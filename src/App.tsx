import React, { useState, useEffect, useRef } from 'react';
import {
  GameRole,
  GamePhase,
  SpellingWord,
  GameSettings,
  WordAttempt,
  P2PMessage,
  AnalyticsData,
} from './types';
import { Header } from './components/Header';
import { LobbyHost } from './components/LobbyHost';
import { LobbyPlayer } from './components/LobbyPlayer';
import { HostSpectator } from './components/HostSpectator';
import { PlayerGame } from './components/PlayerGame';
import { ResultsScreen } from './components/ResultsScreen';
import { ImproveMode } from './components/ImproveMode';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { createP2PNetwork, P2PNetworkHandler } from './utils/p2p';
import { PRESET_WORD_LISTS } from './utils/presetWords';
import { computeLevenshtein, getMistakeSeverity, categorizeError } from './utils/levenshtein';
import { loadAnalytics, recordGameResults } from './utils/storage';
import { playSound, pronounceWord } from './utils/audio';

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 4; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BEE-${res}`;
}

export default function App() {
  // Parse URL parameters
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) return urlRoom.toUpperCase();
    }
    return generateRoomId();
  });

  const [role, setRole] = useState<GameRole>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'player') return 'player';
      if (urlRole === 'solo') return 'solo';
    }
    return 'host';
  });

  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [playerName, setPlayerName] = useState('Speller');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game Settings & Words
  const [words, setWords] = useState<SpellingWord[]>(PRESET_WORD_LISTS[0].words);
  const [settings, setSettings] = useState<GameSettings>({
    timeLimitSeconds: 25,
    speechRate: 0.95,
    speechPitch: 1.0,
    allowSlowPronounce: true,
  });

  // Active Game State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [liveTypedInput, setLiveTypedInput] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(25);
  const [completedAttempts, setCompletedAttempts] = useState<WordAttempt[]>([]);

  // P2P Connection State
  const [playerConnected, setPlayerConnected] = useState(false);
  const [networkStatusText, setNetworkStatusText] = useState('Initializing P2P...');
  const networkRef = useRef<P2PNetworkHandler | null>(null);

  // Modals
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>(loadAnalytics);

  // Host timer countdown interval ref
  const hostTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize P2P Network
  useEffect(() => {
    if (role === 'solo') return;

    const handler = createP2PNetwork(
      roomId,
      role,
      (msg: P2PMessage) => {
        handleIncomingMessage(msg);
      },
      (status, detail) => {
        if (status === 'connected') {
          setPlayerConnected(true);
          setNetworkStatusText(detail || 'Connected');
        } else {
          setNetworkStatusText(detail || 'Connecting...');
        }
      }
    );

    networkRef.current = handler;

    // If we are a player, announce ourselves immediately
    if (role === 'player') {
      handler.send({ type: 'PLAYER_JOINED', playerName });
    }

    return () => {
      handler.destroy();
      networkRef.current = null;
    };
  }, [roomId, role]);

  // Handle Incoming P2P messages
  const handleIncomingMessage = (msg: P2PMessage) => {
    switch (msg.type) {
      case 'PLAYER_JOINED':
        setPlayerConnected(true);
        if (role === 'host') {
          // Greet player with word list and settings
          networkRef.current?.send({
            type: 'HOST_HELLO',
            hostName: 'Person A',
            settings,
            words,
          });
        }
        break;

      case 'HOST_HELLO':
        setPlayerConnected(true);
        setWords(msg.words);
        setSettings(msg.settings);
        break;

      case 'START_GAME':
        setWords(msg.words);
        setSettings(msg.settings);
        setCurrentWordIndex(0);
        setLiveTypedInput('');
        setCompletedAttempts([]);
        setTimeRemaining(msg.settings.timeLimitSeconds);
        setGamePhase('playing');
        break;

      case 'LIVE_INPUT':
        setLiveTypedInput(msg.currentInput);
        break;

      case 'WORD_SUBMITTED':
        handleWordEvaluated(msg.typedWord, msg.timeSpentSeconds, msg.wordIndex);
        break;

      case 'PRONOUNCE_TRIGGER':
        // Player receives host's pronunciation trigger
        if (words[msg.wordIndex]) {
          pronounceWord(words[msg.wordIndex].word, {
            rate: msg.slow ? 0.72 : 0.95,
          });
        }
        break;

      case 'GAME_OVER':
        setCompletedAttempts(msg.attempts);
        setGamePhase('results');
        const updated = recordGameResults(msg.attempts);
        setAnalytics(updated);
        break;

      case 'RESTART_TO_LOBBY':
        setGamePhase('lobby');
        setCompletedAttempts([]);
        setLiveTypedInput('');
        break;
    }
  };

  // Host live countdown timer watcher
  useEffect(() => {
    if (role !== 'host' || gamePhase !== 'playing' || settings.timeLimitSeconds <= 0) {
      if (hostTimerRef.current) clearInterval(hostTimerRef.current);
      return;
    }

    setTimeRemaining(settings.timeLimitSeconds);
    if (hostTimerRef.current) clearInterval(hostTimerRef.current);

    hostTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (hostTimerRef.current) clearInterval(hostTimerRef.current);
    };
  }, [role, gamePhase, currentWordIndex, settings.timeLimitSeconds]);

  // Evaluate a submitted word
  const handleWordEvaluated = (typed: string, timeSpent: number, wordIdx: number) => {
    const targetWordObj = words[wordIdx];
    if (!targetWordObj) return;

    const targetWord = targetWordObj.word.toLowerCase().trim();
    const cleanTyped = typed.toLowerCase().trim();
    const isCorrect = cleanTyped === targetWord;
    const distance = computeLevenshtein(targetWord, cleanTyped);
    const severity = getMistakeSeverity(targetWord, cleanTyped);
    const errorType = !isCorrect ? categorizeError(targetWord, cleanTyped) : undefined;

    const attempt: WordAttempt = {
      wordId: targetWordObj.id,
      targetWord,
      typedWord: cleanTyped,
      isCorrect,
      timeSpentSeconds: timeSpent,
      errorSeverity: severity,
      distance,
      errorType,
    };

    const nextAttempts = [...completedAttempts, attempt];
    setCompletedAttempts(nextAttempts);

    if (isCorrect) {
      playSound.correctChime();
    } else {
      playSound.incorrectBuzz();
    }

    // Check if round finished
    if (wordIdx + 1 >= words.length) {
      setGamePhase('results');
      if (role === 'host') {
        networkRef.current?.send({
          type: 'GAME_OVER',
          attempts: nextAttempts,
        });
      }
      const updated = recordGameResults(nextAttempts);
      setAnalytics(updated);
    } else {
      setCurrentWordIndex(wordIdx + 1);
      setLiveTypedInput('');
      setTimeRemaining(settings.timeLimitSeconds);
    }
  };

  // Host starts game
  const handleStartGame = () => {
    if (words.length === 0) return;
    setCurrentWordIndex(0);
    setLiveTypedInput('');
    setCompletedAttempts([]);
    setTimeRemaining(settings.timeLimitSeconds);
    setGamePhase('playing');

    if (role === 'host') {
      networkRef.current?.send({
        type: 'START_GAME',
        words,
        settings,
      });
    }
  };

  // Player types on keyboard
  const handlePlayerLiveInput = (val: string) => {
    setLiveTypedInput(val);
    networkRef.current?.send({
      type: 'LIVE_INPUT',
      wordIndex: currentWordIndex,
      currentInput: val,
    });
  };

  // Player submits guess
  const handlePlayerSubmitGuess = (typedWord: string, timeSpentSeconds: number) => {
    networkRef.current?.send({
      type: 'WORD_SUBMITTED',
      wordIndex: currentWordIndex,
      typedWord,
      isCorrect: typedWord.toLowerCase().trim() === words[currentWordIndex]?.word.toLowerCase().trim(),
      timeSpentSeconds,
    });

    handleWordEvaluated(typedWord, timeSpentSeconds, currentWordIndex);
  };

  // Host triggers voice pronunciation to Person B
  const handleHostTriggerPronounce = (slow = false) => {
    networkRef.current?.send({
      type: 'PRONOUNCE_TRIGGER',
      wordIndex: currentWordIndex,
      slow,
    });
    // Also pronounce locally for Host preview
    if (words[currentWordIndex]) {
      pronounceWord(words[currentWordIndex].word, {
        rate: slow ? 0.72 : 0.95,
      });
    }
  };

  // Host skips word
  const handleHostSkipWord = () => {
    handleWordEvaluated('', settings.timeLimitSeconds, currentWordIndex);
  };

  // Start practice with specific words
  const handleStartPracticeWithWords = (wordStrings: string[]) => {
    const practiceWords: SpellingWord[] = wordStrings.map((w, idx) => ({
      id: `practice_${idx}_${Date.now()}`,
      word: w,
      hint: 'Target error practice',
    }));
    setWords(practiceWords);
    setRole('solo');
    setGamePhase('lobby');
  };

  // Restart back to lobby
  const handleRestartToLobby = () => {
    setGamePhase('lobby');
    setCompletedAttempts([]);
    setLiveTypedInput('');
    networkRef.current?.send({ type: 'RESTART_TO_LOBBY' });
  };

  return (
    <div className="min-h-screen bg-honeycomb flex flex-col text-slate-800">
      <Header
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onStartSolo={() => {
          setRole('solo');
          setGamePhase('lobby');
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeRoomId={role !== 'solo' ? roomId : undefined}
      />

      {/* Role Switcher Toolbar (under top bar) */}
      <div className="w-full bg-amber-100/60 border-b border-amber-200/60 py-1.5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Your Role:</span>
            <div className="inline-flex p-0.5 bg-white rounded-lg border border-amber-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setRole('host')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  role === 'host'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Person A (Host)
              </button>
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  role === 'player'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Person B (Player)
              </button>
              <button
                type="button"
                onClick={() => setRole('solo')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  role === 'solo'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo Speller
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            {role !== 'solo' && (
              <span className="font-mono text-[11px] truncate max-w-[200px]">
                {networkStatusText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <main className="flex-1 py-4 sm:py-6">
        {/* LOBBY PHASE */}
        {gamePhase === 'lobby' && (
          <>
            {role === 'host' || role === 'solo' ? (
              <LobbyHost
                roomId={roomId}
                words={words}
                onUpdateWords={setWords}
                settings={settings}
                onUpdateSettings={setSettings}
                playerConnected={playerConnected || role === 'solo'}
                playerName={playerName}
                onStartGame={handleStartGame}
              />
            ) : (
              <LobbyPlayer
                roomId={roomId}
                playerName={playerName}
                onUpdateName={setPlayerName}
                isConnected={playerConnected}
                wordCount={words.length}
                timeLimit={settings.timeLimitSeconds}
              />
            )}
          </>
        )}

        {/* PLAYING PHASE */}
        {gamePhase === 'playing' && (
          <>
            {role === 'host' ? (
              <HostSpectator
                currentWordIndex={currentWordIndex}
                words={words}
                liveTypedInput={liveTypedInput}
                timeRemaining={timeRemaining}
                totalTimeLimit={settings.timeLimitSeconds}
                completedAttempts={completedAttempts}
                onTriggerPronounce={handleHostTriggerPronounce}
                onSkipWord={handleHostSkipWord}
                playerName={playerName}
              />
            ) : (
              <PlayerGame
                currentWordIndex={currentWordIndex}
                totalWords={words.length}
                currentWord={words[currentWordIndex]}
                timeLimitSeconds={settings.timeLimitSeconds}
                onLiveInputChange={handlePlayerLiveInput}
                onSubmitGuess={handlePlayerSubmitGuess}
              />
            )}
          </>
        )}

        {/* RESULTS PHASE */}
        {gamePhase === 'results' && (
          <ResultsScreen
            role={role}
            attempts={completedAttempts}
            onStartImprove={() => setGamePhase('improving')}
            onPlayAgain={handleRestartToLobby}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
            playerName={playerName}
          />
        )}

        {/* IMPROVE MASTERY MODE */}
        {gamePhase === 'improving' && (
          <ImproveMode
            mistakes={completedAttempts.filter((a) => !a.isCorrect)}
            onComplete={handleRestartToLobby}
            onExit={handleRestartToLobby}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        analytics={analytics}
        onStartPracticeWithWords={handleStartPracticeWithWords}
        onResetAnalytics={() => setAnalytics(loadAnalytics())}
      />
    </div>
  );
}
