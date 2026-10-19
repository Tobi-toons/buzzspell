import React from 'react';
import { X, Users, Volume2, Keyboard, Sparkles, CheckCircle2 } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-amber-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-950 font-display">How BuzzSpell Works</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-amber-100/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 font-bold">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-900">Host (Person A) Sets Up the Bee</p>
              <p className="text-slate-600 mt-0.5">
                Person A creates a room and picks or types custom words. Share the unique room link with Person B. No server setup is required—it connects peer-to-peer!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 font-bold">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-900">Live Speech Pronunciation</p>
              <p className="text-slate-600 mt-0.5">
                When the game starts, words are read aloud using Text-to-Speech to Person B. Person B can tap the speaker button to hear it repeated anytime.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 font-bold">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-900">Anti-Autocorrect Touch Keyboard</p>
              <p className="text-slate-600 mt-0.5">
                Person B spells each word using the custom on-screen touch keyboard. Native phone keyboards and auto-correct are completely disabled for fair play!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 font-bold">
              4
            </div>
            <div>
              <p className="font-semibold text-slate-900">Host Spectator Console</p>
              <p className="text-slate-600 mt-0.5">
                Person A watches Person B spell in real-time tile by tile. The host can repeat pronunciations or provide helpful hints if needed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 font-bold">
              5
            </div>
            <div>
              <p className="font-semibold text-slate-900">Smart "Improve" Mastery Mode</p>
              <p className="text-slate-600 mt-0.5">
                Misspelled a word? The app calculates mistake severity (1, 2, or 3 practice reps). Before the final attempt, the target word is hidden so Person B spells from pure memory!
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-sm shadow-sm transition-all cursor-pointer"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
