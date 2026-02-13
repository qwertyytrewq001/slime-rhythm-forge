import { SlimeTraits } from '@/types/slime';
import { NAME_ADJECTIVES, NAME_DESCRIPTORS, NAME_NOUNS } from '@/data/traitData';

export function generateSlimeName(traits: SlimeTraits): string {
  // Pick adjective from pattern, glow, or aura (whichever is most notable)
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

  const parts = [adjective, descriptor, noun].filter(Boolean);
  return parts.join(' ');
}
