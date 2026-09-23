import React, { useState, useRef, useEffect } from 'react';
import { ChordDefinition } from '../types/chord';
import { getChordDefinition } from '../utils/chordDb';
import { ChordDiagram } from './ChordDiagram';
import { Volume2, ExternalLink, Info } from 'lucide-react';
import { playChordStrum } from '../utils/audioSynth';

interface ChordHoverTokenProps {
  chordName: string;
  onClick: () => void;
}

export const ChordHoverToken: React.FC<ChordHoverTokenProps> = ({
  chordName,
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [popoverPlacement, setPopoverPlacement] = useState<'top' | 'bottom'>('top');
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const chordDef = getChordDefinition(chordName);

  // Check viewport bounds to prevent cut-off
  const checkPlacement = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // If there's not enough room above (less than 230px from top viewport), place below
      if (rect.top < 230) {
        setPopoverPlacement('bottom');
      } else {
        setPopoverPlacement('top');
      }
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    checkPlacement();
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(true);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chordDef) {
      playChordStrum(chordDef);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Chord Tag Button */}
      <button
        onClick={onClick}
        type="button"
        className={`font-mono font-extrabold text-xs sm:text-sm px-1.5 py-0.5 rounded-md transition-all duration-150 cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-indigo-600 text-white shadow-md scale-105 ring-2 ring-indigo-400/50'
            : 'text-indigo-700 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white bg-indigo-50/90 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 border border-indigo-200/80 dark:border-indigo-800/60'
        }`}
        title={`Hover untuk diagram cepat, klik untuk detail ${chordName}`}
        aria-expanded={isOpen}
      >
        {chordName}
      </button>

      {/* Instant Fingering Hover Popover */}
      {isOpen && (
        <div
          role="tooltip"
          onMouseEnter={() => {
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
            setIsOpen(true);
          }}
          onMouseLeave={handleMouseLeave}
          className={`absolute left-1/2 -translate-x-1/2 z-50 w-52 bg-white/98 dark:bg-[#121826]/98 amoled:bg-black/98 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 amoled:border-neutral-800 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 select-none ${
            popoverPlacement === 'top'
              ? 'bottom-full mb-2.5'
              : 'top-full mt-2.5'
          }`}
        >
          {/* Arrow Pointer */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#121826] amoled:bg-black border-slate-200/90 dark:border-slate-800 rotate-45 ${
              popoverPlacement === 'top'
                ? 'bottom-[-6px] border-r border-b'
                : 'top-[-6px] border-l border-t'
            }`}
          />

          {/* Popover Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                {chordName}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                {chordDef?.barres && chordDef.barres.length > 0 ? 'Kunci Palang' : 'Standar'}
              </span>
            </div>

            {/* Quick Audio Play Button */}
            {chordDef && (
              <button
                onClick={handleAudioPlay}
                title="Dengarkan petikan kunci (Strum)"
                className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Bunyi</span>
              </button>
            )}
          </div>

          {/* Fingering Diagram Body */}
          <div className="py-2 flex justify-center relative z-10">
            {chordDef ? (
              <div className="flex flex-col items-center">
                <ChordDiagram
                  chord={chordDef}
                  size="sm"
                  showPlayButton={false}
                  className="scale-95"
                />
                {chordDef.baseFret && chordDef.baseFret > 1 && (
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Fret mulai: {chordDef.baseFret}
                  </span>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col items-center gap-1">
                <Info className="w-4 h-4 text-slate-400" />
                <span>Diagram {chordName} belum terdaftar</span>
              </div>
            )}
          </div>

          {/* Popover Footer: Open Full Details */}
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onClick();
              }}
              className="w-full py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Variasi & Detail Lainnya</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
