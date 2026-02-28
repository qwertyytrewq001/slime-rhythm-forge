class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lofiOsc: OscillatorNode | null = null;
  private lofiGain: GainNode | null = null;
  private lofiFilter: BiquadFilterNode | null = null;
  private shimmerOsc: OscillatorNode | null = null;
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
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this._muted ? 0 : 0.3, this.ctx.currentTime, 0.1);
    }
  }

  startLofi(rhythmTrait: number = 2) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isPlaying) return;
    this.isPlaying = true;

    const baseFreq = 110 + rhythmTrait * 5;
    
    // Layer 1: Warm Foundation Pad
    this.lofiOsc = this.ctx.createOscillator();
    this.lofiOsc.type = 'triangle';
    this.lofiOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.1);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setTargetAtTime(baseFreq * 1.01, this.ctx.currentTime, 0.1);

    // Layer 2: Mountain Air Shimmer
    this.shimmerOsc = this.ctx.createOscillator();
    this.shimmerOsc.type = 'sine';
    this.shimmerOsc.frequency.setTargetAtTime(baseFreq * 4, this.ctx.currentTime, 0.1);

    this.lofiFilter = this.ctx.createBiquadFilter();
    this.lofiFilter.type = 'lowpass';
    this.lofiFilter.frequency.value = 1200;
    this.lofiFilter.Q.value = 1.5;

    // LFO for gentle "floating" effect
    this.lfoNode = this.ctx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.value = 0.15;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 300;
    this.lfoNode.connect(lfoGain);
    lfoGain.connect(this.lofiFilter.frequency);

    this.lofiGain = this.ctx.createGain();
    this.lofiGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.lofiGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.0); // Smooth fade in

    this.lofiOsc.connect(this.lofiFilter);
    osc2.connect(this.lofiFilter);
    this.shimmerOsc.connect(this.lofiFilter);
    this.lofiFilter.connect(this.lofiGain);
    this.lofiGain.connect(this.masterGain);

    this.lofiOsc.start();
    osc2.start();
    this.shimmerOsc.start();
    this.lfoNode.start();

    this.playMysticMelody(baseFreq, rhythmTrait);
  }

  private arpInterval: ReturnType<typeof setInterval> | null = null;

  private playMysticMelody(baseFreq: number, rhythm: number) {
    if (!this.ctx || !this.masterGain) return;

    // Lydian Scale Ratios (Magical/Fantasy vibe)
    const notes = [1, 1.125, 1.265, 1.423, 1.5, 1.687, 1.898, 2];
    let noteIndex = 0;
    const tempo = 600 - rhythm * 20;

    this.arpInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain || this._muted) return;
      
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq * notes[Math.floor(Math.random() * notes.length)] * 4;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2500;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.5);
    }, tempo);
  }

  stopLofi() {
    this.isPlaying = false;
    try { this.lofiOsc?.stop(); } catch {}
    try { this.shimmerOsc?.stop(); } catch {}
    try { this.lfoNode?.stop(); } catch {}
    if (this.arpInterval) { clearInterval(this.arpInterval); this.arpInterval = null; }
    this.lofiOsc = null;
    this.shimmerOsc = null;
    this.lfoNode = null;
  }

  playSfx(type: 'breed' | 'collect' | 'purchase' | 'achievement' | 'tap' | 'hatch' | 'discovery') {
    this.init();
    if (!this.ctx || !this.masterGain || this._muted) return;

    switch (type) {
      case 'discovery':
        // High-impact "Discovery!" sound - Pokemon style (LOUDER)
        const discoveryNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
        const discoveryTiming = [0, 0.05, 0.1, 0.15, 0.2, 0.25];
        
        discoveryNotes.forEach((freq, i) => {
          const o = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, this.ctx!.currentTime + discoveryTiming[i]);
          
          g.gain.setValueAtTime(0, this.ctx!.currentTime + discoveryTiming[i]);
          g.gain.linearRampToValueAtTime(0.2, this.ctx!.currentTime + discoveryTiming[i] + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + discoveryTiming[i] + 0.6);

          o.connect(g);
          g.connect(this.masterGain!);
          o.start(this.ctx!.currentTime + discoveryTiming[i]);
          o.stop(this.ctx!.currentTime + discoveryTiming[i] + 0.6);
        });

        const shimmer = this.ctx.createOscillator();
        const shimmerGain = this.ctx.createGain();
        shimmer.type = 'sine';
        shimmer.frequency.setValueAtTime(2093.00, this.ctx.currentTime + 0.3);
        shimmerGain.gain.setValueAtTime(0, this.ctx.currentTime + 0.3);
        shimmerGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.35);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        
        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        vibrato.frequency.value = 10;
        vibratoGain.gain.value = 30;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(shimmer.frequency);
        
        shimmer.connect(shimmerGain);
        shimmerGain.connect(this.masterGain);
        vibrato.start(this.ctx.currentTime + 0.3);
        shimmer.start(this.ctx.currentTime + 0.3);
        shimmer.stop(this.ctx.currentTime + 1.5);
        vibrato.stop(this.ctx.currentTime + 1.5);
        break;
      case 'hatch':
        const hNotes = [523.25, 523.25, 659.25, 783.99];
        const hTiming = [0, 0.1, 0.2, 0.3];
        const hDurations = [0.08, 0.08, 0.08, 0.4];

        hNotes.forEach((freq, i) => {
          const o = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          o.type = i === 3 ? 'sine' : 'square';
          o.frequency.setValueAtTime(freq, this.ctx!.currentTime + hTiming[i]);
          g.gain.setValueAtTime(0, this.ctx!.currentTime + hTiming[i]);
          g.gain.linearRampToValueAtTime(0.12, this.ctx!.currentTime + hTiming[i] + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + hTiming[i] + hDurations[i]);
          o.connect(g);
          g.connect(this.masterGain!);
          o.start(this.ctx!.currentTime + hTiming[i]);
          o.stop(this.ctx!.currentTime + hTiming[i] + hDurations[i]);
        });
        break;
      case 'breed':
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(300, this.ctx.currentTime);
        bOsc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2);
        bGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        bGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        bOsc.connect(bGain); bGain.connect(this.masterGain);
        bOsc.start(); bOsc.stop(this.ctx.currentTime + 0.4);
        break;
      case 'collect':
        const cOsc = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        cOsc.type = 'square';
        cOsc.frequency.value = 523;
        cGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        cGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        cOsc.connect(cGain); cGain.connect(this.masterGain);
        cOsc.start(); cOsc.stop(this.ctx.currentTime + 0.1);
        break;
      case 'purchase':
        const pOsc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        pOsc.type = 'triangle';
        pOsc.frequency.setValueAtTime(400, this.ctx.currentTime);
        pOsc.frequency.setValueAtTime(500, this.ctx.currentTime + 0.1);
        pOsc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.2);
        pGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        pGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        pOsc.connect(pGain); pGain.connect(this.masterGain);
        pOsc.start(); pOsc.stop(this.ctx.currentTime + 0.3);
        break;
      case 'achievement':
        const aOsc = this.ctx.createOscillator();
        const aGain = this.ctx.createGain();
        aOsc.type = 'sine';
        aOsc.frequency.setValueAtTime(400, this.ctx.currentTime);
        aOsc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.15);
        aOsc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.3);
        aGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        aGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        aOsc.connect(aGain); aGain.connect(this.masterGain);
        aOsc.start(); aOsc.stop(this.ctx.currentTime + 0.5);
        break;
      case 'tap':
        const tOsc = this.ctx.createOscillator();
        const tGain = this.ctx.createGain();
        tOsc.type = 'square';
        tOsc.frequency.value = 660;
        tGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        tGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        tOsc.connect(tGain); tGain.connect(this.masterGain);
        tOsc.start(); tOsc.stop(this.ctx.currentTime + 0.05);
        break;
    }
  }

  resume() {
    this.ctx?.resume();
  }
}

export const audioEngine = new AudioEngine();
