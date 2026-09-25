export type ThemeType = 'light' | 'dark' | 'amoled';

export interface ChordPosition {
  chord: string;
  frets: (number | 'x')[]; // 6 strings from low E to high E: e.g. ['x', 3, 2, 0, 1, 0] for C
  fingers?: (number | null)[]; // 1=index, 2=middle, 3=ring, 4=pinky
  barre?: {
    fret: number;
    from: number; // string index 0-5
    to: number;   // string index 0-5
  };
  baseFret?: number; // Starting fret, default 1
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
  content: string; // The lyrics and chord progression markup
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
} as const;
