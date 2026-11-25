/**
 * The new-player guide: which button should the arrow point at right now?
 *
 * The journey is: buy an egg → hatch it → give it a home → feed it to level 5 → win battle 1. For the step the
 * player is on, this returns a list of possible targets, the most specific first (a button inside an open screen),
 * ending with the way out of any screen that is in the way. The arrow goes to the first one that is on screen.
 */
import { GameState, SlimeFoodType } from '@/types/slime';
import { ELEMENT_DISPLAY_NAMES, HABITAT_COSTS } from '@/data/traitData';

export interface GuideStep {
  /** CSS selector; elements are marked with data-guide="..." */
  sel: string;
  text: string;
}

export const GUIDE_BATTLE_LEVEL = 5;

const g = (name: string, extra = '') => `[data-guide="${name}"]${extra}`;
const step = (sel: string, text: string): GuideStep => ({ sel, text });

/** True for a save that has not started playing yet: only those players ever see the guide. */
export const isBrandNew = (s: GameState) =>
  s.slimes.length === 0 && !s.activeHatching && (s.currentLevel || 1) === 1 && (s.habitats?.length ?? 0) === 0 && (s.stats?.feeds ?? 0) === 0;

/** The guide ends for good once the first battle is won. */
export const guideFinished = (s: GameState) => (s.currentLevel || 1) > 1;

export function guideSteps(s: GameState, now: number): GuideStep[] {
  if (guideFinished(s)) return [];

  const egg = s.activeHatching;
  const hatched = s.slimes.filter(x => !egg || egg.waiting || x.id !== egg.slime.id);
  // ways out of a screen that is in the way
  const out = {
    bazaar: step(g('baz-close'), 'Close the shop'),
    viewer: step(g('viewer-back'), 'Go back'),
    isles: step(g('isles-close'), 'Go back'),
    farm: step(g('farm-close'), 'Go back'),
    map: step(g('map-close'), 'Go back'),
    hatchery: step(g('hatch-close'), 'Go back'),
  };
  const welcome = step(g('discovery-ok'), 'Say hello, then tap here');

  if (hatched.length === 0) {
    if (egg) {
      const ready = now >= egg.endTime;
      const wait = ready ? 'Tap the egg until it hatches!' : 'Your egg is warming up. Nearly there…';
      return [
        welcome,
        step(g('egg-big'), wait),
        step(g('see-jar'), 'Go and see your egg'),
        step(g('egg'), wait),
        out.bazaar, out.viewer, out.isles, out.farm, out.map,
      ];
    }
    return [
      step(g('baz-egg', '[data-element="fire"]'), 'Buy this egg'),
      step(g('baz-egg'), 'Buy an egg'),
      step(g('baz-tab-eggs'), 'Open the Eggs tab'),
      step(g('bazaar'), 'Start here: buy your first egg'),
      out.viewer, out.isles, out.farm, out.map, out.hatchery,
    ];
  }

  const best = hatched.reduce((a, b) => (b.level > a.level ? b : a));

  if (best.level >= GUIDE_BATTLE_LEVEL) {
    return [
      welcome,
      step(g('enemy-target'), 'Tap an enemy'),
      step(g('move-attack'), 'Tap Attack'),
      step(g('battle-go'), 'Start the fight!'),
      step(g('battle-auto'), 'Pick your team'),
      step(g('map-level'), 'Tap level 1'),
      step(g('nav-battle'), 'Your slime is ready to battle!'),
      out.bazaar, out.viewer, out.isles, out.farm, out.hatchery,
    ];
  }

  const home = s.habitats.find(h => h.assignedSlimeIds.includes(best.id));

  if (!home) {
    const room = s.habitats.find(h => best.elements.includes(h.element) && h.assignedSlimeIds.length < h.capacity);
    if (room) {
      return [
        welcome,
        step(g('slime-card', `[data-slime="${best.id}"]`), 'Pick your slime'),
        step(`[data-viewer="${room.id}"] ${g('add-slime')}`, 'Tap + to move your slime in'),
        step(g('isle', `[data-habitat="${room.id}"]`), 'Open this habitat'),
        step(g('nav-habitats'), 'Move your slime into its home'),
        out.bazaar, out.viewer, out.farm, out.map, out.hatchery,
      ];
    }
    const pending = s.pendingHabitatPlacement;
    if (pending && best.elements.includes(pending.element)) {
      return [
        welcome,
        step(g('place-site'), 'Tap a glowing spot to build'),
        step(g('nav-habitats'), 'Now place your habitat'),
        out.bazaar, out.viewer, out.farm, out.map, out.hatchery,
      ];
    }
    const name = ELEMENT_DISPLAY_NAMES[best.elements[0]];
    // spent the Goo elsewhere: the rewards already earned pay for the home
    const short = best.elements.every(el => s.goo < HABITAT_COSTS[el]);
    const earn = short
      ? [
          step(g('claim'), 'Claim your reward Goo'),
          step(g('achievements', '[data-claimable="true"]'), `Claim reward Goo for a ${name} home`),
          step(g('baz-close'), 'Close the shop and claim your rewards'),
        ]
      : [];
    return [
      welcome,
      ...earn,
      ...best.elements.map(el => step(g('baz-habitat', `[data-element="${el}"]`), `Buy the ${ELEMENT_DISPLAY_NAMES[el]} habitat`)),
      // the right habitat can be on another page of the shop
      step(g('baz-next', '[data-tab="habitats"]'), `Look for the ${name} habitat`),
      step(g('baz-prev', '[data-tab="habitats"]'), `Look for the ${name} habitat`),
      step(g('baz-tab-habitats'), 'Open the Habitats tab'),
      step(g('bazaar'), `Your slime needs a ${name} home`),
      out.viewer, out.isles, out.farm, out.map, out.hatchery,
    ];
  }

  const hasFood = (Object.keys(s.inventory) as SlimeFoodType[]).some(k => s.inventory[k] > 0);
  if (hasFood) {
    return [
      welcome,
      step(`[data-viewer="${home.id}"] ${g('food')}`, `Drag food onto your slime (feed it to level ${GUIDE_BATTLE_LEVEL})`),
      step(`[data-viewer="${home.id}"] ${g('food-bag')}`, 'Open the food bag'),
      step(g('isle', `[data-habitat="${home.id}"]`), 'Visit your slime'),
      step(g('nav-habitats'), `Feed your slime to level ${GUIDE_BATTLE_LEVEL}`),
      out.bazaar, out.viewer, out.farm, out.map, out.hatchery,
    ];
  }
  return [
    step(g('farm-crop'), 'Choose a seed'),
    step(g('farm-harvest'), 'Harvest your food'),
    step(g('farm-plant'), 'Plant some food'),
    step(g('nav-farm'), 'Out of food: grow more on the Farm'),
    out.bazaar, out.viewer, out.isles, out.map, out.hatchery,
  ];
}
