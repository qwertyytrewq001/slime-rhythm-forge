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
export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Supreme';

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
  breedHistory: BreedResult[];
  achievements: Achievement[];
  mutationJuiceActive: boolean;
  totalBreeds: number;
  perfectTaps: number;
  muted: boolean;
  bestRarity: number;
  discoveredModels: number[];
  discoveredElements: string[];
}

export type GameAction =
  | { type: 'ADD_SLIME'; slime: Slime }
  | { type: 'SELECT_SLIME'; id: string | null }
  | { type: 'SET_BREED_SLOT'; slot: 1 | 2; id: string | null }
  | { type: 'CLEAR_BREED_SLOTS' }
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
  | { type: 'CLEAR_NEW_BADGE'; slimeId: string };
