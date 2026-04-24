import { SlimeElement, RarityTier } from '@/types/slime';
import { ALL_CODEX_SLIMES, SLIME_CODEX_MAP, CodexSlime } from '@/data/slimeCodex';

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
  parent2Rarity: RarityTier = 'Common'
): BreedingResult | null {
  
  // ===== PHASE ONE: ELEMENTAL POOL =====
  // Parent Union (PU): Combine all unique elements from both parents
  const parentUnion = [...new Set([...parent1Elements, ...parent2Elements])];
  console.log(`🧬 Parent Union: [${parentUnion.join(', ')}]`);
  
  // Database Filtration: Only slimes that have ALL parent elements
  const validOutcomes = ALL_CODEX_SLIMES.filter(slime => {
    // Union Rule: Slime must have all elements from the parent union (can have more too)
    return parentUnion.every(element => slime.elements.includes(element));
  });
  
  console.log(`🧬 Valid Outcomes Found: ${validOutcomes.length} slimes`);
  
  if (validOutcomes.length === 0) {
    console.log('🧬 No valid breeding outcomes found');
    return null;
  }
  
  // ===== PHASE TWO: BREEDINGPOWER CALCULATION =====
  const breedingPower = ((parent1Level + parent2Level) * 0.5) + 
                        (RARITY_VALUES[parent1Rarity] + RARITY_VALUES[parent2Rarity]);
  console.log(`🧬 BreedingPower: ${breedingPower} (Levels: ${parent1Level + parent2Level}, Rarities: ${parent1Rarity} + ${parent2Rarity})`);
  
  // ===== PHASE THREE: DYNAMIC WEIGHTED SELECTION =====
  const finalWeights: Record<string, number> = {};
  
  validOutcomes.forEach(slime => {
    const baseWeight = BASE_RARITY_WEIGHTS[slime.rarityTier];
    let finalWeight = baseWeight;
    
    // Apply BreedingPower multiplier for higher tiers
    if (slime.rarityTier === 'Rare') {
      finalWeight = baseWeight * (1 + (breedingPower * 0.02));
    } else if (slime.rarityTier === 'Epic') {
      finalWeight = baseWeight * (1 + (breedingPower * 0.05));
    } else if (slime.rarityTier === 'Legendary') {
      finalWeight = baseWeight * (1 + (breedingPower * 0.08));
    } else if (['Divine', 'Ancient'].includes(slime.rarityTier)) {
      finalWeight = baseWeight * (1 + (breedingPower * 0.1));
    }
    
    finalWeights[slime.id] = finalWeight;
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
  
  console.log(`🧬 Current Odds for Epic: ${oddsByRarity['Epic']?.toFixed(2) || 0}%`);
  console.log(`🧬 Current Odds for Rare: ${oddsByRarity['Rare']?.toFixed(2) || 0}%`);
  console.log(`🧬 Current Odds for Legendary: ${oddsByRarity['Legendary']?.toFixed(2) || 0}%`);
  
  // Weighted random selection
  const selectedSlimeId = selectWeightedRandom(validOutcomes, finalWeights);
  
  if (!selectedSlimeId) {
    console.error('❌ Failed to select slime from breeding pool');
    return null;
  }
  
  const selectedSlime = SLIME_CODEX_MAP.get(selectedSlimeId)!;
  console.log(`🧬 Selected Slime: ${selectedSlime.name} (${selectedSlime.rarityTier})`);
  
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
  
  // Parent Union (PU): Combine all unique elements from both parents
  const parentUnion = [...new Set([...parent1Elements, ...parent2Elements])];
  console.log(`🧬 GetPossibleOutcomes - Parent Union: [${parentUnion.join(', ')}]`);
  
  // Database Filtration: Only slimes that have ALL parent elements
  const validOutcomes = ALL_CODEX_SLIMES.filter(slime => {
    // Union Rule: Slime must have all elements from the parent union (can have more too)
    return parentUnion.every(element => slime.elements.includes(element));
  });
  
  console.log(`🧬 GetPossibleOutcomes - Valid Outcomes Found: ${validOutcomes.length} slimes`);
  
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
      console.log(`🧬 Selected ${slime.name} with weight ${weights[slime.id]}`);
      return slime.id;
    }
  }
  
  console.error('❌ Weighted selection failed - this should not happen');
  return null;
}
