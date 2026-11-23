import { describe, it, expect } from 'vitest';
import { createElementSlime } from './slimeGenerator';
import { ALL_ELEMENTS } from '@/data/traitData';

describe('starter eggs are fixed', () => {
  it('every bought egg hatches the core slime with exactly that one element', () => {
    for (const element of ALL_ELEMENTS) {
      const slime = createElementSlime(element);
      expect(slime.elements).toEqual([element]);
      expect(slime.rarityTier).toBe('Common');
    }
  });

  it('an Electric egg gives Spark Slime, not a dual-element species', () => {
    expect(createElementSlime('electric').codexId).toBe('spark_slime');
  });
});
