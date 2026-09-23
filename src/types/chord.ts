export type GenreType =
  | 'Pop'
  | 'Rock'
  | 'Dangdut'
  | 'Indie'
  | 'Reggae'
  | 'Minang'
  | 'Melayu'
  | 'Akustik'
  | 'Barat';

export type DifficultyType = 'Mudah' | 'Sedang' | 'Sulit';
export type ThemeType = 'light' | 'dark' | 'amoled';

export interface ChordDefinition {
  name: string;
  frets: number[]; // 6 strings: [E2, A2, D3, G3, B3, E4], -1 for mute (X), 0 for open (O), 1..N for fret number
  fingers?: number[]; // [E2, A2, D3, G3, B3, E4], 0 for none, 1 for index, 2 for middle, 3 for ring, 4 for pinky
  baseFret?: number; // Starting fret (default 1)
  barres?: number[]; // Barre fret numbers
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  genre: GenreType;
  difficulty?: DifficultyType;
  tempo?: number;
  timeSignature?: string;
  capo?: number;
  content: string; // The formatted song text with chords
  tags?: string[];
  views?: string; // e.g. "76.4K"
  likes?: string; // e.g. "3.2K"
  rank?: number;
  isCustom?: boolean;
  createdAt?: number;
}

export interface SongSettings {
  transpose: number; // Semitones offset (-11 to +11)
  capo: number; // Capo fret (0 to 7)
  fontSize: number; // In px, e.g. 16
  fontMono: boolean;
  showDiagrams: boolean;
  accidentalPreference: 'sharp' | 'flat';
  leftHanded: boolean;
}

export interface ChordRequest {
  id: string;
  songTitle: string;
  artistName: string;
  requesterName?: string;
  requesterEmail?: string;
  notes?: string;
  createdAt: number;
}
