import type { Song } from '@/types/chord';

/** Canonical SEO slug for a song. Existing catalog IDs are already stable slugs. */
export function getSongSlug(song: Pick<Song, 'id'>): string {
  return song.id;
}

export function getSongPath(song: Pick<Song, 'id'>): string {
  return `/chord/${encodeURIComponent(getSongSlug(song))}`;
}
