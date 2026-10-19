import React from 'react';
import {
  Volume2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  SkipForward,
  HelpCircle,
  Award,
} from 'lucide-react';
import { SpellingWord, WordAttempt } from '../types';

interface HostSpectatorProps {
  currentWordIndex: number;
  words: SpellingWord[];
  liveTypedInput: string;
  timeRemaining: number;
  totalTimeLimit: number;
  completedAttempts: WordAttempt[];
  onTriggerPronounce: (slow?: boolean) => void;
  onSkipWord: () => void;
  playerName?: string;
}

export const HostSpectator: React.FC<HostSpectatorProps> = ({
  currentWordIndex,
  words,
  liveTypedInput,
  timeRemaining,
  totalTimeLimit,
  completedAttempts,
  onTriggerPronounce,
  onSkipWord,
  playerName = 'Person B',
}) => {
  const currentWord = words[currentWordIndex];
  const timerPercentage =
    totalTimeLimit > 0 ? Math.max(0, (timeRemaining / totalTimeLimit) * 100) : 100;

  const score = completedAttempts.filter((a) => a.isCorrect).length;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header / Progress */}
      <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Live Spectator Mode</span>
            </span>
            <span className="text-xs text-slate-500">Moderating {playerName}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-600">
              Score: <span className="font-mono font-bold text-amber-900 text-sm">{score} / {completedAttempts.length}</span>
            </div>
            <div className="text-xs font-semibold text-slate-600">
              Word: <span className="font-mono font-bold text-amber-900 text-sm">{currentWordIndex + 1} of {words.length}</span>
            </div>
          </div>
        </div>

        {/* Timer Bar */}
        {totalTimeLimit > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Time Remaining
              </span>
              <span className={`font-bold ${timeRemaining <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                {timeRemaining}s
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  timeRemaining <= 5 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Stage: Target Word & Live Typing Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: What Person B is supposed to spell (Target Word - visible to Host) */}
        <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Target Word to Spell
          </span>

          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-950 font-display tracking-wider uppercase">
              {currentWord ? currentWord.word : '—'}
            </h2>
            {currentWord?.hint && (
              <p className="text-xs text-slate-500 mt-2 italic">
                Hint: &quot;{currentWord.hint}&quot;
              </p>
            )}
          </div>

          {/* Host Moderator Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Moderator Controls
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => onTriggerPronounce(false)}
                className="flex-1 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Pronounce to {playerName}</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerPronounce(true)}
                className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Slow Speed</span>
              </button>

              <button
                type="button"
                onClick={onSkipWord}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Typing Spectator Monitor */}
        <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{playerName}&apos;s Live Input</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              {liveTypedInput.length} chars
            </span>
          </div>

          {/* Live Tiles Preview */}
          <div className="min-h-[100px] flex items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
            {liveTypedInput.length === 0 ? (
              <span className="text-xs text-slate-500 font-mono italic">
                Waiting for {playerName} to tap keys...
              </span>
            ) : (
              <div className="flex flex-wrap justify-center gap-1.5">
                {liveTypedInput.split('').map((char, i) => (
                  <span
                    key={i}
                    className="w-8 h-10 sm:w-10 sm:h-12 bg-amber-400 text-slate-950 font-display font-extrabold text-xl sm:text-2xl rounded-lg flex items-center justify-center shadow-md animate-in zoom-in-75 duration-75 uppercase"
                  >
                    {char === ' ' ? '␣' : char}
                  </span>
                ))}
                {/* Blinking cursor tile */}
                <div className="w-2 h-10 sm:h-12 bg-amber-300 rounded-sm animate-pulse" />
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center">
            You are viewing {playerName}&apos;s inputs in real time without lag.
          </p>
        </div>
      </div>

      {/* Completed Words History Log */}
      {completedAttempts.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Completed Words in this Session
          </h3>

          <div className="divide-y divide-slate-100">
            {completedAttempts.map((att, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  {att.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span className="font-bold text-slate-900 capitalize">{att.targetWord}</span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {!att.isCorrect && (
                    <span className="font-mono text-rose-600 line-through">
                      Typed: &quot;{att.typedWord || '(blank)'}&quot;
                    </span>
                  )}
                  <span className="text-slate-400 font-mono">{att.timeSpentSeconds}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
