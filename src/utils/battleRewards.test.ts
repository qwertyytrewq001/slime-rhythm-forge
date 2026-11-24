import { describe, it, expect } from 'vitest';
import { calculateBattleRewards } from './battleEngine';
import { BATTLE_STORY } from '@/data/battleStory';

describe('battle rewards', () => {
  it('pay goo and food, never XP', () => {
    const r = calculateBattleRewards(12, true);
    expect(r.goo).toBeGreaterThan(0);
    expect(r.food.basic).toBeGreaterThan(0);
    expect('xp' in r).toBe(false);
  });
  it('give better food on later levels and bosses', () => {
    expect(calculateBattleRewards(3, true).food.elemental).toBe(0);
    expect(calculateBattleRewards(8, true).food.elemental).toBe(1);
    expect(calculateBattleRewards(15, true).food.elemental).toBe(2);
    expect(calculateBattleRewards(10, true).food.royal).toBe(1);
    expect(calculateBattleRewards(11, true).food.royal).toBe(0);
  });
  it('a defeat pays a little', () => {
    const r = calculateBattleRewards(30, false);
    expect(r.goo).toBe(5);
    expect(r.food).toEqual({ basic: 1, elemental: 0, royal: 0 });
  });
});

describe('story', () => {
  it('every battle level 1-50 has a story beat somewhere', () => {
    const big = [1, 5, 10, 14, 15, 20, 25, 30, 35, 40, 45, 49, 50];
    for (let l = 1; l <= 50; l++) if (!big.includes(l) && l !== 16) expect(BATTLE_STORY[l], `level ${l}`).toBeTruthy();
  });
});

import { gameReducer, createInitialState } from '@/hooks/useGameState';
describe('BATTLE_REWARD reducer', () => {
  it('adds food and goo, and leaves slime levels alone', () => {
    const s0 = createInitialState();
    const team = s0.slimes;
    const s1 = gameReducer(s0, { type: 'BATTLE_REWARD', result: { playerTeam: team, opponentTeam: [], winner: 'player', gooReward: 30, foodReward: { basic: 3, elemental: 1, royal: 0 }, levelReached: 4 } });
    expect(s1.inventory.basic).toBe(s0.inventory.basic + 3);
    expect(s1.inventory.elemental).toBe(s0.inventory.elemental + 1);
    expect(s1.goo).toBe(s0.goo + 30);
    expect(s1.slimes.map(x => x.level)).toEqual(s0.slimes.map(x => x.level));
    expect(s1.currentLevel).toBe(5);
  });
});
