import React from 'react';
import { X, TrendingUp, AlertTriangle, CheckCircle, Award, RotateCcw, Play } from 'lucide-react';
import { AnalyticsData, MistakeRecord } from '../types';
import { getRecurringMistakes, getMasteredWords, clearAnalyticsData } from '../utils/storage';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: AnalyticsData;
  onStartPracticeWithWords: (words: string[]) => void;
  onResetAnalytics: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  analytics,
  onStartPracticeWithWords,
  onResetAnalytics,
}) => {
  if (!isOpen) return null;

  const recurringMistakes = getRecurringMistakes(analytics);
  const masteredWords = getMasteredWords(analytics);
  const accuracy =
    analytics.totalWordsAttempted > 0
      ? Math.round((analytics.totalWordsCorrect / analytics.totalWordsAttempted) * 100)
      : 0;

  const handlePracticeWeakWords = () => {
    if (recurringMistakes.length === 0) return;
    const wordsToPractice = recurringMistakes.slice(0, 8).map((m) => m.word);
    onStartPracticeWithWords(wordsToPractice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-amber-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-950 font-display">Spelling Progress & Error Analytics</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-amber-100/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-center">
              <span className="text-xs font-medium text-slate-500">Games Played</span>
              <p className="text-2xl font-bold font-mono text-amber-950 mt-0.5">{analytics.totalGames}</p>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-center">
              <span className="text-xs font-medium text-slate-500">Words Spelled</span>
              <p className="text-2xl font-bold font-mono text-amber-950 mt-0.5">{analytics.totalWordsAttempted}</p>
            </div>
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-center">
              <span className="text-xs font-medium text-emerald-700">Accuracy</span>
              <p className="text-2xl font-bold font-mono text-emerald-800 mt-0.5">{accuracy}%</p>
            </div>
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/60 text-center">
              <span className="text-xs font-medium text-blue-700">Mastered Words</span>
              <p className="text-2xl font-bold font-mono text-blue-800 mt-0.5">{masteredWords.length}</p>
            </div>
          </div>

          {/* Recurring Errors Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Recurring Spelling Errors ({recurringMistakes.length})
                </h3>
              </div>
              {recurringMistakes.length > 0 && (
                <button
                  type="button"
                  onClick={handlePracticeWeakWords}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Practice Weak Words</span>
                </button>
              )}
            </div>

            {recurringMistakes.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-xl text-center text-slate-500 text-sm">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No active mistake patterns! All words attempted have either been spelled correctly or mastered.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {recurringMistakes.map((record) => (
                  <div key={record.word} className="p-3.5 flex items-center justify-between gap-4 hover:bg-amber-50/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 capitalize text-base">{record.word}</span>
                        <span className="text-xs font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          Missed {record.missCount} {record.missCount === 1 ? 'time' : 'times'}
                        </span>
                      </div>
                      {record.commonMistakes.length > 0 && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span>Past attempts:</span>
                          <span className="font-mono text-rose-600 line-through">
                            {record.commonMistakes.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onStartPracticeWithWords([record.word]);
                        onClose();
                      }}
                      className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      Target Practice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mastered Words Section */}
          {masteredWords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Mastered Words ({masteredWords.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {masteredWords.map((item) => (
                  <span
                    key={item.word}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span className="capitalize">{item.word}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset all spelling analytics and mistake history?')) {
                clearAnalyticsData();
                onResetAnalytics();
              }
            }}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset History</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
