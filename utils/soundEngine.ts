
// Web Audio API Sound Engine for Retro RPG Effects

class SoundEngine {
  private context: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Initialize lazily to respect autoplay policies
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private initContext() {
    if (!this.context) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.context = new AudioContextClass();
        }
      } catch (e) {
        console.warn("AudioContext initialization failed:", e);
      }
    }
    if (this.context && this.context.state === 'suspended') {
      try {
        this.context.resume();
      } catch (e) {
        console.warn("AudioContext resume failed:", e);
      }
    }
  }

  // Play a simple retro beep (UI Click)
  public playClick() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.context) return;

      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(400, this.context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1 * this.volume, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start();
      osc.stop(this.context.currentTime + 0.05);
    } catch (e) {
      // Ignore sound errors to prevent blocking UI
    }
  }

  // Play a success sound (Quest Complete) - Coin sound style
  public playSuccess() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.context) return;

      const t = this.context.currentTime;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.linearRampToValueAtTime(1800, t + 0.1);

      gain.gain.setValueAtTime(0.1 * this.volume, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.3);

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start(t);
      osc.stop(t + 0.3);
      
      // Echo effect
      setTimeout(() => {
          if (!this.context) return;
          const osc2 = this.context.createOscillator();
          const gain2 = this.context.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1800, this.context.currentTime);
          gain2.gain.setValueAtTime(0.05 * this.volume, this.context.currentTime);
          gain2.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.2);
          osc2.connect(gain2);
          gain2.connect(this.context.destination);
          osc2.start();
          osc2.stop(this.context.currentTime + 0.2);
      }, 100);
    } catch (e) {
      // Ignore
    }
  }

  // Play a level up fanfare
  public playLevelUp() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.context) return;

      const t = this.context.currentTime;
      
      const playNote = (freq: number, startTime: number, duration: number) => {
          if (!this.context) return;
          const osc = this.context.createOscillator();
          const gain = this.context.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.1 * this.volume, startTime);
          gain.gain.linearRampToValueAtTime(0, startTime + duration);
          osc.connect(gain);
          gain.connect(this.context.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
      };

      // Simple Major Arpeggio Fanfare
      playNote(523.25, t, 0.1); // C5
      playNote(659.25, t + 0.1, 0.1); // E5
      playNote(783.99, t + 0.2, 0.1); // G5
      playNote(1046.50, t + 0.3, 0.4); // C6
    } catch (e) {
      // Ignore
    }
  }

  public playError() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.context) return;

      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.context.currentTime);
      osc.frequency.linearRampToValueAtTime(100, this.context.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.1 * this.volume, this.context.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.context.destination);
      
      osc.start();
      osc.stop(this.context.currentTime + 0.2);
    } catch (e) {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine();
