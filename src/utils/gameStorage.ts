import { GameState } from '@/types/slime';

const STORAGE_KEY = 'rareslime-forge-save';

export function saveGame(state: GameState): void {
  try {
    const data = {
      slimes: state.slimes,
      goo: state.goo,
      breedHistory: state.breedHistory,
      achievements: state.achievements,
      mutationJuiceActive: state.mutationJuiceActive,
      luckyCharmActive: state.luckyCharmActive,
      // an egg in the incubator or a ritual in progress must survive closing the tab (the game used to lose them, and the goo spent on them)
      activeBreeding: state.activeBreeding,
      activeHatching: state.activeHatching,
      pendingHabitatPlacement: state.pendingHabitatPlacement,
      totalBreeds: state.totalBreeds,
      perfectTaps: state.perfectTaps,
      muted: state.muted,
      bestRarity: state.bestRarity,
      discoveredModels: state.discoveredModels,
      discoveredElements: state.discoveredElements,
      habitats: state.habitats,
      stats: state.stats,
      currentLevel: state.currentLevel,
      tutorialCompleted: state.tutorialCompleted,
      completedTutorialChapters: state.completedTutorialChapters,
      inventory: state.inventory,
      floorFood: state.floorFood,
      farmPlots: state.farmPlots,
      farm: state.farm,
      visitor: state.visitor,
      nextVisitAt: state.nextVisitAt,
      seeds: state.seeds,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save game:', e);
  }
}

export function loadGame(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load game:', e);
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(STORAGE_KEY);
}
