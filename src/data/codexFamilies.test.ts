import { describe, it, expect } from 'vitest';
import { ALL_CODEX_SLIMES } from './slimeCodex';

describe('codex families', () => {
  it('every slime has exactly one family and appears once', () => {
    const ids = ALL_CODEX_SLIMES.map(s => s.id);
    expect(new Set(ids).size, 'duplicate ids').toBe(ids.length);
    const names = ALL_CODEX_SLIMES.map(s => s.name.toLowerCase());
    const dupNames = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupNames, 'duplicate names').toEqual([]);
    for (const s of ALL_CODEX_SLIMES) expect(s.family, s.id).toBeTruthy();
  });
  it('a slime is listed in one family only (no id shows up under two families)', () => {
    const seen = new Map<string, string>();
    for (const s of ALL_CODEX_SLIMES) {
      expect(seen.has(s.id) && seen.get(s.id) !== s.family, `${s.id} in two families`).toBe(false);
      seen.set(s.id, s.family as string);
    }
    // family sizes add up to the whole codex
    const per = new Map<string, number>();
    ALL_CODEX_SLIMES.forEach(s => per.set(s.family as string, (per.get(s.family as string) ?? 0) + 1));
    expect([...per.values()].reduce((a, b) => a + b, 0)).toBe(ALL_CODEX_SLIMES.length);
  });
});

import { existsSync } from 'fs';
import { resolve } from 'path';
describe('codex art', () => {
  it('every slime has its own sprite file, and no two slimes share one', () => {
    const ids = ALL_CODEX_SLIMES.map(s => (s as { spriteId?: string }).spriteId ?? s.id);
    for (const id of ids) expect(existsSync(resolve(__dirname, '../../public', `${id}.png`)), id).toBe(true);
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    expect(dup, 'two slimes using the same sprite').toEqual([]);
  });
});
