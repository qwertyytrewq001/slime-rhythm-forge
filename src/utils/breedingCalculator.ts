import { SlimeElement } from '@/types/slime';
import { ALL_CODEX_SLIMES, SLIME_CODEX_MAP } from '@/data/slimeCodex';

export interface BreedingPool {
  slimes: string[];
  totalWeight: number;
}

export interface BreedingResult {
  slimeId: string;
  luckBonus: number;
  geneStrength: number;
  finalWeights: Record<string, number>;
}

/**
 * The Enhanced 4-Step Breeding Pipeline with Level Bonuses and Rarity Heritage
 * Gene Extraction → Pool Filtering → Level Bonus → Rarity Heritage → Dynamic Weighting → Result Selection
 */
export function calculateBreedingResult(parent1Id: string, parent2Id: string, parent1Level: number = 1, parent2Level: number = 1): BreedingResult | null {
  console.log(`🧬 Enhanced Breeding Calculator: Parent 1 = ${parent1Id} (Lv${parent1Level}), Parent 2 = ${parent2Id} (Lv${parent2Level})`);
  
  // Step 1: Gene Extraction - Get combined element list from parents
  const parent1 = SLIME_CODEX_MAP.get(parent1Id);
  const parent2 = SLIME_CODEX_MAP.get(parent2Id);
  
  if (!parent1 || !parent2) {
    console.error('❌ Invalid parent IDs provided to breeding calculator');
    return null;
  }
  
  // Collect all unique elements from both parents
  const combinedElements = [...new Set([...parent1.elements, ...parent2.elements])];
  console.log(`🧬 Combined Elements: [${combinedElements.join(', ')}]`);
  
  // Step 2: Pool Filtering - Scan codex for matching element subsets
  const filteredPool = ALL_CODEX_SLIMES.filter(slime => {
    // Law 1: The Element Gate - A slime can only be a result if parents provide all of its required elements
    return slime.elements.every(element => combinedElements.includes(element));
  });
  
  console.log(`🧬 Filtered Pool Size: ${filteredPool.length} slimes`);
  
  if (filteredPool.length === 0) {
    console.log('🧬 No matching slimes found in codex');
    return null;
  }
  
  // Step 3: Level Bonus Calculation
  const totalParentLevel = parent1Level + parent2Level;
  const luckBonus = Math.floor(totalParentLevel * 0.5); // Level Luck = (Parent1Level + Parent2Level) * 0.5%
  console.log(`🧬 Level Luck Bonus: +${luckBonus}% (from parents Lv${parent1Level} + Lv${parent2Level})`);
  
  // Step 4: Rarity Heritage - Gene Strength from parent tiers
  const parent1Tier = parent1.rarityTier;
  const parent2Tier = parent2.rarityTier;
  const geneStrength = calculateGeneStrength(parent1Tier, parent2Tier);
  console.log(`🧬 Gene Strength Bonus: ${geneStrength}% (from ${parent1Tier} + ${parent2Tier} parents)`);
  
  // Step 5: Dynamic Weighting - Apply level bonus and gene strength to pool
  const { finalWeights, adjustedPool } = applyDynamicWeighting(filteredPool, luckBonus, geneStrength);
  
  // Step 6: Result Selection - Choose single slime ID based on weighted probability
  const selectedSlimeId = selectWeightedRandomEnhanced(adjustedPool, finalWeights);
  
  if (!selectedSlimeId) {
    console.error('❌ Failed to select slime from breeding pool');
    return null;
  }
  
  const selectedSlime = SLIME_CODEX_MAP.get(selectedSlimeId)!;
  console.log(`🧬 Selected Slime: ${selectedSlime.name} (${selectedSlime.rarityTier}) - Final Chance: ${finalWeights[selectedSlimeId]}%`);
  
  return {
    slimeId: selectedSlimeId,
    luckBonus,
    geneStrength,
    finalWeights
  };
}

/**
 * Calculate Gene Strength from parent rarity tiers
 * Rarity Heritage: If parents are already high-tier, they should have "Stronger Genes."
 */
function calculateGeneStrength(parent1Tier: string, parent2Tier: string): number {
  const tierStrength: Record<string, number> = {
    'Common': 0,
    'Uncommon': 5,
    'Rare': 10,
    'Epic': 15,
    'Legendary': 25,
    'Ancient': 35,
    'Divine': 40
  };
  
  const strength1 = tierStrength[parent1Tier] || 0;
  const strength2 = tierStrength[parent2Tier] || 0;
  const averageStrength = (strength1 + strength2) / 2;
  
  // Epic Parents: +15% chance to hit the top-tier of the available pool
  // Legendary Parents: +25% chance
  return Math.floor(averageStrength);
}

/**
 * Apply Dynamic Weighting with Level Bonus and Gene Strength
 * This "Luck" reduces the weight of Commons and increases the weight of Epics/Legendaries
 */
function applyDynamicWeighting(pool: any[], luckBonus: number, geneStrength: number): { finalWeights: Record<string, number>; adjustedPool: any[] } {
  const finalWeights: Record<string, number> = {};
  const adjustedPool = pool.map(slime => {
    const baseWeight = slime.weight;
    let adjustedWeight = baseWeight;
    
    // Apply Level Luck Bonus - reduces weight of Commons, increases weight of higher tiers
    if (slime.rarityTier === 'Common') {
      adjustedWeight = Math.max(1, baseWeight - luckBonus);
    } else if (slime.rarityTier === 'Uncommon') {
      adjustedWeight = Math.max(1, baseWeight - Math.floor(luckBonus * 0.5));
    } else if (['Epic', 'Legendary', 'Ancient', 'Divine'].includes(slime.rarityTier)) {
      adjustedWeight = baseWeight + Math.floor(luckBonus * 0.3);
    }
    
    // Apply Gene Strength Bonus
    if (geneStrength >= 15) { // Epic Parents
      adjustedWeight = Math.floor(adjustedWeight * 1.15); // +15% chance to hit top-tier
    } else if (geneStrength >= 25) { // Legendary Parents
      adjustedWeight = Math.floor(adjustedWeight * 1.25); // +25% chance
    }
    
    finalWeights[slime.id] = adjustedWeight;
    
    return {
      ...slime,
      adjustedWeight
    };
  });
  
  return { finalWeights, adjustedPool };
}

/**
 * Enhanced weighted random selection from breeding pool
 */
function selectWeightedRandomEnhanced(pool: any[], weights: Record<string, number>): string | null {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const slime of pool) {
    currentWeight += weights[slime.id];
    
    if (random < currentWeight) {
      console.log(`🧬 Selected ${slime.name} with adjusted weight ${weights[slime.id]}`);
      return slime.id;
    }
  }
  
  console.error('❌ Weighted selection failed - this should not happen');
  return null;
}

/**
 * Weighted random selection from breeding pool
 * Implements the "Tiered Odds" system
 */
function selectWeightedRandom(pool: BreedingPool): string | null {
  const totalWeight = pool.totalWeight;
  const random = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const slimeId of pool.slimes) {
    const slime = SLIME_CODEX_MAP.get(slimeId)!;
    currentWeight += slime.weight;
    
    if (random < currentWeight) {
      console.log(`🧬 Selected ${slime.name} with weight ${slime.weight}`);
      return slimeId;
    }
  }
  
  console.error('❌ Weighted selection failed - this should not happen');
  return null;
}

/**
 * Check if breeding result is valid according to the breeding laws
 */
export function isValidBreedingResult(parent1Id: string, parent2Id: string, resultId: string): boolean {
  const parent1 = SLIME_CODEX_MAP.get(parent1Id);
  const parent2 = SLIME_CODEX_MAP.get(parent2Id);
  const result = SLIME_CODEX_MAP.get(resultId);
  
  if (!parent1 || !parent2 || !result) {
    return false;
  }
  
  const parentElements = [...new Set([...parent1!.elements, ...parent2!.elements])];
  const resultElements = result.elements;
  
  // Law 1: Element Gate - Result can only have elements present in parents
  const isValidElements = resultElements.every(element => parentElements.includes(element));
  
  // Law 2: Complexity Cap - Can't get 3-element slime from two 1-element slimes
  const parentElementCount = parentElements.length;
  const resultElementCount = resultElements.length;
  const isValidComplexity = !(resultElementCount >= 3 && parentElementCount < 3);
  
  const isValid = isValidElements && isValidComplexity;
  console.log(`🧬 Breeding Validation: ${isValid ? '✅ Valid' : '❌ Invalid'} - ${result.name}`);
  
  return isValid;
}

/**
 * Get rarity tier chances for display purposes
 */
export function getRarityChances(pool: BreedingPool): Record<string, number> {
  const chances: Record<string, number> = {};
  const totalWeight = pool.totalWeight;
  
  for (const slimeId of pool.slimes) {
    const slime = SLIME_CODEX_MAP.get(slimeId)!;
    const chance = (slime.weight / totalWeight) * 100;
    chances[slimeId] = Math.round(chance * 10) / 10; // Round to 1 decimal place
  }
  
  return chances;
}

/**
 * Get final breeding chances for display (Luck Meter)
 */
export function getBreedingChances(parent1Id: string, parent2Id: string, parent1Level: number = 1, parent2Level: number = 1): Record<string, number> {
  const result = calculateBreedingResult(parent1Id, parent2Id, parent1Level, parent2Level);
  if (!result) return {};
  
  return result.finalWeights;
}
