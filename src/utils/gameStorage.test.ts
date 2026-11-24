import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame } from './gameStorage';
import { createInitialState } from '@/hooks/useGameState';

describe('save and load', () => {
  beforeEach(() => localStorage.clear());

  it('keeps an egg in the incubator and a breeding in progress across a reload', () => {
    const s = createInitialState();
    const egg = { id: 'egg1', name: 'Test' } as never as typeof s.slimes[0];
    const other = { id: 'p2' } as never as typeof s.slimes[0];
    const state = {
      ...s,
      activeHatching: { slime: egg, endTime: Date.now() + 60_000, waiting: true },
      activeBreeding: { parent1Id: egg.id, parent2Id: other.id, endTime: Date.now() + 90_000, resultSlime: egg },
      luckyCharmActive: true,
    } as never;
    saveGame(state);
    const back = loadGame() as Record<string, unknown>;
    expect((back.activeHatching as { waiting: boolean }).waiting).toBe(true);
    expect((back.activeBreeding as { resultSlime: { id: string } }).resultSlime.id).toBe(egg.id);
    expect(back.luckyCharmActive).toBe(true);
  });
});
