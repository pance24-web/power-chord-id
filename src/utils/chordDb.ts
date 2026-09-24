import { ChordPosition } from '../types/chord';

// Standard dictionary of guitar chord positions: frets for strings [E, A, D, G, B, e]
// 0 = open, 'x' = muted, numbers = fret
export const CHORD_DATABASE: Record<string, ChordPosition> = {
  // C family
  'C': { chord: 'C', frets: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null] },
  'Cm': { chord: 'Cm', frets: ['x', 3, 5, 5, 4, 3], baseFret: 3, barre: { fret: 3, from: 1, to: 5 } },
  'C7': { chord: 'C7', frets: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null] },
  'Cmaj7': { chord: 'Cmaj7', frets: ['x', 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null] },
  'Cm7': { chord: 'Cm7', frets: ['x', 3, 5, 3, 4, 3], baseFret: 3, barre: { fret: 3, from: 1, to: 5 } },
  'Csus4': { chord: 'Csus4', frets: ['x', 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 2] },
  'Cadd9': { chord: 'Cadd9', frets: ['x', 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null] },

  // C# / Db
  'C#': { chord: 'C#', frets: ['x', 4, 6, 6, 6, 4], baseFret: 4, barre: { fret: 4, from: 1, to: 5 } },
  'Db': { chord: 'Db', frets: ['x', 4, 6, 6, 6, 4], baseFret: 4, barre: { fret: 4, from: 1, to: 5 } },
  'C#m': { chord: 'C#m', frets: ['x', 4, 6, 6, 5, 4], baseFret: 4, barre: { fret: 4, from: 1, to: 5 } },
  'Dbm': { chord: 'Dbm', frets: ['x', 4, 6, 6, 5, 4], baseFret: 4, barre: { fret: 4, from: 1, to: 5 } },
  'C#7': { chord: 'C#7', frets: ['x', 4, 6, 4, 6, 4], baseFret: 4, barre: { fret: 4, from: 1, to: 5 } },

  // D family
  'D': { chord: 'D', frets: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] },
  'Dm': { chord: 'Dm', frets: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1] },
  'D7': { chord: 'D7', frets: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3] },
  'Dmaj7': { chord: 'Dmaj7', frets: ['x', 'x', 0, 2, 2, 2], fingers: [null, null, null, 1, 1, 1], barre: { fret: 2, from: 3, to: 5 } },
  'Dm7': { chord: 'Dm7', frets: ['x', 'x', 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], barre: { fret: 1, from: 4, to: 5 } },
  'Dsus4': { chord: 'Dsus4', frets: ['x', 'x', 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 4] },
  'Dsus2': { chord: 'Dsus2', frets: ['x', 'x', 0, 2, 3, 0], fingers: [null, null, null, 1, 2, null] },

  // D# / Eb
  'D#': { chord: 'D#', frets: ['x', 6, 8, 8, 8, 6], baseFret: 6, barre: { fret: 6, from: 1, to: 5 } },
  'Eb': { chord: 'Eb', frets: ['x', 6, 8, 8, 8, 6], baseFret: 6, barre: { fret: 6, from: 1, to: 5 } },
  'D#m': { chord: 'D#m', frets: ['x', 6, 8, 8, 7, 6], baseFret: 6, barre: { fret: 6, from: 1, to: 5 } },
  'Ebm': { chord: 'Ebm', frets: ['x', 6, 8, 8, 7, 6], baseFret: 6, barre: { fret: 6, from: 1, to: 5 } },

  // E family
  'E': { chord: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null] },
  'Em': { chord: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null] },
  'E7': { chord: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null] },
  'Emaj7': { chord: 'Emaj7', frets: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null] },
  'Em7': { chord: 'Em7', frets: [0, 2, 2, 0, 3, 0], fingers: [null, 1, 2, null, 3, null] },
  'Esus4': { chord: 'Esus4', frets: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null] },

  // F family
  'F': { chord: 'F', frets: [1, 3, 3, 2, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 } },
  'Fm': { chord: 'Fm', frets: [1, 3, 3, 1, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 } },
  'F7': { chord: 'F7', frets: [1, 3, 1, 2, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 } },
  'Fmaj7': { chord: 'Fmaj7', frets: ['x', 'x', 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null] },
  'Fm7': { chord: 'Fm7', frets: [1, 3, 1, 1, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 } },

  // F# / Gb
  'F#': { chord: 'F#', frets: [2, 4, 4, 3, 2, 2], baseFret: 2, barre: { fret: 2, from: 0, to: 5 } },
  'Gb': { chord: 'Gb', frets: [2, 4, 4, 3, 2, 2], baseFret: 2, barre: { fret: 2, from: 0, to: 5 } },
  'F#m': { chord: 'F#m', frets: [2, 4, 4, 2, 2, 2], baseFret: 2, barre: { fret: 2, from: 0, to: 5 } },
  'Gbm': { chord: 'Gbm', frets: [2, 4, 4, 2, 2, 2], baseFret: 2, barre: { fret: 2, from: 0, to: 5 } },
  'F#7': { chord: 'F#7', frets: [2, 4, 2, 3, 2, 2], baseFret: 2, barre: { fret: 2, from: 0, to: 5 } },
  'F#m7': { chord: 'F#m7', frets: [2, 4, 2, 2, 2, 2], baseFret: 2, barre: { fret: 2, from: 0, to: 5 } },

  // G family
  'G': { chord: 'G', frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, null, null, 3, 4] },
  'Gm': { chord: 'Gm', frets: [3, 5, 5, 3, 3, 3], baseFret: 3, barre: { fret: 3, from: 0, to: 5 } },
  'G7': { chord: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1] },
  'Gmaj7': { chord: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, null, null, null, 1] },
  'Gm7': { chord: 'Gm7', frets: [3, 5, 3, 3, 3, 3], baseFret: 3, barre: { fret: 3, from: 0, to: 5 } },
  'Gsus4': { chord: 'Gsus4', frets: [3, 3, 0, 0, 1, 3], fingers: [3, 4, null, null, 1, 2] },

  // G# / Ab
  'G#': { chord: 'G#', frets: [4, 6, 6, 5, 4, 4], baseFret: 4, barre: { fret: 4, from: 0, to: 5 } },
  'Ab': { chord: 'Ab', frets: [4, 6, 6, 5, 4, 4], baseFret: 4, barre: { fret: 4, from: 0, to: 5 } },
  'G#m': { chord: 'G#m', frets: [4, 6, 6, 4, 4, 4], baseFret: 4, barre: { fret: 4, from: 0, to: 5 } },
  'Abm': { chord: 'Abm', frets: [4, 6, 6, 4, 4, 4], baseFret: 4, barre: { fret: 4, from: 0, to: 5 } },

  // A family
  'A': { chord: 'A', frets: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null] },
  'Am': { chord: 'Am', frets: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null] },
  'A7': { chord: 'A7', frets: ['x', 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null] },
  'Amaj7': { chord: 'Amaj7', frets: ['x', 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null] },
  'Am7': { chord: 'Am7', frets: ['x', 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null] },
  'Asus4': { chord: 'Asus4', frets: ['x', 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null] },
  'Asus2': { chord: 'Asus2', frets: ['x', 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null] },

  // A# / Bb
  'A#': { chord: 'A#', frets: ['x', 1, 3, 3, 3, 1], baseFret: 1, barre: { fret: 1, from: 1, to: 5 } },
  'Bb': { chord: 'Bb', frets: ['x', 1, 3, 3, 3, 1], baseFret: 1, barre: { fret: 1, from: 1, to: 5 } },
  'A#m': { chord: 'A#m', frets: ['x', 1, 3, 3, 2, 1], baseFret: 1, barre: { fret: 1, from: 1, to: 5 } },
  'Bbm': { chord: 'Bbm', frets: ['x', 1, 3, 3, 2, 1], baseFret: 1, barre: { fret: 1, from: 1, to: 5 } },
  'Bb7': { chord: 'Bb7', frets: ['x', 1, 3, 1, 3, 1], baseFret: 1, barre: { fret: 1, from: 1, to: 5 } },

  // B family
  'B': { chord: 'B', frets: ['x', 2, 4, 4, 4, 2], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } },
  'Bm': { chord: 'Bm', frets: ['x', 2, 4, 4, 3, 2], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } },
  'B7': { chord: 'B7', frets: ['x', 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4] },
  'Bmaj7': { chord: 'Bmaj7', frets: ['x', 2, 4, 3, 4, 2], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } },
  'Bm7': { chord: 'Bm7', frets: ['x', 2, 4, 2, 3, 2], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } },
  'Bsus4': { chord: 'Bsus4', frets: ['x', 2, 4, 4, 5, 2], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } },
};

export function getChordData(chordName: string): ChordPosition | null {
  if (!chordName) return null;
  const clean = chordName.trim();

  // Direct match
  if (CHORD_DATABASE[clean]) {
    return CHORD_DATABASE[clean];
  }

  // Handle slash chord root, e.g. G/B -> return G
  if (clean.includes('/')) {
    const root = clean.split('/')[0];
    if (CHORD_DATABASE[root]) {
      return { ...CHORD_DATABASE[root], chord: clean };
    }
  }

  // Fallback to basic root (e.g. C#m7 -> C#m or C#)
  const rootMatch = clean.match(/^([A-G][b#]?)(m|maj7|7|sus4)?/);
  if (rootMatch && rootMatch[0] && CHORD_DATABASE[rootMatch[0]]) {
    return { ...CHORD_DATABASE[rootMatch[0]], chord: clean };
  }

  return null;
}
