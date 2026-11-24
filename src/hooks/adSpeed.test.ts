import { describe, it, expect } from 'vitest';
import { gameReducer, createInitialState } from './useGameState';

describe('AD_SPEED (rewarded video halves a timer)', () => {
  it('halves the hatch time but leaves a waiting newborn alone', () => {
    const s = createInitialState();
    const now = Date.now();
    const slime = { id: 'x' } as never;
    const a = gameReducer({ ...s, activeHatching: { slime, endTime: now + 100_000 } }, { type: 'AD_SPEED', target: 'hatch' });
    const left = a.activeHatching!.endTime - Date.now();
    expect(left).toBeGreaterThan(40_000);
    expect(left).toBeLessThanOrEqual(50_000);
    const w = { ...s, activeHatching: { slime, endTime: now + 100_000, waiting: true } };
    expect(gameReducer(w, { type: 'AD_SPEED', target: 'hatch' })).toBe(w);
  });
  it('halves breeding and growing crops, ignores finished ones', () => {
    const s = createInitialState();
    const now = Date.now();
    const b = gameReducer({ ...s, activeBreeding: { parent1Id: 'a', parent2Id: 'b', endTime: now + 60_000, resultSlime: {} as never } as never }, { type: 'AD_SPEED', target: 'breed' });
    expect(b.activeBreeding!.endTime - Date.now()).toBeLessThanOrEqual(30_000);
    const plots = s.farmPlots.map((p, i) => (i === 0 ? { ...p, cropType: 'basic', plantedAt: now - 1000, readyAt: now + 40_000 } : i === 1 ? { ...p, cropType: 'basic', plantedAt: now - 9000, readyAt: now - 1000 } : p));
    const f = gameReducer({ ...s, farmPlots: plots as never }, { type: 'AD_SPEED', target: 'farm' });
    expect(f.farmPlots[0].readyAt! - Date.now()).toBeLessThanOrEqual(20_000);
    expect(f.farmPlots[1].readyAt).toBe(plots[1].readyAt);
  });
});
