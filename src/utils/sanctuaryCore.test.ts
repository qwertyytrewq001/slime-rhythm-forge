import { describe, expect, it } from 'vitest';
import { Habitat, Slime } from '@/types/slime';
import {
  CAPACITY_AT, JOY_MAX, OFFLINE_CAP_MS, PET_COOLDOWN_MS, SanctSlice, addJoy, collectAll, collectGift, giftCap, joyPerMinute, makeGift,
  normalizeHabitat, perksFrom, petHabitat, placeDecor, removeDecor, rollerFrom, tickHabitat, upgradeHabitat, NO_PERKS, UPGRADE_COST, canAffordUpgrade,
} from './sanctuaryCore';
import { CROPS, FarmSlice, harvest, plantCost, plotCost, PLOT_RULES, rushCost, unlockPlot, growMsFor, createFarmPlots, createFarmState } from './farmCore';

const slime = (id: string, element: any = 'plant'): Slime => ({ id, name: id, elements: [element], element } as unknown as Slime);
const hab = (over: Partial<Habitat> = {}): Habitat => normalizeHabitat({ id: 'h1', element: 'plant', gridX: 0, gridY: 0, assignedSlimeIds: ['a', 'b'], capacity: 2, ...over }, 0);
const slimes = [slime('a'), slime('b'), slime('c', 'fire')];
const MIN = 60_000;
const slice = (h: Habitat[], over: Partial<SanctSlice> = {}): SanctSlice => ({ goo: 10_000, inventory: { basic: 10, elemental: 10, royal: 10 }, seeds: { basic: 0, elemental: 0, royal: 0 }, habitats: h, ...over });

describe('migration', () => {
  it('old habitats get level 1, no joy, no time credited', () => {
    const h = normalizeHabitat({ id: 'x', element: 'fire', gridX: 0, gridY: 0, assignedSlimeIds: [], capacity: 2 }, 12345);
    expect(h.level).toBe(1);
    expect(h.joy).toBe(0);
    expect(h.gifts).toEqual([]);
    expect(h.lastTick).toBe(12345);
  });
});

describe('joy', () => {
  it('an empty sanctuary builds no joy', () => {
    expect(joyPerMinute(hab({ assignedSlimeIds: [] }), slimes)).toBe(0);
  });
  it('friends build joy faster than one slime per slime', () => {
    const one = joyPerMinute(hab({ assignedSlimeIds: ['a'] }), slimes);
    const two = joyPerMinute(hab(), slimes);
    expect(two).toBeGreaterThan(one * 2);
  });
  it('decor speeds joy up', () => {
    expect(joyPerMinute(hab({ decor: ['mushroom'] }), slimes)).toBeGreaterThan(joyPerMinute(hab(), slimes));
  });
  it('a full meter leaves a gift and keeps the overflow', () => {
    const h = addJoy(hab(), 130, 1000, rollerFrom([0.9, 0.5]));
    expect(h.gifts).toHaveLength(1);
    expect(h.joy).toBe(30);
  });
  it('stops at the gift cap and the meter holds at full', () => {
    const cap = giftCap(hab());
    const h = addJoy(hab(), 100 * (cap + 3), 1000, rollerFrom([]));
    expect(h.gifts).toHaveLength(cap);
    expect(h.joy).toBe(JOY_MAX);
  });
});

describe('time passing', () => {
  it('builds joy while away', () => {
    const h = tickHabitat(hab({ lastTick: 0 }), slimes, 60 * MIN, rollerFrom([]));
    expect(h.joy! + h.gifts!.length * 100).toBeCloseTo(joyPerMinute(hab(), slimes) * 60, 5);
  });
  it('only credits up to eight hours', () => {
    const a = tickHabitat(hab({ lastTick: 0 }), slimes, OFFLINE_CAP_MS, rollerFrom([]));
    const b = tickHabitat(hab({ lastTick: 0 }), slimes, OFFLINE_CAP_MS * 10, rollerFrom([]));
    expect(b.gifts!.length).toBe(a.gifts!.length);
    expect(b.joy).toBe(a.joy);
  });
  it('a clock that went backwards does nothing bad', () => {
    const h = tickHabitat(hab({ lastTick: 5000 }), slimes, 1000, rollerFrom([]));
    expect(h.joy).toBe(0);
    expect(h.lastTick).toBe(1000);
  });
});

describe('petting', () => {
  it('adds joy, then is on cooldown', () => {
    const h1 = petHabitat(hab(), 100_000, rollerFrom([]));
    expect(h1.joy).toBeGreaterThan(0);
    const h2 = petHabitat(h1, 100_000 + PET_COOLDOWN_MS - 1, rollerFrom([]));
    expect(h2).toBe(h1);
    const h3 = petHabitat(h1, 100_000 + PET_COOLDOWN_MS, rollerFrom([]));
    expect(h3.joy).toBeGreaterThan(h1.joy!);
  });
  it('does nothing with nobody home', () => {
    const h = hab({ assignedSlimeIds: [] });
    expect(petHabitat(h, 100_000, rollerFrom([]))).toBe(h);
  });
});

describe('gifts', () => {
  it('rolls each kind', () => {
    expect(makeGift(hab(), 1, 0, rollerFrom([0.01, 0.5])).kind).toBe('jackpot');
    expect(makeGift(hab(), 1, 0, rollerFrom([0.2, 0.9])).kind).toBe('food');
    expect(makeGift(hab(), 1, 0, rollerFrom([0.4, 0.9])).kind).toBe('seeds');
    expect(makeGift(hab(), 1, 0, rollerFrom([0.9, 0.5])).kind).toBe('goo');
  });
  it('higher levels give more goo, and Warm Hearts adds a bonus', () => {
    expect(makeGift(hab({ level: 4 }), 1, 0, rollerFrom([0.9, 0.5])).amount).toBeGreaterThan(makeGift(hab(), 1, 0, rollerFrom([0.9, 0.5])).amount);
    const fire = hab({ element: 'fire', level: 3 });
    const perks = perksFrom([fire], [slime('a', 'fire')].map(s => ({ ...s, id: 'a' })));
    expect(perks.gooGiftMult).toBeGreaterThan(0);
  });
  it('collecting pays out and removes the gift', () => {
    const h = addJoy(hab(), 100, 1000, rollerFrom([0.9, 0.5]));
    const g = h.gifts![0];
    const r = collectGift(slice([h], { goo: 0 }), 'h1', g.id)!;
    expect(r.slice.goo).toBe(g.amount);
    expect(r.slice.habitats[0].gifts).toHaveLength(0);
    expect(collectGift(r.slice, 'h1', g.id)).toBeNull();
  });
  it('food and seeds go to the right bags; collect all empties everything', () => {
    let h = addJoy(hab({ level: 3 }), 100, 1000, rollerFrom([0.2, 0.9])); // food, basic, level 3 -> 2
    h = addJoy(h, 100, 1001, rollerFrom([0.4, 0.9])); // seeds
    const r = collectAll(slice([h], { inventory: { basic: 0, elemental: 0, royal: 0 } }));
    expect(r.gifts).toHaveLength(2);
    expect(r.slice.inventory.basic).toBe(2);
    expect(r.slice.seeds.basic).toBe(3);
    expect(r.slice.habitats[0].gifts).toHaveLength(0);
  });
});

describe('upgrades', () => {
  it('costs goo and food, and raises capacity and gift cap', () => {
    const s = upgradeHabitat(slice([hab()]), 'h1')!;
    expect(s.habitats[0].level).toBe(2);
    expect(s.habitats[0].capacity).toBe(CAPACITY_AT[2]);
    expect(s.goo).toBe(10_000 - UPGRADE_COST[2]!.goo);
    expect(s.inventory.basic).toBe(10 - 3);
    expect(giftCap(s.habitats[0])).toBeGreaterThan(giftCap(hab()));
  });
  it('refuses without the food, and at max level', () => {
    expect(upgradeHabitat(slice([hab()], { inventory: { basic: 0, elemental: 0, royal: 0 } }), 'h1')).toBeNull();
    expect(upgradeHabitat(slice([hab({ level: 5 })]), 'h1')).toBeNull();
    expect(canAffordUpgrade({ goo: 5, inventory: { basic: 99, elemental: 99, royal: 99 } }, UPGRADE_COST[2]!)).toBe(false);
  });
});

describe('decor', () => {
  it('is limited by slots, one of each, and costs goo', () => {
    let s: SanctSlice | null = slice([hab()]);
    s = placeDecor(s, 'h1', 'flowers')!;
    expect(s.habitats[0].decor).toEqual(['flowers']);
    expect(placeDecor(s, 'h1', 'ball')).toBeNull(); // level 1 has one slot
    expect(placeDecor(s, 'h1', 'flowers')).toBeNull();
    s = removeDecor(s, 'h1', 'flowers')!;
    expect(s.habitats[0].decor).toEqual([]);
    expect(placeDecor(slice([hab()], { goo: 1 }), 'h1', 'flowers')).toBeNull();
  });
});

describe('element perks', () => {
  it('need a matching slime living there', () => {
    expect(perksFrom([hab({ assignedSlimeIds: [] })], slimes).yieldChance).toBe(0);
    expect(perksFrom([hab()], slimes).yieldChance).toBeCloseTo(0.02);
    expect(perksFrom([hab({ level: 5 })], slimes).yieldChance).toBeCloseTo(0.1);
  });
  it('are capped when stacked', () => {
    const many = ['plant', 'earth', 'wind', 'water', 'electric', 'metal', 'light'].map((el, i) => hab({ id: 'h' + i, element: el as any, level: 5, assignedSlimeIds: ['s' + i] }));
    const sl = many.map((h, i) => slime('s' + i, h.element));
    const p = perksFrom(many, sl);
    expect(p.growthCut).toBeLessThanOrEqual(0.25);
    expect(p.landDiscount).toBeLessThanOrEqual(0.2);
    expect(p.farmXpFlat).toBe(3);
  });
});

describe('farm integration', () => {
  const farm = (perks?: any, over: Partial<FarmSlice> = {}): FarmSlice => ({
    goo: 1000, seeds: { basic: 0, elemental: 0, royal: 0 }, inventory: { basic: 0, elemental: 0, royal: 0 },
    farmPlots: createFarmPlots(), farm: { ...createFarmState(), level: 4 }, stats: { battlesWon: 0, bossesDefeated: 0, harvests: 0, goldenHarvests: 0, feeds: 0 }, perks, ...over,
  });
  it('without perks nothing changes', () => {
    expect(plantCost(farm(), 'royal')).toBe(CROPS.royal.seedCost);
    expect(plotCost(PLOT_RULES[4])).toBe(PLOT_RULES[4].cost);
  });
  it('perks cheapen seeds, land and rushing, and speed growth', () => {
    const p = { ...NO_PERKS, seedDiscount: 0.2, landDiscount: 0.1, rushDiscount: 0.5, growthCut: 0.1 };
    expect(plantCost(farm(p), 'royal')).toBe(Math.round(CROPS.royal.seedCost * 0.8));
    expect(plotCost(PLOT_RULES[4], p)).toBe(Math.round(PLOT_RULES[4].cost * 0.9));
    expect(growMsFor('basic', 4, p)).toBeLessThan(growMsFor('basic', 4));
    const plot = { id: 0, unlocked: true, cropType: 'royal' as const, plantedAt: 1, readyAt: 1_000_001, watered: false, lastCrop: 'royal' as const };
    expect(rushCost(plot, 1, p)).toBeLessThan(rushCost(plot, 1));
  });
  it('perks add yield chance and Farm XP, and discount land purchases', () => {
    const ready = createFarmPlots().map(pl => (pl.id === 0 ? { ...pl, cropType: 'basic' as const, plantedAt: 0, readyAt: 1 } : pl));
    const base = harvest(farm(undefined, { farmPlots: ready }), 0, [0.3, 0.99], 10)!;
    expect(base.outcome.extra).toBe(false);
    const withPerk = harvest(farm({ ...NO_PERKS, yieldChance: 0.5, farmXpFlat: 2 }, { farmPlots: ready }), 0, [0.3, 0.99], 10)!;
    expect(withPerk.outcome.extra).toBe(true);
    expect(withPerk.outcome.farmXp).toBe(CROPS.basic.farmXp + 2);
    const land = farm({ ...NO_PERKS, landDiscount: 0.5 }, { goo: PLOT_RULES[4].cost * 0.6, farm: { level: 13, xp: 99999, autoReplant: false } });
    expect(unlockPlot(land, 4)).not.toBeNull();
    expect(unlockPlot({ ...land, perks: undefined }, 4)).toBeNull();
  });
});
