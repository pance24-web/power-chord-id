import { ChordDefinition } from '../types/chord';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Open string frequencies in standard tuning (Hz): E2, A2, D3, G3, B3, E4
export const OPEN_STRING_FREQS = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
export const STRING_NAMES = ['6 (E)', '5 (A)', '4 (D)', '3 (G)', '2 (B)', '1 (e)'];

/**
 * Synthesizes a pluck sound for a single acoustic guitar string note
 */
export function playGuitarPluck(frequency: number, delayMs = 0, duration = 1.8) {
  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime + delayMs / 1000;

    // Dual oscillator for rich acoustic harmonic content (triangle + fundamental sine)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, startTime);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(frequency, startTime);

    // Lowpass filter mimicking wood resonance
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(frequency * 4.5, 3200), startTime);
    filter.frequency.exponentialRampToValueAtTime(160, startTime + duration);

    // Amplitude envelope: fast attack, natural decay
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, startTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.2, startTime);

    osc1.connect(filter);
    osc2.connect(subGain);
    subGain.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  } catch (e) {
    console.warn('Audio playback not supported or blocked:', e);
  }
}

/**
 * Strum a guitar chord based on fret definition
 */
export function playChordStrum(chord: ChordDefinition) {
  if (!chord || !chord.frets) return;

  const validNotes: { freq: number; delay: number }[] = [];
  let strumDelay = 0;

  for (let i = 0; i < 6; i++) {
    const fret = chord.frets[i];
    if (fret >= 0) {
      // Calculate frequency: openFreq * 2^(fret / 12)
      const freq = OPEN_STRING_FREQS[i] * Math.pow(2, fret / 12);
      validNotes.push({ freq, delay: strumDelay });
      strumDelay += 28; // 28ms between strings for natural strum
    }
  }

  validNotes.forEach((n) => {
    playGuitarPluck(n.freq, n.delay, 2.2);
  });
}

/**
 * Play single standard string reference tone
 */
export function playStringTuningTone(stringIndex: number) {
  if (stringIndex >= 0 && stringIndex < OPEN_STRING_FREQS.length) {
    playGuitarPluck(OPEN_STRING_FREQS[stringIndex], 0, 3.0);
  }
}
