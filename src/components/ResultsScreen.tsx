import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Volume2,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import { GameRole, WordAttempt } from '../types';
import { pronounceWord, playSound } from '../utils/audio';

interface ResultsScreenProps {
  role: GameRole;
  attempts: WordAttempt[];
  onStartImprove: () => void;
  onPlayAgain: () => void;
  onOpenAnalytics: () => void;
  playerName?: string;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  role,
  attempts,
  onStartImprove,
  onPlayAgain,
  onOpenAnalytics,
  playerName = 'Player',
}) => {
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const totalCount = attempts.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const incorrectAttempts = attempts.filter((a) => !a.isCorrect);

  useEffect(() => {
    if (accuracy >= 70) {
      playSound.victoryFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#10b981', '#3b82f6'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [accuracy]);

  const getSeverityBadge = (severity: 1 | 2 | 3) => {
    switch (severity) {
      case 1:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
            Minor Error (1 rep)
          </span>
        );
      case 2:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-md">
            Moderate Error (2 reps)
          </span>
        );
      case 3:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
            Major Error (3 reps)
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Score Hero Card */}
      <div className="bg-white rounded-3xl border border-amber-200/90 shadow-md p-6 sm:p-8 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-800 mx-auto">
          {accuracy >= 70 ? (
            <Award className="w-10 h-10 text-amber-600" />
          ) : (
            <Sparkles className="w-10 h-10 text-amber-600" />
          )}
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {role === 'host' ? `${playerName}'s Results` : 'Your Results'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-950 font-display mt-2">
            {accuracy === 100
              ? 'Flawless Spelling Bee!'
              : accuracy >= 70
              ? 'Great Performance!'
              : 'Keep Practicing!'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {role === 'host' ? `${playerName} completed the round.` : 'You completed all the words in this round.'}
          </p>
        </div>

        {/* Big Accuracy Metrics */}
        <div className="flex justify-center items-baseline gap-2 py-2">
          <span className="text-5xl sm:text-6xl font-extrabold font-mono text-amber-950">
            {correctCount}
          </span>
          <span className="text-2xl font-bold text-slate-400 font-mono">/ {totalCount}</span>
          <span className="text-lg font-bold text-emerald-600 font-mono ml-2">({accuracy}%)</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {incorrectAttempts.length > 0 && role !== 'host' && (
            <button
              type="button"
              onClick={onStartImprove}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Improve {incorrectAttempts.length} Mistakes</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPlayAgain}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>{role === 'host' ? 'New Word List / Room' : 'Play Again'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAnalytics}
            className="px-5 py-3 bg-white hover:bg-amber-50 border border-amber-200 active:scale-95 text-amber-900 font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer text-sm"
          >
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>View Progress & Analytics</span>
          </button>
        </div>
      </div>

      {/* Word-by-word Breakdown Table */}
      <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 font-display flex items-center justify-between">
          <span>Word-by-Word Breakdown</span>
          <span className="text-xs font-mono text-slate-500">
            {correctCount} Correct · {incorrectAttempts.length} Incorrect
          </span>
        </h2>

        <div className="divide-y divide-slate-100">
          {attempts.map((att, idx) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                {att.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 capitalize text-base">{att.targetWord}</span>
                    <button
                      type="button"
                      onClick={() => pronounceWord(att.targetWord)}
                      aria-label="Hear pronunciation"
                      className="p-1 text-slate-400 hover:text-amber-700 rounded-md cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!att.isCorrect && (
                    <div className="text-xs text-rose-700 flex items-center gap-1.5 mt-0.5">
                      <span>You spelled:</span>
                      <span className="font-mono font-semibold line-through bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        {att.typedWord || '(blank / timed out)'}
                      </span>
                      {att.errorType && (
                        <span className="text-slate-500 italic">· {att.errorType}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {!att.isCorrect && getSeverityBadge(att.errorSeverity)}
                <span className="font-mono text-xs text-slate-400">{att.timeSpentSeconds}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
