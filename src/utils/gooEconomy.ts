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

/** How long a breeding ritual and an egg take, by the rarity of the baby. The very first of each is short so a new player is not left waiting. */
const BREED_MIN: Record<string, number> = { Common: 3, Uncommon: 5, Rare: 8, Epic: 15, Legendary: 30, Divine: 45, Ancient: 60 };
const HATCH_MIN: Record<string, number> = { Common: 2, Uncommon: 3, Rare: 5, Epic: 10, Legendary: 20, Divine: 30, Ancient: 45 };
export const FIRST_WAIT_MS = 20_000;
export const breedMs = (tier: string, isFirst = false) => (isFirst ? FIRST_WAIT_MS : (BREED_MIN[tier] ?? 5) * 60_000);
export const hatchMs = (tier: string, isFirst = false) => (isFirst ? FIRST_WAIT_MS : (HATCH_MIN[tier] ?? 3) * 60_000);
