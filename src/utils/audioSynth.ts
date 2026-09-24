// Web Audio API Synthesizer for Guitar Tuner & Chord Playback

class GuitarAudioSynth {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a realistic plucked guitar string note
  playFrequency(freq: number, durationSeconds = 2.5): void {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Plucked string harmonic overtones
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Fast attack, natural acoustic decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.6, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);
    } catch (e) {
      console.error('Audio synth error:', e);
    }
  }

  // Play standard guitar string by note name
  playGuitarString(stringNote: 'E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4'): void {
    const frequencies: Record<string, number> = {
      'E2': 82.41,
      'A2': 110.00,
      'D3': 146.83,
      'G3': 196.00,
      'B3': 246.94,
      'E4': 329.63,
    };
    const freq = frequencies[stringNote];
    if (freq) {
      this.playFrequency(freq, 3.0);
    }
  }
}

export const audioSynth = new GuitarAudioSynth();
