import React, { useEffect, useState, useRef } from 'react';
import { Volume2, Volume1, Clock, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import { SpellingWord } from '../types';
import { TouchKeyboard } from './TouchKeyboard';
import { playSound, pronounceWord } from '../utils/audio';

interface PlayerGameProps {
  currentWordIndex: number;
  totalWords: number;
  currentWord: SpellingWord;
  timeLimitSeconds: number;
  onLiveInputChange: (val: string) => void;
  onSubmitGuess: (typedWord: string, timeSpentSeconds: number) => void;
  onRequestPronounce?: () => void;
}

export const PlayerGame: React.FC<PlayerGameProps> = ({
  currentWordIndex,
  totalWords,
  currentWord,
  timeLimitSeconds,
  onLiveInputChange,
  onSubmitGuess,
}) => {
  const [typedInput, setTypedInput] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Automatically pronounce word when a new word is loaded
  useEffect(() => {
    setTypedInput('');
    onLiveInputChange('');
    setTimeRemaining(timeLimitSeconds);
    startTimeRef.current = Date.now();
    setLastFeedback(null);

    // Pronounce the target word clearly
    setIsSpeaking(true);
    pronounceWord(currentWord.word, {
      onEnd: () => setIsSpeaking(false),
    });

    if (timeLimitSeconds > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto submit when time runs out
            handleForceSubmit('');
            return 0;
          }
          if (prev <= 5) {
            playSound.timerTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentWordIndex, currentWord]);

  const handleForceSubmit = (forcedValue?: string) => {
    const finalVal = forcedValue !== undefined ? forcedValue : typedInput;
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    onSubmitGuess(finalVal, timeSpent);
  };

  const handleKeyPress = (char: string) => {
    if (typedInput.length >= 24) return;
    const next = typedInput + char.toLowerCase();
    setTypedInput(next);
    onLiveInputChange(next);
  };

  const handleBackspace = () => {
    const next = typedInput.slice(0, -1);
    setTypedInput(next);
    onLiveInputChange(next);
  };

  const handleClear = () => {
    setTypedInput('');
    onLiveInputChange('');
  };

  const handleSubmit = () => {
    handleForceSubmit();
  };

  const handleHearAgain = (slow = false) => {
    setIsSpeaking(true);
    pronounceWord(currentWord.word, {
      rate: slow ? 0.72 : 0.95,
      onEnd: () => setIsSpeaking(false),
    });
  };

  const timerPercentage =
    timeLimitSeconds > 0 ? Math.max(0, (timeRemaining / timeLimitSeconds) * 100) : 100;

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 flex flex-col min-h-[calc(100vh-5rem)] justify-between">
      {/* Top Bar: Progress and Timer */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-amber-200/90 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-950 font-display">
              Word {currentWordIndex + 1} of {totalWords}
            </span>
          </div>

          {timeLimitSeconds > 0 && (
            <div
              className={`flex items-center gap-1.5 font-mono font-bold text-sm ${
                timeRemaining <= 5 ? 'text-rose-600 animate-bounce' : 'text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{timeRemaining}s</span>
            </div>
          )}
        </div>

        {/* Timer Bar */}
        {timeLimitSeconds > 0 && (
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                timeRemaining <= 5 ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Center Stage: Audio Pronunciation Prompts */}
      <div className="my-auto py-4 sm:py-6 text-center space-y-4">
        {/* Big Audio Trigger */}
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleHearAgain(false)}
            aria-label="Hear pronunciation again"
            className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-display font-extrabold text-base sm:text-lg flex items-center gap-3 shadow-md transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 animate-pulse'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:scale-102 active:scale-98'
            }`}
          >
            <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>{isSpeaking ? 'Pronouncing...' : 'Hear Word Again'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleHearAgain(true)}
            className="text-xs text-amber-900 hover:text-amber-950 font-semibold flex items-center gap-1 hover:underline cursor-pointer pt-1"
          >
            <Volume1 className="w-3.5 h-3.5" />
            <span>Pronounce Slower</span>
          </button>
        </div>

        {/* Definition / Context Hint if provided by Host */}
        {currentWord.hint && (
          <div className="inline-block px-4 py-1.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 max-w-md mx-auto">
            <span className="font-semibold">Context:</span> &quot;{currentWord.hint}&quot;
          </div>
        )}

        {/* Display Typed Word Tiles (Anti-autocorrect display) */}
        <div className="min-h-[68px] sm:min-h-[80px] p-3 sm:p-4 bg-white rounded-2xl border-2 border-amber-300 shadow-inner flex items-center justify-center">
          {typedInput.length === 0 ? (
            <div className="text-slate-400 text-sm font-medium tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Tap the keyboard tiles below to spell</span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
              {typedInput.split('').map((char, index) => (
                <div
                  key={index}
                  className="w-8 h-11 sm:w-11 sm:h-14 bg-amber-100 border-2 border-amber-400 text-amber-950 font-display font-extrabold text-xl sm:text-2xl rounded-xl flex items-center justify-center shadow-xs uppercase select-none"
                >
                  {char === ' ' ? '␣' : char}
                </div>
              ))}
              {/* Flashing cursor tile */}
              <div className="w-1.5 h-9 sm:h-11 bg-amber-500 rounded-sm animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Deck: Custom On-Screen Touch Keyboard */}
      <div className="pt-2">
        <TouchKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onSubmit={handleSubmit}
          canSubmit={typedInput.trim().length > 0}
        />
      </div>
    </div>
  );
};
