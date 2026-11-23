import { describe, it, expect } from 'vitest';
import { calculateBreedingResult, getPossibleOutcomes } from './breedingCalculator';
import { ALL_ELEMENTS } from '@/data/traitData';
import { SLIME_CODEX_MAP } from '@/data/slimeCodex';
import type { SlimeElement } from '@/types/slime';

/** A parent pair whose offspring include both Common and rarer slimes, so the shop items have something to change. */
function mixedPair(): [SlimeElement[], SlimeElement[]] {
  for (const a of ALL_ELEMENTS) {
    for (const b of ALL_ELEMENTS) {
      const outs = getPossibleOutcomes([a], [b]);
      const tiers = new Set(outs.map(o => o.rarityTier));
      if (tiers.has('Common') && tiers.size > 1) return [[a], [b]];
    }
  }
  throw new Error('no mixed pair found');
}

const share = (hits: number, n: number) => hits / n;

describe('shop breeding items', () => {
  const [p1, p2] = mixedPair();
  const N = 3000;
  const run = (opts: { luck?: number; skipCommon?: boolean }) => {
    let common = 0, rareOrBetter = 0;
    for (let i = 0; i < N; i++) {
      const r = calculateBreedingResult(p1, p2, 1, 1, 'Common', 'Common', opts);
      const tier = SLIME_CODEX_MAP.get(r!.slimeId)!.rarityTier;
      if (tier === 'Common') common++;
      if (tier !== 'Common' && tier !== 'Uncommon') rareOrBetter++;
    }
    return { common: share(common, N), rare: share(rareOrBetter, N) };
  };

  it('Mutation Juice avoids Common results when a rarer slime is possible', () => {
    const base = run({});
    const juiced = run({ skipCommon: true });
    expect(base.common).toBeGreaterThan(0.05);
    expect(juiced.common).toBeLessThan(base.common * 0.3);
  });

  it('Lucky Charm does not make rare slimes less likely, and helps on average', () => {
    const base = run({});
    const lucky = run({ luck: 0.35 });
    expect(lucky.rare).toBeGreaterThanOrEqual(base.rare - 0.02);
  });
});
