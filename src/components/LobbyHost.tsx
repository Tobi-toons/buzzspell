import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Plus,
  Trash2,
  Clock,
  ExternalLink,
  Sparkles,
  BookOpen,
  Volume2,
  Play,
  Share2,
} from 'lucide-react';
import { GameSettings, SpellingWord } from '../types';
import { PRESET_WORD_LISTS, PresetList } from '../utils/presetWords';
import { pronounceWord } from '../utils/audio';

interface LobbyHostProps {
  roomId: string;
  words: SpellingWord[];
  onUpdateWords: (words: SpellingWord[]) => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  playerConnected: boolean;
  playerName?: string;
  onStartGame: () => void;
}

export const LobbyHost: React.FC<LobbyHostProps> = ({
  roomId,
  words,
  onUpdateWords,
  settings,
  onUpdateSettings,
  playerConnected,
  playerName,
  onStartGame,
}) => {
  const [newWordInput, setNewWordInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}&role=player`
    : `?room=${roomId}&role=player`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPlayerTab = () => {
    window.open(shareUrl, '_blank');
  };

  const handleAddWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = newWordInput.trim();
    if (!raw) return;

    // Support comma or newline separated inputs
    const tokens = raw
      .split(/[\n,]+/)
      .map((w) => w.trim().replace(/[^a-zA-Z\s-]/g, ''))
      .filter((w) => w.length > 0);

    const newEntries: SpellingWord[] = tokens.map((word) => ({
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      word: word.toLowerCase(),
    }));

    onUpdateWords([...words, ...newEntries]);
    setNewWordInput('');
  };

  const handleRemoveWord = (id: string) => {
    onUpdateWords(words.filter((w) => w.id !== id));
  };

  const handleLoadPreset = (preset: PresetList) => {
    onUpdateWords(preset.words);
    setShowPresets(false);
  };

  const timeOptions = [
    { label: '15s', value: 15 },
    { label: '25s', value: 25 },
    { label: '35s', value: 35 },
    { label: '60s', value: 60 },
    { label: 'No limit', value: 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Host Room Banner & Connection Deck */}
      <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Host / Moderator Desk
              </span>
              <span className="text-xs text-slate-500">Person A</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-display mt-1">
              Spelling Bee Room #{roomId.toUpperCase()}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Type custom words, set the timer, and share the invite link with Person B to play.
            </p>
          </div>

          {/* Connection status badge */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                playerConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  playerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span>
                {playerConnected
                  ? `Person B Connected (${playerName || 'Player'})`
                  : 'Waiting for Person B to Join...'}
              </span>
            </div>
          </div>
        </div>

        {/* Share Link Row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2 border-t border-amber-100">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono overflow-x-auto select-all">
            <Share2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{shareUrl}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-slate-900" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPlayerTab}
              title="Open Player link in a new tab to test dual-screen locally"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Test Player View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Word List & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Words Configuration (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Word List ({words.length} {words.length === 1 ? 'word' : 'words'})
              </h2>
              <p className="text-xs text-slate-500">
                Person B will be asked to spell these words via voice pronunciation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Preset Lists</span>
            </button>
          </div>

          {/* Preset lists dropdown picker */}
          {showPresets && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Pick a Curated Word Pack:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_WORD_LISTS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    className="text-left p-2.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">{preset.title}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                        {preset.words.length} words
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Word Input Form */}
          <form onSubmit={handleAddWord} className="flex gap-2">
            <input
              type="text"
              value={newWordInput}
              onChange={(e) => setNewWordInput(e.target.value)}
              placeholder="Type word (e.g. rhythm, beautiful, rendezvous)"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!newWordInput.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Words Preview Chips List */}
          {words.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-amber-200 rounded-xl text-center text-slate-500 text-sm space-y-2">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="font-medium text-slate-700">No words added yet!</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Type words above or click &quot;Preset Lists&quot; to load ready-made word collections.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {words.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-amber-50/50 border border-slate-200/80 rounded-xl text-sm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 capitalize tracking-wide">{item.word}</span>
                    {item.hint && (
                      <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-xs">
                        ({item.hint})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => pronounceWord(item.word)}
                      title="Test Pronunciation"
                      className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-100 rounded-md cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(item.id)}
                      title="Remove Word"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Game Parameters & Start (1 column) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Timeframe Per Word</span>
            </h3>

            {/* Timer segmented selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, timeLimitSeconds: opt.value })}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    settings.timeLimitSeconds === opt.value
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              Person B has {settings.timeLimitSeconds > 0 ? `${settings.timeLimitSeconds} seconds` : 'unlimited time'} to
              spell each word before auto-submitting.
            </div>
          </div>

          {/* Start Game Action */}
          <div className="bg-amber-50 rounded-2xl border border-amber-300/80 p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Play className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>Ready to Begin?</span>
            </div>

            <p className="text-xs text-slate-600">
              {playerConnected
                ? 'Person B is connected and ready. Click below to start the live competition!'
                : 'You can wait for Person B or start now to test as Moderator.'}
            </p>

            <button
              type="button"
              disabled={words.length === 0}
              onClick={onStartGame}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Start Spelling Bee ({words.length} Words)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
