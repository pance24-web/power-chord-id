export type ThemeType = 'light' | 'dark' | 'amoled';

export type InstrumentType = 'guitar' | 'ukulele' | 'piano';

export interface ChordPosition {
  chord: string;
  frets: (number | 'x')[]; // guitar: 6 strings, ukulele: 4 strings
  fingers?: (number | null)[];
  barre?: {
    fret: number;
    from: number;
    to: number;
  };
  baseFret?: number;
  /** Piano: list of note names to highlight, e.g. ['C4', 'E4', 'G4'] */
  pianoNotes?: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  tempo?: number | string;
  capo?: number;
  difficulty?: 'Mudah' | 'Sedang' | 'Lanjutan';
  genre?: string;
  tags?: string[];
  views?: string;
  likes?: string;
  album?: string;
  year?: number | string;
  youtubeId?: string;
  chords: string[];
  content: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface ChordRequest {
  id: string;
  songTitle: string;
  artist: string;
  requesterEmail?: string;
  notes?: string;
  requestedAt: string;
}

export const STORAGE_KEYS = {
  THEME: 'powerchord_theme',
  FAVORITES: 'powerchord_favorites',
  CUSTOM_SONGS: 'powerchord_custom_songs',
  OFFLINE_FAVORITE_SONGS: 'powerchord_offline_favorites',
  OFFLINE_RECENT_SONGS: 'powerchord_offline_recent',
  SCROLL_SPEED: 'powerchord_scroll_speed',
  CHORD_REQUESTS: 'powerchord_chord_requests',
  PREFERRED_INSTRUMENT: 'powerchord_preferred_instrument',
} as const;
