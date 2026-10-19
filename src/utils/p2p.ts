import Peer, { DataConnection } from 'peerjs';
import { GameRole, P2PMessage } from '../types';

export interface P2PNetworkHandler {
  send: (msg: P2PMessage) => void;
  destroy: () => void;
  getConnectionStatus: () => 'connecting' | 'connected' | 'disconnected';
}

interface WrappedEnvelope {
  id: string;
  sender: string;
  timestamp: number;
  payload: P2PMessage;
}

export function createP2PNetwork(
  roomId: string,
  role: GameRole,
  onMessage: (msg: P2PMessage) => void,
  onStatusChange: (status: 'connecting' | 'connected' | 'disconnected', detail?: string) => void
): P2PNetworkHandler {
  const cleanRoomId = roomId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const peerHostId = `buzzspell-${cleanRoomId}-host`;
  const clientId = `${role}-${Math.random().toString(36).substring(2, 8)}`;

  let isDestroyed = false;
  let peer: Peer | null = null;
  let activeConn: DataConnection | null = null;
  let status: 'connecting' | 'connected' | 'disconnected' = 'connecting';

  // Keep track of recently received message IDs to avoid duplicates between BroadcastChannel and WebRTC
  const seenMessageIds = new Set<string>();

  const processEnvelope = (env: WrappedEnvelope) => {
    if (isDestroyed) return;
    if (env.sender === clientId) return; // Ignore own echoes
    if (seenMessageIds.has(env.id)) return; // Deduplicate

    seenMessageIds.add(env.id);
    if (seenMessageIds.size > 200) {
      const first = seenMessageIds.values().next().value;
      if (first) seenMessageIds.delete(first);
    }

    if (status !== 'connected') {
      status = 'connected';
      onStatusChange('connected', 'Peer connected');
    }

    onMessage(env.payload);
  };

  // 1. BroadcastChannel for instant local cross-tab / cross-window sync
  let channel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(`buzzspell_chan_${cleanRoomId}`);
      channel.onmessage = (event) => {
        if (event.data && event.data.payload) {
          processEnvelope(event.data as WrappedEnvelope);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not available:', e);
    }
  }

  // 2. Storage event fallback for older browsers or if BroadcastChannel is blocked
  const storageHandler = (e: StorageEvent) => {
    if (e.key === `buzzspell_msg_${cleanRoomId}` && e.newValue) {
      try {
        const envelope = JSON.parse(e.newValue);
        processEnvelope(envelope);
      } catch {
        // Parse error
      }
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
  }

  // 3. PeerJS for remote peer-to-peer WebRTC connection across devices
  const initPeerJS = () => {
    try {
      if (role === 'host') {
        peer = new Peer(peerHostId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        });

        peer.on('open', () => {
          onStatusChange('connecting', 'Room ready for players to join');
        });

        peer.on('connection', (conn) => {
          activeConn = conn;
          setupConnectionListeners(conn);
          status = 'connected';
          onStatusChange('connected', 'Player joined via WebRTC');
        });

        peer.on('error', (err) => {
          // If ID is already taken, someone else might be hosting or tab refreshed
          if (err.type === 'unavailable-id') {
            console.warn('Peer ID was already active. Continuing with local broadcast...');
          }
        });
      } else if (role === 'player') {
        // Player gets a random ID and connects to peerHostId
        peer = new Peer({
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        });

        peer.on('open', () => {
          const conn = peer!.connect(peerHostId, { reliable: true });
          activeConn = conn;
          setupConnectionListeners(conn);
        });

        peer.on('error', (err) => {
          console.warn('Peer connection issue:', err);
        });
      }
    } catch (err) {
      console.warn('PeerJS init failed, falling back to BroadcastChannel:', err);
    }
  };

  const setupConnectionListeners = (conn: DataConnection) => {
    conn.on('open', () => {
      status = 'connected';
      onStatusChange('connected', 'Direct P2P Link Established');
    });

    conn.on('data', (data) => {
      if (data && typeof data === 'object' && 'payload' in data) {
        processEnvelope(data as WrappedEnvelope);
      }
    });

    conn.on('close', () => {
      status = 'disconnected';
      onStatusChange('disconnected', 'Peer disconnected');
    });

    conn.on('error', (err) => {
      console.warn('Data connection error:', err);
    });
  };

  initPeerJS();

  const send = (payload: P2PMessage) => {
    if (isDestroyed) return;

    const envelope: WrappedEnvelope = {
      id: `${clientId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: clientId,
      timestamp: Date.now(),
      payload,
    };

    // Mark our own message so we don't process it
    seenMessageIds.add(envelope.id);

    // 1. Send over BroadcastChannel (instant local tabs)
    if (channel) {
      try {
        channel.postMessage(envelope);
      } catch (e) {
        console.warn('Broadcast send error:', e);
      }
    }

    // 2. Send over storage bus
    try {
      localStorage.setItem(`buzzspell_msg_${cleanRoomId}`, JSON.stringify(envelope));
    } catch {
      // Ignore
    }

    // 3. Send over WebRTC DataConnection
    if (activeConn && activeConn.open) {
      try {
        activeConn.send(envelope);
      } catch (e) {
        console.warn('WebRTC send error:', e);
      }
    }
  };

  const destroy = () => {
    isDestroyed = true;
    if (channel) {
      channel.close();
      channel = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageHandler);
    }
    if (activeConn) {
      activeConn.close();
      activeConn = null;
    }
    if (peer) {
      peer.destroy();
      peer = null;
    }
  };

  return {
    send,
    destroy,
    getConnectionStatus: () => status,
  };
}
