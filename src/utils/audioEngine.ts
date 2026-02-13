class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lofiOsc: OscillatorNode | null = null;
  private lofiGain: GainNode | null = null;
  private lofiFilter: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private isPlaying = false;
  private _muted = false;

  get muted() { return this._muted; }

  private init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this._muted ? 0 : 0.3;
    }
  }

  startLofi(rhythmTrait: number = 2) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isPlaying) return;
    this.isPlaying = true;

    // Create a warm pad
    const baseFreq = 110 + rhythmTrait * 10;
    
    // Pad oscillator
    this.lofiOsc = this.ctx.createOscillator();
    this.lofiOsc.type = 'triangle';
    this.lofiOsc.frequency.value = baseFreq;

    // Second oscillator for thickness
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = baseFreq * 1.5;

    // Low-pass filter for warmth
    this.lofiFilter = this.ctx.createBiquadFilter();
    this.lofiFilter.type = 'lowpass';
    this.lofiFilter.frequency.value = 800;
    this.lofiFilter.Q.value = 2;

    // LFO for gentle wobble
    this.lfoNode = this.ctx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.value = 0.3 + rhythmTrait * 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 15;
    this.lfoNode.connect(lfoGain);
    lfoGain.connect(this.lofiFilter.frequency);

    // Volume
    this.lofiGain = this.ctx.createGain();
    this.lofiGain.gain.value = 0.15;

    // Connect
    this.lofiOsc.connect(this.lofiFilter);
    osc2.connect(this.lofiFilter);
    this.lofiFilter.connect(this.lofiGain);
    this.lofiGain.connect(this.masterGain);

    this.lofiOsc.start();
    osc2.start();
    this.lfoNode.start();

    // Arpeggio pattern
    this.playArpeggio(baseFreq, rhythmTrait);
  }

  private arpInterval: ReturnType<typeof setInterval> | null = null;

  private playArpeggio(baseFreq: number, rhythm: number) {
    if (!this.ctx || !this.masterGain) return;

    const notes = [1, 1.25, 1.5, 1.875, 2]; // Pentatonic ratios
    let noteIndex = 0;
    const tempo = 400 - rhythm * 30;

    this.arpInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain || this._muted) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = baseFreq * notes[noteIndex % notes.length] * 2;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.05;
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
      noteIndex++;
    }, tempo);
  }

  stopLofi() {
    this.isPlaying = false;
    try { this.lofiOsc?.stop(); } catch {}
    try { this.lfoNode?.stop(); } catch {}
    if (this.arpInterval) { clearInterval(this.arpInterval); this.arpInterval = null; }
    this.lofiOsc = null;
    this.lfoNode = null;
  }

  playSfx(type: 'breed' | 'collect' | 'purchase' | 'achievement' | 'tap') {
    this.init();
    if (!this.ctx || !this.masterGain || this._muted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (type) {
      case 'breed':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(gain); gain.connect(this.masterGain);
        osc.start(); osc.stop(this.ctx.currentTime + 0.4);
        break;
      case 'collect':
        osc.type = 'square';
        osc.frequency.value = 523;
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        osc.connect(gain); gain.connect(this.masterGain);
        osc.start(); osc.stop(this.ctx.currentTime + 0.1);
        break;
      case 'purchase':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.setValueAtTime(500, this.ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        osc.connect(gain); gain.connect(this.masterGain);
        osc.start(); osc.stop(this.ctx.currentTime + 0.3);
        break;
      case 'achievement':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        osc.connect(gain); gain.connect(this.masterGain);
        osc.start(); osc.stop(this.ctx.currentTime + 0.5);
        break;
      case 'tap':
        osc.type = 'square';
        osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain); gain.connect(this.masterGain);
        osc.start(); osc.stop(this.ctx.currentTime + 0.05);
        break;
    }
  }

  resume() {
    this.ctx?.resume();
  }
}

export const audioEngine = new AudioEngine();
