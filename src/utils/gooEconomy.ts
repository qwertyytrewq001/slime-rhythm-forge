import { ELEMENT_TIERS } from '@/data/traitData';
/**
 * Goo economy knobs in one place. Slimes earn goo passively; eggs, habitats and shop items drain it. The original
 * numbers were very generous (one Common slime made ~720 goo an hour against a 50 goo egg), so passive income is
 * cut to 35% and the shop prices are doubled or more. Farm, sanctuary and battle numbers have their own files.
 */
/** Multiplier on passive goo (was 0.2). */
export const GOO_RATE = 0.07;
/** Goo for hatching an egg (was 500). */
export const HATCH_BONUS = 200;
/** Starter egg price in the Bazaar (was 50). */
export const EGG_COST = 120;
/** Egg prices by element: the four starter elements cost the base price, the later elements cost more (the same order as their habitats). */
const EGG_COSTS: Record<string, number> = { wind: 150, ice: 180, electric: 180, metal: 220, light: 260, shadow: 260 };
export const eggCost = (element: string) => EGG_COSTS[element] ?? EGG_COST;

/** How long a breeding ritual and an egg take, by the rarity of the baby. Early slimes are Common, so a new player waits 30 seconds for an egg and 1 minute for a breeding; the waits grow with rarity. */
const BREED_MIN: Record<string, number> = { Common: 1, Uncommon: 2, Rare: 5, Epic: 10, Legendary: 20, Divine: 35, Ancient: 60 };
const HATCH_MIN: Record<string, number> = { Common: 0.5, Uncommon: 1, Rare: 3, Epic: 6, Legendary: 12, Divine: 20, Ancient: 40 };
export const FIRST_WAIT_MS = 20_000;
/**
 * The elements a new player starts with are quick; each tier that unlocks later is slower to breed and hatch.
 * A slime with several elements waits as long as its most complex one.
 */
const ELEMENT_WAIT_FACTOR: Record<number, number> = { 1: 1, 2: 1.5, 3: 2, 4: 3 };
export const elementWaitFactor = (elements: readonly string[] = []) =>
  Math.max(1, ...elements.map(el => {
    const tier = Object.keys(ELEMENT_TIERS).map(Number).find(t => (ELEMENT_TIERS[t] as string[]).includes(el));
    return tier ? ELEMENT_WAIT_FACTOR[tier] ?? 1 : 1;
  }));
const roundWait = (ms: number) => (ms < 120_000 ? Math.round(ms / 5000) * 5000 : Math.round(ms / 30_000) * 30_000);
export const breedMs = (tier: string, isFirst = false, elements: readonly string[] = []) =>
  isFirst ? FIRST_WAIT_MS : roundWait((BREED_MIN[tier] ?? 5) * 60_000 * elementWaitFactor(elements));
export const hatchMs = (tier: string, isFirst = false, elements: readonly string[] = []) =>
  isFirst ? FIRST_WAIT_MS : roundWait((HATCH_MIN[tier] ?? 3) * 60_000 * elementWaitFactor(elements));
