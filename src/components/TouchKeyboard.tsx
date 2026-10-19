import React from 'react';
import { Delete, RotateCcw, CornerDownLeft } from 'lucide-react';
import { playSound } from '../utils/audio';

interface TouchKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  canSubmit?: boolean;
}

const ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

export const TouchKeyboard: React.FC<TouchKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  onSubmit,
  disabled = false,
  canSubmit = true,
}) => {
  const handleKey = (char: string) => {
    if (disabled) return;
    playSound.keyClick();
    onKeyPress(char);
  };

  const handleBackspace = () => {
    if (disabled) return;
    playSound.backspace();
    onBackspace();
  };

  const handleClear = () => {
    if (disabled) return;
    playSound.backspace();
    onClear();
  };

  const handleSubmit = () => {
    if (disabled || !canSubmit) return;
    onSubmit();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-2 select-none touch-key p-2 sm:p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl shadow-sm">
      {/* Row 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
        {ROW_1.map((letter) => (
          <button
            key={letter}
            type="button"
            disabled={disabled}
            onClick={() => handleKey(letter)}
            className="flex-1 max-w-[48px] h-12 sm:h-14 bg-white hover:bg-amber-100 active:scale-95 active:bg-amber-200 text-slate-800 font-bold text-base sm:text-lg rounded-xl border border-amber-200 shadow-[0_2px_0_#d1c3a5] transition-all flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full px-2 sm:px-4">
        {ROW_2.map((letter) => (
          <button
            key={letter}
            type="button"
            disabled={disabled}
            onClick={() => handleKey(letter)}
            className="flex-1 max-w-[48px] h-12 sm:h-14 bg-white hover:bg-amber-100 active:scale-95 active:bg-amber-200 text-slate-800 font-bold text-base sm:text-lg rounded-xl border border-amber-200 shadow-[0_2px_0_#d1c3a5] transition-all flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Row 3: Backspace + Bottom Letters */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
        {ROW_3.map((letter) => (
          <button
            key={letter}
            type="button"
            disabled={disabled}
            onClick={() => handleKey(letter)}
            className="flex-1 max-w-[48px] h-12 sm:h-14 bg-white hover:bg-amber-100 active:scale-95 active:bg-amber-200 text-slate-800 font-bold text-base sm:text-lg rounded-xl border border-amber-200 shadow-[0_2px_0_#d1c3a5] transition-all flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {letter}
          </button>
        ))}
        {/* Backspace Key */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleBackspace}
          aria-label="Backspace"
          className="flex-1 max-w-[64px] h-12 sm:h-14 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-semibold text-sm rounded-xl border border-amber-300 shadow-[0_2px_0_#d1c3a5] transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <Delete className="w-5 h-5 text-amber-800" />
        </button>
      </div>

      {/* Row 4: Space + Clear + Submit */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full pt-1">
        {/* Clear Key */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleClear}
          className="px-3 sm:px-4 h-12 sm:h-13 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-medium text-xs sm:text-sm rounded-xl border border-slate-300 shadow-[0_2px_0_#cbd5e1] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span className="hidden xs:inline">Clear</span>
        </button>

        {/* Space Key */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey(' ')}
          className="flex-1 h-12 sm:h-13 bg-white hover:bg-amber-50 active:scale-98 text-slate-600 font-medium text-xs sm:text-sm rounded-xl border border-amber-200 shadow-[0_2px_0_#d1c3a5] transition-all flex items-center justify-center cursor-pointer"
        >
          SPACE
        </button>

        {/* Submit Key */}
        <button
          type="button"
          disabled={disabled || !canSubmit}
          onClick={handleSubmit}
          className="px-4 sm:px-6 h-12 sm:h-13 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-bold text-sm sm:text-base rounded-xl border border-amber-600 shadow-[0_3px_0_#b45309] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:shadow-none disabled:pointer-events-none cursor-pointer shrink-0"
        >
          <span>Submit</span>
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
