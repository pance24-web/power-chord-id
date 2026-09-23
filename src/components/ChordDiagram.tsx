import React from 'react';
import { ChordDefinition } from '../types/chord';
import { playChordStrum } from '../utils/audioSynth';
import { Volume2 } from 'lucide-react';

interface ChordDiagramProps {
  chord: ChordDefinition;
  size?: 'sm' | 'md' | 'lg';
  showPlayButton?: boolean;
  className?: string;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({
  chord,
  size = 'md',
  showPlayButton = true,
  className = '',
}) => {
  const { name, frets, fingers = [], baseFret = 1, barres = [] } = chord;

  // Sizing configurations
  const width = size === 'sm' ? 100 : size === 'lg' ? 180 : 130;
  const height = size === 'sm' ? 120 : size === 'lg' ? 210 : 155;
  const marginX = size === 'sm' ? 18 : 22;
  const marginTop = size === 'sm' ? 24 : 32;
  const marginBottom = size === 'sm' ? 16 : 20;

  const numStrings = 6;
  const numFrets = 4;

  const fretWidth = (width - marginX * 2) / (numStrings - 1);
  const fretHeight = (height - marginTop - marginBottom) / numFrets;

  // Determine finger dot radius
  const dotRadius = size === 'sm' ? 5 : size === 'lg' ? 8 : 6.5;

  const handlePlayStrum = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChordStrum(chord);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center justify-between w-full px-1 mb-1">
        <span className="font-bold text-sm md:text-base text-neutral-900 dark:text-neutral-100 tracking-tight">
          {name}
        </span>
        {showPlayButton && (
          <button
            onClick={handlePlayStrum}
            title="Dengarkan kunci"
            className="p-1 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label={`Dengarkan kunci ${name}`}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Nut (Thick line if baseFret is 1) */}
        {baseFret === 1 ? (
          <line
            x1={marginX}
            y1={marginTop}
            x2={width - marginX}
            y2={marginTop}
            stroke="currentColor"
            strokeWidth="4"
            className="text-neutral-800 dark:text-neutral-200"
          />
        ) : (
          <>
            {/* Base Fret indicator on the side */}
            <text
              x={marginX - 8}
              y={marginTop + fretHeight / 2 + 4}
              fontSize={size === 'sm' ? '10' : '11'}
              fontWeight="bold"
              textAnchor="end"
              className="fill-neutral-500 dark:fill-neutral-400 font-mono"
            >
              {baseFret}fr
            </text>
            <line
              x1={marginX}
              y1={marginTop}
              x2={width - marginX}
              y2={marginTop}
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-neutral-400 dark:text-neutral-600"
            />
          </>
        )}

        {/* Fret wire lines (Horizontal) */}
        {Array.from({ length: numFrets }).map((_, i) => {
          const y = marginTop + (i + 1) * fretHeight;
          return (
            <line
              key={`fret-${i}`}
              x1={marginX}
              y1={y}
              x2={width - marginX}
              y2={y}
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-neutral-300 dark:text-neutral-700"
            />
          );
        })}

        {/* Guitar strings (Vertical, from 6th E to 1st e) */}
        {Array.from({ length: numStrings }).map((_, i) => {
          const x = marginX + i * fretWidth;
          // Thicker stroke for low strings
          const stringThickness = 2.2 - (i * 0.25);
          return (
            <line
              key={`string-${i}`}
              x1={x}
              y1={marginTop}
              x2={x}
              y2={marginTop + numFrets * fretHeight}
              stroke="currentColor"
              strokeWidth={Math.max(1, stringThickness)}
              className="text-neutral-400 dark:text-neutral-600"
            />
          );
        })}

        {/* Barre chords if defined */}
        {barres.map((barreFret, idx) => {
          const relativeFret = barreFret - baseFret + 1;
          if (relativeFret >= 1 && relativeFret <= numFrets) {
            const y = marginTop + (relativeFret - 0.5) * fretHeight;
            // find string range for barre
            const barreIndices: number[] = [];
            frets.forEach((f, strIdx) => {
              if (f === barreFret) barreIndices.push(strIdx);
            });
            const minStr = Math.min(...barreIndices, 0);
            const maxStr = Math.max(...barreIndices, 5);

            return (
              <rect
                key={`barre-${idx}`}
                x={marginX + minStr * fretWidth - dotRadius}
                y={y - dotRadius}
                width={(maxStr - minStr) * fretWidth + dotRadius * 2}
                height={dotRadius * 2}
                rx={dotRadius}
                className="fill-amber-600 dark:fill-amber-500 opacity-90"
              />
            );
          }
          return null;
        })}

        {/* String markers: Muted (X), Open (O), or Finger positions */}
        {frets.map((fret, strIdx) => {
          const x = marginX + strIdx * fretWidth;

          if (fret === -1) {
            // Muted string (X above nut)
            return (
              <text
                key={`mute-${strIdx}`}
                x={x}
                y={marginTop - 8}
                textAnchor="middle"
                fontSize={size === 'sm' ? '10' : '12'}
                fontWeight="bold"
                className="fill-neutral-400 dark:fill-neutral-500"
              >
                ✕
              </text>
            );
          }

          if (fret === 0) {
            // Open string (O above nut)
            return (
              <circle
                key={`open-${strIdx}`}
                cx={x}
                cy={marginTop - 11}
                r={dotRadius * 0.65}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                className="text-neutral-600 dark:text-neutral-300"
              />
            );
          }

          // Fretted note: check if it falls within visible window
          const relativeFret = fret - baseFret + 1;
          if (relativeFret >= 1 && relativeFret <= numFrets) {
            const y = marginTop + (relativeFret - 0.5) * fretHeight;
            const finger = fingers[strIdx];

            return (
              <g key={`fret-dot-${strIdx}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={dotRadius}
                  className="fill-amber-600 dark:fill-amber-500"
                />
                {finger && finger > 0 && size !== 'sm' && (
                  <text
                    x={x}
                    y={y + 3.5}
                    textAnchor="middle"
                    fontSize={size === 'lg' ? '10' : '8'}
                    fontWeight="bold"
                    className="fill-white font-mono pointer-events-none"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
};
