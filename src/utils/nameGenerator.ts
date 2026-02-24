import { SlimeTraits, SlimeElement } from '@/types/slime';
import { NAME_ADJECTIVES, NAME_DESCRIPTORS, NAME_NOUNS, MODEL_NAME_PREFIX, RARITY_PREFIXES, RARITY_SUFFIXES, ELEMENT_NAME_FRAGMENTS } from '@/data/traitData';

export function generateSlimeName(traits: SlimeTraits, stars: number = 1, elements: SlimeElement[] = []): string {
  const modelNames = MODEL_NAME_PREFIX[traits.model] || MODEL_NAME_PREFIX[0];
  const modelBase = modelNames[Math.floor(Math.random() * modelNames.length)];

  // Element fragment from primary element
  const primaryElem = elements[0];
  const elemFragments = primaryElem ? ELEMENT_NAME_FRAGMENTS[primaryElem] : [];
  const elemFragment = elemFragments.length > 0 ? elemFragments[Math.floor(Math.random() * elemFragments.length)] : '';

  // Multi-element fusion name fragment
  let fusionFragment = '';
  if (elements.length >= 3) {
    const secondFrags = ELEMENT_NAME_FRAGMENTS[elements[1]] || [];
    fusionFragment = secondFrags.length > 0 ? secondFrags[Math.floor(Math.random() * secondFrags.length)] : '';
  }

  let adjective = '';
  if (traits.aura > 0 && NAME_ADJECTIVES.aura[traits.aura]) {
    adjective = NAME_ADJECTIVES.aura[traits.aura];
  } else if (traits.glow > 0 && NAME_ADJECTIVES.glow[traits.glow]) {
    adjective = NAME_ADJECTIVES.glow[traits.glow];
  } else if (traits.pattern > 0 && NAME_ADJECTIVES.pattern[traits.pattern]) {
    adjective = NAME_ADJECTIVES.pattern[traits.pattern];
  }

  let descriptor = '';
  if (traits.spikes > 0 && NAME_DESCRIPTORS.spikes[traits.spikes]) {
    descriptor = NAME_DESCRIPTORS.spikes[traits.spikes];
  } else if (NAME_DESCRIPTORS.eyes[traits.eyes]) {
    descriptor = NAME_DESCRIPTORS.eyes[traits.eyes];
  }

  const noun = NAME_NOUNS[traits.shape] || 'Slimeus';

  // Build name based on rarity tier with element flavor
  const clampedStars = Math.min(stars, 7);

  if (clampedStars >= 7) {
    // Supreme: "[Supreme Prefix] [Elem] [Fusion] [Noun] [Suffix]"
    const prefix = pickRandom(RARITY_PREFIXES[7]);
    const suffix = pickRandom(RARITY_SUFFIXES[7]);
    return [prefix, elemFragment, fusionFragment || adjective, noun, suffix].filter(Boolean).join(' ');
  } else if (clampedStars >= 6) {
    const prefix = pickRandom(RARITY_PREFIXES[6]);
    const suffix = pickRandom(RARITY_SUFFIXES[6]);
    return [prefix, elemFragment, adjective || descriptor, noun, suffix].filter(Boolean).join(' ');
  } else if (clampedStars >= 5) {
    const prefix = pickRandom(RARITY_PREFIXES[5]);
    const suffix = pickRandom(RARITY_SUFFIXES[5]);
    return [prefix, elemFragment || adjective, noun, suffix].filter(Boolean).join(' ');
  } else if (clampedStars >= 4) {
    const prefix = pickRandom(RARITY_PREFIXES[4]);
    const suffix = pickRandom(RARITY_SUFFIXES[4]);
    return [prefix, elemFragment || modelBase, noun, suffix].filter(Boolean).join(' ');
  } else if (clampedStars >= 3) {
    const prefix = pickRandom(RARITY_PREFIXES[3]);
    return [prefix, elemFragment || descriptor, noun].filter(Boolean).join(' ');
  } else if (clampedStars >= 2) {
    return [adjective || elemFragment || descriptor, modelBase, noun].filter(Boolean).join(' ');
  } else {
    return elemFragment || modelBase || noun;
  }
}

function pickRandom(arr: string[]): string {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}
