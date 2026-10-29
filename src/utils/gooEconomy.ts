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
