import { SlimeElement, RarityTier } from '@/types/slime';

export interface CodexSlime {
  id: string;
  name: string;
  elements: SlimeElement[];
  rarityTier: RarityTier;
  weight: number;
  description: string;
  family: 'elemental-slimes' | 'sweet-collection' | 'storm-collection' | 'nature-collection' | 'lab-slimes' | 'mystic-slimes' | 'crystal-collection' | 'legendary-slimes' | 'hybrid-collection' | 'lost-slimes';
  spriteId: string;
}

// 🧬 The Primals (Core 1-Element Slimes) - 18 Slimes
export const PRIMAL_SLIMES: CodexSlime[] = [
  {
    id: 'fire_primal',
    name: 'Fire Slime',
    elements: ['fire'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The basic flame spirit. Parent of all fire-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'fire_base'
  },
  {
    id: 'water_primal',
    name: 'Water Slime',
    elements: ['water'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The fluid essence spirit. Master of water-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'water_base'
  },
  {
    id: 'leaf_primal',
    name: 'Leaf Slime',
    elements: ['plant'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The nature spirit. Guardian of plant-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'plant_base'
  },
  {
    id: 'rock_primal',
    name: 'Rock Slime',
    elements: ['earth'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The earth spirit. Foundation of earth-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'earth_base'
  },
  {
    id: 'wind_primal',
    name: 'Wind Slime',
    elements: ['wind'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The air spirit. Controller of wind-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'wind_base'
  },
  {
    id: 'snow_primal',
    name: 'Snow Slime',
    elements: ['ice'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The frozen spirit. Master of ice-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'ice_base'
  },
  {
    id: 'bolt_primal',
    name: 'Bolt Slime',
    elements: ['electric'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The storm spirit. Wielder of electric-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'electric_base'
  },
  {
    id: 'iron_primal',
    name: 'Iron Slime',
    elements: ['metal'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The metal spirit. Creator of metal-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'metal_base'
  },
  {
    id: 'glow_primal',
    name: 'Glow Slime',
    elements: ['light'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The radiant spirit. Beacon of light-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'light_base'
  },
  {
    id: 'dark_primal',
    name: 'Dark Slime',
    elements: ['shadow'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The shadow spirit. Keeper of shadow-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'shadow_base'
  },
  {
    id: 'star_primal',
    name: 'Star Slime',
    elements: ['cosmic'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The cosmic spirit. Guardian of cosmic-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'cosmic_base'
  },
  {
    id: 'null_primal',
    name: 'Null Slime',
    elements: ['void'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The void spirit. Master of void-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'void_base'
  },
  {
    id: 'ooze_primal',
    name: 'Ooze Slime',
    elements: ['toxic'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The toxic spirit. Creator of toxic-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'toxic_base'
  },
  {
    id: 'gem_primal',
    name: 'Gem Slime',
    elements: ['crystal'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The crystal spirit. Keeper of crystal-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'crystal_base'
  },
  {
    id: 'magma_primal',
    name: 'Magma Slime',
    elements: ['lava'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The lava spirit. Master of lava-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'lava_base'
  },
  {
    id: 'wild_primal',
    name: 'Wild Slime',
    elements: ['nature'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The nature spirit. Guardian of nature-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'nature_base'
  },
  {
    id: 'rune_primal',
    name: 'Rune Slime',
    elements: ['arcane'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The arcane spirit. Wielder of arcane-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'arcane_base'
  },
  {
    id: 'angel_primal',
    name: 'Angel Slime',
    elements: ['divine'],
    rarityTier: 'Common',
    weight: 100,
    description: 'The divine spirit. Keeper of divine-based slimes.',
    family: 'elemental-slimes',
    spriteId: 'divine_base'
  }
];

// 🍭 The Confectionary Family (The "Sweet" Set) - 12 Slimes
export const CONFECTIONARY_SLIMES: CodexSlime[] = [
  {
    id: 'candy_slime',
    name: 'Candy Slime',
    elements: ['plant', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A sweet fusion of plant and fire elements.',
    family: 'sweet-collection',
    spriteId: 'candy_plant_fire'
  },
  {
    id: 'pudding_slime',
    name: 'Pudding Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A soft blend of water and earth elements.',
    family: 'sweet-collection',
    spriteId: 'pudding_water_earth'
  },
  {
    id: 'gummy_slime',
    name: 'Gummy Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A chewy mix of plant and water elements.',
    family: 'sweet-collection',
    spriteId: 'gummy_plant_water'
  },
  {
    id: 'honey_slime',
    name: 'Honey Slime',
    elements: ['plant', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A golden blend of plant and light elements.',
    family: 'sweet-collection',
    spriteId: 'honey_plant_light'
  },
  {
    id: 'choco_slime',
    name: 'Choco Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A rich fusion of earth and fire elements.',
    family: 'sweet-collection',
    spriteId: 'choco_earth_fire'
  },
  {
    id: 'berry_slime',
    name: 'Berry Slime',
    elements: ['plant', 'nature'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A fruity blend of plant and nature elements.',
    family: 'sweet-collection',
    spriteId: 'berry_plant_nature'
  },
  {
    id: 'mint_slime',
    name: 'Mint Slime',
    elements: ['plant', 'ice'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A cool fusion of plant and ice elements.',
    family: 'sweet-collection',
    spriteId: 'mint_plant_ice'
  },
  {
    id: 'caramel_slime',
    name: 'Caramel Slime',
    elements: ['lava', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A warm blend of lava and water elements.',
    family: 'sweet-collection',
    spriteId: 'caramel_lava_water'
  },
  {
    id: 'cotton_candy_slime',
    name: 'Cotton Candy Slime',
    elements: ['wind', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A fluffy fusion of wind and plant elements.',
    family: 'sweet-collection',
    spriteId: 'cotton_wind_plant'
  },
  {
    id: 'donut_slime',
    name: 'Donut Slime',
    elements: ['earth', 'nature'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A round fusion of earth and nature elements.',
    family: 'sweet-collection',
    spriteId: 'donut_earth_nature'
  },
  {
    id: 'soda_slime',
    name: 'Soda Slime',
    elements: ['water', 'electric'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A fizzy fusion of water and electric elements.',
    family: 'sweet-collection',
    spriteId: 'soda_water_electric'
  },
  {
    id: 'steam_slime',
    name: 'Steam Slime',
    elements: ['fire', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A hot fusion of fire and water elements.',
    family: 'sweet-collection',
    spriteId: 'steam_fire_water'
  },
  {
    id: 'mud_slime',
    name: 'Mud Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A soft fusion of water and earth elements.',
    family: 'sweet-collection',
    spriteId: 'mud_water_earth'
  },
  {
    id: 'mist_slime',
    name: 'Mist Slime',
    elements: ['water', 'wind'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A light fusion of water and wind elements.',
    family: 'sweet-collection',
    spriteId: 'mist_water_wind'
  },
  {
    id: 'ash_slime',
    name: 'Ash Slime',
    elements: ['fire', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A dry fusion of fire and plant elements.',
    family: 'sweet-collection',
    spriteId: 'ash_fire_plant'
  },
  {
    id: 'storm_slime',
    name: 'Storm Slime',
    elements: ['electric', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A powerful fusion of electric and water elements.',
    family: 'sweet-collection',
    spriteId: 'storm_electric_water'
  },
  {
    id: 'molten_slime',
    name: 'Molten Slime',
    elements: ['metal', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A hot fusion of metal and fire elements.',
    family: 'sweet-collection',
    spriteId: 'molten_metal_fire'
  },
  {
    id: 'bloom_slime',
    name: 'Bloom Slime',
    elements: ['light', 'plant'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A bright fusion of light and plant elements.',
    family: 'sweet-collection',
    spriteId: 'bloom_light_plant'
  },
  {
    id: 'darkness_slime',
    name: 'Darkness Slime',
    elements: ['shadow', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A dark fusion of shadow and earth elements.',
    family: 'sweet-collection',
    spriteId: 'darkness_shadow_earth'
  },
  {
    id: 'toffee_slime',
    name: 'Toffee Slime',
    elements: ['metal', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A hard fusion of metal and fire elements.',
    family: 'sweet-collection',
    spriteId: 'toffee_metal_fire'
  }
];

// The Disaster Family (The "Force" Set) - 10 Slimes
export const DISASTER_SLIMES: CodexSlime[] = [
  {
    id: 'volcano_slime',
    name: 'Volcano Slime',
    elements: ['lava', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'An explosive fusion of lava and fire elements.',
    family: 'storm-collection',
    spriteId: 'volcano_lava_fire'
  },
  {
    id: 'tornado_slime',
    name: 'Tornado Slime',
    elements: ['wind', 'electric'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A violent fusion of wind and electric elements.',
    family: 'storm-collection',
    spriteId: 'tornado_wind_electric'
  },
  {
    id: 'tsunami_slime',
    name: 'Tsunami Slime',
    elements: ['water', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A massive fusion of water and wind elements.',
    family: 'storm-collection',
    spriteId: 'tsunami_water_wind'
  },
  {
    id: 'earthquake_slime',
    name: 'Earthquake Slime',
    elements: ['earth', 'metal'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A devastating fusion of earth and metal elements.',
    family: 'storm-collection',
    spriteId: 'earthquake_earth_metal'
  },
  {
    id: 'wildfire_slime',
    name: 'Wildfire Slime',
    elements: ['fire', 'plant'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A burning fusion of fire and plant elements.',
    family: 'storm-collection',
    spriteId: 'wildfire_fire_plant'
  },
  {
    id: 'blizzard_slime',
    name: 'Blizzard Slime',
    elements: ['ice', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A freezing fusion of ice and wind elements.',
    family: 'storm-collection',
    spriteId: 'blizzard_ice_wind'
  },
  {
    id: 'sandstorm_slime',
    name: 'Sandstorm Slime',
    elements: ['earth', 'wind'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A abrasive fusion of earth and wind elements.',
    family: 'storm-collection',
    spriteId: 'sandstorm_earth_wind'
  },
  {
    id: 'acid_rain_slime',
    name: 'Acid Rain Slime',
    elements: ['toxic', 'water'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A corrosive fusion of toxic and water elements.',
    family: 'storm-collection',
    spriteId: 'acid_rain_toxic_water'
  },
  {
    id: 'meteor_slime',
    name: 'Meteor Slime',
    elements: ['cosmic', 'earth'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'An impact fusion of cosmic and earth elements.',
    family: 'storm-collection',
    spriteId: 'meteor_cosmic_earth'
  },
  {
    id: 'solar_flare_slime',
    name: 'Solar Flare Slime',
    elements: ['cosmic', 'fire'],
    rarityTier: 'Rare',
    weight: 25,
    description: 'A brilliant fusion of cosmic and fire elements.',
    family: 'storm-collection',
    spriteId: 'solar_flare_cosmic_fire'
  }
];

// The Mythical "Quad-Cores" (Slimes 141–150) - 10 Slimes
export const MYTHICAL_SLIMES: CodexSlime[] = [
  {
    id: 'genesis_slime',
    name: 'Genesis Slime',
    elements: ['divine', 'nature', 'earth', 'water'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'The slime that seeded the first forests.',
    family: 'lost-slimes',
    spriteId: 'genesis_divine_nature_earth_water'
  },
  {
    id: 'apocalypse_slime',
    name: 'Apocalypse Slime',
    elements: ['void', 'fire', 'lava', 'shadow'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Born from the heat of a dying world.',
    family: 'lost-slimes',
    spriteId: 'apocalypse_void_fire_lava_shadow'
  },
  {
    id: 'galaxy_whale_slime',
    name: 'Galaxy-Whale Slime',
    elements: ['cosmic', 'water', 'wind', 'arcane'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'So large it was once mistaken for a floating island.',
    family: 'lost-slimes',
    spriteId: 'galaxy_whale_cosmic_water_wind_arcane'
  },
  {
    id: 'mecha_god_slime',
    name: 'Mecha-God Slime',
    elements: ['metal', 'electric', 'light', 'crystal'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'A slime that replaced its body with perfect machinery.',
    family: 'lost-slimes',
    spriteId: 'mecha_god_metal_electric_light_crystal'
  },
  {
    id: 'eldritch_horror_slime',
    name: 'Eldritch-Horror Slime',
    elements: ['void', 'toxic', 'shadow', 'arcane'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Even other slimes are afraid to look at it.',
    family: 'lost-slimes',
    spriteId: 'eldritch_horror_void_toxic_shadow_arcane'
  },
  {
    id: 'yggdrasil_slime',
    name: 'Yggdrasil Slime',
    elements: ['plant', 'nature', 'earth', 'divine'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'It grows a miniature world on its back.',
    family: 'lost-slimes',
    spriteId: 'yggdrasil_plant_nature_earth_divine'
  },
  {
    id: 'star_eater_slime',
    name: 'Star-Eater Slime',
    elements: ['cosmic', 'void', 'fire', 'metal'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Its core is a black hole held together by gravity.',
    family: 'lost-slimes',
    spriteId: 'star_eater_cosmic_void_fire_metal'
  },
  {
    id: 'harmony_slime',
    name: 'Harmony Slime',
    elements: ['light', 'nature', 'wind', 'water'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'Its presence stops all nearby battles instantly.',
    family: 'lost-slimes',
    spriteId: 'harmony_light_nature_wind_water'
  },
  {
    id: 'pandora_slime',
    name: 'Pandora Slime',
    elements: ['void', 'arcane', 'toxic', 'fire'],
    rarityTier: 'Legendary',
    weight: 1,
    description: 'A slime that contains all of the world\'s curiosities.',
    family: 'lost-slimes',
    spriteId: 'pandora_void_arcane_toxic_fire'
  },
  {
    id: 'the_alpha_blob_slime',
    name: 'The Alpha-Blob Slime',
    elements: ['divine', 'cosmic', 'void', 'nature'],
    rarityTier: 'Ancient',
    weight: 0.5,
    description: 'The "True Master."',
    family: 'lost-slimes',
    spriteId: 'alpha_blob_divine_cosmic_void_nature'
  },
  {
    id: 'crytsal_ice_slime',
    name: 'Crytsal Ice Slime',
    elements: ['ice', 'crystal', 'light'],
    rarityTier: 'Legendary',
    weight: 3,
    description: 'A crystalline fusion of ice, crystal, and light elements.',
    family: 'lost-slimes',
    spriteId: 'crytsal_ice_crystal_light'
  }
];

// The Biome Family (The "World" Set) - 15 Slimes
export const BIOME_SLIMES: CodexSlime[] = [
  {
    id: 'swamp_slime',
    name: 'Swamp Slime',
    elements: ['toxic', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A murky fusion of toxic and water elements.',
    family: 'nature-collection',
    spriteId: 'swamp_toxic_water'
  },
  {
    id: 'savanna_slime',
    name: 'Savanna Slime',
    elements: ['earth', 'wind'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A dry fusion of earth and wind elements.',
    family: 'nature-collection',
    spriteId: 'savanna_earth_wind'
  },
  {
    id: 'desert_slime',
    name: 'Desert Slime',
    elements: ['earth', 'fire'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A scorching fusion of earth and fire elements.',
    family: 'nature-collection',
    spriteId: 'desert_earth_fire'
  },
  {
    id: 'rainforest_slime',
    name: 'Rainforest Slime',
    elements: ['plant', 'water'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A lush fusion of plant and water elements.',
    family: 'nature-collection',
    spriteId: 'rainforest_plant_water'
  },
  {
    id: 'oasis_slime',
    name: 'Oasis Slime',
    elements: ['water', 'nature'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A refreshing fusion of water and nature elements.',
    family: 'nature-collection',
    spriteId: 'oasis_water_nature'
  },
  {
    id: 'tundra_slime',
    name: 'Tundra Slime',
    elements: ['ice', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A cold fusion of ice and earth elements.',
    family: 'nature-collection',
    spriteId: 'tundra_ice_earth'
  },
  {
    id: 'cave_slime',
    name: 'Cave Slime',
    elements: ['earth', 'shadow'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A dark fusion of earth and shadow elements.',
    family: 'nature-collection',
    spriteId: 'cave_earth_shadow'
  },
  {
    id: 'coral_slime',
    name: 'Coral Slime',
    elements: ['water', 'crystal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A vibrant fusion of water and crystal elements.',
    family: 'nature-collection',
    spriteId: 'coral_water_crystal'
  },
  {
    id: 'jungle_slime',
    name: 'Jungle Slime',
    elements: ['plant', 'nature'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A dense fusion of plant and nature elements.',
    family: 'nature-collection',
    spriteId: 'jungle_plant_nature'
  },
  {
    id: 'alpine_slime',
    name: 'Alpine Slime',
    elements: ['wind', 'ice'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A high fusion of wind and ice elements.',
    family: 'nature-collection',
    spriteId: 'alpine_wind_ice'
  },
  {
    id: 'canyon_slime',
    name: 'Canyon Slime',
    elements: ['earth', 'lava'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A deep fusion of earth and lava elements.',
    family: 'nature-collection',
    spriteId: 'canyon_earth_lava'
  },
  {
    id: 'mangrove_slime',
    name: 'Mangrove Slime',
    elements: ['plant', 'toxic'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A coastal fusion of plant and toxic elements.',
    family: 'nature-collection',
    spriteId: 'mangrove_plant_toxic'
  },
  {
    id: 'meadow_slime',
    name: 'Meadow Slime',
    elements: ['nature', 'light'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A peaceful fusion of nature and light elements.',
    family: 'nature-collection',
    spriteId: 'meadow_nature_light'
  },
  {
    id: 'island_slime',
    name: 'Island Slime',
    elements: ['water', 'earth'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A isolated fusion of water and earth elements.',
    family: 'nature-collection',
    spriteId: 'island_water_earth'
  },
  {
    id: 'bamboo_slime',
    name: 'Bamboo Slime',
    elements: ['plant', 'metal'],
    rarityTier: 'Uncommon',
    weight: 60,
    description: 'A strong fusion of plant and metal elements.',
    family: 'nature-collection',
    spriteId: 'bamboo_plant_metal'
  }
];

// Combine all slimes for easy access
export const ALL_CODEX_SLIMES: CodexSlime[] = [
  ...PRIMAL_SLIMES,
  ...CONFECTIONARY_SLIMES,
  ...DISASTER_SLIMES,
  ...BIOME_SLIMES,
  ...MYTHICAL_SLIMES
];

// Create lookup map for quick access
export const SLIME_CODEX_MAP = new Map<string, CodexSlime>(
  ALL_CODEX_SLIMES.map(slime => [slime.id, slime])
);
