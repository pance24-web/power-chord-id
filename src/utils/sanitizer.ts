/**
 * Input sanitization and validation utilities for PowerChord (SEC-01)
 * Protects against Stored XSS, HTML injection, and ReDoS attacks.
 */

export function sanitizeText(input: unknown, maxLength = 200): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Strip angle brackets to prevent HTML injection
    .replace(/javascript:/gi, '') // Prevent javascript: pseudo-protocols
    .slice(0, maxLength);
}

export function sanitizeChordContent(content: unknown, maxLength = 30000): string {
  if (typeof content !== 'string') return '';
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags completely
    .replace(/<[^>]*>?/gm, '') // Strip any HTML tags
    .slice(0, maxLength);
}

export function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return false;
  // Safe RFC 5322 regex without ReDoS vulnerability
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

export interface ValidatedSongInput {
  title: string;
  artist: string;
  originalKey: string;
  tempo: number;
  capo: number;
  genre: string;
  difficulty: 'Mudah' | 'Sedang' | 'Lanjutan';
  content: string;
}

export function validateSongInput(data: Partial<ValidatedSongInput>): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: ValidatedSongInput;
} {
  const errors: Record<string, string> = {};

  const cleanTitle = sanitizeText(data.title, 100);
  if (!cleanTitle || cleanTitle.length < 2) {
    errors.title = 'Judul lagu wajib diisi minimal 2 karakter.';
  }

  const cleanArtist = sanitizeText(data.artist, 100);
  if (!cleanArtist || cleanArtist.length < 2) {
    errors.artist = 'Nama artis wajib diisi minimal 2 karakter.';
  }

  const cleanContent = sanitizeChordContent(data.content);
  if (!cleanContent || cleanContent.length < 10) {
    errors.content = 'Isi lirik dan chord wajib diisi minimal 10 karakter.';
  }

  const cleanKey = sanitizeText(data.originalKey || 'C', 10);
  const cleanGenre = sanitizeText(data.genre || 'Pop', 50);

  const tempoNum = Number(data.tempo) || 80;
  if (tempoNum < 30 || tempoNum > 300) {
    errors.tempo = 'Tempo (BPM) harus di antara 30 dan 300.';
  }

  const capoNum = Number(data.capo) || 0;
  if (capoNum < 0 || capoNum > 12) {
    errors.capo = 'Fret Capo harus antara 0 sampai 12.';
  }

  const validDifficulties = ['Mudah', 'Sedang', 'Lanjutan'] as const;
  const diff = validDifficulties.includes(data.difficulty as any) ? data.difficulty! : 'Mudah';

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      title: cleanTitle,
      artist: cleanArtist,
      originalKey: cleanKey,
      tempo: tempoNum,
      capo: capoNum,
      genre: cleanGenre,
      difficulty: diff,
      content: cleanContent,
    },
  };
}
