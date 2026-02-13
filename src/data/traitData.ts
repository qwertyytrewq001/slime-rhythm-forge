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
};

// Size rarity: further from 1.0 = rarer
export function getSizeRarity(size: number): number {
  return Math.round(Math.abs(size - 1.0) * 10);
}

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
