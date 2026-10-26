import { FarmPlot, FarmState, GameStats, SlimeFoodType, SLIME_FOODS } from '../types/slime';
import { FarmPerks, NO_PERKS } from './sanctuaryCore';

/**
 * Farm rules (pure functions, no React).
 *
 * Design goals:
 *  - Each crop is the best choice for a different way of playing: Glimberries while you are here, Moonpetal for a
 *    visit every few minutes, Starfruit for overnight. XP per plot-hour is deliberately close between them so no crop
 *    beats the others on every measure; patience is rewarded with goo efficiency and fewer taps instead.
 *  - Goo is plentiful in this game (hundreds of thousands an hour late on), so seeds stay cheap and the real goo sinks are
 *    land, speed-ups and upgrades. Time, plots and Farm Level are what actually limit the farm.
 *  - Farm Level is the farm's own progression: land, crops and perks unlock as you harvest.
 */

export interface CropDef {
  id: SlimeFoodType;
  name: string;
  emoji: string;
  growMs: number;
  seedCost: number;
  baseYield: number; // items per harvest before perks
  farmXp: number; // Farm XP per harvest
  unlockLevel: number;
  role: 'Quick' | 'Steady' | 'Overnight';
  blurb: string;
}

export const CROPS: Record<SlimeFoodType, CropDef> = {
  basic: {
    id: 'basic', name: 'Glimberries', emoji: '🫐', growMs: 60_000, seedCost: 4, baseYield: 1, farmXp: 1, unlockLevel: 1,
    role: 'Quick', blurb: 'Ready in a minute. Great while you are here.',
  },
  elemental: {
    id: 'elemental', name: 'Moonpetal Blossom', emoji: '🌼', growMs: 20 * 60_000, seedCost: 35, baseYield: 2, farmXp: 5, unlockLevel: 2,
    role: 'Steady', blurb: 'Twenty minutes. A good fit for a quick check-in.',
  },
  royal: {
    id: 'royal', name: 'Starfruit Vine', emoji: '⭐', growMs: 8 * 3_600_000, seedCost: 300, baseYield: 2, farmXp: 20, unlockLevel: 4,
    role: 'Overnight', blurb: 'Eight hours. Plant it before you head off.',
  },
};
export const CROP_ORDER: SlimeFoodType[] = ['basic', 'elemental', 'royal'];

/** Total Farm XP needed to reach each level (index = level). */
export const FARM_LEVEL_XP = [0, 0, 15, 45, 100, 200, 380, 680, 1150, 1850, 2900, 4400, 6500, 9300];
export const MAX_FARM_LEVEL = FARM_LEVEL_XP.length - 1;

export interface PlotRule {
  level: number; // Farm Level needed
  cost: number; // goo
}
export const PLOT_RULES: PlotRule[] = [
  { level: 1, cost: 0 }, { level: 1, cost: 0 }, { level: 1, cost: 0 }, { level: 1, cost: 0 },
  { level: 2, cost: 150 }, { level: 3, cost: 300 }, { level: 4, cost: 600 }, { level: 5, cost: 1_200 },
  { level: 6, cost: 2_400 }, { level: 7, cost: 4_500 }, { level: 8, cost: 8_000 }, { level: 9, cost: 14_000 },
  { level: 10, cost: 24_000 }, { level: 11, cost: 40_000 }, { level: 12, cost: 65_000 }, { level: 13, cost: 100_000 },
];
export const TOTAL_PLOTS = PLOT_RULES.length;
export const START_PLOTS = 4;

export const levelForXp = (xp: number) => {
  let level = 1;
  for (let l = 2; l <= MAX_FARM_LEVEL; l++) if (xp >= FARM_LEVEL_XP[l]) level = l;
  return level;
};
export const plotsAtLevel = (level: number) => PLOT_RULES.filter(r => r.level <= level).length;
export const xpIntoLevel = (farm: FarmState) => {
  if (farm.level >= MAX_FARM_LEVEL) return { have: farm.xp - FARM_LEVEL_XP[MAX_FARM_LEVEL], need: 0 };
  return { have: farm.xp - FARM_LEVEL_XP[farm.level], need: FARM_LEVEL_XP[farm.level + 1] - FARM_LEVEL_XP[farm.level] };
};

// ---- perks that grow with Farm Level ----
export const extraYieldChance = (level: number) => Math.min(0.35, 0.03 * (level - 1));
export const goldenChance = (level: number) => Math.min(0.12, 0.03 + 0.0075 * (level - 1));
export const growthMultiplier = (level: number) => 1 - Math.min(0.2, 0.015 * (level - 1));
export const WATER_BONUS = 0.1; // of the full grow time, once per plant
export const RUSH_FACTOR = 2.5; // finishing a brand new plant instantly costs this many seeds' worth of goo
export const GOLDEN_MULT = 3;

export const growMsFor = (crop: SlimeFoodType, level: number, perks: FarmPerks = NO_PERKS) =>
  Math.round(CROPS[crop].growMs * growthMultiplier(level) * (1 - perks.growthCut));
export const seedPrice = (crop: SlimeFoodType, perks: FarmPerks = NO_PERKS) => Math.max(1, Math.round(CROPS[crop].seedCost * (1 - perks.seedDiscount)));
export const plotCost = (rule: PlotRule, perks: FarmPerks = NO_PERKS) => Math.round(rule.cost * (1 - perks.landDiscount));

// ---------------------------------------------------------------------------

export interface FarmSlice {
  goo: number;
  seeds: Record<SlimeFoodType, number>;
  inventory: Record<SlimeFoodType, number>;
  farmPlots: FarmPlot[];
  farm: FarmState;
  stats: GameStats;
  /** Bonuses from the player's sanctuaries; none when absent. */
  perks?: FarmPerks;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const isReady = (p: FarmPlot, now: number) => !!p.cropType && !!p.readyAt && now >= p.readyAt;
export const isGrowing = (p: FarmPlot, now: number) => !!p.cropType && !!p.readyAt && now < p.readyAt;
export const progressOf = (p: FarmPlot, now: number) =>
  p.cropType && p.plantedAt && p.readyAt ? Math.min(1, Math.max(0, (now - p.plantedAt) / (p.readyAt - p.plantedAt))) : 0;

export function cropUnlocked(crop: SlimeFoodType, level: number) {
  return level >= CROPS[crop].unlockLevel;
}

/** What it costs to plant: nothing if you already own a seed, otherwise the seed price. */
export function plantCost(s: Pick<FarmSlice, 'seeds' | 'perks'>, crop: SlimeFoodType) {
  return (s.seeds[crop] || 0) > 0 ? 0 : seedPrice(crop, s.perks);
}

function placeCrop(s: FarmSlice, plotId: number, crop: SlimeFoodType, now: number): FarmSlice | null {
  const plot = s.farmPlots.find(p => p.id === plotId);
  if (!plot || !plot.unlocked || plot.cropType) return null;
  if (!cropUnlocked(crop, s.farm.level)) return null;
  const owned = s.seeds[crop] || 0;
  const cost = owned > 0 ? 0 : seedPrice(crop, s.perks);
  if (cost > s.goo) return null;
  const grow = growMsFor(crop, s.farm.level, s.perks);
  return {
    ...s,
    goo: round2(s.goo - cost),
    seeds: owned > 0 ? { ...s.seeds, [crop]: owned - 1 } : s.seeds,
    farmPlots: s.farmPlots.map(p =>
      p.id === plotId ? { ...p, cropType: crop, lastCrop: crop, plantedAt: now, readyAt: now + grow, watered: false } : p,
    ),
  };
}

export const plant = placeCrop;

export function plantAll(s: FarmSlice, crop: SlimeFoodType, now: number): { slice: FarmSlice; planted: number } {
  let cur = s;
  let planted = 0;
  for (const plot of s.farmPlots) {
    if (!plot.unlocked || plot.cropType) continue;
    const next = placeCrop(cur, plot.id, crop, now);
    if (!next) break; // out of goo (or crop locked)
    cur = next;
    planted++;
  }
  return { slice: cur, planted };
}

export interface HarvestOutcome {
  plotId: number;
  crop: SlimeFoodType;
  items: number;
  extra: boolean;
  golden: boolean;
  farmXp: number;
  levelUp: number | null;
  replanted: boolean;
}

/** rolls = [yield roll, golden roll], each 0..1. Passed in so the reducer stays pure and testable. */
export function harvest(s: FarmSlice, plotId: number, rolls: [number, number], now: number): { slice: FarmSlice; outcome: HarvestOutcome } | null {
  const plot = s.farmPlots.find(p => p.id === plotId);
  if (!plot || !plot.cropType || !isReady(plot, now)) return null;
  const crop = plot.cropType;
  const def = CROPS[crop];
  const level = s.farm.level;

  const perks = s.perks ?? NO_PERKS;
  const extra = rolls[0] < extraYieldChance(level) + perks.yieldChance;
  const golden = rolls[1] < goldenChance(level) + perks.goldenChance;
  const items = (def.baseYield + (extra ? 1 : 0)) * (golden ? GOLDEN_MULT : 1);
  const xp = (def.farmXp + perks.farmXpFlat) * (golden ? 2 : 1);

  const newXp = s.farm.xp + xp;
  const newLevel = levelForXp(newXp);

  let slice: FarmSlice = {
    ...s,
    inventory: { ...s.inventory, [crop]: (s.inventory[crop] || 0) + items },
    farm: { ...s.farm, xp: newXp, level: newLevel },
    farmPlots: s.farmPlots.map(p => (p.id === plotId ? { ...p, cropType: null, plantedAt: null, readyAt: null, watered: false } : p)),
    stats: { ...s.stats, harvests: s.stats.harvests + 1, goldenHarvests: (s.stats.goldenHarvests ?? 0) + (golden ? 1 : 0) },
  };

  let replanted = false;
  if (s.farm.autoReplant) {
    const again = placeCrop(slice, plotId, crop, now);
    if (again) {
      slice = again;
      replanted = true;
    }
  }

  return { slice, outcome: { plotId, crop, items, extra, golden, farmXp: xp, levelUp: newLevel > level ? newLevel : null, replanted } };
}

export function harvestAll(s: FarmSlice, rolls: Array<[number, number]>, now: number): { slice: FarmSlice; outcomes: HarvestOutcome[] } {
  let cur = s;
  const outcomes: HarvestOutcome[] = [];
  let i = 0;
  for (const plot of s.farmPlots) {
    if (!isReady(plot, now)) continue;
    const r = rolls[i++] ?? [0.99, 0.99];
    const res = harvest(cur, plot.id, r, now);
    if (res) {
      cur = res.slice;
      outcomes.push(res.outcome);
    }
  }
  return { slice: cur, outcomes };
}

export function water(s: FarmSlice, plotId: number, now: number): FarmSlice | null {
  const plot = s.farmPlots.find(p => p.id === plotId);
  if (!plot || !isGrowing(plot, now) || plot.watered || !plot.plantedAt || !plot.readyAt) return null;
  const total = plot.readyAt - plot.plantedAt;
  const readyAt = Math.max(now, plot.readyAt - Math.round(total * WATER_BONUS));
  return { ...s, farmPlots: s.farmPlots.map(p => (p.id === plotId ? { ...p, readyAt, watered: true } : p)) };
}

export function waterAll(s: FarmSlice, now: number): { slice: FarmSlice; watered: number } {
  let cur = s;
  let watered = 0;
  for (const plot of s.farmPlots) {
    const next = water(cur, plot.id, now);
    if (next) {
      cur = next;
      watered++;
    }
  }
  return { slice: cur, watered };
}

/** Goo to finish a growing plant right now: proportional to what is left. */
export function rushCost(plot: FarmPlot, now: number, perks: FarmPerks = NO_PERKS): number {
  if (!plot.cropType || !plot.plantedAt || !plot.readyAt || now >= plot.readyAt) return 0;
  const total = plot.readyAt - plot.plantedAt;
  const left = plot.readyAt - now;
  return Math.max(1, Math.ceil((left / total) * CROPS[plot.cropType].seedCost * RUSH_FACTOR * (1 - perks.rushDiscount)));
}

export function rush(s: FarmSlice, plotId: number, now: number): FarmSlice | null {
  const plot = s.farmPlots.find(p => p.id === plotId);
  if (!plot || !isGrowing(plot, now)) return null;
  const cost = rushCost(plot, now, s.perks);
  if (cost > s.goo) return null;
  return { ...s, goo: round2(s.goo - cost), farmPlots: s.farmPlots.map(p => (p.id === plotId ? { ...p, readyAt: now } : p)) };
}

export function unlockPlot(s: FarmSlice, plotId: number): FarmSlice | null {
  const plot = s.farmPlots.find(p => p.id === plotId);
  const rule = PLOT_RULES[plotId];
  if (!plot || plot.unlocked || !rule) return null;
  const cost = plotCost(rule, s.perks);
  if (s.farm.level < rule.level || s.goo < cost) return null;
  return { ...s, goo: round2(s.goo - cost), farmPlots: s.farmPlots.map(p => (p.id === plotId ? { ...p, unlocked: true } : p)) };
}

// ---------------------------------------------------------------------------
// Saves
// ---------------------------------------------------------------------------

export function createFarmPlots(): FarmPlot[] {
  return Array.from({ length: TOTAL_PLOTS }, (_, i) => ({
    id: i, unlocked: i < START_PLOTS, cropType: null, plantedAt: null, readyAt: null, watered: false, lastCrop: null,
  }));
}

export const createFarmState = (): FarmState => ({ level: 1, xp: 0, autoReplant: false });

/** Bring an older save (6 plots, no Farm Level) forward without taking anything away from the player. */
export function migrateFarm(savedPlots: FarmPlot[] | undefined, savedFarm: FarmState | undefined, seeds: Record<SlimeFoodType, number> | undefined) {
  const base = createFarmPlots();
  const plots = base.map(p => {
    const old = savedPlots?.find(o => o.id === p.id);
    return old ? { ...p, ...old, unlocked: p.unlocked || old.unlocked, watered: old.watered ?? false, lastCrop: old.lastCrop ?? old.cropType ?? null } : p;
  });
  if (savedFarm) return { plots, farm: savedFarm };

  // an older save: keep every plot and crop usable
  const unlocked = plots.filter(p => p.unlocked).length;
  let level = 1;
  while (level < MAX_FARM_LEVEL && plotsAtLevel(level) < unlocked) level++;
  const usesRoyal = (seeds?.royal ?? 0) > 0 || plots.some(p => p.cropType === 'royal');
  if (usesRoyal) level = Math.max(level, 5);
  else if ((seeds?.elemental ?? 0) > 0 || plots.some(p => p.cropType === 'elemental')) level = Math.max(level, 2);
  return { plots, farm: { level, xp: FARM_LEVEL_XP[level], autoReplant: false } };
}

// ---------------------------------------------------------------------------
// Numbers for the UI and for balance checks
// ---------------------------------------------------------------------------

export const foodXp = (crop: SlimeFoodType) => SLIME_FOODS[crop].xpValue;

/** Expected feeding XP one plot produces per hour of continuous tending, at a Farm Level. */
export function xpPerPlotHour(crop: SlimeFoodType, level: number) {
  const def = CROPS[crop];
  const perHarvest = (def.baseYield + extraYieldChance(level)) * (1 + (GOLDEN_MULT - 1) * goldenChance(level));
  return (3_600_000 / growMsFor(crop, level)) * perHarvest * foodXp(crop);
}
