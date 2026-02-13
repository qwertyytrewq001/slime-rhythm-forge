import { SlimeElement } from '@/types/slime';

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
  'Diamond', 'Galaxy', 'Spiral', 'Cat', 'Sleepy',
  'Angry', 'Happy', 'Wink', 'Dizzy', 'Void',
];

export const MOUTH_NAMES = [
  'Smile', 'Frown', 'Open', 'Fang', ':3',
  'Tongue', 'Whistle', 'Zigzag', 'O', 'Flat',
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
export const ELEMENT_NAMES: Record<SlimeElement, string> = {
  earth: '🌿 Earth', fire: '🔥 Fire', ice: '❄️ Ice', cosmic: '🌌 Cosmic', bio: '🌸 Bio',
};
export const ELEMENT_ICONS: Record<SlimeElement, string> = {
  earth: '🌿', fire: '🔥', ice: '❄️', cosmic: '🌌', bio: '🌸',
};

export const ACCESSORY_NAMES = [
  'None', 'Hat', 'Crown', 'Bow', 'Glasses',
  'Wings', 'Horns', 'Halo', 'Scarf', 'Flower', 'Monocle',
];

// Rarity weights: higher index = rarer for most traits
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

// Element combo rarity bonuses
export const ELEMENT_COMBO_BONUS: Record<string, number> = {
  'fire+cosmic': 20,
  'cosmic+fire': 20,
  'ice+fire': 15,
  'fire+ice': 15,
  'earth+bio': 10,
  'bio+earth': 10,
  'cosmic+ice': 15,
  'ice+cosmic': 15,
};

// Size rarity: further from 1.0 = rarer
export function getSizeRarity(size: number): number {
  return Math.round(Math.abs(size - 1.0) * 10);
}

// Derive element from color + shape traits
export function deriveElement(color1: number, shape: number): SlimeElement {
  // Earth: greens/browns (colors 0,7,14), nature shapes
  if ([0, 7, 14].includes(color1) || [9, 11].includes(shape)) return 'earth';
  // Fire: reds/oranges (colors 3,6,11), aggressive shapes
  if ([3, 6, 11, 10].includes(color1) || [2, 5].includes(shape)) return 'fire';
  // Ice: blues/cyans (colors 1,5,13), crystal shapes
  if ([1, 5, 13].includes(color1) || [14, 6].includes(shape)) return 'ice';
  // Cosmic: purples/golds (colors 4,9,19,18), star/diamond shapes
  if ([4, 9, 19, 18].includes(color1) || [4, 13].includes(shape)) return 'cosmic';
  // Bio: pinks/pastels
  return 'bio';
}

// Element colors for particle effects
export const ELEMENT_COLORS: Record<SlimeElement, string[]> = {
  earth: ['#6B8E23', '#8FBC8F', '#556B2F', '#90EE90'],
  fire: ['#FF4500', '#FF6347', '#FFD700', '#FF8C00'],
  ice: ['#87CEEB', '#B0E0E6', '#ADD8E6', '#E0FFFF'],
  cosmic: ['#9B59B6', '#8E44AD', '#FFD700', '#E8DAEF'],
  bio: ['#FF69B4', '#FFC0CB', '#90EE90', '#FFB6C1'],
};

// Name generation parts
export const NAME_ADJECTIVES: Record<string, string[]> = {
  pattern: ['', 'Dotted', 'Striped', 'Checkered', 'Swirly', 'Diamond', 'Starry', 'Lovely', 'Camo', 'Cosmic', 'Void', 'Circuit', 'Scaled', 'Bubbly', 'Zigzag'],
  glow: ['', 'Glimmer', 'Shining', 'Radiant', 'Blazing', 'Prismatic'],
  aura: ['', 'Sparkle', 'Inferno', 'Frost', 'Quantum'],
};

export const NAME_DESCRIPTORS: Record<string, string[]> = {
  eyes: ['Beady', 'Wide', 'Stargazer', 'Heartful', 'Crossed', 'Gem', 'Galaxy', 'Spiral', 'Feline', 'Dreamy', 'Fierce', 'Jolly', 'Charming', 'Dizzy', 'Abyss'],
  spikes: ['', 'Spiny', 'Crystal', 'Blazing', 'Icy', 'Bony', 'Leafy', 'Zappy', 'Shadow', 'Horned'],
};

export const NAME_NOUNS = [
  'Globbius', 'Orbis', 'Spikelord', 'Cubex', 'Stellaris',
  'Diamondis', 'Lunaris', 'Hexius', 'Droplet', 'Shroomie',
  'Bellsworth', 'Cumulus', 'Amoris', 'Phantasm', 'Prismatica',
];

// Model-specific name fragments
export const MODEL_NAME_PREFIX: Record<number, string[]> = {
  0: ['Gloopy', 'Blobby', 'Squishy', 'Puffy', 'Gloopie'],
  1: ['Spike', 'Razor', 'Fang', 'Thorn', 'Barb'],
  2: ['Jelli', 'Ripple', 'Wobble', 'Oozy', 'Drippy'],
};

// Rarity prefix tiers
export const RARITY_PREFIXES: Record<number, string[]> = {
  1: ['Little', 'Tiny', 'Baby', 'Wee'],
  2: ['Young', 'Swift', 'Bold', 'Keen'],
  3: ['Storm', 'Grand', 'Noble', 'Mighty'],
  4: ['Ancient', 'Arcane', 'Sacred', 'Exalted'],
  5: ['Eldritch', 'Mythic', 'Eternal', 'Celestial'],
};

export const RARITY_SUFFIXES: Record<number, string[]> = {
  1: [],
  2: [],
  3: ['the Brave', 'the Bold'],
  4: ['the Ancient', 'Prime', 'the Exalted'],
  5: ['the Eternal', 'the Infinite', 'Omega', 'the Legendary'],
};
