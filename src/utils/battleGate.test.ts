import { describe, it, expect } from 'vitest';
import { battleUnlocked, bestSlimeLevel } from './battleGate';
import { createCodexSlime } from './slimeGenerator';

const slime = (level: number) => ({ ...createCodexSlime('leaf_slime'), level });

describe('battle gate', () => {
  it('a new player with a baby is locked out', () => {
    expect(battleUnlocked([slime(1)], 1)).toBe(false);
    expect(battleUnlocked([slime(4), slime(2)], 1)).toBe(false);
  });
  it('a level 5 slime opens battles', () => {
    expect(battleUnlocked([slime(1), slime(5)], 1)).toBe(true);
    expect(bestSlimeLevel([slime(3), slime(7)])).toBe(7);
  });
  it('old saves that already fought stay open', () => {
    expect(battleUnlocked([slime(1)], 3)).toBe(true);
  });
});
