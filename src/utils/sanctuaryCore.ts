import { Habitat, HabitatGift, Slime, SlimeElement, SlimeFoodType } from '@/types/slime';

/**
 * Sanctuary rules, kept pure so they can be tested without React. Anything random (which gift a happy
 * slime leaves) comes from `rolls` that the caller supplies, the same way farmCore does it.
 *
 * The loop: slimes living in a sanctuary build up Joy. A full Joy meter becomes a gift waiting to be
 * collected. Gifts stop piling up at a cap, so you come back every few hours. Upgrading a sanctuary
 * (goo plus farm food) raises its capacity, its gift cap, and the strength of its element perk.
 */

export const MAX_SANCT_LEVEL = 5;
export const JOY_MAX = 100;
export const OFFLINE_CAP_MS = 8 * 3_600_000;
export const PET_COOLDOWN_MS = 15_000;
export const PET_JOY = 6;
export const FEED_JOY = 15;

//                          L0  L1 L2 L3 L4 L5
export const CAPACITY_AT = [0, 2, 3, 4, 5, 6];
export const GIFT_CAP_AT = [0, 2, 3, 4, 5, 6];
export const DECOR_SLOTS_AT = [0, 1, 2, 3, 3, 4];

export interface UpgradeCost {
  goo: number;
  food: Partial<Record<SlimeFoodType, number>>;
}
/** Cost to REACH the level at the same index. */
export const UPGRADE_COST: Array<UpgradeCost | null> = [
  null,
  null,
  { goo: 300, food: { basic: 3 } },
  { goo: 800, food: { basic: 5, elemental: 2 } },
  { goo: 2500, food: { elemental: 4, royal: 1 } },
  { goo: 8000, food: { elemental: 6, royal: 3 } },
];

// ---- what each element's sanctuary gives the player (strength scales with level) ----
export interface FarmPerks {
  yieldChance: number;
  goldenChance: number;
  growthCut: number;
  seedDiscount: number;
  rushDiscount: number;
  landDiscount: number;
  farmXpFlat: number;
}
export interface SanctuaryPerks extends FarmPerks {
  gooGiftMult: number;
  giftCapBonus: number;
  joyMult: number;
}
export const NO_PERKS: SanctuaryPerks = {
  yieldChance: 0, goldenChance: 0, growthCut: 0, seedDiscount: 0, rushDiscount: 0, landDiscount: 0, farmXpFlat: 0,
  gooGiftMult: 0, giftCapBonus: 0, joyMult: 0,
};

export interface PerkInfo {
  title: string;
  /** What it does at a given sanctuary level, for the UI. */
  text: (level: number) => string;
  apply: (p: SanctuaryPerks, level: number) => void;
}
const pct = (n: number) => `${Math.round(n * 100)}%`;
export const ELEMENT_PERKS: Record<SlimeElement, PerkInfo> = {
  plant: { title: 'Overgrowth', text: l => `Farm: +${pct(0.02 * l)} chance of extra crops`, apply: (p, l) => { p.yieldChance += 0.02 * l; } },
  earth: { title: 'Rich Soil', text: l => `Farm: +${pct(0.01 * l)} chance of golden crops`, apply: (p, l) => { p.goldenChance += 0.01 * l; } },
  wind: { title: 'Fair Winds', text: l => `Farm: crops grow ${pct(0.03 * l)} faster`, apply: (p, l) => { p.growthCut += 0.03 * l; } },
  water: { title: 'Spring Water', text: l => `Farm: seeds cost ${pct(0.04 * l)} less`, apply: (p, l) => { p.seedDiscount += 0.04 * l; } },
  electric: { title: 'Static Charge', text: l => `Farm: rushing costs ${pct(0.05 * l)} less`, apply: (p, l) => { p.rushDiscount += 0.05 * l; } },
  metal: { title: 'Fine Tools', text: l => `Farm: new land costs ${pct(0.03 * l)} less`, apply: (p, l) => { p.landDiscount += 0.03 * l; } },
  light: { title: 'Sunlit Learning', text: l => `Farm: +${Math.ceil(l / 2)} Farm XP per harvest`, apply: (p, l) => { p.farmXpFlat += Math.ceil(l / 2); } },
  fire: { title: 'Warm Hearts', text: l => `Gifts: ${pct(0.1 * l)} more goo`, apply: (p, l) => { p.gooGiftMult += 0.1 * l; } },
  ice: { title: 'Cold Storage', text: l => (l >= 3 ? 'Gifts: holds 1 more gift' : 'Gifts: holds 1 more gift at level 3'), apply: (p, l) => { if (l >= 3) p.giftCapBonus += 1; } },
  shadow: { title: 'Gentle Dusk', text: l => `Joy builds ${pct(0.1 * l)} faster`, apply: (p, l) => { p.joyMult += 0.1 * l; } },
};

// ---- decoration slimes use; each raises how fast Joy builds ----
export interface DecorDef {
  id: string;
  name: string;
  cost: number;
  joy: number;
}
export const DECOR: DecorDef[] = [
  { id: 'flowers', name: 'Flower Patch', cost: 80, joy: 0.05 },
  { id: 'ball', name: 'Play Ball', cost: 120, joy: 0.06 },
  { id: 'lantern', name: 'Glow Lantern', cost: 150, joy: 0.06 },
  { id: 'swing', name: 'Little Swing', cost: 250, joy: 0.08 },
  { id: 'fountain', name: 'Mini Fountain', cost: 300, joy: 0.08 },
  { id: 'stump', name: 'Climbing Stump', cost: 350, joy: 0.09 },
  { id: 'hammock', name: 'Cosy Hammock', cost: 450, joy: 0.1 },
  { id: 'mushroom', name: 'Bouncy Mushroom', cost: 600, joy: 0.12 },
];
export const decorById = (id: string) => DECOR.find(d => d.id === id);

// ---------------------------------------------------------------------------

export const habitatLevel = (h: Habitat) => Math.min(MAX_SANCT_LEVEL, Math.max(1, h.level ?? 1));
export const habitatCapacity = (h: Habitat) => Math.max(h.capacity, CAPACITY_AT[habitatLevel(h)]);
export const decorSlots = (h: Habitat) => DECOR_SLOTS_AT[habitatLevel(h)];

/** Old saves have none of the sanctuary fields; fill them in without crediting any time that passed. */
export function normalizeHabitat(h: Habitat, now: number): Habitat {
  const level = habitatLevel(h);
  return {
    ...h,
    level,
    capacity: Math.max(h.capacity, CAPACITY_AT[level]),
    joy: Math.min(JOY_MAX, Math.max(0, h.joy ?? 0)),
    gifts: h.gifts ?? [],
    decor: h.decor ?? [],
    lastTick: h.lastTick ?? now,
    petAt: h.petAt ?? 0,
  };
}

/** The perks the player is getting right now: an element's perk needs a matching slime living there. */
export function perksFrom(habitats: Habitat[], slimes: Slime[]): SanctuaryPerks {
  const out: SanctuaryPerks = { ...NO_PERKS };
  const best = new Map<SlimeElement, number>();
  for (const h of habitats) {
    const staffed = h.assignedSlimeIds.some(id => slimes.find(s => s.id === id)?.elements.includes(h.element));
    if (!staffed) continue;
    best.set(h.element, Math.max(best.get(h.element) ?? 0, habitatLevel(h)));
  }
  best.forEach((lvl, el) => ELEMENT_PERKS[el].apply(out, lvl));
  out.yieldChance = Math.min(0.15, out.yieldChance);
  out.goldenChance = Math.min(0.08, out.goldenChance);
  out.growthCut = Math.min(0.25, out.growthCut);
  out.seedDiscount = Math.min(0.25, out.seedDiscount);
  out.rushDiscount = Math.min(0.4, out.rushDiscount);
  out.landDiscount = Math.min(0.2, out.landDiscount);
  return out;
}

/** Perks currently being earned, one line each, for the UI. */
export function activePerks(habitats: Habitat[], slimes: Slime[]): Array<{ element: SlimeElement; level: number; title: string; text: string }> {
  const best = new Map<SlimeElement, number>();
  for (const h of habitats) {
    if (!h.assignedSlimeIds.some(id => slimes.find(s => s.id === id)?.elements.includes(h.element))) continue;
    best.set(h.element, Math.max(best.get(h.element) ?? 0, habitatLevel(h)));
  }
  return [...best.entries()].map(([element, level]) => ({ element, level, title: ELEMENT_PERKS[element].title, text: ELEMENT_PERKS[element].text(level) }));
}

export const giftCap = (h: Habitat, perks: SanctuaryPerks = NO_PERKS) => GIFT_CAP_AT[habitatLevel(h)] + (h.element === 'ice' ? perks.giftCapBonus : 0);

/** Joy per minute while the player is away. Only slimes of the right element live here. */
export function joyPerMinute(h: Habitat, slimes: Slime[], perks: SanctuaryPerks = NO_PERKS): number {
  const living = h.assignedSlimeIds.filter(id => slimes.find(s => s.id === id)).length;
  if (!living) return 0;
  let rate = 0.4 * living;
  if (living >= 2) rate *= 1.2; // friends
  const decor = (h.decor ?? []).reduce((sum, id) => sum + (decorById(id)?.joy ?? 0), 0);
  rate *= 1 + decor + (h.element === 'shadow' ? perks.joyMult : 0);
  return rate;
}

// ---- gifts ----

export type Roller = () => number;
export const rollerFrom = (rolls: number[]): Roller => {
  let i = 0;
  return () => (i < rolls.length ? rolls[i++] : 0.5);
};

const CROP_WEIGHTS = (level: number): Array<[SlimeFoodType, number]> => {
  const royal = 0.02 * level;
  const elemental = 0.18 + 0.05 * level;
  return [['royal', royal], ['elemental', elemental], ['basic', 1 - royal - elemental]];
};
const pickCrop = (level: number, r: number): SlimeFoodType => {
  let acc = 0;
  for (const [crop, w] of CROP_WEIGHTS(level)) {
    acc += w;
    if (r < acc) return crop;
  }
  return 'basic';
};

export function gooGiftAmount(level: number, perks: SanctuaryPerks = NO_PERKS) {
  return Math.round(60 * (1 + 0.6 * (level - 1)) * (1 + perks.gooGiftMult));
}

export function makeGift(h: Habitat, now: number, n: number, next: Roller, perks: SanctuaryPerks = NO_PERKS): HabitatGift {
  const level = habitatLevel(h);
  const kindRoll = next();
  const cropRoll = next();
  const id = `${h.id}-${now}-${n}`;
  if (kindRoll < 0.05) return { id, kind: 'jackpot', amount: gooGiftAmount(level, perks) * 5, at: now };
  if (kindRoll < 0.3) return { id, kind: 'food', crop: pickCrop(level, cropRoll), amount: level >= 3 ? 2 : 1, at: now };
  if (kindRoll < 0.45) {
    const crop = pickCrop(level, cropRoll);
    return { id, kind: 'seeds', crop, amount: crop === 'basic' ? 3 : 1, at: now };
  }
  return { id, kind: 'goo', amount: gooGiftAmount(level, perks), at: now };
}

/** Add Joy. Every time the meter fills, a gift is left, until the gift cap is reached. */
export function addJoy(h: Habitat, amount: number, now: number, next: Roller, perks: SanctuaryPerks = NO_PERKS): Habitat {
  let joy = (h.joy ?? 0) + amount;
  const gifts = [...(h.gifts ?? [])];
  const cap = giftCap(h, perks);
  while (joy >= JOY_MAX && gifts.length < cap) {
    gifts.push(makeGift(h, now, gifts.length, next, perks));
    joy -= JOY_MAX;
  }
  return { ...h, joy: Math.min(joy, JOY_MAX), gifts };
}

/** Time passing: slimes living here slowly build Joy, even while the player is away (up to 8 hours). */
export function tickHabitat(h: Habitat, slimes: Slime[], now: number, next: Roller, perks: SanctuaryPerks = NO_PERKS): Habitat {
  const last = h.lastTick ?? now;
  const elapsed = Math.min(Math.max(0, now - last), OFFLINE_CAP_MS);
  const base = { ...h, lastTick: now };
  if (!elapsed) return base;
  return addJoy(base, joyPerMinute(h, slimes, perks) * (elapsed / 60_000), now, next, perks);
}

/** Petting builds Joy, but only once every few seconds per sanctuary so it cannot be spammed. */
export function petHabitat(h: Habitat, now: number, next: Roller, perks: SanctuaryPerks = NO_PERKS): Habitat {
  if (!h.assignedSlimeIds.length || now - (h.petAt ?? 0) < PET_COOLDOWN_MS) return h;
  return addJoy({ ...h, petAt: now }, PET_JOY, now, next, perks);
}

// ---- collecting, upgrading, decorating (all act on a slice so the reducer stays thin) ----

export interface SanctSlice {
  goo: number;
  inventory: Record<SlimeFoodType, number>;
  seeds: Record<SlimeFoodType, number>;
  habitats: Habitat[];
}
const round2 = (n: number) => Math.round(n * 100) / 100;

export function applyGift(s: SanctSlice, g: HabitatGift): SanctSlice {
  if (g.kind === 'goo' || g.kind === 'jackpot') return { ...s, goo: round2(s.goo + g.amount) };
  const crop = g.crop ?? 'basic';
  if (g.kind === 'food') return { ...s, inventory: { ...s.inventory, [crop]: (s.inventory[crop] || 0) + g.amount } };
  return { ...s, seeds: { ...s.seeds, [crop]: (s.seeds[crop] || 0) + g.amount } };
}

export function collectGift(s: SanctSlice, habitatId: string, giftId: string): { slice: SanctSlice; gift: HabitatGift } | null {
  const h = s.habitats.find(x => x.id === habitatId);
  const gift = h?.gifts?.find(g => g.id === giftId);
  if (!h || !gift) return null;
  const withGift = applyGift(s, gift);
  return { gift, slice: { ...withGift, habitats: withGift.habitats.map(x => (x.id === habitatId ? { ...x, gifts: (x.gifts ?? []).filter(g => g.id !== giftId) } : x)) } };
}

export function collectAll(s: SanctSlice): { slice: SanctSlice; gifts: HabitatGift[] } {
  let cur = s;
  const gifts: HabitatGift[] = [];
  for (const h of s.habitats) for (const g of h.gifts ?? []) {
    const r = collectGift(cur, h.id, g.id);
    if (r) { cur = r.slice; gifts.push(r.gift); }
  }
  return { slice: cur, gifts };
}

export const totalGifts = (habitats: Habitat[]) => habitats.reduce((n, h) => n + (h.gifts?.length ?? 0), 0);

export function canAffordUpgrade(s: Pick<SanctSlice, 'goo' | 'inventory'>, cost: UpgradeCost) {
  return s.goo >= cost.goo && (Object.entries(cost.food) as Array<[SlimeFoodType, number]>).every(([c, n]) => (s.inventory[c] || 0) >= n);
}

export function upgradeHabitat(s: SanctSlice, habitatId: string): SanctSlice | null {
  const h = s.habitats.find(x => x.id === habitatId);
  if (!h) return null;
  const level = habitatLevel(h);
  if (level >= MAX_SANCT_LEVEL) return null;
  const cost = UPGRADE_COST[level + 1];
  if (!cost || !canAffordUpgrade(s, cost)) return null;
  const inventory = { ...s.inventory };
  (Object.entries(cost.food) as Array<[SlimeFoodType, number]>).forEach(([c, n]) => { inventory[c] = (inventory[c] || 0) - n; });
  const next = level + 1;
  return {
    ...s,
    goo: round2(s.goo - cost.goo),
    inventory,
    habitats: s.habitats.map(x => (x.id === habitatId ? { ...x, level: next, capacity: Math.max(x.capacity, CAPACITY_AT[next]) } : x)),
  };
}

export function placeDecor(s: SanctSlice, habitatId: string, decorId: string): SanctSlice | null {
  const h = s.habitats.find(x => x.id === habitatId);
  const def = decorById(decorId);
  if (!h || !def) return null;
  const placed = h.decor ?? [];
  if (placed.includes(decorId) || placed.length >= decorSlots(h) || s.goo < def.cost) return null;
  return { ...s, goo: round2(s.goo - def.cost), habitats: s.habitats.map(x => (x.id === habitatId ? { ...x, decor: [...placed, decorId] } : x)) };
}

export function removeDecor(s: SanctSlice, habitatId: string, decorId: string): SanctSlice | null {
  const h = s.habitats.find(x => x.id === habitatId);
  if (!h || !(h.decor ?? []).includes(decorId)) return null;
  return { ...s, habitats: s.habitats.map(x => (x.id === habitatId ? { ...x, decor: (x.decor ?? []).filter(d => d !== decorId) } : x)) };
}

/** A short line on how soon the next gift is likely, for the UI. */
export function minutesToNextGift(h: Habitat, slimes: Slime[], perks: SanctuaryPerks = NO_PERKS): number | null {
  const rate = joyPerMinute(h, slimes, perks);
  if (rate <= 0) return null;
  return Math.ceil((JOY_MAX - (h.joy ?? 0)) / rate);
}

// ---- time of day: the sanctuaries follow the player's real clock ----
export type DayPhase = 'night' | 'dawn' | 'day' | 'dusk';
export interface DayInfo {
  phase: DayPhase;
  /** A colour to multiply over the scene, or null in full daylight. */
  tint: string | null;
  night: boolean;
}
export function dayPhase(d: Date): DayInfo {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5 && h < 7) return { phase: 'dawn', tint: 'rgb(255,222,200)', night: false };
  if (h >= 7 && h < 18) return { phase: 'day', tint: null, night: false };
  if (h >= 18 && h < 20) return { phase: 'dusk', tint: 'rgb(255,196,170)', night: false };
  return { phase: 'night', tint: 'rgb(130,140,215)', night: true };
}

// ---- slots on the Sanctuary Isles: space opens up as the sanctuaries grow ----
export const TOTAL_SLOTS = 8;
/** Four sites from the start; the best sanctuary level opens one more per level above 1. */
export function slotsOpen(habitats: Habitat[]): number {
  const best = habitats.reduce((n, h) => Math.max(n, habitatLevel(h)), 1);
  return Math.min(TOTAL_SLOTS, Math.max(habitats.length, 4 + (best - 1)));
}
