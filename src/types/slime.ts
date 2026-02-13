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
}

export interface Slime {
  id: string;
  name: string;
  traits: SlimeTraits;
  rarityScore: number;
  rarityStars: number;
  createdAt: number;
  parentIds?: [string, string];
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
  | { type: 'BOOST_TRAIT'; slimeId: string; trait: keyof SlimeTraits };
