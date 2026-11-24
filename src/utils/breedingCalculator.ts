import { SlimeElement, RarityTier } from '@/types/slime';
import { ALL_CODEX_SLIMES, SLIME_CODEX_MAP, CodexSlime } from '@/data/slimeCodex';

// Debug logging flag - set to false for production
const DEBUG_LOGGING = true;

// Helper function for debug logging
function debugLog(message: string) {
  if (DEBUG_LOGGING) {
    console.log(message);
  }
}

export interface BreedingResult {
  slimeId: string;
  parentUnion: string[];
  validOutcomes: string[];
  finalWeights: Record<string, number>;
  breedingPower: number;
}

// Base rarity weights (higher = more common)
const BASE_RARITY_WEIGHTS: Record<RarityTier, number> = {
  'Common': 100,
  'Uncommon': 50,
  'Rare': 20,
  'Epic': 5,
  'Legendary': 1,
  'Divine': 0.5,
  'Ancient': 0.2
};

// Rarity values for BreedingPower calculation
const RARITY_VALUES: Record<RarityTier, number> = {
  'Common': 1,
  'Uncommon': 2,
  'Rare': 3,
  'Epic': 4,
  'Legendary': 5,
  'Divine': 6,
  'Ancient': 7
};

// Max possible BreedingPower: two level-50 parents (50) + two Ancient parents (7+7).
const MAX_BREEDING_POWER = 64;

// How much a fully-maxed pair of parents changes each tier's weight
// (multiplier = 1 + power01 * bonus). Negative = less likely with strong parents.
const POWER_TIER_BONUS: Record<RarityTier, number> = {
  'Common': -0.6,
  'Uncommon': -0.1,
  'Rare': 4,
  'Epic': 9,
  'Legendary': 25,
  'Divine': 30,
  'Ancient': 30
};

// Helper function to validate slime elements
function validateSlimeElements(elements: SlimeElement[]): string | null {
  if (!Array.isArray(elements)) {
    return 'Elements must be an array';
  }
  if (elements.length === 0) {
    return 'Elements array cannot be empty';
  }
  if (elements.length > 4) {
    return 'Slimes cannot have more than 4 elements';
  }
  
  const validElements: SlimeElement[] = [
    'fire', 'water', 'plant', 'earth', 'wind',
    'ice', 'electric', 'metal', 'light', 'shadow'
  ];
  
  for (const element of elements) {
    if (!validElements.includes(element)) {
      return `Invalid element: ${element}`;
    }
  }
  
  return null;
}

// Breeding rule: a baby is a BLEND of the two parents. It must have at least two elements (single-element
// "core" slimes only come from the shop, never from breeding) and carry an element from EACH parent.
// First choice: built only from the parents' combined elements (Fire x Water -> any Fire+Water slime).
// If that pool is empty (e.g. two Fire parents, or a pair with no hybrid species), widen to any blend that
// still touches both parents, and only as a last resort to anything built from the combined elements.
function filterSlimesByExactElements(parentUnion: SlimeElement[], parent1: SlimeElement[], parent2: SlimeElement[]): CodexSlime[] {
  const pool = new Set(parentUnion);
  const touches = (sl: CodexSlime, p: SlimeElement[]) => sl.elements.some(e => p.includes(e));
  const blends = ALL_CODEX_SLIMES.filter(sl => sl.elements.length >= 2 && touches(sl, parent1) && touches(sl, parent2));
  const tight = blends.filter(sl => sl.elements.every(e => pool.has(e)));
  if (tight.length) return tight;
  if (blends.length) return blends;
  return ALL_CODEX_SLIMES.filter(sl => sl.elements.length > 0 && sl.elements.every(e => pool.has(e)));
}

/**
 * Strict Elemental Pool Breeding System
 * Phase One: Elemental Pool (Union of parent elements)
 * Phase Two: BreedingPower calculation 
 * Phase Three: Weighted random selection
 */
export function calculateBreedingResult(
  parent1Elements: SlimeElement[], 
  parent2Elements: SlimeElement[], 
  parent1Level: number = 1, 
  parent2Level: number = 1,
  parent1Rarity: RarityTier = 'Common',
  parent2Rarity: RarityTier = 'Common',
  /** Shop items: luck nudges the odds toward rarer slimes, skipCommon avoids Common results when anything rarer is possible. */
  opts: { luck?: number; skipCommon?: boolean } = {}
): BreedingResult | null {
  // Input validation
  const parent1Validation = validateSlimeElements(parent1Elements);
  const parent2Validation = validateSlimeElements(parent2Elements);
  
  if (parent1Validation) {
    console.error(`❌ Invalid parent1 elements: ${parent1Validation}`);
    return null;
  }
  
  if (parent2Validation) {
    console.error(`❌ Invalid parent2 elements: ${parent2Validation}`);
    return null;
  }
  
  // ===== PHASE ONE: ELEMENTAL POOL =====
  // Parent Union (PU): Combine all unique elements from both parents
  const parentUnion = [...new Set([...parent1Elements, ...parent2Elements])];
  debugLog(`🧬 Parent Union: [${parentUnion.join(', ')}]`);
  
  // Database Filtration: Only slimes with EXACTLY the parent elements
  const validOutcomes = filterSlimesByExactElements(parentUnion, parent1Elements, parent2Elements);
  
  debugLog(`🧬 Valid Outcomes Found: ${validOutcomes.length} slimes`);
  
  if (validOutcomes.length === 0) {
    debugLog('🧬 No valid breeding outcomes found');
    return null;
  }
  
  // ===== PHASE TWO: BREEDINGPOWER CALCULATION =====
  const breedingPower = ((parent1Level + parent2Level) * 0.5) + 
                        (RARITY_VALUES[parent1Rarity] + RARITY_VALUES[parent2Rarity]);
  debugLog(`🧬 BreedingPower: ${breedingPower} (Levels: ${parent1Level + parent2Level}, Rarities: ${parent1Rarity} + ${parent2Rarity})`);
  
  // ===== PHASE THREE: DYNAMIC WEIGHTED SELECTION =====
  const finalWeights: Record<string, number> = {};
  
  validOutcomes.forEach(slime => {
    const baseWeight = BASE_RARITY_WEIGHTS[slime.rarityTier];
    let finalWeight = baseWeight;
    
    // Strong parents (high level + high rarity) push odds toward rarer tiers
    // and away from Common. power01: 0 = level-1 Common parents, 1 = maxed.
    const power01 = Math.min(1, breedingPower / MAX_BREEDING_POWER + (opts.luck ?? 0));
    finalWeight = baseWeight * (1 + power01 * POWER_TIER_BONUS[slime.rarityTier]);
    if (opts.skipCommon && slime.rarityTier === 'Common' && validOutcomes.some(o => o.rarityTier !== 'Common')) finalWeight *= 0.02;

    finalWeights[slime.id] = Math.max(0.01, finalWeight);
  });
  
  // Calculate odds for debug logging
  const totalWeight = Object.values(finalWeights).reduce((sum, weight) => sum + weight, 0);
  const oddsByRarity: Record<string, number> = {};
  
  validOutcomes.forEach(slime => {
    if (!oddsByRarity[slime.rarityTier]) {
      oddsByRarity[slime.rarityTier] = 0;
    }
    oddsByRarity[slime.rarityTier] += (finalWeights[slime.id] / totalWeight) * 100;
  });
  
  debugLog(`🧬 Current Odds for Epic: ${oddsByRarity['Epic']?.toFixed(2) || 0}%`);
  debugLog(`🧬 Current Odds for Rare: ${oddsByRarity['Rare']?.toFixed(2) || 0}%`);
  debugLog(`🧬 Current Odds for Legendary: ${oddsByRarity['Legendary']?.toFixed(2) || 0}%`);
  
  // Weighted random selection
  const selectedSlimeId = selectWeightedRandom(validOutcomes, finalWeights);
  
  if (!selectedSlimeId) {
    console.error('❌ Failed to select slime from breeding pool');
    return null;
  }
  
  const selectedSlime = SLIME_CODEX_MAP.get(selectedSlimeId);
  if (!selectedSlime) {
    console.error('❌ Selected slime not found in codex map');
    return null;
  }
  debugLog(`🧬 Selected Slime: ${selectedSlime.name} (${selectedSlime.rarityTier})`);
  
  return {
    slimeId: selectedSlimeId,
    parentUnion,
    validOutcomes: validOutcomes.map(s => s.id),
    finalWeights,
    breedingPower
  };
}

/**
 * Get all possible breeding outcomes for display (without selection)
 */
export function getPossibleOutcomes(
  parent1Elements: SlimeElement[], 
  parent2Elements: SlimeElement[]
): CodexSlime[] {
  // Input validation
  const parent1Validation = validateSlimeElements(parent1Elements);
  const parent2Validation = validateSlimeElements(parent2Elements);
  
  if (parent1Validation) {
    console.error(`❌ Invalid parent1 elements in getPossibleOutcomes: ${parent1Validation}`);
    return [];
  }
  
  if (parent2Validation) {
    console.error(`❌ Invalid parent2 elements in getPossibleOutcomes: ${parent2Validation}`);
    return [];
  }
  
  // Parent Union (PU): Combine all unique elements from both parents
  const parentUnion = [...new Set([...parent1Elements, ...parent2Elements])];
  debugLog(`🧬 GetPossibleOutcomes - Parent Union: [${parentUnion.join(', ')}]`);
  
  // Database Filtration: Only slimes with EXACTLY the parent elements
  const validOutcomes = filterSlimesByExactElements(parentUnion, parent1Elements, parent2Elements);
  
  debugLog(`🧬 GetPossibleOutcomes - Valid Outcomes Found: ${validOutcomes.length} slimes`);
  
  return validOutcomes;
}

/**
 * Weighted random selection from pool
 */
function selectWeightedRandom(pool: CodexSlime[], weights: Record<string, number>): string | null {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const slime of pool) {
    currentWeight += weights[slime.id];
    
    if (random < currentWeight) {
      debugLog(`🧬 Selected ${slime.name} with weight ${weights[slime.id]}`);
      return slime.id;
    }
  }
  
  console.error('❌ Weighted selection failed - this should not happen');
  return null;
}
