import { Slime } from '@/types/slime';
import { breedSlimes } from './slimeGenerator';

/**
 * Generate preview offspring for the breeding pod.
 * Uses the real breeding logic with different random seeds to show
 * a range of possible outcomes.
 */
export function generateBreedPreviews(parent1: Slime, parent2: Slime, count: number = 6): Slime[] {
  const previews: Slime[] = [];
  const seen = new Set<string>();

  // Generate more candidates than needed to get variety
  const maxAttempts = count * 4;
  for (let i = 0; i < maxAttempts && previews.length < count; i++) {
    const child = breedSlimes(parent1, parent2, false);
    // Deduplicate by rarity tier + primary element combo
    const key = `${child.rarityTier}-${child.element}`;
    if (!seen.has(key)) {
      seen.add(key);
      previews.push(child);
    }
  }

  // Sort by rarity descending for visual appeal
  previews.sort((a, b) => b.rarityScore - a.rarityScore);

  return previews.slice(0, count);
}
