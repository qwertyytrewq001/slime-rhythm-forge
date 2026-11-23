import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Load a fresh copy of the portal module for a given portal, with the SDK script "loading" instantly.
async function load(portal: 'poki' | 'crazygames' | 'none') {
  vi.resetModules();
  vi.stubEnv('VITE_PORTAL', portal);
  vi.spyOn(document.head, 'appendChild').mockImplementation((node: any) => { queueMicrotask(() => node.onload?.()); return node; });
  return import('./portal');
}

describe('portal glue', () => {
  beforeEach(() => { delete (window as any).PokiSDK; delete (window as any).CrazyGames; });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it('does nothing on the plain web build', async () => {
    const p = await load('none');
    await p.initPortal();
    p.gameplayStart();
    await expect(p.commercialBreak()).resolves.toBeUndefined();
    await expect(p.rewardedBreak()).resolves.toBe(false);
    expect(p.isHeld()).toBe(false);
  });

  it('Poki: starts, stops, and silences the game around an ad', async () => {
    const calls: string[] = [];
    (window as any).PokiSDK = {
      init: () => Promise.resolve(),
      gameLoadingFinished: () => calls.push('loaded'),
      gameplayStart: () => calls.push('start'),
      gameplayStop: () => calls.push('stop'),
      commercialBreak: (before: () => void) => { before(); calls.push('ad'); return Promise.resolve(); },
    };
    const p = await load('poki');
    await p.initPortal();
    const holds: boolean[] = [];
    p.onHoldChange(h => holds.push(h));
    p.gameplayStart();
    await p.commercialBreak();
    expect(calls).toEqual(['start', 'stop', 'ad', 'start']);
    expect(holds).toEqual([true, false]); // muted while the ad ran, back on after
    expect(p.isHeld()).toBe(false);
    expect(p.isAdPlaying()).toBe(false);
  });

  it('Poki: a rewarded ad only pays out when it really played', async () => {
    (window as any).PokiSDK = { init: () => Promise.resolve(), rewardedBreak: (b: () => void) => { b(); return Promise.resolve(true); }, gameplayStart() {}, gameplayStop() {} };
    const p = await load('poki');
    await p.initPortal();
    await expect(p.rewardedBreak()).resolves.toBe(true);
    (window as any).PokiSDK.rewardedBreak = () => Promise.resolve(false);
    await expect(p.rewardedBreak()).resolves.toBe(false);
  });

  it('CrazyGames: ad finished and ad error both give the game back', async () => {
    let mode: 'finish' | 'error' | 'throw' = 'finish';
    (window as any).CrazyGames = { SDK: {
      environment: 'local',
      init: () => Promise.resolve(),
      game: { gameplayStart() {}, gameplayStop() {}, loadingStart() {}, loadingStop() {}, settings: { muteAudio: false }, addSettingsChangeListener() {} },
      ad: { requestAd: (_t: string, cb: any) => { if (mode === 'throw') throw new Error('boom'); cb.adStarted(); mode === 'finish' ? cb.adFinished() : cb.adError({ code: 'unfilled' }); } },
    } };
    const p = await load('crazygames');
    await p.initPortal();
    for (const m of ['finish', 'error', 'throw'] as const) {
      mode = m;
      await p.commercialBreak();
      expect(p.isHeld()).toBe(false);
      expect(p.isAdPlaying()).toBe(false);
    }
  });

  it('CrazyGames: honours the portal asking for no sound', async () => {
    (window as any).CrazyGames = { SDK: { environment: 'crazygames', init: () => Promise.resolve(), game: { settings: { muteAudio: true }, addSettingsChangeListener() {}, loadingStart() {} }, ad: {} } };
    const p = await load('crazygames');
    await p.initPortal();
    expect(p.isHeld()).toBe(true);
  });

  it('CrazyGames: on a domain that is not CrazyGames the SDK is left alone', async () => {
    const start = vi.fn();
    (window as any).CrazyGames = { SDK: { environment: 'disabled', init: () => Promise.resolve(), game: { gameplayStart: start }, ad: {} } };
    const p = await load('crazygames');
    await p.initPortal();
    p.gameplayStart();
    expect(start).not.toHaveBeenCalled();
    await expect(p.commercialBreak()).resolves.toBeUndefined();
  });

  it('keeps running when the SDK fails to load (ad blocker)', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_PORTAL', 'poki');
    vi.spyOn(document.head, 'appendChild').mockImplementation((node: any) => { queueMicrotask(() => node.onerror?.()); return node; });
    const p = await import('./portal');
    await expect(p.initPortal()).resolves.toBeUndefined();
    p.gameplayStart();
    await expect(p.commercialBreak()).resolves.toBeUndefined();
  });

  it('a hidden tab is silent', async () => {
    const p = await load('none');
    const holds: boolean[] = [];
    p.onHoldChange(h => holds.push(h));
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(p.isHeld()).toBe(true);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(p.isHeld()).toBe(false);
    expect(holds).toEqual([true, false]);
  });
});
