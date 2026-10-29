/**
 * Real audio files: music per screen (with crossfades) and sound-effect files that replace the built-in
 * synthesised sounds when they exist. Everything is optional: a missing file is detected once and the old
 * synthesised sound (or silence, for music) is used instead, so files can be added one at a time.
 *
 * Files live in public/audio/music/<name>.mp3 and public/audio/sfx/<name>.mp3 (see AUDIO_SPEC.md).
 */
const BASE = import.meta.env.BASE_URL;
const MUSIC_VOL_KEY = 'rs_music_vol';
const SFX_VOL_KEY = 'rs_sfx_vol';
const FADE_MS = 1500;

const readVol = (key: string, fallback: number) => {
  try { const v = Number(localStorage.getItem(key)); return Number.isFinite(v) && localStorage.getItem(key) !== null ? Math.min(1, Math.max(0, v)) : fallback; } catch { return fallback; }
};

/** Does this file really exist? (A dev server answers 200 with a web page for unknown paths, so check the type.) */
const known = new Map<string, boolean>();
const pending = new Map<string, Promise<boolean>>();
function exists(url: string): Promise<boolean> {
  const hit = known.get(url);
  if (hit !== undefined) return Promise.resolve(hit);
  let p = pending.get(url);
  if (!p) {
    p = fetch(url, { method: 'HEAD' })
      .then(r => r.ok && /audio|ogg|mpeg|octet/i.test(r.headers.get('content-type') ?? ''))
      .catch(() => false)
      .then(ok => { known.set(url, ok); pending.delete(url); return ok; });
    pending.set(url, p);
  }
  return p;
}

class Soundtrack {
  private current: { name: string; el: HTMLAudioElement } | null = null;
  private wanted: string | null = null;
  private muted = false;
  musicVolume = readVol(MUSIC_VOL_KEY, 0.5);
  sfxVolume = readVol(SFX_VOL_KEY, 0.8);
  /** Browsers only allow sound after a click; the title screen's Play button calls unlock(). */
  private unlocked = false;
  private ducked = false;

  unlock() {
    this.unlocked = true;
    if (this.wanted) void this.play(this.wanted);
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.current) this.current.el.volume = this.target();
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    try { localStorage.setItem(MUSIC_VOL_KEY, String(v)); } catch { /* private mode */ }
    if (this.current) this.current.el.volume = this.target();
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v;
    try { localStorage.setItem(SFX_VOL_KEY, String(v)); } catch { /* private mode */ }
  }

  /** Quieter music while a stinger or a dialogue is on. */
  duck(on: boolean) {
    this.ducked = on;
    if (this.current) this.current.el.volume = this.target();
  }

  private target() {
    return this.muted ? 0 : this.musicVolume * (this.ducked ? 0.35 : 1);
  }

  private fade(el: HTMLAudioElement, to: number, then?: () => void) {
    const from = el.volume;
    const start = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / FADE_MS);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * t));
      if (t < 1) requestAnimationFrame(step); else then?.();
    };
    requestAnimationFrame(step);
  }

  /** Switch to a track (or null for silence), crossfading. Safe to call as often as you like. */
  async play(name: string | null) {
    this.wanted = name;
    if (!this.unlocked) return;
    if (name === (this.current?.name ?? null)) return;
    const old = this.current;
    this.current = null;
    if (old) this.fade(old.el, 0, () => { old.el.pause(); old.el.src = ''; });
    if (!name) return;
    const url = `${BASE}audio/music/${name}.mp3`;
    if (!(await exists(url)) || this.wanted !== name) return;
    const el = new Audio(url);
    el.loop = true;
    el.volume = 0;
    this.current = { name, el };
    try { await el.play(); } catch { this.current = null; return; }
    this.fade(el, this.target());
  }

  /** Play a sound-effect file; resolves false if it does not exist so the caller can use the synthesised sound. */
  async sfx(name: string): Promise<boolean> {
    if (this.muted || !this.unlocked) return false;
    const url = `${BASE}audio/sfx/${name}.mp3`;
    if (known.get(url) === false) return false;
    if (!(await exists(url))) return false;
    const el = new Audio(url);
    el.volume = this.sfxVolume;
    try { await el.play(); return true; } catch { return false; }
  }
}

export const soundtrack = new Soundtrack();

/** Which music belongs to which screen. */
export function trackFor(opts: { title: boolean; view: string; night: boolean; inBattle: boolean; bazaar: boolean; library: boolean }): string {
  if (opts.title) return 'title';
  if (opts.inBattle) return 'battle';
  if (opts.bazaar) return 'bazaar';
  if (opts.library) return 'library';
  switch (opts.view) {
    case 'farm': return 'farm';
    case 'sanctuaries': return opts.night ? 'sanctuary_night' : 'sanctuary_day';
    case 'battleMap': return 'battle_map';
    case 'breedingDen': return 'den';
    default: return 'home';
  }
}
