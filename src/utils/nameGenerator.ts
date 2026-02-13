import { SlimeTraits } from '@/types/slime';
import { NAME_ADJECTIVES, NAME_DESCRIPTORS, NAME_NOUNS, MODEL_NAME_PREFIX, RARITY_PREFIXES, RARITY_SUFFIXES } from '@/data/traitData';

export function generateSlimeName(traits: SlimeTraits, stars: number = 1): string {
  // Model-specific base name
  const modelNames = MODEL_NAME_PREFIX[traits.model] || MODEL_NAME_PREFIX[0];
  const modelBase = modelNames[Math.floor(Math.random() * modelNames.length)];

  // Pick adjective from pattern, glow, or aura
  let adjective = '';
  if (traits.aura > 0 && NAME_ADJECTIVES.aura[traits.aura]) {
    adjective = NAME_ADJECTIVES.aura[traits.aura];
  } else if (traits.glow > 0 && NAME_ADJECTIVES.glow[traits.glow]) {
    adjective = NAME_ADJECTIVES.glow[traits.glow];
  } else if (traits.pattern > 0 && NAME_ADJECTIVES.pattern[traits.pattern]) {
    adjective = NAME_ADJECTIVES.pattern[traits.pattern];
  }

  // Pick descriptor from eyes or spikes
  let descriptor = '';
  if (traits.spikes > 0 && NAME_DESCRIPTORS.spikes[traits.spikes]) {
    descriptor = NAME_DESCRIPTORS.spikes[traits.spikes];
  } else if (NAME_DESCRIPTORS.eyes[traits.eyes]) {
    descriptor = NAME_DESCRIPTORS.eyes[traits.eyes];
  }

  // Noun from shape
  const noun = NAME_NOUNS[traits.shape] || 'Slimeus';

  // Build name based on rarity tier
  if (stars >= 5) {
    // Mythic: "[Rarity Prefix] [Adj] [Noun] [Suffix]"
    const prefix = pickRandom(RARITY_PREFIXES[5]);
    const suffix = pickRandom(RARITY_SUFFIXES[5]);
    return [prefix, adjective || descriptor, noun, suffix].filter(Boolean).join(' ');
  } else if (stars >= 4) {
    const prefix = pickRandom(RARITY_PREFIXES[4]);
    const suffix = pickRandom(RARITY_SUFFIXES[4]);
    return [prefix, adjective || modelBase, noun, suffix].filter(Boolean).join(' ');
  } else if (stars >= 3) {
    const prefix = pickRandom(RARITY_PREFIXES[3]);
    return [prefix, descriptor || adjective, noun].filter(Boolean).join(' ');
  } else if (stars >= 2) {
    return [adjective || descriptor, modelBase, noun].filter(Boolean).join(' ');
  } else {
    // Common: just a cute name
    return modelBase || noun;
  }
}

function pickRandom(arr: string[]): string {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}
