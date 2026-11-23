import { describe, it, expect } from 'vitest';
import { breedMs, hatchMs, FIRST_WAIT_MS } from './gooEconomy';
import { CROPS, RUSH_FACTOR } from './farmCore';

describe('waiting times and rushing', () => {
  it('the first breeding and the first egg are short, later ones grow with rarity', () => {
    expect(breedMs('Legendary', true)).toBe(FIRST_WAIT_MS);
    expect(hatchMs('Common', true)).toBe(FIRST_WAIT_MS);
    const tiers = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    for (let i = 1; i < tiers.length; i++) {
      expect(breedMs(tiers[i])).toBeGreaterThan(breedMs(tiers[i - 1]));
      expect(hatchMs(tiers[i])).toBeGreaterThan(hatchMs(tiers[i - 1]));
    }
    expect(hatchMs('Common')).toBeGreaterThanOrEqual(2 * 60_000);
  });

  it('rushing a crop costs real goo, and the long crops cost the most', () => {
    expect(RUSH_FACTOR).toBeGreaterThanOrEqual(8);
    const fresh = (c: keyof typeof CROPS) => CROPS[c].seedCost * RUSH_FACTOR;
    expect(fresh('royal')).toBeGreaterThan(fresh('elemental'));
    expect(fresh('elemental')).toBeGreaterThan(fresh('basic'));
    expect(fresh('royal')).toBeGreaterThan(2000);
  });
});
