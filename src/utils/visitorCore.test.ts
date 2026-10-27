import { describe, expect, it } from 'vitest';
import { Habitat } from '@/types/slime';
import { dayPhase, normalizeHabitat, rollerFrom, slotsOpen } from './sanctuaryCore';
import { FIRST_VISIT_DELAY_MS, NEXT_VISIT_MAX_MS, NEXT_VISIT_MIN_MS, VISIT_MS, canDeliver, deliver, spawnVisitor, visitorTick } from './visitorCore';

const hab = (over: Partial<Habitat> = {}): Habitat => normalizeHabitat({ id: 'h1', element: 'plant', gridX: 0, gridY: 0, assignedSlimeIds: ['a'], capacity: 2, ...over }, 0);

describe('day and night', () => {
  it('follows the clock', () => {
    expect(dayPhase(new Date(2026, 0, 1, 3, 0)).night).toBe(true);
    expect(dayPhase(new Date(2026, 0, 1, 6, 0)).phase).toBe('dawn');
    expect(dayPhase(new Date(2026, 0, 1, 12, 0)).tint).toBeNull();
    expect(dayPhase(new Date(2026, 0, 1, 19, 0)).phase).toBe('dusk');
    expect(dayPhase(new Date(2026, 0, 1, 22, 0)).night).toBe(true);
  });
});

describe('island slots', () => {
  it('start at four and open with the best sanctuary level, never hiding a built one', () => {
    expect(slotsOpen([])).toBe(4);
    expect(slotsOpen([hab({ level: 3 })])).toBe(6);
    expect(slotsOpen([hab({ level: 5 })])).toBe(8);
    const six = Array.from({ length: 6 }, (_, i) => hab({ id: 'x' + i }));
    expect(slotsOpen(six)).toBe(6);
    const eight = Array.from({ length: 8 }, (_, i) => hab({ id: 'y' + i }));
    expect(slotsOpen(eight)).toBe(9); // page one full: the next site opens on page two
    expect(slotsOpen(Array.from({ length: 16 }, (_, i) => hab({ id: 'z' + i })))).toBe(16);
  });
});

describe('the visitor', () => {
  it('only asks for crops the farm can grow yet', () => {
    expect(spawnVisitor(0, [0.99, 0.5], 1).crop).toBe('basic');
    expect(spawnVisitor(0, [0.99, 0.5], 3).crop).toBe('elemental');
    expect(spawnVisitor(0, [0.99, 0.5], 5).crop).toBe('royal');
  });
  it('rarer food asks for fewer but pays more', () => {
    const b = spawnVisitor(0, [0, 0.99], 5);
    const r = spawnVisitor(0, [0.99, 0.99], 5);
    expect(b.qty).toBeGreaterThan(r.qty);
    expect(r.rewardGoo).toBeGreaterThan(b.rewardGoo);
  });
  it('waits for a sanctuary, then comes soon, stays a while and leaves for hours', () => {
    expect(visitorTick(null, undefined, 1000, false, [0.5, 0.5, 0.5], 1)).toEqual({ visitor: null, nextVisitAt: undefined });
    const first = visitorTick(null, undefined, 1000, true, [0.5, 0.5, 0.5], 1);
    expect(first.nextVisitAt).toBe(1000 + FIRST_VISIT_DELAY_MS);
    expect(visitorTick(null, first.nextVisitAt, 1000 + FIRST_VISIT_DELAY_MS - 1, true, [0.5, 0.5, 0.5], 1).visitor).toBeNull();
    const arrive = visitorTick(null, first.nextVisitAt, 1000 + FIRST_VISIT_DELAY_MS, true, [0.1, 0.5, 0.5], 1);
    expect(arrive.visitor).not.toBeNull();
    const t = arrive.visitor!.arrivedAt;
    expect(visitorTick(arrive.visitor, arrive.nextVisitAt, t + VISIT_MS - 1, true, [0.5, 0.5, 0.5], 1).visitor).not.toBeNull();
    const left = visitorTick(arrive.visitor, arrive.nextVisitAt, t + VISIT_MS, true, [0.5, 0.5, 0.0], 1);
    expect(left.visitor).toBeNull();
    expect(left.nextVisitAt! - (t + VISIT_MS)).toBeGreaterThanOrEqual(NEXT_VISIT_MIN_MS);
    expect(left.nextVisitAt! - (t + VISIT_MS)).toBeLessThanOrEqual(NEXT_VISIT_MAX_MS);
  });
  it('delivering pays, takes the food, cheers up sanctuaries with someone home, and he leaves soon', () => {
    const v = spawnVisitor(1000, [0, 0], 1);
    const s = { goo: 10, inventory: { basic: v.qty + 2, elemental: 0, royal: 0 }, habitats: [hab(), hab({ id: 'empty', assignedSlimeIds: [] })], visitor: v };
    expect(canDeliver(s)).toBe(true);
    const out = deliver(s, 5000, rollerFrom([]))!;
    expect(out.goo).toBe(10 + v.rewardGoo);
    expect(out.inventory.basic).toBe(2);
    expect(out.habitats[0].joy).toBeGreaterThan(0);
    expect(out.habitats[1].joy).toBe(0);
    expect(out.visitor!.done).toBe(true);
    expect(out.visitor!.leavesAt).toBeLessThan(v.leavesAt);
    expect(deliver({ ...s, ...out }, 6000, rollerFrom([]))).toBeNull();
    expect(canDeliver({ inventory: { basic: v.qty - 1, elemental: 0, royal: 0 }, visitor: v })).toBe(false);
  });
});
