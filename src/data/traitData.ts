import { SlimeElement, RarityTier } from '@/types/slime';

// 20-color pastel/vibrant palette
export const COLOR_PALETTE = [
  '#7FFF7F', '#7FBFFF', '#FF7FBF', '#FFBF7F', '#BF7FFF',
  '#7FFFFF', '#FF7F7F', '#BFFF7F', '#FF7FFF', '#7F7FFF',
  '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
];

export const SHAPE_NAMES = [
  'Blob', 'Orb', 'Spikeball', 'Cube', 'Star',
  'Diamond', 'Crescent', 'Hex', 'Teardrop', 'Mushroom',
  'Bell', 'Cloud', 'Heart', 'Ghost', 'Crystal',
];

export const EYE_NAMES = [
  'Dot', 'Circle', 'Star', 'Heart', 'X',
  'Laser', 'Galaxy', 'Sparkle', 'Surprise', 'Sleepy',
  'Angry', 'Happy', 'Wink', 'Dizzy', 'Void',
];

export const MOUTH_NAMES = [
  'Smile', 'Frown', 'Open', 'Fang', ':3',
  'Chomp', 'Whistle', 'Zigzag', 'O', 'Flat',
];

export const SPIKE_NAMES = [
  'None', 'Small', 'Crystal', 'Fire', 'Ice',
  'Bone', 'Leaf', 'Electric', 'Shadow', 'Horn',
];

export const PATTERN_NAMES = [
  'None', 'Dots', 'Stripes', 'Checkers', 'Swirl',
  'Diamond', 'Stars', 'Hearts', 'Camo', 'Galaxy',
  'Void', 'Circuit', 'Scales', 'Bubbles', 'Zigzag',
];

export const GLOW_NAMES = ['None', 'Soft', 'Medium', 'Bright', 'Intense', 'Rainbow'];
export const AURA_NAMES = ['None', 'Sparkle', 'Flame', 'Frost', 'Quantum'];
export const MODEL_NAMES = ['Blob', 'Spiky', 'Jelly'];
export const ACCESSORY_NAMES = [
  'None', 'Hat', 'Crown', 'Bow', 'Glasses',
  'Wings', 'Horns', 'Halo', 'Scarf', 'Flower', 'Monocle',
];

// ===== 18 ELEMENTS (Dragon Mania Legends inspired) =====

export const ALL_ELEMENTS: SlimeElement[] = [
  'fire', 'water', 'plant', 'earth', 'wind',
  'ice', 'electric', 'metal', 'light', 'shadow',
  'cosmic', 'void', 'toxic', 'crystal', 'lava',
  'nature', 'arcane', 'divine',
];

export const ELEMENT_NAMES: Record<SlimeElement, string> = {
  fire: '🔥 Fire',      water: '💧 Water',    plant: '🌱 Plant',
  earth: '🪨 Earth',     wind: '🌪️ Wind',     ice: '❄️ Ice',
  electric: '⚡ Electric', metal: '⚙️ Metal',   light: '✨ Light',
  shadow: '🌑 Shadow',   cosmic: '🌌 Cosmic',  void: '🕳️ Void',
  toxic: '☠️ Toxic',     crystal: '💎 Crystal', lava: '🌋 Lava',
  nature: '🌿 Nature',   arcane: '🔮 Arcane',  divine: '👼 Divine',
};

// Clean display names without emojis
export const ELEMENT_DISPLAY_NAMES: Record<SlimeElement, string> = {
  fire: 'Fire', water: 'Water', plant: 'Plant', earth: 'Earth', wind: 'Wind',
  ice: 'Ice', electric: 'Electric', metal: 'Metal', light: 'Light', shadow: 'Shadow',
  cosmic: 'Cosmic', void: 'Void', toxic: 'Toxic', crystal: 'Crystal', lava: 'Lava',
  nature: 'Nature', arcane: 'Arcane', divine: 'Divine',
};

export const ELEMENT_ICONS: Record<SlimeElement, string> = {
  fire: '🔥', water: '💧', plant: '🌱', earth: '🪨', wind: '🌪️',
  ice: '❄️', electric: '⚡', metal: '⚙️', light: '✨', shadow: '🌑',
  cosmic: '🌌', void: '🕳️', toxic: '☠️', crystal: '💎', lava: '🌋',
  nature: '🌿', arcane: '🔮', divine: '👼',
};

// Element colors for particles and rendering
export const ELEMENT_COLORS: Record<SlimeElement, string[]> = {
  fire:     ['#FF4500', '#FF6347', '#FFD700', '#FF8C00'],
  water:    ['#4169E1', '#1E90FF', '#87CEEB', '#00CED1'],
  plant:    ['#228B22', '#32CD32', '#90EE90', '#6B8E23'],
  earth:    ['#8B4513', '#A0522D', '#DEB887', '#D2B48C'],
  wind:     ['#B0C4DE', '#E0E8F0', '#87CEEB', '#F0F8FF'],
  ice:      ['#87CEEB', '#B0E0E6', '#ADD8E6', '#E0FFFF'],
  electric: ['#FFD700', '#FFA500', '#FFFF00', '#F0E68C'],
  metal:    ['#C0C0C0', '#A9A9A9', '#808080', '#D3D3D3'],
  light:    ['#FFFACD', '#FAFAD2', '#FFD700', '#FFF8DC'],
  shadow:   ['#2F2F4F', '#483D8B', '#4B0082', '#191970'],
  cosmic:   ['#9B59B6', '#8E44AD', '#FFD700', '#E8DAEF'],
  void:     ['#0D0D0D', '#1C1C2E', '#2D1B69', '#4A0E4E'],
  toxic:    ['#00FF00', '#7FFF00', '#ADFF2F', '#9ACD32'],
  crystal:  ['#E0B0FF', '#DA70D6', '#DDA0DD', '#FF69B4'],
  lava:     ['#FF0000', '#FF4500', '#FF6600', '#CC3300'],
  nature:   ['#3CB371', '#2E8B57', '#66CDAA', '#20B2AA'],
  arcane:   ['#8A2BE2', '#9370DB', '#BA55D3', '#9400D3'],
  divine:   ['#FFD700', '#FFFFF0', '#FFF8DC', '#FAEBD7'],
};

// Element hue for background tinting
export const ELEMENT_HUE: Record<SlimeElement, number> = {
  fire: 15, water: 210, plant: 120, earth: 35, wind: 200,
  ice: 195, electric: 50, metal: 0, light: 55, shadow: 260,
  cosmic: 270, void: 280, toxic: 100, crystal: 300, lava: 10,
  nature: 140, arcane: 275, divine: 45,
};

// Element-specific model visual descriptors
export const ELEMENT_MODEL_FEATURES: Record<SlimeElement, { blob: string; spiky: string; jelly: string }> = {
  fire:     { blob: 'flame-crowned', spiky: 'flame horns', jelly: 'lava drip' },
  water:    { blob: 'bubble-coated', spiky: 'fin ridges', jelly: 'wave body' },
  plant:    { blob: 'vine-wrapped', spiky: 'thorn crown', jelly: 'moss gel' },
  earth:    { blob: 'mud-crusted', spiky: 'rock spines', jelly: 'sand flow' },
  wind:     { blob: 'breeze-puffed', spiky: 'feather spikes', jelly: 'mist form' },
  ice:      { blob: 'frost-kissed', spiky: 'crystal spikes', jelly: 'frozen gel' },
  electric: { blob: 'spark-charged', spiky: 'lightning rods', jelly: 'plasma body' },
  metal:    { blob: 'iron-plated', spiky: 'blade spines', jelly: 'mercury flow' },
  light:    { blob: 'sun-blessed', spiky: 'prism spikes', jelly: 'halo shimmer' },
  shadow:   { blob: 'shade-cloaked', spiky: 'dark thorns', jelly: 'smoke wisp' },
  cosmic:   { blob: 'star-dusted', spiky: 'meteor spikes', jelly: 'nebula body' },
  void:     { blob: 'void-touched', spiky: 'rift spines', jelly: 'warp gel' },
  toxic:    { blob: 'ooze-dripping', spiky: 'venom barbs', jelly: 'acid body' },
  crystal:  { blob: 'gem-encrusted', spiky: 'crystal horns', jelly: 'prism gel' },
  lava:     { blob: 'magma-core', spiky: 'obsidian spikes', jelly: 'molten flow' },
  nature:   { blob: 'flower-crowned', spiky: 'branch antlers', jelly: 'dew body' },
  arcane:   { blob: 'rune-marked', spiky: 'sigil spines', jelly: 'mana flow' },
  divine:   { blob: 'halo-born', spiky: 'seraph wings', jelly: 'grace body' },
};

// Breeding combo results
export const BREEDING_COMBOS: Record<string, SlimeElement[]> = {
  'fire+water': ['lava'],
  'fire+ice': ['crystal'],
  'fire+plant': ['lava', 'nature'],
  'fire+shadow': ['void'],
  'fire+void': ['shadow'],
  'fire+earth': ['lava', 'metal'],
  'fire+wind': ['electric'],
  'fire+cosmic': ['divine'],
  'water+plant': ['nature'],
  'water+ice': ['ice', 'crystal'],
  'water+electric': ['electric'],
  'water+earth': ['nature', 'plant'],
  'water+toxic': ['toxic'],
  'ice+wind': ['ice'],
  'ice+cosmic': ['crystal', 'arcane'],
  'ice+shadow': ['void'],
  'earth+plant': ['nature'],
  'earth+metal': ['metal', 'crystal'],
  'earth+fire': ['lava'],
  'wind+electric': ['electric'],
  'wind+light': ['divine'],
  'light+shadow': ['arcane', 'void'],
  'light+cosmic': ['divine'],
  'light+arcane': ['divine'],
  'shadow+void': ['void'],
  'shadow+cosmic': ['void', 'arcane'],
  'cosmic+arcane': ['divine'],
  'toxic+nature': ['toxic', 'plant'],
  'toxic+water': ['toxic'],
  'metal+electric': ['electric', 'metal'],
  'metal+crystal': ['crystal'],
  'arcane+void': ['divine', 'void'],
};

// Element combo rarity bonuses
export const ELEMENT_COMBO_BONUS: Record<string, number> = {
  'fire+void': 25,      'shadow+cosmic': 25,
  'fire+cosmic': 20,    'light+shadow': 20,
  'ice+fire': 15,       'cosmic+arcane': 20,
  'light+cosmic': 18,   'arcane+void': 22,
  'fire+ice': 15,       'water+electric': 12,
  'earth+crystal': 15,  'toxic+nature': 10,
  'lava+ice': 25,       'divine+void': 30,
  'metal+crystal': 12,  'wind+electric': 10,
};

// Rarity tier thresholds — renamed Mythic→Divine, Supreme→Ancient
export function getRarityTier(score: number): RarityTier {
  if (score >= 80) return 'Ancient';
  if (score >= 60) return 'Divine';
  if (score >= 45) return 'Legendary';
  if (score >= 30) return 'Epic';
  if (score >= 18) return 'Rare';
  if (score >= 8) return 'Uncommon';
  return 'Common';
}

export const RARITY_TIER_COLORS: Record<string, string> = {
  Common: '#A0A0A0',
  Uncommon: '#4ECDC4',
  Rare: '#4169E1',
  Epic: '#9B59B6',
  Legendary: '#FFD700',
  Divine: '#FF4500',
  Ancient: '#FF69B4',
  // Legacy compat
  Mythic: '#FF4500',
  Supreme: '#FF69B4',
};

export const RARITY_TIER_STARS: Record<string, number> = {
  Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5, Divine: 6, Ancient: 7,
  Mythic: 6, Supreme: 7,
};

// ===== PROGRESSIVE ELEMENT UNLOCKING =====

export const ELEMENT_TIERS: Record<number, SlimeElement[]> = {
  1: ['fire', 'water', 'plant', 'earth'],
  2: ['ice', 'wind', 'electric'],
  3: ['void', 'cosmic', 'light', 'shadow'],
};

export function getPlayerLevel(totalBreeds: number, slimeCount: number): number {
  return Math.floor((totalBreeds * 2 + slimeCount) / 5) + 1;
}

export function getUnlockedElements(level: number): SlimeElement[] {
  const elements: SlimeElement[] = [];
  if (level >= 1) elements.push(...ELEMENT_TIERS[1]);
  if (level >= 6) elements.push(...ELEMENT_TIERS[2]);
  if (level >= 11) elements.push(...ELEMENT_TIERS[3]);
  return elements;
}

export function getElementTierForLevel(level: number): number {
  if (level >= 11) return 3;
  if (level >= 6) return 2;
  return 1;
}

// Habitat costs per element
export const HABITAT_COSTS: Record<SlimeElement, number> = {
  fire: 100, water: 100, plant: 100, earth: 100,
  ice: 200, wind: 200, electric: 200,
  void: 400, cosmic: 400, light: 400, shadow: 400,
  metal: 250, toxic: 250, crystal: 300, lava: 300,
  nature: 150, arcane: 350, divine: 500,
};

// Habitat visual themes
export const HABITAT_THEMES: Record<SlimeElement, { bg: string; accent: string; desc: string }> = {
  fire:     { bg: '#3D1408', accent: '#FF4500', desc: 'Volcanic nest with lava cracks' },
  water:    { bg: '#082038', accent: '#4169E1', desc: 'Crystal blue pool with ripples' },
  plant:    { bg: '#0A2810', accent: '#32CD32', desc: 'Vine-covered floral dome' },
  earth:    { bg: '#2A1A08', accent: '#A0522D', desc: 'Rocky cavern with crystals' },
  ice:      { bg: '#102838', accent: '#87CEEB', desc: 'Shimmering ice cave' },
  wind:     { bg: '#1A2838', accent: '#B0C4DE', desc: 'Floating cloud platform' },
  electric: { bg: '#282008', accent: '#FFD700', desc: 'Tesla coil chamber' },
  metal:    { bg: '#1A1A1A', accent: '#C0C0C0', desc: 'Forge and anvil pit' },
  light:    { bg: '#2A2810', accent: '#FFFACD', desc: 'Sunlit crystal garden' },
  shadow:   { bg: '#0A0A1A', accent: '#483D8B', desc: 'Dark mist hollow' },
  cosmic:   { bg: '#100A28', accent: '#9B59B6', desc: 'Starfield observatory' },
  void:     { bg: '#050508', accent: '#2D1B69', desc: 'Reality rift chamber' },
  toxic:    { bg: '#0A1A08', accent: '#7FFF00', desc: 'Bubbling acid swamp' },
  crystal:  { bg: '#1A0A28', accent: '#DA70D6', desc: 'Prism geode cavern' },
  lava:     { bg: '#280808', accent: '#FF0000', desc: 'Molten core pit' },
  nature:   { bg: '#0A2018', accent: '#3CB371', desc: 'Enchanted grove' },
  arcane:   { bg: '#140A28', accent: '#8A2BE2', desc: 'Rune circle sanctum' },
  divine:   { bg: '#28280A', accent: '#FFD700', desc: 'Celestial shrine' },
};

// Rarity weights
export const TRAIT_RARITY_WEIGHTS: Record<string, number[]> = {
  shape:     [0,0,1,1,2,2,3,3,4,4,5,5,6,8,10],
  color1:    [0,0,0,0,0,1,1,1,1,1,2,2,2,3,3,4,4,5,6,8],
  color2:    [0,0,0,0,0,1,1,1,1,1,2,2,2,3,3,4,4,5,6,8],
  eyes:      [0,0,1,1,2,2,3,3,4,4,5,6,7,8,12],
  mouth:     [0,0,1,1,2,2,3,4,5,6],
  spikes:    [0,1,2,3,4,4,5,6,8,10],
  pattern:   [0,0,1,1,2,2,3,3,4,5,6,7,8,9,12],
  glow:      [0,1,3,5,8,15],
  aura:      [0,2,4,6,12],
  rhythm:    [0,0,1,2,3,5],
  accessory: [0,1,2,2,3,4,5,5,6,7,10],
  model:     [0,1,2],
};

export function getSizeRarity(size: number): number {
  return Math.round(Math.abs(size - 1.0) * 10);
}

// Derive primary element from color + shape
export function deriveElement(color1: number, shape: number): SlimeElement {
  if ([0, 7, 14].includes(color1) || shape === 9) return 'plant';
  if ([3, 6, 11, 10].includes(color1) || shape === 2) return 'fire';
  if ([1, 5, 13].includes(color1) || shape === 14) return 'ice';
  if ([4, 9, 19, 18].includes(color1) || shape === 4) return 'cosmic';
  if ([8, 16].includes(color1) || shape === 12) return 'arcane';
  if ([12, 17].includes(color1)) return 'water';
  if ([15].includes(color1) || shape === 5) return 'light';
  if (shape === 3 || shape === 7) return 'earth';
  if (shape === 13) return 'shadow';
  if (shape === 10) return 'wind';
  return 'nature';
}

// Derive secondary element from additional traits
export function deriveSecondaryElement(spikes: number, pattern: number, aura: number, glow: number): SlimeElement | null {
  if (aura === 4) return 'void';
  if (aura === 3) return 'ice';
  if (aura === 2) return 'fire';
  if (glow >= 4) return 'light';
  if (pattern === 10) return 'void';
  if (pattern === 9) return 'cosmic';
  if (pattern === 11) return 'electric';
  if (spikes >= 7) return 'shadow';
  if (spikes >= 5) return 'toxic';
  if (pattern === 8) return 'nature';
  return null;
}

// Name generation parts
export const NAME_ADJECTIVES: Record<string, string[]> = {
  pattern: ['', 'Dotted', 'Striped', 'Checkered', 'Swirly', 'Diamond', 'Starry', 'Lovely', 'Camo', 'Cosmic', 'Void', 'Circuit', 'Scaled', 'Bubbly', 'Zigzag'],
  glow: ['', 'Glimmer', 'Shining', 'Radiant', 'Blazing', 'Prismatic'],
  aura: ['', 'Sparkle', 'Inferno', 'Frost', 'Quantum'],
};

export const NAME_DESCRIPTORS: Record<string, string[]> = {
  eyes: ['Beady', 'Wide', 'Stargazer', 'Heartful', 'Crossed', 'Laser', 'Galaxy', 'Sparkle', 'Feline', 'Dreamy', 'Fierce', 'Jolly', 'Charming', 'Dizzy', 'Abyss'],
  spikes: ['', 'Spiny', 'Crystal', 'Blazing', 'Icy', 'Bony', 'Leafy', 'Zappy', 'Shadow', 'Horned'],
};

export const NAME_NOUNS = [
  'Globbius', 'Orbis', 'Spikelord', 'Cubex', 'Stellaris',
  'Diamondis', 'Lunaris', 'Hexius', 'Droplet', 'Shroomie',
  'Bellsworth', 'Cumulus', 'Amoris', 'Phantasm', 'Prismatica',
];

export const MODEL_NAME_PREFIX: Record<number, string[]> = {
  0: ['Gloopy', 'Blobby', 'Squishy', 'Puffy', 'Gloopie'],
  1: ['Spike', 'Razor', 'Fang', 'Thorn', 'Barb'],
  2: ['Jelli', 'Ripple', 'Wobble', 'Oozy', 'Drippy'],
};

// Element-specific name fragments
export const ELEMENT_NAME_FRAGMENTS: Record<SlimeElement, string[]> = {
  fire: ['Blaze', 'Ember', 'Scorch', 'Inferno', 'Cinder'],
  water: ['Tide', 'Splash', 'Torrent', 'Marina', 'Aqua'],
  plant: ['Sprout', 'Bloom', 'Thorn', 'Fern', 'Petal'],
  earth: ['Boulder', 'Quake', 'Terra', 'Stone', 'Granite'],
  wind: ['Gale', 'Zephyr', 'Breeze', 'Tempest', 'Cyclone'],
  ice: ['Frost', 'Glacier', 'Shard', 'Flurry', 'Cryo'],
  electric: ['Volt', 'Spark', 'Thunder', 'Surge', 'Arc'],
  metal: ['Steel', 'Chrome', 'Iron', 'Forge', 'Anvil'],
  light: ['Lumen', 'Ray', 'Prism', 'Dawn', 'Beacon'],
  shadow: ['Shade', 'Dusk', 'Umbra', 'Gloom', 'Eclipse'],
  cosmic: ['Nova', 'Nebula', 'Pulsar', 'Quasar', 'Astral'],
  void: ['Rift', 'Abyss', 'Null', 'Warp', 'Entropy'],
  toxic: ['Venom', 'Blight', 'Plague', 'Sludge', 'Miasma'],
  crystal: ['Prism', 'Facet', 'Geode', 'Jewel', 'Opal'],
  lava: ['Magma', 'Pumice', 'Obsidian', 'Caldera', 'Basalt'],
  nature: ['Gaia', 'Sylvan', 'Grove', 'Thicket', 'Verdant'],
  arcane: ['Rune', 'Sigil', 'Mystic', 'Arcanus', 'Ether'],
  divine: ['Seraph', 'Halo', 'Sanctus', 'Celeste', 'Exaltus'],
};

export const RARITY_PREFIXES: Record<number, string[]> = {
  1: ['Little', 'Tiny', 'Baby', 'Wee'],
  2: ['Young', 'Swift', 'Bold', 'Keen'],
  3: ['Storm', 'Grand', 'Noble', 'Mighty'],
  4: ['Ancient', 'Arcane', 'Sacred', 'Exalted'],
  5: ['Eldritch', 'Mythic', 'Eternal', 'Celestial'],
  6: ['Primordial', 'Transcendent', 'Omniscient'],
  7: ['Supreme', 'Absolute', 'Infinite', 'Godslime'],
};

export const RARITY_SUFFIXES: Record<number, string[]> = {
  1: [],
  2: [],
  3: ['the Brave', 'the Bold'],
  4: ['the Ancient', 'Prime', 'the Exalted'],
  5: ['the Eternal', 'the Infinite', 'Omega', 'the Legendary'],
  6: ['Worldshaper', 'the Undying', 'Starborn'],
  7: ['the Absolute', 'God-Emperor', 'the One', 'Omnipotent'],
};
