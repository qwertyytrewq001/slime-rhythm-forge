import { describe, it, expect } from 'vitest';
import { getPossibleOutcomes } from './breedingCalculator';
import { ALL_CODEX_SLIMES } from '@/data/slimeCodex';
import type { SlimeElement } from '@/types/slime';

describe('breeding rule', () => {
  it('babies are blends: never a single-element slime, and always carry an element from each parent', () => {
    const seen = new Set<string>();
    for (const a of ALL_CODEX_SLIMES) for (const b of ALL_CODEX_SLIMES) {
      const key = [a.elements.join(), b.elements.join()].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      const out = getPossibleOutcomes(a.elements as SlimeElement[], b.elements as SlimeElement[]);
      expect(out.length, `${a.name} + ${b.name} has no result`).toBeGreaterThan(0);
      for (const s of out) {
        expect(s.elements.length, `${s.name} from ${a.name} + ${b.name} is a core slime`).toBeGreaterThanOrEqual(2);
        expect(s.elements.some(e => a.elements.includes(e)), `${s.name} lacks ${a.name}'s element`).toBe(true);
        expect(s.elements.some(e => b.elements.includes(e)), `${s.name} lacks ${b.name}'s element`).toBe(true);
      }
    }
  });
  it('Fire x Water gives only Fire+Water slimes', () => {
    const names = getPossibleOutcomes(['fire'], ['water']).map(s => s.name).sort();
    expect(names).toEqual(['Caramel Slime', 'Lava Slime', 'Steam Slime', 'Volcano Slime']);
  });
});
