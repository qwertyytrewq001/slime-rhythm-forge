import { Slime, SlimeTraits } from '@/types/slime';
import { TRAIT_RARITY_WEIGHTS, getSizeRarity, deriveElement, ELEMENT_COMBO_BONUS } from '@/data/traitData';
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

  const element = deriveElement(traits.color1, traits.shape);
  const rarityScore = calculateRarity(traits, element);
  const rarityStars = getStars(rarityScore);

  return {
    id: randomId(),
    name: generateSlimeName(traits, rarityStars),
    traits,
    element,
    rarityScore,
    rarityStars,
    createdAt: Date.now(),
  };
}

export function createStarterSlimes(): Slime[] {
  const green: SlimeTraits = { shape: 0, color1: 0, color2: 5, eyes: 0, mouth: 0, spikes: 0, pattern: 0, glow: 0, size: 1.0, aura: 0, rhythm: 1, accessory: 0, model: 0 };
  const blue: SlimeTraits = { shape: 1, color1: 1, color2: 9, eyes: 1, mouth: 0, spikes: 0, pattern: 0, glow: 0, size: 1.0, aura: 0, rhythm: 0, accessory: 0, model: 1 };
  const pink: SlimeTraits = { shape: 8, color1: 2, color2: 8, eyes: 3, mouth: 4, spikes: 0, pattern: 0, glow: 0, size: 0.8, aura: 0, rhythm: 2, accessory: 0, model: 2 };

  return [green, blue, pink].map(traits => {
    const element = deriveElement(traits.color1, traits.shape);
    const rarityScore = calculateRarity(traits, element);
    return {
      id: randomId(),
      name: generateSlimeName(traits, getStars(rarityScore)),
      traits,
      element,
      rarityScore,
      rarityStars: getStars(rarityScore),
      createdAt: Date.now(),
    };
  });
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

  const element = deriveElement(traits.color1, traits.shape);
  const rarityScore = calculateRarity(traits, element);

  // Element combo bonus from parents
  const parentComboKey = `${parent1.element}+${parent2.element}`;
  const comboBonus = ELEMENT_COMBO_BONUS[parentComboKey] || 0;
  const finalScore = rarityScore + comboBonus;

  return {
    id: randomId(),
    name: generateSlimeName(traits, getStars(finalScore)),
    traits,
    element,
    rarityScore: finalScore,
    rarityStars: getStars(finalScore),
    createdAt: Date.now(),
    parentIds: [parent1.id, parent2.id],
    isNew: true,
  };
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
  if (score >= 50) return 5;
  if (score >= 35) return 4;
  if (score >= 20) return 3;
  if (score >= 10) return 2;
  return 1;
}
