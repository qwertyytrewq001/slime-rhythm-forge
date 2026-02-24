import { Slime, SlimeTraits, SlimeElement, RarityTier } from '@/types/slime';
import { TRAIT_RARITY_WEIGHTS, getSizeRarity, deriveElement, deriveSecondaryElement, BREEDING_COMBOS, ELEMENT_COMBO_BONUS, getRarityTier, RARITY_TIER_STARS, ALL_ELEMENTS } from '@/data/traitData';
import { generateSlimeName } from './nameGenerator';

function randomId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function deriveElements(traits: SlimeTraits): SlimeElement[] {
  const primary = deriveElement(traits.color1, traits.shape);
  const elements: SlimeElement[] = [primary];

  const secondary = deriveSecondaryElement(traits.spikes, traits.pattern, traits.aura, traits.glow);
  if (secondary && secondary !== primary) {
    elements.push(secondary);
  }

  // Rare third element from extreme trait combos
  if (traits.glow >= 4 && traits.aura >= 3) {
    const third: SlimeElement = traits.model === 0 ? 'divine' : traits.model === 1 ? 'void' : 'arcane';
    if (!elements.includes(third)) elements.push(third);
  }

  return elements.slice(0, 4);
}

function buildSlime(traits: SlimeTraits, parentIds?: [string, string], bonusScore = 0): Slime {
  const elements = deriveElements(traits);
  const primary = elements[0];
  const baseScore = calculateRarity(traits, primary);
  // Multi-element bonus
  const multiBonus = (elements.length - 1) * 8;
  const finalScore = baseScore + bonusScore + multiBonus;
  const tier = getRarityTier(finalScore);
  const stars = Math.min(7, RARITY_TIER_STARS[tier]);

  return {
    id: randomId(),
    name: generateSlimeName(traits, stars, elements),
    traits,
    elements,
    element: primary,
    rarityScore: finalScore,
    rarityStars: stars,
    rarityTier: tier,
    createdAt: Date.now(),
    parentIds,
    isNew: !!parentIds,
  };
}

export function createRandomSlime(basicOnly = false): Slime {
  const maxShape = basicOnly ? 2 : 14;
  const maxEyes = basicOnly ? 3 : 14;
  const maxSpikes = basicOnly ? 2 : 9;
  const maxPattern = basicOnly ? 2 : 14;
  const maxGlow = basicOnly ? 1 : 5;
  const maxAura = basicOnly ? 0 : 4;
  const maxAccessory = basicOnly ? 1 : 10;

  const traits: SlimeTraits = {
    shape: randInt(0, maxShape),
    color1: randInt(0, 19),
    color2: randInt(0, 19),
    eyes: randInt(0, maxEyes),
    mouth: randInt(0, 9),
    spikes: randInt(0, maxSpikes),
    pattern: randInt(0, maxPattern),
    glow: randInt(0, maxGlow),
    size: basicOnly ? 1.0 : randFloat(0.5, 2.0),
    aura: randInt(0, maxAura),
    rhythm: randInt(0, 5),
    accessory: randInt(0, maxAccessory),
    model: basicOnly ? 0 : randInt(0, 2),
  };

  return buildSlime(traits);
}

export function createStarterSlimes(): Slime[] {
  const green: SlimeTraits = { shape: 0, color1: 0, color2: 5, eyes: 0, mouth: 0, spikes: 0, pattern: 0, glow: 0, size: 1.0, aura: 0, rhythm: 1, accessory: 0, model: 0 };
  const blue: SlimeTraits = { shape: 1, color1: 1, color2: 9, eyes: 1, mouth: 0, spikes: 0, pattern: 0, glow: 0, size: 1.0, aura: 0, rhythm: 0, accessory: 0, model: 1 };
  const pink: SlimeTraits = { shape: 8, color1: 2, color2: 8, eyes: 3, mouth: 4, spikes: 0, pattern: 0, glow: 0, size: 0.8, aura: 0, rhythm: 2, accessory: 0, model: 2 };

  return [green, blue, pink].map(traits => buildSlime(traits));
}

export function breedSlimes(parent1: Slime, parent2: Slime, mutationBoost = false): Slime {
  const traitKeys: (keyof SlimeTraits)[] = [
    'shape', 'color1', 'color2', 'eyes', 'mouth', 'spikes',
    'pattern', 'glow', 'size', 'aura', 'rhythm', 'accessory',
  ];

  const mutationRate = mutationBoost ? 0.5 : 0.2;
  const traits = {} as SlimeTraits;

  for (const key of traitKeys) {
    const roll = Math.random();
    if (roll < 0.3) {
      traits[key] = parent1.traits[key];
    } else if (roll < 0.6) {
      traits[key] = parent2.traits[key];
    } else if (roll < 0.6 + mutationRate) {
      const base = Math.random() < 0.5 ? parent1.traits[key] : parent2.traits[key];
      if (key === 'size') {
        traits[key] = Math.round((base + (Math.random() - 0.5) * 0.6) * 10) / 10;
        traits[key] = Math.max(0.5, Math.min(2.0, traits[key]));
      } else {
        const max = getTraitMax(key);
        traits[key] = Math.max(0, Math.min(max, base + randInt(-2, 2)));
      }
    } else {
      if (key === 'size') {
        traits[key] = randFloat(0.5, 2.0);
      } else {
        traits[key] = randInt(0, getTraitMax(key));
      }
    }
  }

  // Model inheritance: 70% from parent, 30% mutate
  if (Math.random() < 0.7) {
    traits.model = Math.random() < 0.5 ? parent1.traits.model : parent2.traits.model;
  } else {
    traits.model = randInt(0, 2);
  }

  // 5% ultra-rare: boost a random trait to max
  if (Math.random() < 0.05) {
    const rareKey = traitKeys[randInt(0, traitKeys.length - 1)];
    if (rareKey === 'size') {
      traits[rareKey] = Math.random() < 0.5 ? 0.5 : 2.0;
    } else {
      traits[rareKey] = getTraitMax(rareKey);
    }
  }

  // Element combo bonus from parents (defensive: fallback to [element] if elements missing)
  const p1Elems = parent1.elements || (parent1.element ? [parent1.element] : ['nature' as SlimeElement]);
  const p2Elems = parent2.elements || (parent2.element ? [parent2.element] : ['nature' as SlimeElement]);
  const allParentElements = [...new Set([...p1Elems, ...p2Elems])];
  let comboBonus = 0;

  // Check breeding combos for hybrid element injection
  for (const e1 of p1Elems) {
    for (const e2 of p2Elems) {
      const key1 = `${e1}+${e2}`;
      const key2 = `${e2}+${e1}`;
      comboBonus += ELEMENT_COMBO_BONUS[key1] || ELEMENT_COMBO_BONUS[key2] || 0;

      // Chance to inject combo element into child traits
      const comboResult = BREEDING_COMBOS[key1] || BREEDING_COMBOS[key2];
      if (comboResult && Math.random() < 0.4) {
        // Bias traits to produce the combo element
        const targetElem = comboResult[randInt(0, comboResult.length - 1)];
        biasTraitsForElement(traits, targetElem);
      }
    }
  }

  // Multi-element parents increase child complexity
  if (allParentElements.length >= 3 && Math.random() < 0.3) {
    // Boost glow/aura to trigger secondary element derivation
    traits.glow = Math.min(5, traits.glow + randInt(1, 2));
    traits.aura = Math.min(4, traits.aura + 1);
  }

  return buildSlime(traits, [parent1.id, parent2.id], comboBonus);
}

function biasTraitsForElement(traits: SlimeTraits, element: SlimeElement) {
  // Nudge color/shape toward producing the target element
  const colorMap: Partial<Record<SlimeElement, number[]>> = {
    fire: [3, 6, 11], water: [12, 17], plant: [0, 7], earth: [3],
    ice: [1, 5, 13], cosmic: [4, 9, 19], arcane: [8, 16],
    light: [15], shadow: [4], electric: [10],
  };
  const colors = colorMap[element];
  if (colors && Math.random() < 0.5) {
    traits.color1 = colors[randInt(0, colors.length - 1)];
  }

  // Boost secondary element traits
  const auraMap: Partial<Record<SlimeElement, number>> = {
    void: 4, ice: 3, fire: 2,
  };
  if (auraMap[element] !== undefined) {
    traits.aura = Math.max(traits.aura, auraMap[element]!);
  }
}

function getTraitMax(key: keyof SlimeTraits): number {
  const maxes: Record<keyof SlimeTraits, number> = {
    shape: 14, color1: 19, color2: 19, eyes: 14, mouth: 9,
    spikes: 9, pattern: 14, glow: 5, size: 2, aura: 4,
    rhythm: 5, accessory: 10, model: 2,
  };
  return maxes[key];
}

export function calculateRarity(traits: SlimeTraits, element?: string): number {
  let score = 0;
  for (const [key, value] of Object.entries(traits)) {
    if (key === 'size') {
      score += getSizeRarity(value);
    } else if (key === 'model') {
      score += (TRAIT_RARITY_WEIGHTS[key]?.[value] || 0);
    } else if (TRAIT_RARITY_WEIGHTS[key]) {
      score += TRAIT_RARITY_WEIGHTS[key][value] || 0;
    }
  }
  return score;
}

export function getStars(score: number): number {
  return Math.min(7, RARITY_TIER_STARS[getRarityTier(score)]);
}
