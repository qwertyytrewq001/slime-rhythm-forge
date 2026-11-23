import { describe, it, expect } from 'vitest';
import { breedSlimes, createCodexSlime } from './slimeGenerator';
import { drawEnhancedEgg } from './eggRenderer';
import { deriveBattleStats } from './battleEngine';
import { ALL_CODEX_SLIMES } from '@/data/slimeCodex';
import { eggElementFor } from '@/components/game/PaintedEgg';

/** A canvas stand-in that accepts any drawing call, so the egg drawing code can run without a browser. */
const fakeCtx = () => new Proxy({}, {
  get: (_t, prop) => {
    if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => ({ addColorStop: () => {} });
    if (prop === 'measureText') return () => ({ width: 10 });
    return () => {};
  },
  set: () => true,
}) as unknown as CanvasRenderingContext2D;

describe('breeding never produces a slime the game cannot show', () => {
  it('every pair of species gives a complete baby that can be drawn as an egg and described', () => {
    const parents = ALL_CODEX_SLIMES.map(s => createCodexSlime(s.id));
    let tried = 0;
    for (const a of parents) {
      for (const b of parents) {
        const baby = breedSlimes(a, b);
        expect(baby, `${a.name} + ${b.name}`).toBeTruthy();
        expect(baby.traits).toBeTruthy();
        expect(baby.elements.length).toBeGreaterThan(0);
        expect(typeof baby.rarityTier).toBe('string');
        expect(() => drawEnhancedEgg(fakeCtx(), { size: 120, slime: baby })).not.toThrow();
        expect(() => deriveBattleStats(baby)).not.toThrow();
        expect(eggElementFor(baby).length).toBeGreaterThan(0);
        tried++;
      }
    }
    expect(tried).toBe(parents.length * parents.length);
  });
});
