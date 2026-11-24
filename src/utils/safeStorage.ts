/**
 * Portals run the game inside an iframe, often in incognito or with third-party storage blocked. In those cases merely
 * touching window.localStorage / sessionStorage can throw. Call installSafeStorage() once, first thing: if a store is
 * unusable it is replaced with an in-memory one, so the rest of the game keeps working (progress just is not kept).
 */
function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k: string) => (m.has(k) ? (m.get(k) as string) : null),
    key: (i: number) => Array.from(m.keys())[i] ?? null,
    removeItem: (k: string) => { m.delete(k); },
    setItem: (k: string, v: string) => { m.set(k, String(v)); },
  } as Storage;
}

function works(name: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const s = window[name];
    const k = '__rs_probe__';
    s.setItem(k, '1');
    s.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function installSafeStorage(): { local: boolean; session: boolean } {
  const result = { local: true, session: true };
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    if (works(name)) continue;
    result[name === 'localStorage' ? 'local' : 'session'] = false;
    try {
      Object.defineProperty(window, name, { configurable: true, value: memoryStorage() });
    } catch { /* nothing more we can do */ }
  }
  return result;
}
