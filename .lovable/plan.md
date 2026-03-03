

## Evolution System: Baby → Teen → Adult Slimes

### Concept

Each slime has a **level** (1-15) and an **evolution stage** derived from it:
- **Baby** (Lv 1-4): Smaller body (~0.6x scale), bigger eyes relative to body, simpler features, no spikes/accessories
- **Teen** (Lv 5-9): Medium body (~0.85x scale), normal eyes, spikes start showing, partial accessories
- **Adult** (Lv 10+): Full size (1.0x), all features rendered, glow/aura at full intensity

Feeding costs goo and grants XP. When XP reaches a threshold, the slime levels up. Each evolution stage change triggers a visual "evolution burst" animation.

### Data Changes (`src/types/slime.ts`)

Add to the `Slime` interface:
- `level: number` (default 1)
- `xp: number` (default 0)
- `stage: 'baby' | 'teen' | 'adult'` (derived from level, or stored)

Add `GameAction`:
- `FEED_SLIME_XP` — spends goo, adds XP, checks for level-up and stage evolution

### XP & Leveling Formula

- XP to next level: `level * 15` (so Lv1→2 = 15 XP, Lv9→10 = 135 XP)
- Each feed gives 10 XP, costs 5 goo
- Stage thresholds: Baby < 5, Teen < 10, Adult >= 10

### Rendering Changes (`src/utils/slimeRenderer.ts`)

Derive stage from `slime.level` at render time. Apply a **stage scale multiplier** to the body radius and offset all features accordingly:

- **Baby**: Scale body to 60%. Draw eyes 30% larger relative to body (cute/chibi). Skip spikes, accessories, and aura. Increase bounce amplitude by 1.3x (bouncier). Simpler mouth (only happy expressions).
- **Teen**: Scale body to 85%. Eyes normal ratio. Render spikes at 50% length. Accessories at 50% opacity. Aura at 50% opacity.
- **Adult**: Full render as current code, no changes needed.

This only requires wrapping the existing radius/feature calculations with a stage multiplier — no rewrite of the rendering pipeline.

### Migration

- `migrateSlime()` adds `level: s.level ?? 1` and `xp: s.xp ?? 0` for existing saves
- Stage is computed as a helper function `getStage(level)`, not stored

### UI Changes

- **Gallery cards**: Show "Baby", "Teen", or "Adult" tag next to species name
- **StatsPanel / detail view**: Show level, XP bar, and a "Feed" button (costs 5 goo, +10 XP)
- **Evolution popup**: When crossing a stage threshold, show a brief "Evolving!" popup with a glow burst effect, similar to the discovery popup

### Game Balance Impact

- Feeding is the primary goo sink, encouraging habitat-based goo farming
- Adult slimes produce more goo passively (multiply base goo output by `1 + (level - 1) * 0.1`)
- Only Adult slimes (Lv 10+) can breed — this gates breeding behind investment and makes progression feel earned

### Files to Change

1. **`src/types/slime.ts`** — Add `level`, `xp` to `Slime`; add `FEED_SLIME_XP` action
2. **`src/hooks/useGameState.tsx`** — Handle `FEED_SLIME_XP` reducer logic (spend goo, add xp, level up); update goo tick to factor in level; migrate old slimes
3. **`src/utils/slimeRenderer.ts`** — Add `getStage()` helper; apply stage-based scale/feature gating to existing render pipeline
4. **`src/components/game/SlimeGallery.tsx`** — Show stage tag on cards
5. **`src/components/game/StatsPanel.tsx`** — Show level, XP bar, feed button
6. **`src/components/game/DiscoveryPopup.tsx`** or new `EvolutionPopup.tsx` — Evolution celebration

