

## Plan: Fix Build Errors + Fast & Satisfying Leveling

### 1. Fix Build Errors (3 files)

**`src/utils/slimeGenerator.ts`** (line 44-56): Add `level: 1, xp: 0` to the `buildSlime` return object.

**`src/components/game/Shop.tsx`** (line 18): Add `level: 1, xp: 0` to the mock slime object.

**`src/components/game/Shop.tsx`** (line 133): Change `'FEED_SLIME'` to `'FEED_SLIME_XP'` with proper `foodType` parameter.

### 2. Make Leveling Fast & Dopamine-Hitting

**Current formula**: XP to next level = `level * 15`, feed gives 10 XP. Level 12 requires 180 XP (18 feeds). Too slow and grindy.

**New formula**: XP to next level = `5 + level * 3`. This means:
- Lv 1→2: 8 XP (1 feed)
- Lv 5→6: 20 XP (2 feeds)  
- Lv 10→11: 35 XP (4 feeds)
- Lv 12→13: 41 XP (5 feeds)

Reaching level 12 total = ~240 XP (~24 feeds) but each individual level feels fast and achievable.

**Files**: `src/hooks/useGameState.tsx` — change `xpToNext = newLevel * 15` to `xpToNext = 5 + newLevel * 3` in the FEED_SLIME_XP reducer (line 289, 296).

### 3. Level-Up Celebration Effect

**`src/hooks/useGameState.tsx`**: On every level-up (not just stage evolution), play `achievement` SFX and show a toast. Add a `lastLevelUp` field to GameState tracking `{ slimeId, newLevel, timestamp }`.

**`src/components/game/StatsPanel.tsx`** or wherever the feed button lives: Show a brief "LEVEL UP!" burst animation with screen shake and particle effects when level increases. Use `sonner` toast with a custom styled message like "⚡ LEVEL UP! Lv X → Lv Y" with the slime name.

**`src/components/game/EvolutionPopup.tsx`**: Already exists for stage changes — keep this for baby→teen→adult transitions. For regular level-ups, use a lighter toast notification so it's frequent and snappy rather than a full modal.

### Summary of Changes

| File | Change |
|------|--------|
| `src/utils/slimeGenerator.ts` | Add `level: 1, xp: 0` to buildSlime |
| `src/components/game/Shop.tsx` | Add `level: 1, xp: 0` to mock; fix action type |
| `src/hooks/useGameState.tsx` | Flatten XP curve to `5 + level * 3`; track level-ups for celebration |
| `src/components/game/StatsPanel.tsx` | Add level-up toast/animation on feed |

