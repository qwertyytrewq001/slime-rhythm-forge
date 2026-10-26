# Farm v2 – design notes

## What was wrong with v1
- 6 small plots, 3 crops that were just "faster / slower" versions of each other.
- No progression: nothing to work toward, no reason to expand.
- Food XP vs. cost was never balanced (Starfruit paid far more XP per goo than anything else).
- Harvesting was one tap per plot, forever.

## The v2 pillars
1. **Three crop roles** – Glimberries = *Quick* (1 min, check-in crop), Moonpetal = *Steady* (20 min), Starfruit = *Overnight* (8 h).
   Each fits a different way of playing; none is strictly best.
2. **Farm Level (1–13)** – harvesting gives Farm XP. Levels unlock plots (4 free → 16), crops (Moonpetal Lv 2, Starfruit Lv 4) and perks.
3. **Perks** – extra-yield chance (up to 35%), golden harvest (up to 12%, x3 yield and 2x Farm XP), growth speed (up to -20% time).
4. **Active play** – water a plant once for -10% time, or rush it with goo (cost scales with remaining time).
5. **Quality of life** – Plant All, Harvest All, Water All, Auto-replant.
6. **Land is a goo sink** – plots 5–16 cost 150 → 100,000 goo and need the matching Farm Level.

## Economy rules of thumb (from the vite-node simulation)
- Slime XP per food: 10 / 55 / 350 (Glimberries / Moonpetal Honey / Starfruit).
- Seeds cost 4 / 35 / 300 goo, bought on demand when planting (stock used first).
- Goal: every play style (sprinter, check-in, casual, overnight-only) still progresses after 14 days.
- Constants live in `src/utils/farmCore.ts`; change them there and re-run `npx vite-node` unit tests.

## Phase B ideas (not built)
- Element-favourite crops (a Fire slime eats Emberroot for a bonus) – needs a feed-tray redesign.
- Farmhand slimes assigned to plots (passive watering / auto-harvest).
- Daily orders from townsfolk ("deliver 5 Moonpetal") for goo + rare seeds.
- Weather / seasons that boost one crop role.
- Painted crop art per growth stage (see `FARM_ART_PROMPTS.md`).
