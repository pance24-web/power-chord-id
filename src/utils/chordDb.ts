import { ChordDefinition } from '../types/chord';

/**
 * Standard Guitar Tuning: E2, A2, D3, G3, B3, E4
 * Strings are indexed 0 (Low E) to 5 (High E)
 * Frets: -1 = Muted (X), 0 = Open (O), 1..N = Fret
 * Fingers: 1=Index, 2=Middle, 3=Ring, 4=Pinky, 0=None
 */
export const CHORD_DATABASE: Record<string, ChordDefinition> = {
  // C family
  'C': { name: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
  'Cm': { name: 'Cm', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], baseFret: 3, barres: [3] },
  'C7': { name: 'C7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], baseFret: 1 },
  'Cmaj7': { name: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], baseFret: 1 },
  'Cm7': { name: 'Cm7', frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], baseFret: 3, barres: [3] },
  'Csus4': { name: 'Csus4', frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1], baseFret: 1, barres: [1] },
  'Csus2': { name: 'Csus2', frets: [-1, 3, 0, 0, 1, 0], fingers: [0, 3, 0, 0, 1, 0], baseFret: 1 },
  'Cadd9': { name: 'Cadd9', frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0], baseFret: 1 },

  // C# / Db family
  'C#': { name: 'C#', frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], baseFret: 4, barres: [4] },
  'Db': { name: 'Db', frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], baseFret: 4, barres: [4] },
  'C#m': { name: 'C#m', frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], baseFret: 4, barres: [4] },
  'Dbm': { name: 'Dbm', frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], baseFret: 4, barres: [4] },
  'C#7': { name: 'C#7', frets: [-1, 4, 6, 4, 6, 4], fingers: [0, 1, 3, 1, 4, 1], baseFret: 4, barres: [4] },
  'C#m7': { name: 'C#m7', frets: [-1, 4, 6, 4, 5, 4], fingers: [0, 1, 3, 1, 2, 1], baseFret: 4, barres: [4] },

  // D family
  'D': { name: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1 },
  'Dm': { name: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1 },
  'D7': { name: 'D7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], baseFret: 1 },
  'Dmaj7': { name: 'Dmaj7', frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3], baseFret: 1 },
  'Dm7': { name: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], baseFret: 1, barres: [1] },
  'Dsus4': { name: 'Dsus4', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 3, 4], baseFret: 1 },
  'Dsus2': { name: 'Dsus2', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0], baseFret: 1 },

  // D# / Eb family
  'D#': { name: 'D#', frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], baseFret: 6, barres: [6] },
  'Eb': { name: 'Eb', frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], baseFret: 6, barres: [6] },
  'D#m': { name: 'D#m', frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], baseFret: 6, barres: [6] },
  'Ebm': { name: 'Ebm', frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], baseFret: 6, barres: [6] },
  'Eb7': { name: 'Eb7', frets: [-1, 6, 8, 6, 8, 6], fingers: [0, 1, 3, 1, 4, 1], baseFret: 6, barres: [6] },

  // E family
  'E': { name: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], baseFret: 1 },
  'Em': { name: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], baseFret: 1 },
  'E7': { name: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], baseFret: 1 },
  'Emaj7': { name: 'Emaj7', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], baseFret: 1 },
  'Em7': { name: 'Em7', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0], baseFret: 1 },
  'Esus4': { name: 'Esus4', frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0], baseFret: 1 },

  // F family
  'F': { name: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, barres: [1] },
  'Fm': { name: 'Fm', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1, barres: [1] },
  'F7': { name: 'F7', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], baseFret: 1, barres: [1] },
  'Fmaj7': { name: 'Fmaj7', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], baseFret: 1 },
  'Fm7': { name: 'Fm7', frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], baseFret: 1, barres: [1] },
  'Fsus4': { name: 'Fsus4', frets: [1, 3, 3, 3, 1, 1], fingers: [1, 2, 3, 4, 1, 1], baseFret: 1, barres: [1] },

  // F# / Gb family
  'F#': { name: 'F#', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], baseFret: 2, barres: [2] },
  'Gb': { name: 'Gb', frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], baseFret: 2, barres: [2] },
  'F#m': { name: 'F#m', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], baseFret: 2, barres: [2] },
  'Gbm': { name: 'Gbm', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], baseFret: 2, barres: [2] },
  'F#7': { name: 'F#7', frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], baseFret: 2, barres: [2] },
  'F#m7': { name: 'F#m7', frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], baseFret: 2, barres: [2] },

  // G family
  'G': { name: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], baseFret: 1 },
  'Gm': { name: 'Gm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3, barres: [3] },
  'G7': { name: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], baseFret: 1 },
  'Gmaj7': { name: 'Gmaj7', frets: [3, -1, 0, 0, 0, 2], fingers: [2, 0, 0, 0, 0, 1], baseFret: 1 },
  'Gm7': { name: 'Gm7', frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], baseFret: 3, barres: [3] },
  'Gsus4': { name: 'Gsus4', frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4], baseFret: 1 },
  'G6': { name: 'G6', frets: [3, 2, 0, 0, 0, 0], fingers: [2, 1, 0, 0, 0, 0], baseFret: 1 },

  // G# / Ab family
  'G#': { name: 'G#', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], baseFret: 4, barres: [4] },
  'Ab': { name: 'Ab', frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], baseFret: 4, barres: [4] },
  'G#m': { name: 'G#m', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], baseFret: 4, barres: [4] },
  'Abm': { name: 'Abm', frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], baseFret: 4, barres: [4] },
  'G#7': { name: 'G#7', frets: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], baseFret: 4, barres: [4] },

  // A family
  'A': { name: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
  'Am': { name: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], baseFret: 1 },
  'A7': { name: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], baseFret: 1 },
  'Amaj7': { name: 'Amaj7', frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], baseFret: 1 },
  'Am7': { name: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], baseFret: 1 },
  'Asus4': { name: 'Asus4', frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
  'Asus2': { name: 'Asus2', frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], baseFret: 1 },

  // A# / Bb family
  'A#': { name: 'A#', frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barres: [1] },
  'Bb': { name: 'Bb', frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], baseFret: 1, barres: [1] },
  'A#m': { name: 'A#m', frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barres: [1] },
  'Bbm': { name: 'Bbm', frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], baseFret: 1, barres: [1] },
  'Bb7': { name: 'Bb7', frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1], baseFret: 1, barres: [1] },
  'Bbmaj7': { name: 'Bbmaj7', frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], baseFret: 1, barres: [1] },

  // B family
  'B': { name: 'B', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], baseFret: 2, barres: [2] },
  'Bm': { name: 'Bm', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], baseFret: 2, barres: [2] },
  'B7': { name: 'B7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], baseFret: 1 },
  'Bmaj7': { name: 'Bmaj7', frets: [-1, 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], baseFret: 2, barres: [2] },
  'Bm7': { name: 'Bm7', frets: [-1, 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], baseFret: 2, barres: [2] },
  'Bsus4': { name: 'Bsus4', frets: [-1, 2, 4, 4, 5, 2], fingers: [0, 1, 2, 3, 4, 1], baseFret: 2, barres: [2] },
  'Bdim': { name: 'Bdim', frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0], baseFret: 1 },
  'Bdim7': { name: 'Bdim7', frets: [-1, 2, 3, 1, 3, -1], fingers: [0, 2, 3, 1, 4, 0], baseFret: 1 },

  // Power Chords (5th Chords / Rock & Punk)
  'C5': { name: 'C5', frets: [-1, 3, 5, 5, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 3 },
  'C#5': { name: 'C#5', frets: [-1, 4, 6, 6, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 4 },
  'Db5': { name: 'Db5', frets: [-1, 4, 6, 6, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 4 },
  'D5': { name: 'D5', frets: [-1, -1, 0, 2, 3, -1], fingers: [0, 0, 0, 1, 2, 0], baseFret: 1 },
  'D#5': { name: 'D#5', frets: [-1, 6, 8, 8, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 6 },
  'Eb5': { name: 'Eb5', frets: [-1, 6, 8, 8, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 6 },
  'E5': { name: 'E5', frets: [0, 2, 2, -1, -1, -1], fingers: [0, 1, 2, 0, 0, 0], baseFret: 1 },
  'F5': { name: 'F5', frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 1 },
  'F#5': { name: 'F#5', frets: [2, 4, 4, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 2 },
  'Gb5': { name: 'Gb5', frets: [2, 4, 4, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 2 },
  'G5': { name: 'G5', frets: [3, 5, 5, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 3 },
  'G#5': { name: 'G#5', frets: [4, 6, 6, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 4 },
  'Ab5': { name: 'Ab5', frets: [4, 6, 6, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 4 },
  'A5': { name: 'A5', frets: [-1, 0, 2, 2, -1, -1], fingers: [0, 0, 1, 2, 0, 0], baseFret: 1 },
  'A#5': { name: 'A#5', frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 1 },
  'Bb5': { name: 'Bb5', frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 1 },
  'B5': { name: 'B5', frets: [-1, 2, 4, 4, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 2 },
};

/**
 * Common slash chords
 */
const SLASH_CHORD_MODS: Record<string, ChordDefinition> = {
  'G/B': { name: 'G/B', frets: [-1, 2, 0, 0, 3, 3], fingers: [0, 1, 0, 0, 3, 4], baseFret: 1 },
  'C/E': { name: 'C/E', frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
  'D/F#': { name: 'D/F#', frets: [2, 0, 0, 2, 3, 2], fingers: [1, 0, 0, 2, 4, 3], baseFret: 1 },
  'Am/G': { name: 'Am/G', frets: [3, 0, 2, 2, 1, 0], fingers: [3, 0, 2, 1, 1, 0], baseFret: 1 },
  'F/A': { name: 'F/A', frets: [-1, 0, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], baseFret: 1 },
};

/**
 * Lookup chord definition or produce a sensible approximation
 */
export function getChordDefinition(chordName: string): ChordDefinition | null {
  const clean = chordName.trim();
  if (SLASH_CHORD_MODS[clean]) {
    return SLASH_CHORD_MODS[clean];
  }
  if (CHORD_DATABASE[clean]) {
    return CHORD_DATABASE[clean];
  }

  // Handle slash chord fallback: lookup main chord
  if (clean.includes('/')) {
    const mainChord = clean.split('/')[0];
    if (CHORD_DATABASE[mainChord]) {
      return {
        ...CHORD_DATABASE[mainChord],
        name: clean,
      };
    }
  }

  // Handle enharmonics: C# <-> Db, etc.
  const enharmonics: Record<string, string> = {
    'Db': 'C#', 'D#': 'Eb', 'Gb': 'F#', 'Ab': 'G#', 'A#': 'Bb',
    'C#': 'Db', 'Eb': 'D#', 'F#': 'Gb', 'G#': 'Ab', 'Bb': 'A#',
  };

  const rootMatch = clean.match(/^([A-G][#b]?)(.*)$/);
  if (rootMatch) {
    const root = rootMatch[1];
    const mod = rootMatch[2];
    const altRoot = enharmonics[root];
    if (altRoot && CHORD_DATABASE[altRoot + mod]) {
      return {
        ...CHORD_DATABASE[altRoot + mod],
        name: clean,
      };
    }
  }

  return null;
}
