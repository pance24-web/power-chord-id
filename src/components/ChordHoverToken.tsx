import React, { useState } from 'react';
import { getChordData } from '../utils/chordDb';
import { ChordDiagram } from './ChordDiagram';

interface ChordHoverTokenProps {
  chord: string;
  onClickChord?: (chord: string) => void;
}

export const ChordHoverToken: React.FC<ChordHoverTokenProps> = ({
  chord,
  onClickChord,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const chordData = getChordData(chord);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onClickChord) onClickChord(chord);
        }}
        className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer select-text px-0.5 rounded-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40"
      >
        {chord}
      </button>

      {/* Floating Hover Card */}
      {showTooltip && chordData && (
        <div className="absolute z-40 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none drop-shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <ChordDiagram chord={chordData} chordName={chord} size="sm" showSoundButton={false} />
          </div>
          {/* Arrow */}
          <div className="w-2.5 h-2.5 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 rotate-45 mx-auto -mt-1.5" />
        </div>
      )}
    </span>
  );
};
