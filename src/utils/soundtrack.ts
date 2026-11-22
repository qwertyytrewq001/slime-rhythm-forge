/**
 * Real audio files: music per screen (with crossfades), a quiet background bed, and sound effects that replace
 * the built-in synthesised sounds when a file exists. Everything is optional: a missing file is detected once and
 * the old synthesised sound (or silence, for music) is used instead, so files can be added one at a time.
 *
 * Files live in public/audio/{music,sfx,ambience}/<name>.<ogg|mp3|wav> (see AUDIO_SPEC.md).
 *
 * Speed: the files we ship are listed in MANIFEST so no request is wasted probing for them, music is preloaded in
 * the background after the first click so a screen change never waits on a download, and sound effects are decoded
 * into memory so a click answers instantly. A new track starts the moment it is ready and the old one fades out
 * quickly under it.
 */
const BASE = import.meta.env.BASE_URL;
const MUSIC_VOL_KEY = 'rs_music_vol_v2';
const SFX_VOL_KEY = 'rs_sfx_vol_v2';
const FADE_OUT_MS = 500;
const FADE_IN_MS = 700;
/** Sound effects are mixed well above the music: the music is mastered loud, the effects are short and quiet. */
const SFX_BOOST = 1.5;

type Kind = 'music' | 'sfx' | 'ambience';

/** Extension of every shipped file, so the game goes straight to the right URL. Names not listed are probed once. */
const MANIFEST: Record<Kind, Record<string, string>> = {
  music: { battle: 'ogg', battle_map: 'mp3', farm: 'mp3', home: 'mp3', lofi_loop: 'mp3', medieval: 'ogg', sanctuary_day: 'mp3' },
  ambience: { garden: 'mp3' },
  sfx: {
    achievement: 'ogg', bond_chime: 'wav', buy_land: 'ogg', claim: 'ogg', coin: 'ogg', decor_place: 'ogg', egg_crack_1: 'ogg', egg_crack_2: 'ogg',
    egg_crack_3: 'ogg', egg_hatch: 'ogg', gift_collect: 'wav', harvest_pop: 'ogg', level_up: 'ogg', new_slime: 'ogg', plant_dig: 'ogg',
    page_turn: 'ogg', screen_change: 'ogg', purchase: 'ogg', ritual_start: 'wav', slime_tap: 'ogg', ui_click: 'ogg', ui_error: 'ogg', ui_open: 'ogg', ui_toggle: 'ogg', water_splash: 'ogg',
  },
};
/** Preload order: the screens people reach first. */
const PRELOAD_MUSIC = ['home', 'farm', 'battle_map', 'sanctuary_day', 'battle', 'lofi_loop', 'medieval'];

const readVol = (key: string, fallback: number) => {
  try { const v = Number(localStorage.getItem(key)); return Number.isFinite(v) && localStorage.getItem(key) !== null ? Math.min(1, Math.max(0, v)) : fallback; } catch { return fallback; }
};

/** Does this file really exist? (A dev server answers 200 with a web page for unknown paths, so check the type.) */
const known = new Map<string, boolean>();
function exists(url: string): Promise<boolean> {
  const hit = known.get(url);
  if (hit !== undefined) return Promise.resolve(hit);
  return fetch(url, { method: 'HEAD' })
    .then(r => r.ok && /audio|ogg|mpeg|octet/i.test(r.headers.get('content-type') ?? ''))
    .catch(() => false)
    .then(ok => { known.set(url, ok); return ok; });
}

const resolved = new Map<string, string | null>();
/** URL for a name: straight from the manifest when we ship it, otherwise the first existing extension (remembered). */
async function resolveUrl(kind: Kind, name: string): Promise<string | null> {
  const ext = MANIFEST[kind][name];
  if (ext) return `${BASE}audio/${kind}/${name}.${ext}`;
  const key = `${kind}/${name}`;
  if (resolved.has(key)) return resolved.get(key) ?? null;
  for (const e of ['ogg', 'mp3', 'wav']) {
    const url = `${BASE}audio/${key}.${e}`;
    if (await exists(url)) { resolved.set(key, url); return url; }
  }
  resolved.set(key, null);
  return null;
}

/** Screens that do not have a track of their own yet borrow one (the files are only loaded once). */
const MUSIC_ALIAS: Record<string, string> = {
  home: 'lofi_loop', title: 'lofi_loop', library: 'lofi_loop', den: 'home', sanctuary_night: 'sanctuary_day', bazaar: 'medieval',
};

class Soundtrack {
  private current: { name: string; el: HTMLAudioElement } | null = null;
  private bed: { name: string; el: HTMLAudioElement } | null = null;
  private wanted: string | null = null;
  private bedWanted: string | null = null;
  private muted = false;
  musicVolume = readVol(MUSIC_VOL_KEY, 0.26);
  sfxVolume = readVol(SFX_VOL_KEY, 1);
  /** Browsers only allow sound after a click; the first click anywhere calls unlock(). */
  private unlocked = false;
  private ducked = false;
  private sfxDuck = false;
  private sfxDuckTimer = 0;
  /** One player per track, kept (paused) so coming back to a screen never downloads again. */
  private pool = new Map<string, HTMLAudioElement>();
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, { buf: AudioBuffer; gain: number } | null>();
  private bufLoading = new Map<string, Promise<void>>();
  private preloadStarted = false;
  /** When an effect last played, so the catch-all button click does not stack on top of a specific sound. */
  lastSfxAt = 0;

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      this.ctx = new AudioContext();
      void this.ctx.resume();
    } catch { this.ctx = null; }
    if (this.wanted) void this.play(this.wanted);
    if (this.bedWanted) void this.ambience(this.bedWanted);
    this.startPreload();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.applyVolumes();
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    try { localStorage.setItem(MUSIC_VOL_KEY, String(v)); } catch { /* private mode */ }
    this.applyVolumes();
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v;
    try { localStorage.setItem(SFX_VOL_KEY, String(v)); } catch { /* private mode */ }
  }

  /** Quieter music while a stinger or a dialogue is on. */
  duck(on: boolean) {
    this.ducked = on;
    this.applyVolumes();
  }

  private target() {
    return this.muted ? 0 : this.musicVolume * (this.ducked ? 0.35 : 1) * (this.sfxDuck ? 0.45 : 1);
  }

  private bedTarget() { return this.muted ? 0 : Math.min(1, this.musicVolume * 1.1) * (this.sfxDuck ? 0.6 : 1); }

  private applyVolumes() {
    if (this.current) this.current.el.volume = this.target();
    if (this.bed) this.bed.el.volume = this.bedTarget();
  }

  private player(kind: 'music' | 'ambience', name: string, url: string): HTMLAudioElement {
    const key = `${kind}/${name}`;
    let el = this.pool.get(key);
    if (!el) {
      el = new Audio(url);
      el.loop = true;
      el.preload = 'auto';
      this.pool.set(key, el);
    }
    return el;
  }

  /** Resolve once the player can play through, or after a timeout so a slow connection never blocks forever. */
  private ready(el: HTMLAudioElement, ms = 2500): Promise<void> {
    if (el.readyState >= 3) return Promise.resolve();
    return new Promise(res => {
      const done = () => { el.removeEventListener('canplaythrough', done); el.removeEventListener('error', done); res(); };
      el.addEventListener('canplaythrough', done);
      el.addEventListener('error', done);
      window.setTimeout(done, ms);
    });
  }

  /** After the first click, quietly fetch every track and decode every effect, one after another. */
  private startPreload() {
    if (this.preloadStarted) return;
    this.preloadStarted = true;
    void (async () => {
      for (const name of Object.keys(MANIFEST.sfx)) await this.loadSfx(name);
      for (const name of PRELOAD_MUSIC) {
        const url = await resolveUrl('music', name);
        if (url) await this.ready(this.player('music', name, url), 15000);
      }
      const garden = await resolveUrl('ambience', 'garden');
      if (garden) await this.ready(this.player('ambience', 'garden', garden), 15000);
    })();
  }

  private fades = new WeakMap<HTMLAudioElement, number>();

  private fade(el: HTMLAudioElement, to: number, ms: number, then?: () => void) {
    const from = el.volume;
    const start = performance.now();
    const id = (this.fades.get(el) ?? 0) + 1;
    this.fades.set(el, id);
    const step = () => {
      if (this.fades.get(el) !== id) return; // a newer fade on this player took over
      const t = Math.min(1, (performance.now() - start) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * t));
      if (t < 1) requestAnimationFrame(step); else then?.();
    };
    requestAnimationFrame(step);
  }

  private stopEl(el: HTMLAudioElement) {
    this.fade(el, 0, FADE_OUT_MS, () => { if (this.current?.el !== el && this.bed?.el !== el) el.pause(); });
  }

  /** Switch to a track (or null for silence), crossfading. Safe to call as often as you like. */
  async play(name: string | null) {
    this.wanted = name;
    if (!this.unlocked) return;
    const file = name ? (MUSIC_ALIAS[name] ?? name) : null;
    if (file === (this.current?.name ?? null)) return;
    if (!name) {
      const old = this.current; this.current = null;
      if (old) this.stopEl(old.el);
      return;
    }
    const url = await resolveUrl('music', file!);
    if (!url || this.wanted !== name) return;
    const el = this.player('music', file!, url);
    // the old track keeps playing until the new one is ready, then they swap at once
    await this.ready(el);
    if (this.wanted !== name || file === (this.current?.name ?? null)) return;
    const old = this.current;
    this.current = { name: file!, el };
    el.currentTime = 0;
    el.volume = 0;
    try { await el.play(); } catch { this.current = old; return; }
    if (old) this.stopEl(old.el);
    this.fade(el, this.target(), FADE_IN_MS);
  }

  /** Start or stop the background bed; null fades it out. */
  async ambience(name: string | null) {
    this.bedWanted = name;
    if (!this.unlocked) return;
    if (name === (this.bed?.name ?? null)) return;
    if (!name) {
      const old = this.bed; this.bed = null;
      if (old) this.stopEl(old.el);
      return;
    }
    const url = await resolveUrl('ambience', name);
    if (!url || this.bedWanted !== name) return;
    const el = this.player('ambience', name, url);
    await this.ready(el);
    if (this.bedWanted !== name || name === (this.bed?.name ?? null)) return;
    const old = this.bed;
    this.bed = { name, el };
    el.currentTime = 0;
    el.volume = 0;
    try { await el.play(); } catch { this.bed = old; return; }
    if (old) this.stopEl(old.el);
    this.fade(el, this.bedTarget(), FADE_IN_MS);
  }

  /** Fetch and decode one effect; a missing file is remembered as null. Quiet files are levelled up to a common peak. */
  private loadSfx(name: string): Promise<void> {
    const hit = this.bufLoading.get(name);
    if (hit) return hit;
    const p = (async () => {
      const ctx = this.ctx;
      const url = await resolveUrl('sfx', name);
      if (!ctx || !url) { this.buffers.set(name, null); return; }
      try {
        const data = await (await fetch(url)).arrayBuffer();
        const buf = await ctx.decodeAudioData(data);
        let peak = 0.0001;
        for (let c = 0; c < buf.numberOfChannels; c++) {
          const ch = buf.getChannelData(c);
          for (let i = 0; i < ch.length; i += 8) peak = Math.max(peak, Math.abs(ch[i]));
        }
        this.buffers.set(name, { buf, gain: Math.min(4, Math.max(0.6, 0.85 / peak)) });
      } catch { this.buffers.set(name, null); }
    })();
    this.bufLoading.set(name, p);
    return p;
  }

  /** Play a sound-effect file; resolves false if it does not exist so the caller can use the synthesised sound. */
  async sfx(name: string): Promise<boolean> {
    if (this.muted || !this.unlocked) return false;
    if (!this.buffers.has(name)) await this.loadSfx(name);
    const entry = this.buffers.get(name);
    const ctx = this.ctx;
    if (!entry || !ctx) return false;
    this.lastSfxAt = performance.now();
    if (ctx.state === 'suspended') void ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = entry.buf;
    const g = ctx.createGain();
    g.gain.value = Math.min(4, this.sfxVolume * SFX_BOOST * entry.gain);
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
    // let the effect cut through: the music dips for a moment
    this.sfxDuck = true;
    this.applyVolumes();
    window.clearTimeout(this.sfxDuckTimer);
    this.sfxDuckTimer = window.setTimeout(() => { this.sfxDuck = false; this.applyVolumes(); }, Math.min(1400, entry.buf.duration * 1000 + 150));
    return true;
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
