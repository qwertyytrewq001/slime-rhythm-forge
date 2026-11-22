/**
 * Real audio files: music per screen (with crossfades) and sound-effect files that replace the built-in
 * synthesised sounds when they exist. Everything is optional: a missing file is detected once and the old
 * synthesised sound (or silence, for music) is used instead, so files can be added one at a time.
 *
 * Files live in public/audio/music/<name> and public/audio/sfx/<name> as .ogg, .mp3 or .wav (see AUDIO_SPEC.md).
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

const EXTS = ['ogg', 'mp3', 'wav'];
const resolved = new Map<string, string | null>();
/** First existing file for a name, trying each audio extension; remembered so each name is probed once. */
async function resolveUrl(kind: 'music' | 'sfx' | 'ambience', name: string): Promise<string | null> {
  const key = `${kind}/${name}`;
  if (resolved.has(key)) return resolved.get(key) ?? null;
  for (const ext of EXTS) {
    const url = `${BASE}audio/${key}.${ext}`;
    if (await exists(url)) { resolved.set(key, url); return url; }
  }
  resolved.set(key, null);
  return null;
}

/** Screens that do not have a track of their own yet borrow one (the files are only loaded once). */
const MUSIC_ALIAS: Record<string, string> = {
  title: 'lofi_loop', library: 'lofi_loop', den: 'home', sanctuary_night: 'sanctuary_day', bazaar: 'medieval',
};

class Soundtrack {
  private current: { name: string; el: HTMLAudioElement } | null = null;
  private wanted: string | null = null;
  private muted = false;
  musicVolume = readVol(MUSIC_VOL_KEY, 0.5);
  sfxVolume = readVol(SFX_VOL_KEY, 0.8);
  /** Browsers only allow sound after a click; the title screen's Play button calls unlock(). */
  private unlocked = false;
  private ducked = false;
  /** A quiet looping background bed (birds, wind) under the music. */
  private bed: { name: string; el: HTMLAudioElement } | null = null;
  private bedWanted: string | null = null;
  /** The file being fetched right now, so two quick play() calls for one track start only one player. */
  private loading: string | null = null;

  unlock() {
    this.unlocked = true;
    if (this.wanted) void this.play(this.wanted);
    if (this.bedWanted) void this.ambience(this.bedWanted);
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.current) this.current.el.volume = this.target();
    if (this.bed) this.bed.el.volume = this.bedTarget();
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    if (this.bed) this.bed.el.volume = this.bedTarget();
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

  private bedTarget() { return this.muted ? 0 : Math.min(1, this.musicVolume * 1.1); }

  /** Start or stop the background bed; null fades it out. */
  async ambience(name: string | null) {
    this.bedWanted = name;
    if (!this.unlocked) return;
    if (name === (this.bed?.name ?? null)) return;
    const old = this.bed;
    this.bed = null;
    if (old) this.fade(old.el, 0, () => { old.el.pause(); old.el.src = ''; });
    if (!name) return;
    const url = await resolveUrl('ambience', name);
    if (!url || this.bedWanted !== name) return;
    const el = new Audio(url);
    el.loop = true;
    el.volume = 0;
    this.bed = { name, el };
    try { await el.play(); } catch { this.bed = null; return; }
    this.fade(el, this.bedTarget());
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
    const file = name ? (MUSIC_ALIAS[name] ?? name) : null;
    if (file === (this.current?.name ?? null) || (file && file === this.loading)) return;
    const old = this.current;
    this.current = null;
    if (old) this.fade(old.el, 0, () => { old.el.pause(); old.el.src = ''; });
    if (!name) return;
    this.loading = file;
    const url = await resolveUrl('music', file!);
    if (this.loading === file) this.loading = null;
    if (!url || this.wanted !== name) return;
    const el = new Audio(url);
    el.loop = true;
    el.volume = 0;
    this.current = { name: file!, el };
    try { await el.play(); } catch { this.current = null; return; }
    this.fade(el, this.target());
  }

  /** Play a sound-effect file; resolves false if it does not exist so the caller can use the synthesised sound. */
  async sfx(name: string): Promise<boolean> {
    if (this.muted || !this.unlocked) return false;
    const url = await resolveUrl('sfx', name);
    if (!url) return false;
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
