import { Slime, SlimeTraits, SlimeElement, RarityTier } from '@/types/slime';
import { TRAIT_RARITY_WEIGHTS, getSizeRarity, deriveElement, deriveSecondaryElement, BREEDING_COMBOS, ELEMENT_COMBO_BONUS, getRarityTier, RARITY_TIER_STARS, ALL_ELEMENTS } from '@/data/traitData';
import { generateSlimeName } from './nameGenerator';
import { calculateBreedingResult, isValidBreedingResult } from './breedingCalculator';
import { ALL_CODEX_SLIMES, SLIME_CODEX_MAP } from '@/data/slimeCodex';

function randomId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

/**
 * Create a slime from the Codex system
 * This replaces the old procedural generation with hardcoded slimes
 */
export function createCodexSlime(codexId: string, parentIds?: [string, string]): Slime {
  const codexSlime = SLIME_CODEX_MAP.get(codexId);
  
  if (!codexSlime) {
    throw new Error(`Codex slime with ID "${codexId}" not found`);
  }
  
  return {
    id: codexSlime.id,
    name: codexSlime.name,
    traits: {
      // Convert spriteId back to trait system for compatibility
      // This maintains backward compatibility with existing rendering
      shape: 0, // Base shape for all codex slimes
      color1: 0, // Will be overridden by sprite rendering
      color2: 5, // Will be overridden by sprite rendering
      eyes: 0, // Will be overridden by sprite rendering
      mouth: 0, // Will be overridden by sprite rendering
      spikes: 0, // Will be overridden by sprite rendering
      pattern: 0, // Will be overridden by sprite rendering
      glow: 0, // Will be overridden by sprite rendering
      size: 1.0,
      aura: 0, // Will be overridden by sprite rendering
      rhythm: 1,
      accessory: 0, // Will be overridden by sprite rendering
      model: 0, // Base blob model
    },
    elements: codexSlime.elements,
    element: codexSlime.elements[0], // Primary element
    rarityScore: getRarityScoreForTier(codexSlime.rarityTier),
    rarityStars: getRarityStarsForTier(codexSlime.rarityTier),
    rarityTier: codexSlime.rarityTier,
    createdAt: Date.now(),
    parentIds,
    isNew: !!parentIds,
    level: 1,
    xp: 0,
  };
}

/**
 * Get rarity score for tier (backward compatibility)
 */
function getRarityScoreForTier(tier: RarityTier): number {
  const tierScores: Record<RarityTier, number> = {
    'Common': 10,
    'Uncommon': 25,
    'Rare': 50,
    'Epic': 75,
    'Legendary': 100,
    'Ancient': 150,
    'Divine': 200
  };
  return tierScores[tier] || 10;
}

/**
 * Get rarity stars for tier (backward compatibility)
 */
function getRarityStarsForTier(tier: RarityTier): number {
  const tierStars: Record<RarityTier, number> = {
    'Common': 1,
    'Uncommon': 2,
    'Rare': 3,
    'Epic': 4,
    'Legendary': 5,
    'Ancient': 6,
    'Divine': 7
  };
  return tierStars[tier] || 1;
}

export function createRandomSlime(basicOnly = false): Slime {
  // Select a random slime from the Codex instead of generating procedural ID
  const availableSlimes = basicOnly 
    ? ALL_CODEX_SLIMES.filter(slime => slime.rarityTier === 'Common')
    : ALL_CODEX_SLIMES;
  
  const randomSlime = availableSlimes[Math.floor(Math.random() * availableSlimes.length)];
  return createCodexSlime(randomSlime.id, undefined);
}

// Start with 1 Goo Slime (Common, nature element, basic stats)
export function createStarterSlimes(): Slime[] {
  return [createCodexSlime('wild_primal', undefined)]; // Use nature primal as starter
}

// Create a slime with a specific element (for starter eggs in shop)
export function createElementSlime(element: SlimeElement): Slime {
  // Find the first slime in Codex that has this element as primary
  const matchingSlime = ALL_CODEX_SLIMES.find(slime => slime.elements[0] === element);
  
  if (matchingSlime) {
    return createCodexSlime(matchingSlime.id, undefined);
  }
  
  // Fallback to fire primal if no match found
  return createCodexSlime('fire_primal', undefined);
}

export function breedSlimes(parent1: Slime, parent2: Slime, mutationBoost = false): Slime {
  // Use the new enhanced breeding calculator instead of procedural generation
  const breedingResult = calculateBreedingResult(
    parent1.id, 
    parent2.id, 
    parent1.level || 1, 
    parent2.level || 1
  );
  
  if (!breedingResult) {
    // Fallback to random common slime if breeding fails
    return createRandomSlime(true);
  }
  
  return createCodexSlime(breedingResult.slimeId, [parent1.id, parent2.id]);
}

function biasTraitsForElement(traits: SlimeTraits, element: SlimeElement) {
  const colorMap: Partial<Record<SlimeElement, number[]>> = {
    fire: [3, 6, 11], water: [12, 17], plant: [0, 7], earth: [3],
    ice: [1, 5, 13], cosmic: [4, 9, 19], arcane: [8, 16],
    light: [15], shadow: [4], electric: [10],
  };
  const colors = colorMap[element];
  if (colors && Math.random() < 0.5) {
    traits.color1 = colors[randInt(0, colors.length - 1)];
  }

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
