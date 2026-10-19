import React from 'react';
import { Sparkles, BarChart3, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import mascotImg from '../assets/images/spelling_bee_mascot_1792414236577.jpg';

interface HeaderProps {
  onOpenAnalytics: () => void;
  onOpenHowToPlay: () => void;
  onStartSolo: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeRoomId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAnalytics,
  onOpenHowToPlay,
  onStartSolo,
  soundEnabled,
  onToggleSound,
  activeRoomId,
}) => {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-amber-200/80 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="/"
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-amber-950 whitespace-nowrap shrink-0 group"
        >
          <img
            src={mascotImg}
            alt="BuzzSpell Mascot"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="font-display">BuzzSpell</span>
        </a>

        {/* Zone 2: Navigation & Tools */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={onOpenHowToPlay}
            className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How to Play</span>
          </button>

          <button
            type="button"
            onClick={onOpenAnalytics}
            className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span>Mistake Tracker</span>
          </button>

          <button
            type="button"
            onClick={onStartSolo}
            className="hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Solo Practice</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action / Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 text-slate-500 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={onOpenAnalytics}
            className="md:hidden p-2 text-slate-600 hover:text-amber-800 rounded-lg hover:bg-amber-100 cursor-pointer"
            aria-label="View Analytics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          {activeRoomId ? (
            <div className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-semibold rounded-lg whitespace-nowrap shrink-0">
              Room: {activeRoomId.toUpperCase()}
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartSolo}
              className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
