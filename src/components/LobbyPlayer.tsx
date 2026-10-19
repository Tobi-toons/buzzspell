import React, { useState } from 'react';
import { Volume2, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import mascotImg from '../assets/images/spelling_bee_mascot_1792414236577.jpg';
import { pronounceWord } from '../utils/audio';

interface LobbyPlayerProps {
  roomId: string;
  playerName: string;
  onUpdateName: (name: string) => void;
  isConnected: boolean;
  wordCount: number;
  timeLimit: number;
}

export const LobbyPlayer: React.FC<LobbyPlayerProps> = ({
  roomId,
  playerName,
  onUpdateName,
  isConnected,
  wordCount,
  timeLimit,
}) => {
  const [audioTested, setAudioTested] = useState(false);

  const handleTestAudio = () => {
    pronounceWord('Welcome to the spelling bee! Listen carefully.', {
      onEnd: () => setAudioTested(true),
    });
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white rounded-3xl border border-amber-200/90 shadow-lg p-6 sm:p-8 text-center space-y-6">
        <div className="relative inline-block mx-auto">
          <img
            src={mascotImg}
            alt="BuzzSpell Bee Mascot"
            referrerPolicy="no-referrer"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-400 shadow-md mx-auto"
          />
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Contestant / Player
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-display mt-2">
            You Joined Room #{roomId.toUpperCase()}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Person A is the Moderator. As soon as they hit &quot;Start&quot;, words will be spoken to you to spell on the touch keyboard!
          </p>
        </div>

        {/* Player Name Tag */}
        <div className="max-w-xs mx-auto text-left space-y-1.5">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Your Speller Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => onUpdateName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-center"
          />
        </div>

        {/* Connection status indicator */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-center gap-3 text-sm">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
            }`}
          />
          <span className="font-semibold text-slate-800">
            {isConnected ? 'Connected with Host!' : 'Connecting to Host...'}
          </span>
        </div>

        {/* Audio Sound Check & Rules Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <button
            type="button"
            onClick={handleTestAudio}
            className="p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 group-hover:scale-105 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Audio Check</p>
              <p className="text-[11px] text-slate-500">
                {audioTested ? '✓ Audio working!' : 'Tap to test speaker'}
              </p>
            </div>
          </button>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Anti-Autocorrect</p>
              <p className="text-[11px] text-slate-500">Custom on-screen tiles</p>
            </div>
          </div>
        </div>

        {/* Waiting spinner */}
        <div className="pt-2 flex items-center justify-center gap-2 text-amber-800 font-medium text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span>Waiting for Host to start the game...</span>
        </div>
      </div>
    </div>
  );
};
