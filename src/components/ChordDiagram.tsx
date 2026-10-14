import React from 'react';
import { ChordPosition, InstrumentType } from '../types/chord';
import { audioSynth } from '../utils/audioSynth';
import { Volume2 } from 'lucide-react';

interface ChordDiagramProps {
  chord: ChordPosition | null;
  chordName?: string;
  size?: 'sm' | 'md' | 'lg';
  showSoundButton?: boolean;
  instrument?: InstrumentType;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({
  chord,
  chordName,
  size = 'md',
  showSoundButton = true,
  instrument = 'guitar',
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

  if (instrument === 'piano') {
    return (
      <PianoDiagram
        chordName={displayChordName}
        notes={chord.pianoNotes || []}
        size={size}
        showSoundButton={showSoundButton}
      />
    );
  }

  const isUkulele = instrument === 'ukulele';
  const numStrings = isUkulele ? 4 : 6;

  const config = {
    sm: {
      width: isUkulele ? 90 : 100,
      height: 115,
      fretHeight: 18,
      stringSpacing: isUkulele ? 18 : 14,
      dotRadius: 5,
    },
    md: {
      width: isUkulele ? 120 : 130,
      height: 155,
      fretHeight: 25,
      stringSpacing: isUkulele ? 24 : 18,
      dotRadius: 7,
    },
    lg: {
      width: isUkulele ? 150 : 170,
      height: 200,
      fretHeight: 32,
      stringSpacing: isUkulele ? 30 : 24,
      dotRadius: 9,
    },
  }[size];

  const numFrets = 4;
  const startX = (config.width - (numStrings - 1) * config.stringSpacing) / 2;
  const startY = 32;

  const playChordSound = () => {
    if (isUkulele) {
      // Simple open-string style pluck for ukulele
      const ukeNotes: ('G3' | 'C4' | 'E4' | 'A4')[] = ['G3', 'C4', 'E4', 'A4'];
      chord.frets.forEach((fret, stringIdx) => {
        if (fret !== 'x' && stringIdx < ukeNotes.length) {
          setTimeout(() => {
            audioSynth.playGuitarString(ukeNotes[stringIdx] as any);
          }, stringIdx * 50);
        }
      });
    } else {
      const stringNotes: ('E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4')[] = [
        'E2',
        'A2',
        'D3',
        'G3',
        'B3',
        'E4',
      ];
      chord.frets.forEach((fret, stringIdx) => {
        if (fret !== 'x') {
          setTimeout(() => {
            audioSynth.playGuitarString(stringNotes[stringIdx]);
          }, stringIdx * 45);
        }
      });
    }
  };

  const stringLabels = isUkulele ? ['G', 'C', 'E', 'A'] : null;

  return (
    <div className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs select-none">
      <div className="flex items-center justify-between w-full px-1 mb-1">
        <span className="font-mono font-bold text-base text-slate-800 dark:text-slate-100">
          {displayChordName}
        </span>
        {showSoundButton && (
          <button
            onClick={playChordSound}
            title="Dengarkan petikan"
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

        {/* Fret Lines */}
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

        {/* Strings */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={startX + i * config.stringSpacing}
            y1={startY}
            x2={startX + i * config.stringSpacing}
            y2={startY + numFrets * config.fretHeight}
            stroke="currentColor"
            strokeWidth={isUkulele ? 1.4 : 1 + (5 - i) * 0.3}
            className="text-slate-400 dark:text-slate-600"
          />
        ))}

        {/* String labels for ukulele */}
        {stringLabels &&
          stringLabels.map((label, i) => (
            <text
              key={`label-${i}`}
              x={startX + i * config.stringSpacing}
              y={startY + numFrets * config.fretHeight + 14}
              textAnchor="middle"
              className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500"
            >
              {label}
            </text>
          ))}

        {/* Barre */}
        {chord.barre && (
          <rect
            x={startX + chord.barre.from * config.stringSpacing - config.dotRadius}
            y={
              startY +
              ((chord.barre.fret - (chord.baseFret ? chord.baseFret - 1 : 0)) - 0.5) *
                config.fretHeight -
              config.dotRadius
            }
            width={
              (chord.barre.to - chord.barre.from) * config.stringSpacing + config.dotRadius * 2
            }
            height={config.dotRadius * 2}
            rx={config.dotRadius}
            className="fill-amber-500 opacity-90"
          />
        )}

        {/* Dots / open / muted */}
        {chord.frets.map((fret, stringIdx) => {
          if (stringIdx >= numStrings) return null;
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

          const relativeFret =
            typeof fret === 'number' ? fret - (chord.baseFret ? chord.baseFret - 1 : 0) : 1;
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

/* ---------- Piano Diagram ---------- */

interface PianoDiagramProps {
  chordName: string;
  notes: string[];
  size: 'sm' | 'md' | 'lg';
  showSoundButton: boolean;
}

const PianoDiagram: React.FC<PianoDiagramProps> = ({
  chordName,
  notes,
  size,
  showSoundButton,
}) => {
  // Show one octave + a bit more (C4–C5)
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = [
    { note: 'C#', after: 0 },
    { note: 'D#', after: 1 },
    { note: 'F#', after: 3 },
    { note: 'G#', after: 4 },
    { note: 'A#', after: 5 },
  ];

  const sizeConfig = {
    sm: { whiteW: 14, whiteH: 48, blackW: 9, blackH: 30 },
    md: { whiteW: 18, whiteH: 64, blackW: 12, blackH: 40 },
    lg: { whiteW: 22, whiteH: 80, blackW: 14, blackH: 50 },
  }[size];

  const { whiteW, whiteH, blackW, blackH } = sizeConfig;
  const totalWidth = whiteKeys.length * whiteW;

  // Normalize notes to base name without octave for highlighting
  const activeBaseNotes = new Set(
    notes.map((n) => n.replace(/[0-9]/g, '').replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#')),
  );

  const playPiano = () => {
    notes.forEach((note, i) => {
      setTimeout(() => {
        // Map to closest guitar synth string as fallback
        const base = note.replace(/[0-9]/g, '');
        const map: Record<string, any> = {
          C: 'C4',
          'C#': 'C4',
          D: 'D3',
          'D#': 'D3',
          E: 'E4',
          F: 'E4',
          'F#': 'G3',
          G: 'G3',
          'G#': 'G3',
          A: 'A2',
          'A#': 'A2',
          B: 'B3',
        };
        audioSynth.playGuitarString(map[base] || 'E4');
      }, i * 80);
    });
  };

  return (
    <div className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs select-none">
      <div className="flex items-center justify-between w-full px-1 mb-2">
        <span className="font-mono font-bold text-base text-slate-800 dark:text-slate-100">
          {chordName}
        </span>
        {showSoundButton && (
          <button
            onClick={playPiano}
            title="Dengarkan akor piano"
            className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="relative" style={{ width: totalWidth, height: whiteH }}>
        {/* White keys */}
        <div className="flex absolute inset-0">
          {whiteKeys.map((note) => {
            const active = activeBaseNotes.has(note);
            return (
              <div
                key={note}
                className={`border border-slate-300 dark:border-slate-600 rounded-b-sm flex items-end justify-center pb-1 text-[8px] font-mono ${
                  active
                    ? 'bg-amber-400 text-white border-amber-500'
                    : 'bg-white dark:bg-slate-100 text-slate-400'
                }`}
                style={{ width: whiteW, height: whiteH }}
              >
                {active ? note : ''}
              </div>
            );
          })}
        </div>

        {/* Black keys */}
        {blackKeys.map(({ note, after }) => {
          const active = activeBaseNotes.has(note);
          const left = (after + 1) * whiteW - blackW / 2;
          return (
            <div
              key={note}
              className={`absolute top-0 rounded-b-sm z-10 flex items-end justify-center pb-0.5 text-[7px] font-mono ${
                active ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
              style={{ left, width: blackW, height: blackH }}
            >
              {active ? note : ''}
            </div>
          );
        })}
      </div>

      {notes.length > 0 && (
        <p className="mt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          {notes.join(' · ')}
        </p>
      )}
    </div>
  );
};
