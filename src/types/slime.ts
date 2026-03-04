export interface SlimeTraits {
  shape: number;      // 0-14
  color1: number;     // 0-19
  color2: number;     // 0-19
  eyes: number;       // 0-14
  mouth: number;      // 0-9
  spikes: number;     // 0-9
  pattern: number;    // 0-14
  glow: number;       // 0-5
  size: number;       // 0.5-2.0
  aura: number;       // 0-4
  rhythm: number;     // 0-5
  accessory: number;  // 0-10
  model: number;      // 0=Blob, 1=Spiky, 2=Jelly
}

// 18 Dragon Mania Legends-inspired elements
export type SlimeElement =
  | 'fire' | 'water' | 'plant' | 'earth' | 'wind'
  | 'ice' | 'electric' | 'metal' | 'light' | 'shadow'
  | 'cosmic' | 'void' | 'toxic' | 'crystal' | 'lava'
  | 'nature' | 'arcane' | 'divine';

// Rarity tiers (DML-inspired scaling)
export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Divine' | 'Ancient';

export type SlimeEvolutionStage = 'baby' | 'teen' | 'adult';

export interface Slime {
  id: string;
  name: string;
  traits: SlimeTraits;
  elements: SlimeElement[];  // 1-4 elements (multi-element hybrids!)
  element: SlimeElement;     // Primary element (first in array, backward compat)
  rarityScore: number;
  rarityStars: number;
  rarityTier: RarityTier;
  createdAt: number;
  parentIds?: [string, string];
  isNew?: boolean;
  level: number;
  xp: number;
}

export interface Habitat {
  id: string;
  element: SlimeElement;
  gridX: number;
  gridY: number;
  assignedSlimeIds: string[];
  capacity: number;
}

export interface BreedResult {
  parent1Id: string;
  parent2Id: string;
  childId: string;
  timestamp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: string;
  rewardAmount: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
}

export interface GameState {
  slimes: Slime[];
  goo: number;
  selectedSlimeId: string | null;
  breedSlot1: string | null;
  breedSlot2: string | null;
  activeBreeding: {
    parent1Id: string;
    parent2Id: string;
    endTime: number;
    resultSlime: Slime; // The slime that will be born
  } | null;
  activeHatching: {
    slime: Slime;
    endTime: number;
  } | null;
  breedHistory: BreedResult[];
  achievements: Achievement[];
  mutationJuiceActive: boolean;
  totalBreeds: number;
  perfectTaps: number;
  muted: boolean;
  bestRarity: number;
  discoveredModels: number[];
  discoveredElements: string[];
  habitats: Habitat[];
  happiness: Record<string, number>;
  lastEvolution: {
    slimeId: string;
    stage: SlimeEvolutionStage;
    timestamp: number;
  } | null;
}

export type SlimeFoodType = 'basic' | 'elemental' | 'royal';

export interface SlimeFood {
  id: SlimeFoodType;
  name: string;
  description: string;
  cost: number;
  xpValue: number;
  icon: string;
}

export const SLIME_FOODS: Record<SlimeFoodType, SlimeFood> = {
  basic: {
    id: 'basic',
    name: 'Sun-Ripened Berries',
    description: 'Freshly foraged berries bursting with natural sweetness. A simple, wholesome snack.',
    cost: 5,
    xpValue: 10,
    icon: '🍓',
  },
  elemental: {
    id: 'elemental',
    name: 'Wildflower Honey',
    description: 'Pure, golden nectar collected from rare spirit blooms. Provides a significant energy boost.',
    cost: 20,
    xpValue: 55,
    icon: '🍯',
  },
  royal: {
    id: 'royal',
    name: 'Enchanted Dragonfruit',
    description: 'A legendary fruit that grows once a century. Radiates powerful energy that accelerates evolution.',
    cost: 100,
    xpValue: 350,
    icon: '🌵',
  },
};

export type GameAction =
  | { type: 'ADD_SLIME'; slime: Slime }
  | { type: 'SELECT_SLIME'; id: string | null }
  | { type: 'SET_BREED_SLOT'; slot: 1 | 2; id: string | null }
  | { type: 'CLEAR_BREED_SLOTS' }
  | { type: 'START_BREEDING'; ritual: { parent1Id: string; parent2Id: string; endTime: number; resultSlime: Slime } }
  | { type: 'COLLECT_EGG' }
  | { type: 'START_HATCHING'; slime: Slime; duration: number }
  | { type: 'FINISH_HATCHING' }
  | { type: 'ADD_GOO'; amount: number }
  | { type: 'SPEND_GOO'; amount: number }
  | { type: 'ACTIVATE_MUTATION_JUICE' }
  | { type: 'DEACTIVATE_MUTATION_JUICE' }
  | { type: 'UNLOCK_ACHIEVEMENT'; id: string }
  | { type: 'ADD_BREED_HISTORY'; result: BreedResult }
  | { type: 'INCREMENT_BREEDS' }
  | { type: 'INCREMENT_PERFECT_TAPS' }
  | { type: 'RESET_PERFECT_TAPS' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'LOAD_STATE'; state: Partial<GameState> }
  | { type: 'BOOST_TRAIT'; slimeId: string; trait: keyof SlimeTraits }
  | { type: 'SET_BEST_RARITY'; score: number }
  | { type: 'ADD_DISCOVERED_MODEL'; model: number }
  | { type: 'ADD_DISCOVERED_ELEMENT'; element: string }
  | { type: 'CLEAR_NEW_BADGE'; slimeId: string }
  | { type: 'BUY_HABITAT'; element: SlimeElement }
  | { type: 'ASSIGN_SLIME_TO_HABITAT'; habitatId: string; slimeId: string }
  | { type: 'REMOVE_SLIME_FROM_HABITAT'; habitatId: string; slimeId: string }
  | { type: 'FEED_SLIME_XP'; slimeId: string; foodType: SlimeFoodType }
  | { type: 'CLEAR_EVOLUTION' };
