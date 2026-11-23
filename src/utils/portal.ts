/**
 * Web-portal glue (Poki, CrazyGames). The same game ships three ways:
 *   npm run build           -> GitHub Pages (docs/), no portal code runs
 *   npm run build:poki      -> dist-poki/, loads the Poki SDK
 *   npm run build:crazy     -> dist-crazygames/, loads the CrazyGames SDK
 * The rest of the game only talks to this file and never knows which portal it is on.
 *
 * Rules both portals share, and what we do about them:
 *  - tell them when real play starts and stops (gameplayStart / gameplayStop)
 *  - mute the sound and pause input while an ad is on screen
 *  - the game must still work if the SDK or an ad fails to load, or an ad blocker is on
 */

export type PortalName = 'poki' | 'crazygames' | 'none';
export const PORTAL: PortalName = ((import.meta.env.VITE_PORTAL as string | undefined) ?? 'none') as PortalName;

const SDK_URL: Record<PortalName, string> = {
  poki: 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js',
  crazygames: 'https://sdk.crazygames.com/crazygames-sdk-v3.js',
  none: '',
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const w = window as any;

let ready = false;
let initPromise: Promise<void> | null = null;
let playing = false;
let inAd = false;

// ---- "hold" state: anything that should silence the game and block input (an ad, a hidden tab, the portal asking for mute) ----
const holds = new Set<string>();
const holdListeners = new Set<(held: boolean) => void>();
const setHold = (key: string, on: boolean) => {
  const before = holds.size > 0;
  if (on) holds.add(key); else holds.delete(key);
  const after = holds.size > 0;
  if (before !== after) holdListeners.forEach(fn => fn(after));
};
export const isHeld = () => holds.size > 0;
export const onHoldChange = (fn: (held: boolean) => void) => { holdListeners.add(fn); return () => { holdListeners.delete(fn); }; };
export const isAdPlaying = () => inAd;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('portal sdk blocked or offline'));
    document.head.appendChild(s);
  });
}

/** Start the portal SDK. Safe to call more than once. Never throws: the game goes on without ads if this fails. */
export function initPortal(): Promise<void> {
  if (PORTAL === 'none') return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await loadScript(SDK_URL[PORTAL]);
      if (PORTAL === 'poki') {
        await w.PokiSDK.init();
        ready = true;
      } else if (PORTAL === 'crazygames') {
        const sdk = w.CrazyGames?.SDK;
        await sdk.init();
        // on a domain that is not CrazyGames the SDK refuses every call, so only trust it where it says it works
        ready = sdk.environment === 'crazygames' || sdk.environment === 'local';
        if (ready) {
          sdk.game?.loadingStart?.();
          const apply = () => setHold('portal-mute', !!sdk.game?.settings?.muteAudio);
          apply();
          sdk.game?.addSettingsChangeListener?.(apply);
        }
      }
    } catch (err) {
      ready = false;
      console.warn('Portal SDK unavailable, running without it', err);
    }
  })();
  return initPromise;
}

/** The first screen the player can use is up. */
export function loadingFinished() {
  if (PORTAL === 'none') return;
  void (initPromise ?? initPortal()).then(() => {
    if (!ready) return;
    try {
      if (PORTAL === 'poki') w.PokiSDK.gameLoadingFinished();
      else if (PORTAL === 'crazygames') w.CrazyGames.SDK.game.loadingStop?.();
    } catch { /* the portal's problem must never break the game */ }
  });
}

export function gameplayStart() {
  if (playing || inAd) return;
  playing = true;
  if (!ready) return;
  try {
    if (PORTAL === 'poki') w.PokiSDK.gameplayStart();
    else if (PORTAL === 'crazygames') w.CrazyGames.SDK.game.gameplayStart();
  } catch { /* ignore */ }
}

export function gameplayStop() {
  if (!playing) return;
  playing = false;
  if (!ready) return;
  try {
    if (PORTAL === 'poki') w.PokiSDK.gameplayStop();
    else if (PORTAL === 'crazygames') w.CrazyGames.SDK.game.gameplayStop();
  } catch { /* ignore */ }
}

/**
 * An ad at a natural pause (a battle just ended, a screen was left). Resolves when it is over, or straight away if there was
 * no ad, no SDK, or an ad blocker. The portal decides if an ad actually shows, so calling this often is fine.
 */
export function commercialBreak(): Promise<void> {
  if (!ready || inAd) return Promise.resolve();
  const wasPlaying = playing;
  const begin = () => { inAd = true; setHold('ad', true); };
  const end = () => { inAd = false; setHold('ad', false); if (wasPlaying) gameplayStart(); };
  if (wasPlaying) gameplayStop();
  return new Promise<void>(resolve => {
    let done = false;
    const finish = () => { if (done) return; done = true; end(); resolve(); };
    const safety = window.setTimeout(finish, 120_000); // an ad that never reports back must not freeze the game
    const wrap = () => { window.clearTimeout(safety); finish(); };
    try {
      if (PORTAL === 'poki') {
        w.PokiSDK.commercialBreak(begin).then(wrap, wrap);
      } else if (PORTAL === 'crazygames') {
        w.CrazyGames.SDK.ad.requestAd('midgame', { adStarted: begin, adFinished: wrap, adError: wrap });
      } else wrap();
    } catch { wrap(); }
  });
}

/** An ad the player chose to watch for a reward. Resolves true only if the ad really played to the end. */
export function rewardedBreak(): Promise<boolean> {
  if (!ready || inAd) return Promise.resolve(false);
  const wasPlaying = playing;
  const begin = () => { inAd = true; setHold('ad', true); };
  const end = () => { inAd = false; setHold('ad', false); if (wasPlaying) gameplayStart(); };
  if (wasPlaying) gameplayStop();
  return new Promise<boolean>(resolve => {
    let done = false;
    const finish = (ok: boolean) => { if (done) return; done = true; end(); resolve(ok); };
    const safety = window.setTimeout(() => finish(false), 120_000);
    const wrap = (ok: boolean) => { window.clearTimeout(safety); finish(ok); };
    try {
      if (PORTAL === 'poki') {
        w.PokiSDK.rewardedBreak(begin).then((ok: boolean) => wrap(!!ok), () => wrap(false));
      } else if (PORTAL === 'crazygames') {
        w.CrazyGames.SDK.ad.requestAd('rewarded', { adStarted: begin, adFinished: () => wrap(true), adError: () => wrap(false) });
      } else wrap(false);
    } catch { wrap(false); }
  });
}

/** Can the player be offered a "watch an ad" button at all? */
export const canOfferRewarded = () => PORTAL !== 'none' && ready;

// a hidden tab is silent on every portal
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => setHold('hidden', document.hidden));
}
