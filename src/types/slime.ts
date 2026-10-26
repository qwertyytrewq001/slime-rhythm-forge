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

// All Elements Used in Actual Sprites
export type SlimeElement =
  | 'fire' | 'water' | 'plant' | 'earth' | 'wind'
  | 'ice' | 'electric' | 'metal' | 'light' | 'shadow';

// Rarity tiers (DML-inspired scaling)
export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Divine' | 'Ancient';

export type SlimeEvolutionStage = 'baby' | 'teen' | 'adult';

export interface Slime {
  id: string;
  // Species id in the codex. `id` is unique per bred slime, so anything that needs the
  // species (sprite, lore, codex discovery) must use codexId, not id.
  codexId?: string;
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
  claimed: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
}

export interface BattleSlime extends Slime {
  battleStats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export interface BattleTurn {
  attackerId: string;
  defenderId: string;
  damage: number;
  effectiveness: 'super' | 'weak' | 'neutral';
  isCritical: boolean;
  message: string;
  remainingHp: number;
}

export interface BattleResult {
  playerTeam: Slime[];
  opponentTeam: Slime[];
  winner: 'player' | 'opponent';
  gooReward: number;
  xpReward: number;
  levelReached: number;
}

export interface GameStats {
  battlesWon: number;
  bossesDefeated: number;
  harvests: number;
  goldenHarvests: number;
  feeds: number;
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
  pendingHabitatPlacement: {
    element: SlimeElement;
  } | null;
  lastEvolution: {
    slimeId: string;
    stage: SlimeEvolutionStage;
    timestamp: number;
  } | null;
  lastLevelUp: {
    slimeId: string;
    slimeName: string;
    oldLevel: number;
    newLevel: number;
    timestamp: number;
  } | null;
  lastPlayerLevelUp: {
    level: number;
    timestamp: number;
  } | null;
  currentLevel: number; // For battle map progression
  tutorialCompleted: boolean;
  completedTutorialChapters: string[];
  inventory: Record<SlimeFoodType, number>;
  floorFood: Array<{ id: string; x: number; y: number; foodId: SlimeFoodType; timestamp: number }>;
  farmPlots: FarmPlot[];
  farm: FarmState;
  seeds: Record<SlimeFoodType, number>;
  stats: GameStats;
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
    name: 'Glimberries',
    description: 'Sweet little berries that glow faintly at dusk. Grown from Glimberry seeds.',
    cost: 20, // Increased from 5 to 20
    xpValue: 10,
    icon: '🍓',
  },
  elemental: {
    id: 'elemental',
    name: 'Moonpetal Honey',
    description: 'Golden honey made from Moonpetal Blossoms. A significant energy boost.',
    cost: 50, // Increased from 20 to 50
    xpValue: 55,
    icon: '🍯',
  },
  royal: {
    id: 'royal',
    name: 'Starfruit',
    description: 'A fruit that only ripens once the stars align. Wildly potent.',
    cost: 100,
    xpValue: 350,
    icon: '⭐',
  },
};

export interface CropInfo {
  name: string;
  icon: string;
  description: string;
}

export const CROP_INFO: Record<SlimeFoodType, CropInfo> = {
  basic: { name: 'Glimberries', icon: '🫐', description: 'Sweet little berries that glow faintly at dusk.' },
  elemental: { name: 'Moonpetal Blossom', icon: '🌼', description: 'A rare flowering herb that hums with quiet magic. Its nectar is turned into honey.' },
  royal: { name: 'Starfruit Vine', icon: '🍇', description: 'A vine that only fruits once the stars align. Wildly potent.' },
};

export interface FarmPlot {
  id: number;
  unlocked: boolean;
  cropType: SlimeFoodType | null;
  plantedAt: number | null;
  readyAt: number | null;
  watered?: boolean; // watered once this growth (a small speed-up)
  lastCrop?: SlimeFoodType | null; // what Auto-replant plants again
}

export interface FarmState {
  level: number;
  xp: number;
  autoReplant: boolean;
}

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
  | { type: 'CLAIM_ACHIEVEMENT'; id: string }
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
  | { type: 'START_HABITAT_PLACEMENT'; element: SlimeElement }
  | { type: 'PLACE_HABITAT_IN_SLOT'; element: SlimeElement; gridX: number; gridY: number }
  | { type: 'CANCEL_HABITAT_PLACEMENT' }
  | { type: 'ASSIGN_SLIME_TO_HABITAT'; habitatId: string; slimeId: string }
  | { type: 'REMOVE_SLIME_FROM_HABITAT'; habitatId: string; slimeId: string }
  | { type: 'FEED_SLIME_XP'; slimeId: string; foodType: SlimeFoodType }
  | { type: 'CLEAR_EVOLUTION' }
  | { type: 'CLEAR_LEVEL_UP' }
  | { type: 'CLEAR_PLAYER_LEVEL_UP' }
  | { type: 'BATTLE_REWARD'; result: BattleResult }
  | { type: 'SET_CURRENT_LEVEL'; level: number }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'COMPLETE_TUTORIAL_CHAPTER'; chapterId: string }
  | { type: 'ADD_TO_INVENTORY'; foodType: SlimeFoodType; quantity: number }
  | { type: 'REMOVE_FROM_INVENTORY'; foodType: SlimeFoodType; quantity: number }
  | { type: 'ADD_FLOOR_FOOD'; id: string; x: number; y: number; foodId: SlimeFoodType }
  | { type: 'REMOVE_FLOOR_FOOD'; id: string }
  | { type: 'SLIME_EAT_FOOD'; slimeId: string; foodId: string }
  | { type: 'SPEED_UP_HATCHING' }
  | { type: 'UNLOCK_FARM_PLOT'; plotId: number }
  | { type: 'PLANT_CROP'; plotId: number; cropType: SlimeFoodType }
  | { type: 'PLANT_ALL'; cropType: SlimeFoodType }
  | { type: 'HARVEST_CROP'; plotId: number; rolls?: [number, number] }
  | { type: 'HARVEST_ALL'; rolls?: Array<[number, number]> }
  | { type: 'WATER_PLOT'; plotId: number }
  | { type: 'WATER_ALL' }
  | { type: 'RUSH_PLOT'; plotId: number }
  | { type: 'SET_AUTO_REPLANT'; value: boolean };
