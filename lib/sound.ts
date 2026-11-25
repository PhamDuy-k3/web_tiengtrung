/**
 * Web Audio API synthesizer for pleasant sound effects (100% self-contained, no external mp3 assets needed)
 */
type WindowWithWebkitAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export type MascotSoundAction = "idle" | "wave" | "celebrate" | "think" | "sad";

const MASCOT_MUTED_KEY = "hanyu:mascot:muted";

interface NoteSpec {
  freq: number;
  endFreq?: number;
  delay: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
}

class SoundService {
  private ctx: AudioContext | null = null;
  private activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  private async ensureRunningContext(): Promise<AudioContext | null> {
    const ctx = this.getContext();
    if (!ctx) return null;
    if (ctx.state === "suspended") {
      try {
        // Race resume() with a short timeout: when autoplay is blocked, Chrome
        // keeps resume() pending until the next user gesture.
        await Promise.race([
          ctx.resume().catch(() => undefined),
          new Promise<void>((resolve) => setTimeout(resolve, 120)),
        ]);
      } catch {
        return null;
      }
    }
    return ctx.state === "running" ? ctx : null;
  }

  public isMascotMuted(): boolean {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(MASCOT_MUTED_KEY) === "1";
    } catch {
      return false;
    }
  }

  public setMascotMuted(muted: boolean): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(MASCOT_MUTED_KEY, muted ? "1" : "0");
    } catch {
      // Ignore storage failures
    }
    if (muted) {
      this.stopMascotSound();
    }
  }

  public stopMascotSound(): void {
    for (const node of this.activeNodes) {
      try {
        node.osc.stop();
      } catch {
        // Ignore already-stopped oscillator
      }
      try {
        node.osc.disconnect();
        node.gain.disconnect();
      } catch {
        // Ignore
      }
    }
    this.activeNodes = [];
  }

  private playSequence(ctx: AudioContext, notes: NoteSpec[]): void {
    this.stopMascotSound();
    const now = ctx.currentTime;

    for (const n of notes) {
      const start = now + n.delay;
      const stop = start + n.duration;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = n.type ?? "sine";
      osc.frequency.setValueAtTime(n.freq, start);
      if (n.endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(n.endFreq, stop);
      }

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(n.volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, stop);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(stop);

      const entry = { osc, gain };
      this.activeNodes.push(entry);
      osc.onended = () => {
        this.activeNodes = this.activeNodes.filter((item) => item !== entry);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    }
  }

  /**
   * Play expressive sound effect tailored to Han Han mascot's action.
   * Returns true if audio played, false if muted or blocked by autoplay policy.
   */
  public async playMascotAction(action: MascotSoundAction, ignoreMute = false): Promise<boolean> {
    if (!ignoreMute && this.isMascotMuted()) return false;

    try {
      const ctx = await this.ensureRunningContext();
      if (!ctx) return false;

      switch (action) {
        case "wave":
          // Warm welcoming pentatonic chime (C5 -> E5 -> G5 -> A5 -> C6)
          this.playSequence(ctx, [
            { freq: 523.25, delay: 0, duration: 0.18, volume: 0.12, type: "sine" },
            { freq: 659.25, delay: 0.09, duration: 0.18, volume: 0.14, type: "sine" },
            { freq: 783.99, delay: 0.18, duration: 0.2, volume: 0.14, type: "triangle" },
            { freq: 880.0, delay: 0.27, duration: 0.2, volume: 0.12, type: "sine" },
            { freq: 1046.5, delay: 0.36, duration: 0.38, volume: 0.15, type: "sine" },
          ]);
          break;

        case "celebrate":
          // Festive upbeat victory fanfare with harmonic sparkle
          this.playSequence(ctx, [
            { freq: 523.25, delay: 0, duration: 0.14, volume: 0.14, type: "triangle" },
            { freq: 659.25, delay: 0.09, duration: 0.14, volume: 0.15, type: "triangle" },
            { freq: 783.99, delay: 0.18, duration: 0.16, volume: 0.16, type: "triangle" },
            { freq: 1046.5, delay: 0.28, duration: 0.22, volume: 0.18, type: "sine" },
            { freq: 1318.5, delay: 0.4, duration: 0.45, volume: 0.16, type: "sine" },
            { freq: 1567.98, delay: 0.46, duration: 0.42, volume: 0.1, type: "sine" },
          ]);
          break;

        case "think":
          // Curious upward questioning "hmm?" marimba double-blip
          this.playSequence(ctx, [
            { freq: 392.0, endFreq: 440.0, delay: 0, duration: 0.14, volume: 0.11, type: "sine" },
            { freq: 493.88, endFreq: 587.33, delay: 0.16, duration: 0.24, volume: 0.12, type: "sine" },
          ]);
          break;

        case "sad":
          // Gentle empathetic descending-then-warm motif (soft, encouraging)
          this.playSequence(ctx, [
            { freq: 440.0, delay: 0, duration: 0.24, volume: 0.12, type: "sine" },
            { freq: 392.0, delay: 0.2, duration: 0.24, volume: 0.11, type: "sine" },
            { freq: 349.23, delay: 0.4, duration: 0.26, volume: 0.11, type: "sine" },
            { freq: 329.63, endFreq: 311.13, delay: 0.62, duration: 0.42, volume: 0.1, type: "triangle" },
          ]);
          break;

        case "idle":
        default:
          this.playSequence(ctx, [
            { freq: 587.33, delay: 0, duration: 0.12, volume: 0.08, type: "sine" },
            { freq: 783.99, delay: 0.1, duration: 0.18, volume: 0.08, type: "sine" },
          ]);
          break;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cheerful success chime (Duolingo style)
   */
  public playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") void ctx.resume();

      const now = ctx.currentTime;
      // Note 1: E5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Note 2: A5
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);
    } catch {
      // Audio autoplay may be blocked until user interaction
    }
  }

  /**
   * Soft low thud for incorrect answers
   */
  public playError() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") void ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignore
    }
  }

  /**
   * Tile click snap sound
   */
  public playTileClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") void ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }

  /**
   * Level up victory fanfare
   */
  public playFanfare() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === "suspended") void ctx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.35);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundService = new SoundService();
