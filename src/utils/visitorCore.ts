import { Habitat, SlimeFoodType, VisitorState } from '@/types/slime';
import { Roller, addJoy } from './sanctuaryCore';

/**
 * Wicks, a travelling owl-moth merchant. Every few hours he lands at the Sanctuary Isles for a short
 * while and asks for some farm food. Bringing it pays goo and makes every sanctuary happier, which gives
 * the farm a reason to feed the sanctuaries. Pure, like the rest of the rules: dice come in as rolls.
 */

export const VISIT_MS = 45 * 60_000;
export const FIRST_VISIT_DELAY_MS = 3 * 60_000;
export const NEXT_VISIT_MIN_MS = 3 * 3_600_000;
export const NEXT_VISIT_MAX_MS = 5 * 3_600_000;
export const LEAVE_AFTER_DONE_MS = 90_000;
export const REWARD_JOY = 30;
const WORTH: Record<SlimeFoodType, number> = { basic: 6, elemental: 40, royal: 320 };
const REWARD_FACTOR = 4;

export function spawnVisitor(now: number, rolls: [number, number], farmLevel: number): VisitorState {
  const options: Array<[SlimeFoodType, number]> = [['basic', 0.55]];
  if (farmLevel >= 2) options.push(['elemental', 0.35]);
  if (farmLevel >= 4) options.push(['royal', 0.1]);
  const total = options.reduce((n, [, w]) => n + w, 0);
  let acc = 0;
  let crop: SlimeFoodType = options[options.length - 1][0];
  for (const [c, w] of options) {
    acc += w / total;
    if (rolls[0] < acc) { crop = c; break; }
  }
  const qty = crop === 'basic' ? 3 + Math.floor(rolls[1] * 4) : crop === 'elemental' ? 2 + Math.floor(rolls[1] * 3) : 1 + Math.floor(rolls[1] * 2);
  return { id: `v${now}`, arrivedAt: now, leavesAt: now + VISIT_MS, crop, qty, rewardGoo: qty * WORTH[crop] * REWARD_FACTOR, rewardJoy: REWARD_JOY, done: false };
}

export interface VisitorTickResult {
  visitor: VisitorState | null;
  nextVisitAt: number | undefined;
}

/** Arrivals and departures. Nothing happens until the player has built at least one sanctuary. */
export function visitorTick(visitor: VisitorState | null, nextVisitAt: number | undefined, now: number, hasSanctuary: boolean, rolls: [number, number, number], farmLevel: number): VisitorTickResult {
  if (!hasSanctuary) return { visitor, nextVisitAt };
  if (nextVisitAt === undefined) return { visitor, nextVisitAt: now + FIRST_VISIT_DELAY_MS };
  if (visitor && now >= visitor.leavesAt) {
    return { visitor: null, nextVisitAt: now + NEXT_VISIT_MIN_MS + rolls[2] * (NEXT_VISIT_MAX_MS - NEXT_VISIT_MIN_MS) };
  }
  if (!visitor && now >= nextVisitAt) return { visitor: spawnVisitor(now, [rolls[0], rolls[1]], farmLevel), nextVisitAt };
  return { visitor, nextVisitAt };
}

export interface VisitorSlice {
  goo: number;
  inventory: Record<SlimeFoodType, number>;
  habitats: Habitat[];
  visitor: VisitorState | null;
}

export const canDeliver = (s: Pick<VisitorSlice, 'inventory' | 'visitor'>) =>
  !!s.visitor && !s.visitor.done && (s.inventory[s.visitor.crop] || 0) >= s.visitor.qty;

/** Hand over the food: pays goo, cheers up every sanctuary that has someone home, and he heads off soon after. */
export function deliver(s: VisitorSlice, now: number, next: Roller): VisitorSlice | null {
  if (!canDeliver(s) || !s.visitor) return null;
  const v = s.visitor;
  return {
    goo: Math.round((s.goo + v.rewardGoo) * 100) / 100,
    inventory: { ...s.inventory, [v.crop]: (s.inventory[v.crop] || 0) - v.qty },
    habitats: s.habitats.map(h => (h.assignedSlimeIds.length ? addJoy(h, v.rewardJoy, now, next) : h)),
    visitor: { ...v, done: true, leavesAt: Math.min(v.leavesAt, now + LEAVE_AFTER_DONE_MS) },
  };
}
