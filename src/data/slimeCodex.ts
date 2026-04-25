import { SlimeElement, RarityTier } from '@/types/slime';

export interface CodexSlime {
  id: string;
  name: string;
  elements: SlimeElement[];
  rarityTier: RarityTier;
  weight: number;
  description: string;
  family?: 'elemental-slimes' | 'sweet-collection' | 'storm-collection' | 'nature-collection' | 'lab-slimes' | 'mystic-slimes' | 'crystal-collection' | 'legendary-slimes' | 'hybrid-collection' | 'lost-slimes';
  spriteId: string;
}

// 🧬 The Primals (Core 1-Element Slimes) - Based on actual sprites
export const PRIMAL_SLIMES: CodexSlime[] = [
  {
    id: 'fire_slime',
    name: 'Fire Slime',
    elements: ['fire'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The basic flame spirit. Parent of all fire-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'fire_slime'
  },
  {
    id: 'water_slime',
    name: 'Water Slime',
    elements: ['water'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The fluid essence spirit. Master of water-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'water_slime'
  },
  {
    id: 'leaf_slime',
    name: 'Leaf Slime',
    elements: ['plant'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The nature spirit. Guardian of plant-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'leaf_slime'
  },
  {
    id: 'rock_slime',
    name: 'Rock Slime',
    elements: ['earth'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The earth spirit. Foundation of earth-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'rock_slime'
  },
  {
    id: 'wind_slime',
    name: 'Wind Slime',
    elements: ['wind'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The air spirit. Controller of wind-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'wind_slime'
  },
  {
    id: 'snow_slime',
    name: 'Snow Slime',
    elements: ['ice'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The frozen spirit. Master of ice-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'snow_slime'
  },
  {
    id: 'bolt_slime',
    name: 'Bolt Slime',
    elements: ['electric'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The storm spirit. Wielder of electric-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'bolt_slime'
  },
  {
    id: 'iron_slime',
    name: 'Iron Slime',
    elements: ['metal'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The metal spirit. Creator of metal-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'iron_slime'
  },
  {
    id: 'glow_slime',
    name: 'Glow Slime',
    elements: ['light'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The radiant spirit. Beacon of light-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'glow_slime'
  },
  {
    id: 'dark_slime',
    name: 'Dark Slime',
    elements: ['shadow'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The shadow spirit. Keeper of shadow-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'dark_slime'
  },
  {
    id: 'star_slime',
    name: 'Star Slime',
    elements: ['cosmic'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The cosmic spirit. Guardian of cosmic-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'star_slime'
  },
  {
    id: 'ooze_slime',
    name: 'Ooze Slime',
    elements: ['toxic'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The toxic spirit. Creator of toxic-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'ooze_slime'
  },
  {
    id: 'gem_slime',
    name: 'Gem Slime',
    elements: ['crystal'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The crystal spirit. Keeper of crystal-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'gem_slime'
  },
  {
    id: 'lava_slime',
    name: 'Lava Slime',
    elements: ['water', 'fire'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The lava spirit. Master of lava-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'lava_slime'
  },
  {
    id: 'nature_slime',
    name: 'Nature Slime',
    elements: ['plant', 'earth'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The nature spirit. Guardian of nature-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'nature_slime'
  },
  {
    id: 'rune_slime',
    name: 'Rune Slime',
    elements: ['arcane'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The arcane spirit. Wielder of arcane-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'rune_slime'
  },
  {
    id: 'angel_slime',
    name: 'Angel Slime',
    elements: ['divine'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The divine spirit. Keeper of divine-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'angel_slime'
  }
];

// 🍭 The Sweet Collection - Based on actual sprites
export const SWEET_SLIMES: CodexSlime[] = [
  {
    id: 'candy_slime',
    name: 'Candy Slime',
    elements: ['plant', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A sweet fusion of plant and fire elements.',
    family: 'sweet-collection',
    spriteId: 'candy_slime'
  },
  {
    id: 'pudding_slime',
    name: 'Pudding Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A soft blend of water and earth elements.',
    family: 'sweet-collection',
    spriteId: 'pudding_slime'
  },
  {
    id: 'berry_slime',
    name: 'Berry Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A fruity blend of plant and water elements.',
    family: 'nature-collection',
    spriteId: 'berry_slime'
  },
  {
    id: 'mint_slime',
    name: 'Mint Slime',
    elements: ['plant', 'ice'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A cool fusion of plant and ice elements.',
    family: 'sweet-collection',
    spriteId: 'mint_slime'
  },
  {
    id: 'caramel_slime',
    name: 'Caramel Slime',
    elements: ['water', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A warm blend of water and fire elements.',
    family: 'sweet-collection',
    spriteId: 'caramel_slime'
  },
  {
    id: 'cotton_candy_slime',
    name: 'Cotton Candy Slime',
    elements: ['wind', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A fluffy fusion of wind and plant elements.',
    family: 'sweet-collection',
    spriteId: 'cotton_candy_slime'
  },
  {
    id: 'donut_slime',
    name: 'Donut Slime',
    elements: ['earth', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A sweet fusion of earth and plant elements.',
    family: 'sweet-collection',
    spriteId: 'donut_slime'
  },
  {
    id: 'soda_slime',
    name: 'Soda Slime',
    elements: ['water', 'electric'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A fizzy fusion of water and electric elements.',
    family: 'sweet-collection',
    spriteId: 'soda_slime'
  },
  {
    id: 'steam_slime',
    name: 'Steam Slime',
    elements: ['fire', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A hot fusion of fire and water elements.',
    spriteId: 'steam_slime'
  },
  {
    id: 'toffee_slime',
    name: 'Toffee Slime',
    elements: ['metal', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A hard fusion of metal and fire elements.',
    family: 'sweet-collection',
    spriteId: 'toffee_slime'
  },
  {
    id: 'honey_slime',
    name: 'Honey Slime',
    elements: ['plant', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A golden blend of plant and light elements.',
    family: 'sweet-collection',
    spriteId: 'honey_slime'
  },
  {
    id: 'chocolate_slime',
    name: 'Chocolate Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A rich fusion of earth and fire elements.',
    family: 'sweet-collection',
    spriteId: 'chocolate_slime'
  },
  {
    id: 'gummybear_slime',
    name: 'Gummy Bear Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A chewy mix of plant and water elements.',
    family: 'sweet-collection',
    spriteId: 'gummybear_slime'
  }
];

// ⚡ The Storm Collection - Based on actual sprites
export const STORM_SLIMES: CodexSlime[] = [
  {
    id: 'volcano_slime',
    name: 'Volcano Slime',
    elements: ['water', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'An explosive fusion of water and fire elements.',
    family: 'storm-collection',
    spriteId: 'volcano_slime'
  },
  {
    id: 'tornado_slime',
    name: 'Tornado Slime',
    elements: ['wind', 'electric'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A violent fusion of wind and electric elements.',
    family: 'storm-collection',
    spriteId: 'tornado_slime'
  },
  {
    id: 'tsunami_slime',
    name: 'Tsunami Slime',
    elements: ['water', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A massive fusion of water and wind elements.',
    family: 'storm-collection',
    spriteId: 'tsunami_slime'
  },
  {
    id: 'earthquake_slime',
    name: 'Earthquake Slime',
    elements: ['earth', 'metal'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A devastating fusion of earth and metal elements.',
    family: 'storm-collection',
    spriteId: 'earthquake_slime'
  },
  {
    id: 'wildfire_slime',
    name: 'Wildfire Slime',
    elements: ['fire', 'plant'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A burning fusion of fire and plant elements.',
    family: 'storm-collection',
    spriteId: 'wildfire_slime'
  },
  {
    id: 'blizzard_slime',
    name: 'Blizzard Slime',
    elements: ['ice', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A freezing fusion of ice and wind elements.',
    family: 'storm-collection',
    spriteId: 'blizzard_slime'
  },
  {
    id: 'sandstorm_slime',
    name: 'Sandstorm Slime',
    elements: ['earth', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A abrasive fusion of earth and wind elements.',
    family: 'storm-collection',
    spriteId: 'sandstorm_slime'
  },
  {
    id: 'solarflare_slime',
    name: 'Solar Flare Slime',
    elements: ['cosmic', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A brilliant fusion of cosmic and fire elements.',
    family: 'storm-collection',
    spriteId: 'solarflare_slime'
  },
  {
    id: 'meteor_slime',
    name: 'Meteor Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A burning fusion of earth and fire elements from space.',
    family: 'storm-collection',
    spriteId: 'meteor_slime'
  }
];

// 🌟 The Lost Collection - Based on actual sprites
export const LOST_SLIMES: CodexSlime[] = [
  {
    id: 'genesis_slime',
    name: 'Genesis Slime',
    elements: ['divine', 'plant', 'earth', 'water'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'The slime that seeded the first forests.',
    family: 'lost-slimes',
    spriteId: 'yggdrasil_slime'
  },
  {
    id: 'apocalypse_slime',
    name: 'Apocalypse Slime',
    elements: ['void', 'water', 'fire', 'shadow'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Born from the heat of a dying world.',
    family: 'lost-slimes',
    spriteId: 'apocalypse_slime'
  },
  {
    id: 'galaxy_whale_slime',
    name: 'Galaxy Whale Slime',
    elements: ['cosmic', 'water', 'wind', 'arcane'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'So large it was once mistaken for a floating island.',
    family: 'lost-slimes',
    spriteId: 'galaxy_whale_slime'
  },
  {
    id: 'mechagod_slime',
    name: 'Mecha God Slime',
    elements: ['metal', 'electric', 'light', 'crystal'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'A slime that replaced its body with perfect machinery.',
    family: 'lost-slimes',
    spriteId: 'mechagod_slime'
  },
  {
    id: 'eldritch_slime',
    name: 'Eldritch Slime',
    elements: ['void', 'toxic', 'shadow', 'arcane'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Even other slimes are afraid to look at it.',
    family: 'lost-slimes',
    spriteId: 'eldritch_slime'
  },
  {
    id: 'yggdrasil_slime',
    name: 'Yggdrasil Slime',
    elements: ['plant', 'earth', 'water', 'divine'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'It grows a miniature world on its back.',
    family: 'lost-slimes',
    spriteId: 'genesis_slime'
  },
  {
    id: 'star_eater_slime',
    name: 'Star Eater Slime',
    elements: ['cosmic', 'void', 'fire', 'metal'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Its core is a black hole held together by gravity.',
    family: 'lost-slimes',
    spriteId: 'star_eater_slime'
  },
  {
    id: 'harmoney_slime',
    name: 'Harmony Slime',
    elements: ['light', 'plant', 'wind', 'water'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Its presence stops all nearby battles instantly.',
    family: 'lost-slimes',
    spriteId: 'harmoney_slime'
  },
  {
    id: 'pandora_slime',
    name: 'Pandora Slime',
    elements: ['void', 'arcane', 'toxic', 'fire'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'A slime that contains all of the world\'s curiosities.',
    family: 'lost-slimes',
    spriteId: 'pandora_slime'
  },
  {
    id: 'ice_crystal_slime',
    name: 'Ice Crystal Slime',
    elements: ['ice', 'crystal', 'light'],
    rarityTier: 'Legendary',
    weight: 3,
    description: 'A crystalline fusion of ice, crystal, and light elements.',
    family: 'lost-slimes',
    spriteId: 'ice_crystal_slime'
  }
];

// 🌍 The Nature Collection - Based on actual sprites
export const NATURE_SLIMES: CodexSlime[] = [
  {
    id: 'acidrain_slime',
    name: 'Acid Rain Slime',
    elements: ['toxic', 'water'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A corrosive fusion of toxic and water elements.',
    family: 'nature-collection',
    spriteId: 'acidrain_slime'
  },
  {
    id: 'alpine_slime',
    name: 'Alpine Slime',
    elements: ['wind', 'ice'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A high fusion of wind and ice elements.',
    family: 'nature-collection',
    spriteId: 'alpine_slime'
  },
  {
    id: 'bamboo_slime',
    name: 'Bamboo Slime',
    elements: ['plant', 'metal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A strong fusion of plant and metal elements.',
    family: 'nature-collection',
    spriteId: 'bamboo_slime'
  },
  {
    id: 'berry_slime',
    name: 'Berry Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A fruity blend of plant and water elements.',
    family: 'nature-collection',
    spriteId: 'berry_slime'
  },
  {
    id: 'canyon_slime',
    name: 'Canyon Slime',
    elements: ['earth', 'water', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A deep fusion of earth, water, and fire elements.',
    family: 'nature-collection',
    spriteId: 'canyon_slime'
  },
  {
    id: 'cave_slime',
    name: 'Cave Slime',
    elements: ['earth', 'shadow'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A dark fusion of earth and shadow elements.',
    family: 'nature-collection',
    spriteId: 'cave_slime'
  },
  {
    id: 'coral_slime',
    name: 'Coral Slime',
    elements: ['water', 'crystal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A vibrant fusion of water and crystal elements.',
    family: 'nature-collection',
    spriteId: 'coral_slime'
  },
  {
    id: 'desert_slime',
    name: 'Desert Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A scorching fusion of earth and fire elements.',
    family: 'nature-collection',
    spriteId: 'desert_slime'
  },
  {
    id: 'island_slime',
    name: 'Island Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A isolated fusion of water and earth elements.',
    family: 'nature-collection',
    spriteId: 'island_slime'
  },
  {
    id: 'jungle_slime',
    name: 'Jungle Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A dense fusion of plant and water elements.',
    family: 'nature-collection',
    spriteId: 'jungle_slime'
  },
  {
    id: 'mangrove_slime',
    name: 'Mangrove Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A coastal fusion of plant and water elements.',
    family: 'nature-collection',
    spriteId: 'mangrove_slime'
  },
  {
    id: 'meadow_slime',
    name: 'Meadow Slime',
    elements: ['plant', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A peaceful fusion of plant and light elements.',
    family: 'nature-collection',
    spriteId: 'meadow_slime'
  },
  {
    id: 'oasis_slime',
    name: 'Oasis Slime',
    elements: ['water', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A refreshing fusion of water and plant elements.',
    family: 'nature-collection',
    spriteId: 'oasis_slime'
  },
  {
    id: 'rainforest_slime',
    name: 'Rainforest Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A lush fusion of plant and water elements.',
    family: 'nature-collection',
    spriteId: 'rainforest_slime'
  },
  {
    id: 'savanna_slime',
    name: 'Savanna Slime',
    elements: ['earth', 'wind'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A dry fusion of earth and wind elements.',
    family: 'nature-collection',
    spriteId: 'savanna_slime'
  },
  {
    id: 'swamp_slime',
    name: 'Swamp Slime',
    elements: ['toxic', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A murky fusion of toxic and water elements.',
    family: 'nature-collection',
    spriteId: 'swamp_slime'
  },
  {
    id: 'tundra_slime',
    name: 'Tundra Slime',
    elements: ['ice', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A cold fusion of ice and earth elements.',
    family: 'nature-collection',
    spriteId: 'tundra_slime'
  }
];

// 🎈 Special Slimes - Based on actual sprites
export const SPECIAL_SLIMES: CodexSlime[] = [
  {
    id: 'balloon_slime',
    name: 'Balloon Slime',
    elements: ['wind', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A floating fusion of wind and light elements.',
    spriteId: 'balloon_slime'
  },
  {
    id: 'crayon_slime',
    name: 'Crayon Slime',
    elements: ['earth', 'crystal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A colorful fusion of earth and crystal elements.',
    spriteId: 'crayon_slime'
  },
  {
    id: 'glitched_slime',
    name: 'Glitched Slime',
    elements: ['void', 'electric'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A digital fusion of void and electric elements.',
    family: 'lost-slimes',
    spriteId: 'glitched_slime'
  }
];

// Combine all slimes for easy access
export const ALL_CODEX_SLIMES: CodexSlime[] = [
  ...PRIMAL_SLIMES,
  ...SWEET_SLIMES,
  ...STORM_SLIMES,
  ...NATURE_SLIMES,
  ...LOST_SLIMES,
  ...SPECIAL_SLIMES
];

// Create lookup map for quick access
export const SLIME_CODEX_MAP = new Map<string, CodexSlime>(
  ALL_CODEX_SLIMES.map(slime => [slime.id, slime])
);
