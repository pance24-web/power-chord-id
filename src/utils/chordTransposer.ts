const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const ENHARMONIC_MAP: Record<string, number> = {
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
  'B': 11, 'Cb': 11
};

// Regex to identify standard guitar chord tokens
export const CHORD_REGEX = /\b([A-G][b#]?)(m|maj|min|dim|aug|sus|add)?([0-9]{1,2})?((\/[A-G][b#]?)?)\b/g;

export function transposeSingleChord(chord: string, semitones: number, preferFlats = false): string {
  if (!chord || semitones === 0) return chord;

  // Handle slash chords, e.g. G/B, Am7/G
  if (chord.includes('/')) {
    const parts = chord.split('/');
    const mainChord = transposeSingleChord(parts[0], semitones, preferFlats);
    const bassChord = transposeSingleChord(parts[1], semitones, preferFlats);
    return `${mainChord}/${bassChord}`;
  }

  // Match root note and the suffix (e.g. "C#" and "m7")
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chord;

  const root = match[1];
  const suffix = match[2];

  const rootIndex = ENHARMONIC_MAP[root];
  if (rootIndex === undefined) return chord;

  const newIndex = (rootIndex + semitones + 120) % 12;
  const scale = preferFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  const newRoot = scale[newIndex];

  return `${newRoot}${suffix}`;
}

export function isChordToken(token: string): boolean {
  if (!token) return false;
  const clean = token.trim();
  // Quick test: starts with A-G, length <= 10
  if (!/^[A-G][b#]?(m|maj|min|dim|aug|sus|add|7|9|11|13|6|2)*(\/[A-G][b#]?)?$/.test(clean)) {
    return false;
  }
  return true;
}

export function transposeText(text: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return text;

  // If text contains brackets [C] [Am], transpose inside brackets
  if (text.includes('[') && text.includes(']')) {
    return text.replace(/\[([A-G][b#]?[^\]]*)\]/g, (match, chord) => {
      return `[${transposeSingleChord(chord, semitones, preferFlats)}]`;
    });
  }

  // Otherwise line-by-line transpose chord lines
  const lines = text.split('\n');
  const transposedLines = lines.map((line) => {
    // Check if line looks like a chord line (mostly chord-like tokens and spaces)
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return line;

    const chordCount = tokens.filter(isChordToken).length;
    const isChordLine = chordCount >= Math.ceil(tokens.length * 0.7);

    if (isChordLine) {
      // Replace chords keeping spacing intact
      return line.replace(/\b[A-G][b#]?[a-zA-Z0-9#\+/\-]*\b/g, (word) => {
        if (isChordToken(word)) {
          return transposeSingleChord(word, semitones, preferFlats);
        }
        return word;
      });
    }

    return line;
  });

  return transposedLines.join('\n');
}
