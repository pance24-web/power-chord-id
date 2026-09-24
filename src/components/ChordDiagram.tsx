import React from 'react';
import { ChordPosition } from '../types/chord';
import { audioSynth } from '../utils/audioSynth';
import { Volume2 } from 'lucide-react';

interface ChordDiagramProps {
  chord: ChordPosition | null;
  chordName?: string;
  size?: 'sm' | 'md' | 'lg';
  showSoundButton?: boolean;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({
  chord,
  chordName,
  size = 'md',
  showSoundButton = true,
}) => {
  const displayChordName = chordName || chord?.chord || 'Chord';

  if (!chord) {
    return (
      <div className="flex flex-col items-center justify-center p-3 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-500">
        <span className="font-bold text-amber-500 mb-1">{displayChordName}</span>
        <span>Diagram tidak tersedia</span>
      </div>
    );
  }

  // Dimensions configuration based on size
  const config = {
    sm: { width: 100, height: 115, fretHeight: 18, stringSpacing: 14, dotRadius: 5 },
    md: { width: 130, height: 155, fretHeight: 25, stringSpacing: 18, dotRadius: 7 },
    lg: { width: 170, height: 200, fretHeight: 32, stringSpacing: 24, dotRadius: 9 },
  }[size];

  const numFrets = 4;
  const numStrings = 6;
  const startX = (config.width - (numStrings - 1) * config.stringSpacing) / 2;
  const startY = 32;

  const playChordSound = () => {
    // Play a gentle arpeggio of the chord
    const stringNotes: ('E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4')[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
    chord.frets.forEach((fret, stringIdx) => {
      if (fret !== 'x') {
        setTimeout(() => {
          audioSynth.playGuitarString(stringNotes[stringIdx]);
        }, stringIdx * 45);
      }
    });
  };

  return (
    <div className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs select-none">
      <div className="flex items-center justify-between w-full px-1 mb-1">
        <span className="font-mono font-bold text-base text-slate-800 dark:text-slate-100">
          {displayChordName}
        </span>
        {showSoundButton && (
          <button
            onClick={playChordSound}
            title="Dengarkan Petikan Akor"
            className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <svg width={config.width} height={config.height} className="overflow-visible">
        {/* Nut or Base Fret Number */}
        {chord.baseFret && chord.baseFret > 1 ? (
          <text
            x={startX - 10}
            y={startY + 12}
            className="text-[10px] font-mono fill-amber-600 dark:fill-amber-400 font-bold"
            textAnchor="end"
          >
            {chord.baseFret}fr
          </text>
        ) : (
          <line
            x1={startX - 2}
            y1={startY}
            x2={startX + (numStrings - 1) * config.stringSpacing + 2}
            y2={startY}
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-800 dark:text-slate-200"
          />
        )}

        {/* Fret Lines (Horizontal) */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={startX}
            y1={startY + i * config.fretHeight}
            x2={startX + (numStrings - 1) * config.stringSpacing}
            y2={startY + i * config.fretHeight}
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-slate-300 dark:text-slate-700"
          />
        ))}

        {/* Strings (Vertical) */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={startX + i * config.stringSpacing}
            y1={startY}
            x2={startX + i * config.stringSpacing}
            y2={startY + numFrets * config.fretHeight}
            stroke="currentColor"
            strokeWidth={1 + (5 - i) * 0.3} // Thicker for lower pitch strings
            className="text-slate-400 dark:text-slate-600"
          />
        ))}

        {/* Barre Chord Representation */}
        {chord.barre && (
          <rect
            x={startX + chord.barre.from * config.stringSpacing - config.dotRadius}
            y={
              startY +
              ((chord.barre.fret - (chord.baseFret ? chord.baseFret - 1 : 0)) - 0.5) * config.fretHeight -
              config.dotRadius
            }
            width={(chord.barre.to - chord.barre.from) * config.stringSpacing + config.dotRadius * 2}
            height={config.dotRadius * 2}
            rx={config.dotRadius}
            className="fill-amber-500 opacity-90"
          />
        )}

        {/* String Indicators ('x' or 'o' or Fingered Dot) */}
        {chord.frets.map((fret, stringIdx) => {
          const x = startX + stringIdx * config.stringSpacing;

          if (fret === 'x') {
            return (
              <text
                key={`mute-${stringIdx}`}
                x={x}
                y={startY - 6}
                textAnchor="middle"
                className="text-[11px] font-mono fill-rose-500 font-bold"
              >
                &times;
              </text>
            );
          }

          if (fret === 0) {
            return (
              <circle
                key={`open-${stringIdx}`}
                cx={x}
                cy={startY - 9}
                r={config.dotRadius - 2}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-slate-500 dark:text-slate-400"
              />
            );
          }

          // Relative fret position
          const relativeFret = typeof fret === 'number' ? fret - (chord.baseFret ? chord.baseFret - 1 : 0) : 1;
          const y = startY + (relativeFret - 0.5) * config.fretHeight;

          return (
            <g key={`dot-${stringIdx}`}>
              <circle cx={x} cy={y} r={config.dotRadius} className="fill-amber-500" />
              {chord.fingers && chord.fingers[stringIdx] && (
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-white font-bold pointer-events-none"
                >
                  {chord.fingers[stringIdx]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
