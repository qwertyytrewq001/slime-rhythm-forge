# Goo economy notes

All knobs: `src/utils/gooEconomy.ts` (passive rate, hatch bonus, egg price), habitat prices in `src/data/traitData.ts`, shop items in `BazaarModal.tsx`, farm in `farmCore.ts`, sanctuaries in `sanctuaryCore.ts`, battles in `battleEngine.ts`.

Measured before: a Common level-1 slime made ~720 goo/hour passively, an egg cost 50 and hatching gave +500, so early buying was nearly free and goo stopped meaning anything.

Changed: passive income x0.35 (about 250/hour per Common slime), hatch bonus 500 -> 200, starter egg 50 -> 120, habitats x2, shop items x2. Starting goo stays 500 (about four eggs).

Still to watch after real play: late game (20+ high-level slimes) still earns tens of thousands an hour, so late sinks (farm land up to 100k, sanctuary level 5 at 8k plus food) should stay the long-term goals. If it still feels too generous, lower GOO_RATE first.
Egg prices now scale with the element (see eggCost in src/utils/gooEconomy.ts): starter four 120g, wind 150g, ice and electric 180g, metal 220g, light and shadow 260g.
Bazaar items are rare and gated by resonance level: Lucky Charm 300g (Lv 3), Wild Food 250g (Lv 4), Energy Crystal 350g (Lv 5), Mutation Juice 600g (Lv 6).
