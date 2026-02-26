import { SlimeTraits, SlimeElement } from '@/types/slime';
import { ELEMENT_NAME_FRAGMENTS } from '@/data/traitData';

// DML-style species names: always end with "Slime"
// Pattern: [Rarity Descriptor] [Element Prefix] [Optional Descriptor] Slime

const ELEMENT_SPECIES: Record<SlimeElement, string[]> = {
  fire: ['Blaze', 'Ember', 'Cinder', 'Flame', 'Scorch'],
  water: ['Aqua', 'Tide', 'Splash', 'Ripple', 'Brook'],
  plant: ['Vine', 'Sprout', 'Bloom', 'Fern', 'Leaf'],
  earth: ['Stone', 'Mud', 'Clay', 'Pebble', 'Boulder'],
  wind: ['Breeze', 'Gale', 'Zephyr', 'Gust', 'Draft'],
  ice: ['Frost', 'Crystal', 'Flurry', 'Shard', 'Glacier'],
  electric: ['Volt', 'Spark', 'Surge', 'Bolt', 'Arc'],
  metal: ['Steel', 'Chrome', 'Iron', 'Tin', 'Alloy'],
  light: ['Prism', 'Ray', 'Dawn', 'Glow', 'Beacon'],
  shadow: ['Shade', 'Dusk', 'Gloom', 'Murk', 'Phantom'],
  cosmic: ['Nebula', 'Nova', 'Pulsar', 'Astral', 'Star'],
  void: ['Rift', 'Abyss', 'Null', 'Warp', 'Vortex'],
  toxic: ['Venom', 'Sludge', 'Blight', 'Ooze', 'Acid'],
  crystal: ['Geode', 'Jewel', 'Opal', 'Facet', 'Gem'],
  lava: ['Magma', 'Basalt', 'Pumice', 'Caldera', 'Obsidian'],
  nature: ['Grove', 'Moss', 'Thicket', 'Dew', 'Meadow'],
  arcane: ['Rune', 'Sigil', 'Mystic', 'Ether', 'Mana'],
  divine: ['Halo', 'Seraph', 'Celeste', 'Grace', 'Sanctus'],
};

// Hybrid combo names for two elements
const HYBRID_NAMES: Record<string, string[]> = {
  'fire+water': ['Steam', 'Geyser', 'Boil'],
  'fire+earth': ['Magma', 'Volcano', 'Molten'],
  'fire+wind': ['Smoke', 'Ash', 'Wildfire'],
  'fire+plant': ['Bonfire', 'Char', 'Scald'],
  'fire+ice': ['Frost Flame', 'Glacial Ember', 'Thaw'],
  'fire+shadow': ['Dark Flame', 'Hellfire', 'Soot'],
  'fire+cosmic': ['Solar', 'Supernova', 'Sunspot'],
  'water+plant': ['Swamp', 'Lily Pad', 'Marsh'],
  'water+earth': ['Mud', 'Bog', 'Delta'],
  'water+ice': ['Sleet', 'Permafrost', 'Polar'],
  'water+electric': ['Storm', 'Thunder Rain', 'Tempest'],
  'water+toxic': ['Acid Pool', 'Bile', 'Corrosion'],
  'ice+wind': ['Blizzard', 'Snowdrift', 'Hailstorm'],
  'ice+cosmic': ['Comet', 'Aurora', 'Deep Freeze'],
  'ice+shadow': ['Black Ice', 'Frostbite', 'Void Chill'],
  'earth+plant': ['Forest', 'Root', 'Terrain'],
  'earth+metal': ['Ore', 'Mineral', 'Bedrock'],
  'wind+electric': ['Lightning', 'Thunderbolt', 'Cyclone'],
  'wind+light': ['Prism Wind', 'Rainbow', 'Skylight'],
  'light+shadow': ['Twilight', 'Eclipse', 'Duality'],
  'light+cosmic': ['Starlight', 'Radiance', 'Aurora'],
  'shadow+void': ['Abyss', 'Oblivion', 'Nether'],
  'shadow+cosmic': ['Dark Matter', 'Black Hole', 'Entropy'],
  'cosmic+arcane': ['Astral Rune', 'Starweaver', 'Cosmic Sigil'],
  'toxic+nature': ['Poison Ivy', 'Blight Bloom', 'Miasma'],
  'metal+electric': ['Tesla', 'Dynamo', 'Circuit'],
  'metal+crystal': ['Titanium', 'Diamond Edge', 'Platinum'],
  'arcane+void': ['Eldritch', 'Rift Walker', 'Planar'],
  'light+arcane': ['Holy', 'Sanctified', 'Blessed'],
};

// Descriptors for mid-rarity slimes
const MID_DESCRIPTORS = ['Peak', 'Wisp', 'Core', 'Pulse', 'Drift', 'Wave', 'Mist', 'Dust', 'Gleam', 'Flare'];

// High-rarity prefixes
const RARITY_DESCRIPTORS: Record<number, string[]> = {
  5: ['Eternal', 'Ancient', 'Mythic', 'Legendary'],
  6: ['Transcendent', 'Primordial', 'Celestial', 'Omniscient'],
  7: ['Supreme', 'Absolute', 'Infinite', 'Godlike'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSlimeName(traits: SlimeTraits, stars: number = 1, elements: SlimeElement[] = []): string {
  if (elements.length === 0) return 'Goo Slime';

  // Try hybrid name first (2+ elements)
  if (elements.length >= 2) {
    const key1 = `${elements[0]}+${elements[1]}`;
    const key2 = `${elements[1]}+${elements[0]}`;
    const hybrids = HYBRID_NAMES[key1] || HYBRID_NAMES[key2];

    if (hybrids) {
      const prefix = pickRandom(hybrids);
      if (stars >= 5) {
        const rarityDesc = pickRandom(RARITY_DESCRIPTORS[Math.min(stars, 7)] || RARITY_DESCRIPTORS[5]);
        return `${rarityDesc} ${prefix} Slime`;
      }
      if (stars >= 3 && Math.random() > 0.5) {
        return `${prefix} ${pickRandom(MID_DESCRIPTORS)} Slime`;
      }
      return `${prefix} Slime`;
    }
  }

  // Single element name
  const elemSpecies = ELEMENT_SPECIES[elements[0]] || ['Mystery'];
  const prefix = pickRandom(elemSpecies);

  if (stars >= 5) {
    const rarityDesc = pickRandom(RARITY_DESCRIPTORS[Math.min(stars, 7)] || RARITY_DESCRIPTORS[5]);
    return `${rarityDesc} ${prefix} Slime`;
  }
  if (stars >= 3 && Math.random() > 0.4) {
    return `${prefix} ${pickRandom(MID_DESCRIPTORS)} Slime`;
  }
  return `${prefix} Slime`;
}
