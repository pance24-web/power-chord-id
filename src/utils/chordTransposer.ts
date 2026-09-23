/**
 * Chord Transposer Engine
 * Robust semitone transposition with slash chord, suffix, and enharmonic support.
 */

const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map note name to pitch class index (0-11)
const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

// Regex to match a single chord root (e.g. C, C#, Bb) and optional slash chord
export const CHORD_REGEX = /\b([A-G][#b]?)(m|min|maj|M|dim|aug|sus[24]?|add[0-9]|7|9|11|13|6|maj7|maj9|m7|m9|m11|dim7|m7b5|5)?(\/[A-G][#b]?)?\b/g;

/**
 * Transpose a single root note by semitones
 */
export function transposeNote(note: string, semitones: number, preference: 'sharp' | 'flat' = 'sharp'): string {
  const cleanNote = note.trim();
  const index = NOTE_TO_INDEX[cleanNote];
  if (index === undefined) return note;

  const targetIndex = (index + semitones + 1200) % 12;
  return preference === 'flat' ? FLAT_SCALE[targetIndex] : SHARP_SCALE[targetIndex];
}

/**
 * Transpose a single chord token (e.g. "Am7", "C#/F", "Gsus4", "Bbmaj7")
 */
export function transposeChord(chord: string, semitones: number, preference: 'sharp' | 'flat' = 'sharp'): string {
  if (semitones === 0) return chord;

  // Check for slash chord: BaseChord / BassNote
  const slashParts = chord.split('/');
  const mainPart = slashParts[0];
  const bassPart = slashParts[1];

  // Match root + modifier
  const match = mainPart.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const root = match[1];
  const modifier = match[2] || '';
  const transposedRoot = transposeNote(root, semitones, preference);

  let result = transposedRoot + modifier;

  if (bassPart) {
    const bassMatch = bassPart.match(/^([A-G][#b]?)(.*)$/);
    if (bassMatch) {
      const bassRoot = bassMatch[1];
      const bassMod = bassMatch[2] || '';
      const transposedBass = transposeNote(bassRoot, semitones, preference);
      result += '/' + transposedBass + bassMod;
    } else {
      result += '/' + bassPart;
    }
  }

  return result;
}

/**
 * Test whether a word is likely a guitar chord
 */
export function isChordToken(token: string): boolean {
  const trimmed = token.trim();
  if (!trimmed) return false;
  
  // Exclude section labels or common words
  const excludeWords = ['A', 'I', 'IN', 'ON', 'TO', 'THE', 'DAN', 'DI', 'KE', 'DARI', 'SAAT', 'KAU', 'AKU', 'KITA', 'KU'];
  if (excludeWords.includes(trimmed.toUpperCase())) {
    // If it's just 'A', it could be chord A. In chord lines, A is a chord if adjacent tokens are also chords.
    return trimmed === 'A';
  }

  const chordPattern = /^[A-G][#b]?(m|min|maj|dim|aug|sus[24]?|add[0-9]|7|9|11|13|6|maj7|maj9|m7|m9|dim7|m7b5|5)?(\/[A-G][#b]?)?$/;
  return chordPattern.test(trimmed);
}

/**
 * Check if a text line is primarily a chord line (vs a lyric line)
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Header markers like [Intro], [Chorus], [Reff], (Intro), [Hook], Verse 1: are not chord lines
  if (/^(\[|\()?(\s*(intro|verse|chorus|reff|refrain|hook|bait|interlude|bridge|outro|solo|tab|ending|pre-chorus)[\s\d:.-]*)(\]|\))?$/i.test(trimmed)) {
    return false;
  }

  // Bracket format: contains [Chord] patterns
  if (/\[[A-G][#b]?[^\]]*\]/.test(line)) {
    return false; // Handled separately by inline parser
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  for (const token of tokens) {
    if (isChordToken(token)) {
      chordCount++;
    }
  }

  // If 70% or more tokens are valid chords, or if it's 1-2 tokens and all are valid chords
  return chordCount / tokens.length >= 0.65;
}

/**
 * Transpose an entire chord line preserving exact spacing
 */
export function transposeChordLine(line: string, semitones: number, preference: 'sharp' | 'flat' = 'sharp'): string {
  if (semitones === 0) return line;

  // Replace each chord word while maintaining character alignment as much as possible
  return line.replace(/\b([A-G][#b]?(?:m|min|maj|dim|aug|sus[24]?|add[0-9]|7|9|11|13|6|maj7|maj9|m7|m9|dim7|m7b5|5)?(?:\/[A-G][#b]?)?)\b/g, (match) => {
    if (isChordToken(match)) {
      return transposeChord(match, semitones, preference);
    }
    return match;
  });
}

/**
 * Transpose full song content by semitones
 */
export function transposeSongContent(content: string, semitones: number, preference: 'sharp' | 'flat' = 'sharp'): string {
  if (semitones === 0) return content;

  const lines = content.split('\n');
  const transposedLines = lines.map((line) => {
    // If line has bracketed chords like [C] or [Am7], transpose inside brackets
    if (/\[([A-G][#b]?[^\]]*)\]/.test(line)) {
      return line.replace(/\[([A-G][#b]?[^\]]*)\]/g, (match, chord) => {
        return `[${transposeChord(chord, semitones, preference)}]`;
      });
    }

    // If it's a chord line
    if (isChordLine(line)) {
      return transposeChordLine(line, semitones, preference);
    }

    return line;
  });

  return transposedLines.join('\n');
}

/**
 * Extract all unique chords present in the song text
 */
export function extractUniqueChords(content: string): string[] {
  const chordSet = new Set<string>();
  const lines = content.split('\n');

  for (const line of lines) {
    // Check bracket chords
    const bracketMatches = line.matchAll(/\[([A-G][#b]?[^\]]*)\]/g);
    for (const match of bracketMatches) {
      const chord = match[1].trim();
      if (isChordToken(chord)) {
        chordSet.add(chord);
      }
    }

    // Check chord lines
    if (isChordLine(line)) {
      const tokens = line.trim().split(/\s+/);
      for (const token of tokens) {
        if (isChordToken(token)) {
          chordSet.add(token);
        }
      }
    }
  }

  return Array.from(chordSet).sort();
}

/**
 * Calculate capo transposition equivalent
 * E.g., if song is played with Capo 2, playing C shape sounds like D (transposed +2).
 */
export function getCapoInfo(originalKey: string, capoFret: number, preference: 'sharp' | 'flat' = 'sharp'): {
  soundingKey: string;
  shapeKey: string;
  hint: string;
} {
  const soundingKey = transposeNote(originalKey, capoFret, preference);
  const shapeKey = transposeNote(originalKey, -capoFret, preference);

  if (capoFret === 0) {
    return {
      soundingKey: originalKey,
      shapeKey: originalKey,
      hint: 'Tanpa Capo (Standard)',
    };
  }

  return {
    soundingKey,
    shapeKey,
    hint: `Capo di Fret ${capoFret}: Kunci bentuk ${shapeKey} menghasilkan nada asli ${originalKey}`,
  };
}
