import { describe, it, expect } from 'vitest';
import { guideSteps, isBrandNew } from '@/utils/guideSteps';
import { createElementSlime } from '@/utils/slimeGenerator';
import { GameState } from '@/types/slime';

const base = (over: Partial<GameState> = {}): GameState =>
  ({
    slimes: [], habitats: [], activeHatching: null, currentLevel: 1, pendingHabitatPlacement: null,
    inventory: { basic: 8, elemental: 0, royal: 0 }, stats: { feeds: 0 }, ...over,
  }) as unknown as GameState;
const sels = (s: GameState) => guideSteps(s, 1000).map(x => x.sel).join(' ');
const slime = (level: number) => ({ ...createElementSlime('fire'), level });
const home = (ids: string[]) => ({ id: 'h1', element: 'fire' as const, gridX: 0, gridY: 0, assignedSlimeIds: ids, capacity: 2 });

describe('new-player guide', () => {
  it('only counts an untouched save as new', () => {
    expect(isBrandNew(base())).toBe(true);
    expect(isBrandNew(base({ slimes: [slime(1)] }))).toBe(false);
    expect(isBrandNew(base({ currentLevel: 4 }))).toBe(false);
  });

  it('walks from the egg to the first battle', () => {
    expect(sels(base())).toContain('baz-egg');
    const baby = slime(1);
    expect(sels(base({ slimes: [baby], activeHatching: { slime: baby, endTime: 5000 } }))).toContain('"egg"');
    expect(sels(base({ slimes: [baby] }))).toContain('baz-habitat');
    expect(sels(base({ slimes: [baby], pendingHabitatPlacement: { element: 'fire' } }))).toContain('place-site');
    expect(sels(base({ slimes: [baby], habitats: [home([])] }))).toContain('add-slime');
    expect(sels(base({ slimes: [baby], habitats: [home([baby.id])] }))).toContain('food-bag');
    expect(sels(base({ slimes: [baby], habitats: [home([baby.id])], inventory: { basic: 0, elemental: 0, royal: 0 } }))).toContain('farm-plant');
    expect(sels(base({ slimes: [slime(5)] }))).toContain('map-level');
  });

  it('is silent once the first battle is won', () => {
    expect(guideSteps(base({ currentLevel: 2, slimes: [slime(6)] }), 1000)).toEqual([]);
  });
});
