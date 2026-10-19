import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  EyeOff,
  Eye,
  RotateCcw,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { WordAttempt } from '../types';
import { TouchKeyboard } from './TouchKeyboard';
import { playSound, pronounceWord } from '../utils/audio';
import { markWordMastered } from '../utils/storage';

interface ImproveModeProps {
  mistakes: WordAttempt[];
  onComplete: () => void;
  onExit: () => void;
  onOpenAnalytics: () => void;
}

export const ImproveMode: React.FC<ImproveModeProps> = ({
  mistakes,
  onComplete,
  onExit,
  onOpenAnalytics,
}) => {
  const [currentMistakeIndex, setCurrentMistakeIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [typedInput, setTypedInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [allFinished, setAllFinished] = useState(false);

  const currentAttempt = mistakes[currentMistakeIndex];
  const targetWord = currentAttempt ? currentAttempt.targetWord.toLowerCase().trim() : '';
  const totalRepsRequired = currentAttempt ? currentAttempt.errorSeverity : 1; // 1, 2, or 3
  const isLastAttempt = currentRep === totalRepsRequired;

  useEffect(() => {
    if (!currentAttempt) {
      setAllFinished(true);
      return;
    }

    setTypedInput('');
    setFeedback('idle');

    // Automatically speak the word
    setIsSpeaking(true);
    pronounceWord(targetWord, {
      onEnd: () => setIsSpeaking(false),
    });
  }, [currentMistakeIndex, currentRep, targetWord]);

  const handleKeyPress = (char: string) => {
    if (typedInput.length >= 24) return;
    setTypedInput((prev) => prev + char.toLowerCase());
  };

  const handleBackspace = () => {
    setTypedInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setTypedInput('');
  };

  const handleSubmit = () => {
    const cleanGuess = typedInput.toLowerCase().trim();
    if (cleanGuess === targetWord) {
      // Repetition successful
      playSound.correctChime();
      setFeedback('correct');

      setTimeout(() => {
        if (currentRep < totalRepsRequired) {
          // Advance to next rep of same word
          setCurrentRep((prev) => prev + 1);
          setTypedInput('');
          setFeedback('idle');
        } else {
          // Word completed and mastered!
          markWordMastered(targetWord);

          if (currentMistakeIndex + 1 < mistakes.length) {
            // Move to next mistake
            setCurrentMistakeIndex((prev) => prev + 1);
            setCurrentRep(1);
            setTypedInput('');
            setFeedback('idle');
          } else {
            // All mistakes mastered!
            setAllFinished(true);
            playSound.victoryFanfare();
            try {
              confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#f59e0b', '#10b981', '#3b82f6'],
              });
            } catch {
              // Confetti fallback
            }
          }
        }
      }, 700);
    } else {
      // Incorrect attempt
      playSound.incorrectBuzz();
      setFeedback('incorrect');
      setTimeout(() => {
        setTypedInput('');
        setFeedback('idle');
      }, 900);
    }
  };

  const handlePronounce = (slow = false) => {
    setIsSpeaking(true);
    pronounceWord(targetWord, {
      rate: slow ? 0.72 : 0.95,
      onEnd: () => setIsSpeaking(false),
    });
  };

  if (allFinished) {
    return (
      <div className="max-w-xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-3xl border border-amber-200/90 shadow-md p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Award className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Mastery Completed
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 font-display mt-2">
              All Mistakes Mastered!
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
              You practiced every missed word through spaced repetition and spelled them from memory.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-around text-center">
            <div>
              <span className="text-xs text-emerald-700 font-medium">Practiced Words</span>
              <p className="text-2xl font-bold font-mono text-emerald-900">{mistakes.length}</p>
            </div>
            <div className="h-8 w-px bg-emerald-200" />
            <div>
              <span className="text-xs text-emerald-700 font-medium">Memory Retention</span>
              <p className="text-2xl font-bold font-mono text-emerald-900">100%</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onComplete}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Back to Lobby
            </button>
            <button
              type="button"
              onClick={onOpenAnalytics}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <span>View Updated Analytics</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 flex flex-col min-h-[calc(100vh-5rem)] justify-between">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-4 space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-950 font-display">
              Improving Mistake {currentMistakeIndex + 1} of {mistakes.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Exit Improvement Mode
          </button>
        </div>

        {/* Repetition indicator */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalRepsRequired }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  i + 1 < currentRep
                    ? 'bg-emerald-500 text-white'
                    : i + 1 === currentRep
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {i + 1 < currentRep ? '✓' : i + 1}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {isLastAttempt ? (
              <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Final Rep: Word is Hidden!</span>
              </span>
            ) : (
              <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>Study & Type (Rep {currentRep} of {totalRepsRequired})</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Target Word Stage */}
      <div className="my-auto py-4 text-center space-y-4">
        {/* Word Display Box: Visible or Hidden based on prompt requirement */}
        <div className="max-w-md mx-auto p-4 sm:p-5 bg-white rounded-2xl border-2 border-amber-300 shadow-sm text-center">
          {isLastAttempt ? (
            <div className="space-y-2 py-2">
              <div className="inline-flex p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <EyeOff className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-950 font-display">
                Word Hidden from Memory
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Listen to the voice and spell the word without peeking!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Study and Type This Word
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-950 font-display uppercase tracking-widest">
                {targetWord}
              </h2>
            </div>
          )}
        </div>

        {/* Audio Button */}
        <div className="flex justify-center items-center gap-2">
          <button
            type="button"
            onClick={() => handlePronounce(false)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeaking ? 'Speaking...' : 'Listen to Pronunciation'}</span>
          </button>
        </div>

        {/* Typed Letters Display */}
        <div
          className={`min-h-[64px] sm:min-h-[72px] p-3 bg-white rounded-2xl border-2 shadow-inner flex items-center justify-center transition-colors ${
            feedback === 'correct'
              ? 'border-emerald-500 bg-emerald-50/50'
              : feedback === 'incorrect'
              ? 'border-rose-500 bg-rose-50/50 animate-shake'
              : 'border-slate-300'
          }`}
        >
          {typedInput.length === 0 ? (
            <span className="text-slate-400 text-xs sm:text-sm">
              Use on-screen keyboard below
            </span>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-1.5">
              {typedInput.split('').map((char, index) => (
                <div
                  key={index}
                  className={`w-8 h-10 sm:w-10 sm:h-12 border-2 font-display font-extrabold text-xl sm:text-2xl rounded-xl flex items-center justify-center shadow-xs uppercase select-none ${
                    feedback === 'correct'
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                      : feedback === 'incorrect'
                      ? 'bg-rose-100 border-rose-400 text-rose-950'
                      : 'bg-amber-100 border-amber-400 text-amber-950'
                  }`}
                >
                  {char === ' ' ? '␣' : char}
                </div>
              ))}
              <div className="w-1.5 h-8 sm:h-10 bg-amber-500 rounded-sm animate-pulse" />
            </div>
          )}
        </div>

        {feedback === 'incorrect' && (
          <p className="text-xs font-bold text-rose-600 animate-in fade-in">
            Not quite right — give it another shot!
          </p>
        )}
      </div>

      {/* Touch Keyboard */}
      <div className="pt-2">
        <TouchKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onSubmit={handleSubmit}
          canSubmit={typedInput.trim().length > 0}
          disabled={feedback === 'correct'}
        />
      </div>
    </div>
  );
};
