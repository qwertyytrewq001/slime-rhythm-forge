import type { Slime } from '@/types/slime';

/** Battles open once a slime is out of its baby stage (level 5): buy an egg, hatch it, feed it. */
export const BATTLE_UNLOCK_LEVEL = 5;

export const bestSlimeLevel = (slimes: Slime[]): number => slimes.reduce((m, s) => Math.max(m, s.level || 1), 1);

/**
 * Old saves that already fought (currentLevel above 1) are never locked out.
 * A new player has to raise one slime to level 5 first.
 */
export const battleUnlocked = (slimes: Slime[], currentLevel = 1): boolean =>
  currentLevel > 1 || bestSlimeLevel(slimes) >= BATTLE_UNLOCK_LEVEL;
