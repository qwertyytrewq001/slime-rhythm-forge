import { describe, it, expect } from 'vitest';
import { bondLevel, bondName, bondProgress } from './bond';

describe('bond', () => {
  it('levels up at the thresholds', () => {
    expect(bondLevel(undefined)).toBe(0);
    expect(bondLevel(39)).toBe(0);
    expect(bondLevel(40)).toBe(1);
    expect(bondLevel(120)).toBe(2);
    expect(bondLevel(9999)).toBe(3);
    expect(bondName(300)).toBe('Best Friend');
  });
  it('progress runs 0..1', () => {
    expect(bondProgress(0)).toBe(0);
    expect(bondProgress(20)).toBeCloseTo(0.5);
    expect(bondProgress(500)).toBe(1);
  });
});

import { slimeNature } from './bond';
describe('nature', () => {
  it('is stable per slime and uses all four natures across many ids', () => {
    expect(slimeNature('abc')).toBe(slimeNature('abc'));
    const seen = new Set(Array.from({ length: 60 }, (_, i) => slimeNature(`slime-${i}`)));
    expect(seen.size).toBe(4);
  });
});
