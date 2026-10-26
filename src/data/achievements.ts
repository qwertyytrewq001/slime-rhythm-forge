import { Achievement, GameState, GameStats } from '@/types/slime';
import { TOTAL_PLOTS } from '@/utils/farmCore';

export type AchievementCategory = 'Collection' | 'Breeding' | 'Growth' | 'Sanctuary' | 'Battle' | 'Farm';

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'Collection', 'Breeding', 'Growth', 'Sanctuary', 'Battle', 'Farm',
];

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rewardAmount: number; // goo
  target: number;
  // Current progress toward `target` (the UI caps it at the target)
  progress: (state: GameState) => number;
}

export const DEFAULT_STATS: GameStats = {
  battlesWon: 0,
  bossesDefeated: 0,
  harvests: 0,
  goldenHarvests: 0,
  feeds: 0,
};

const speciesOwned = (s: GameState) => new Set(s.slimes.map(x => x.codexId ?? x.name)).size;
const elementsOwned = (s: GameState) => new Set(s.slimes.flatMap(x => x.elements)).size;
const highestLevel = (s: GameState) => s.slimes.reduce((m, x) => Math.max(m, x.level), 0);
const mostElements = (s: GameState) => s.slimes.reduce((m, x) => Math.max(m, x.elements.length), 0);
const hasTier = (s: GameState, tiers: string[]) => (s.slimes.some(x => tiers.includes(x.rarityTier)) ? 1 : 0);
const stat = (s: GameState, key: keyof GameStats) => (s.stats ?? DEFAULT_STATS)[key];

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ---- Collection ----
  { id: 'collector_5', name: 'Growing Family', description: 'Own 5 slimes', category: 'Collection', icon: '🥚', rewardAmount: 50, target: 5, progress: s => s.slimes.length },
  { id: 'collector_10', name: 'Slime Pack', description: 'Own 10 slimes', category: 'Collection', icon: '🐾', rewardAmount: 100, target: 10, progress: s => s.slimes.length },
  { id: 'slime_hoarder', name: 'Slime Hoarder', description: 'Own 20 slimes', category: 'Collection', icon: '📦', rewardAmount: 200, target: 20, progress: s => s.slimes.length },
  { id: 'collector_40', name: 'Menagerie', description: 'Own 40 slimes', category: 'Collection', icon: '🏰', rewardAmount: 500, target: 40, progress: s => s.slimes.length },
  { id: 'species_5', name: 'Field Guide', description: 'Own 5 different species', category: 'Collection', icon: '📖', rewardAmount: 100, target: 5, progress: speciesOwned },
  { id: 'species_15', name: 'Naturalist', description: 'Own 15 different species', category: 'Collection', icon: '🔬', rewardAmount: 300, target: 15, progress: speciesOwned },
  { id: 'species_30', name: 'Master Naturalist', description: 'Own 30 different species', category: 'Collection', icon: '🧭', rewardAmount: 800, target: 30, progress: speciesOwned },
  { id: 'elements_5', name: 'Elementalist', description: 'Own slimes of 5 different elements', category: 'Collection', icon: '🌈', rewardAmount: 150, target: 5, progress: elementsOwned },
  { id: 'elements_10', name: 'Master of Elements', description: 'Own slimes of all 10 elements', category: 'Collection', icon: '🌟', rewardAmount: 600, target: 10, progress: elementsOwned },
  { id: 'rare_find', name: 'Rare Find', description: 'Own a Rare or better slime', category: 'Collection', icon: '💎', rewardAmount: 150, target: 1, progress: s => hasTier(s, ['Rare', 'Epic', 'Legendary', 'Divine', 'Ancient']) },
  { id: 'mythic_hunter', name: 'Legendary Hunter', description: 'Own a Legendary slime', category: 'Collection', icon: '👑', rewardAmount: 500, target: 1, progress: s => hasTier(s, ['Legendary', 'Divine', 'Ancient']) },

  // ---- Breeding ----
  { id: 'first_fusion', name: 'First Fusion', description: 'Breed your first slime', category: 'Breeding', icon: '🧬', rewardAmount: 50, target: 1, progress: s => s.totalBreeds },
  { id: 'breeder_5', name: 'Apprentice Breeder', description: 'Breed 5 times', category: 'Breeding', icon: '🔮', rewardAmount: 100, target: 5, progress: s => s.totalBreeds },
  { id: 'breeder_25', name: 'Seasoned Breeder', description: 'Breed 25 times', category: 'Breeding', icon: '⚗️', rewardAmount: 400, target: 25, progress: s => s.totalBreeds },
  { id: 'breeder_100', name: 'Altar Master', description: 'Breed 100 times', category: 'Breeding', icon: '🏺', rewardAmount: 1500, target: 100, progress: s => s.totalBreeds },
  { id: 'triple_threat', name: 'Triple Threat', description: 'Own a slime with 3 or more elements', category: 'Breeding', icon: '🔱', rewardAmount: 250, target: 3, progress: mostElements },

  // ---- Growth ----
  { id: 'coming_of_age', name: 'Coming of Age', description: 'Raise a slime to Adult (level 10)', category: 'Growth', icon: '🌱', rewardAmount: 100, target: 10, progress: highestLevel },
  { id: 'seasoned', name: 'Seasoned', description: 'Raise a slime to level 25', category: 'Growth', icon: '⭐', rewardAmount: 300, target: 25, progress: highestLevel },
  { id: 'peak_form', name: 'Peak Form', description: 'Raise a slime to the maximum level (50)', category: 'Growth', icon: '🏆', rewardAmount: 1000, target: 50, progress: highestLevel },
  { id: 'well_fed', name: 'Well Fed', description: 'Feed your slimes 10 times', category: 'Growth', icon: '🍓', rewardAmount: 50, target: 10, progress: s => stat(s, 'feeds') },
  { id: 'master_chef', name: 'Master Chef', description: 'Feed your slimes 100 times', category: 'Growth', icon: '🍯', rewardAmount: 250, target: 100, progress: s => stat(s, 'feeds') },

  // ---- Sanctuary ----
  { id: 'first_sanctuary', name: 'Home Sweet Home', description: 'Build your first Sanctuary', category: 'Sanctuary', icon: '🏡', rewardAmount: 75, target: 1, progress: s => s.habitats.length },
  { id: 'sanctuary_4', name: 'Little Village', description: 'Build 4 Sanctuaries', category: 'Sanctuary', icon: '🏘️', rewardAmount: 200, target: 4, progress: s => s.habitats.length },
  { id: 'sanctuary_8', name: 'Haven', description: 'Build 8 Sanctuaries', category: 'Sanctuary', icon: '🏞️', rewardAmount: 500, target: 8, progress: s => s.habitats.length },

  // ---- Battle ----
  { id: 'first_blood', name: 'First Blood', description: 'Win your first battle', category: 'Battle', icon: '⚔️', rewardAmount: 50, target: 1, progress: s => stat(s, 'battlesWon') },
  { id: 'win_10', name: 'Veteran', description: 'Win 10 battles', category: 'Battle', icon: '🛡️', rewardAmount: 150, target: 10, progress: s => stat(s, 'battlesWon') },
  { id: 'win_50', name: 'Champion', description: 'Win 50 battles', category: 'Battle', icon: '🥇', rewardAmount: 600, target: 50, progress: s => stat(s, 'battlesWon') },
  { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat a boss (every 5th battle level)', category: 'Battle', icon: '💀', rewardAmount: 200, target: 1, progress: s => stat(s, 'bossesDefeated') },
  { id: 'warlord', name: 'Warlord', description: 'Defeat 5 bosses', category: 'Battle', icon: '🔥', rewardAmount: 600, target: 5, progress: s => stat(s, 'bossesDefeated') },
  { id: 'into_the_fray', name: 'Into the Fray', description: "Clear battle level 15 and face Voss's first challenge", category: 'Battle', icon: '🗡️', rewardAmount: 300, target: 16, progress: s => s.currentLevel },
  { id: 'castle_gates', name: 'Castle Gates', description: 'Clear battle level 45', category: 'Battle', icon: '🏯', rewardAmount: 800, target: 46, progress: s => s.currentLevel },
  { id: 'restorer', name: 'The Restorer', description: 'Clear the final battle (level 50)', category: 'Battle', icon: '✨', rewardAmount: 2000, target: 51, progress: s => s.currentLevel },

  // ---- Farm ----
  { id: 'green_thumb', name: 'Green Thumb', description: 'Harvest your first crop', category: 'Farm', icon: '🌾', rewardAmount: 50, target: 1, progress: s => stat(s, 'harvests') },
  { id: 'harvest_25', name: 'Bountiful', description: 'Harvest 25 crops', category: 'Farm', icon: '🧺', rewardAmount: 200, target: 25, progress: s => stat(s, 'harvests') },
  { id: 'harvest_100', name: 'Harvest Hero', description: 'Harvest 100 crops', category: 'Farm', icon: '🌽', rewardAmount: 600, target: 100, progress: s => stat(s, 'harvests') },
  { id: 'farm_level_5', name: 'Seasoned Farmer', description: 'Reach Farm Level 5', category: 'Farm', icon: '🧑‍🌾', rewardAmount: 250, target: 5, progress: s => s.farm?.level ?? 1 },
  { id: 'golden_5', name: 'Golden Touch', description: 'Harvest 5 golden crops', category: 'Farm', icon: '🌟', rewardAmount: 300, target: 5, progress: s => stat(s, 'goldenHarvests') },
  { id: 'farm_level_10', name: 'Farm Tycoon', description: 'Reach Farm Level 10', category: 'Farm', icon: '🏡', rewardAmount: 800, target: 10, progress: s => s.farm?.level ?? 1 },
  { id: 'farm_full', name: 'Master Farmer', description: 'Unlock every farm plot', category: 'Farm', icon: '🚜', rewardAmount: 1000, target: TOTAL_PLOTS, progress: s => s.farmPlots.filter(p => p.unlocked).length },
];

const stateFromDef = (def: AchievementDef, saved?: Partial<Achievement>): Achievement => ({
  id: def.id,
  name: def.name,
  description: def.description,
  reward: `${def.rewardAmount} goo`,
  rewardAmount: def.rewardAmount,
  unlocked: saved?.unlocked ?? false,
  unlockedAt: saved?.unlockedAt,
  claimed: saved?.claimed ?? false,
});

export function createAchievementState(): Achievement[] {
  return ACHIEVEMENT_DEFS.map(def => stateFromDef(def));
}

// Keep players' unlocked/claimed progress, pick up new/renamed achievements from the
// definitions, and drop ones that no longer exist (e.g. the old rhythm achievement).
export function mergeAchievements(saved?: Achievement[]): Achievement[] {
  const byId = new Map((saved ?? []).map(a => [a.id, a]));
  return ACHIEVEMENT_DEFS.map(def => stateFromDef(def, byId.get(def.id)));
}
