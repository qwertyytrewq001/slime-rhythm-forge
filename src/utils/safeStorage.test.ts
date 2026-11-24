import { describe, it, expect, afterEach } from 'vitest';
import { installSafeStorage } from './safeStorage';

describe('installSafeStorage', () => {
  const real = Object.getOwnPropertyDescriptor(window, 'localStorage');
  afterEach(() => { if (real) Object.defineProperty(window, 'localStorage', real); });

  it('leaves working storage alone', () => {
    expect(installSafeStorage().local).toBe(true);
  });

  it('swaps a throwing localStorage for a working in-memory one', () => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });
    const r = installSafeStorage();
    expect(r.local).toBe(false);
    window.localStorage.setItem('a', '1');
    expect(window.localStorage.getItem('a')).toBe('1');
    window.localStorage.removeItem('a');
    expect(window.localStorage.getItem('a')).toBeNull();
  });
});
