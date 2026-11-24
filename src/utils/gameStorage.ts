import { GameState } from '@/types/slime';

const STORAGE_KEY = 'rareslime-forge-save';

let saveDisabled = false; // set while starting a new game, so the page closing does not write the old game back

export const hasSavedGame = (): boolean => { try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; } };

/** Wipes the save, the tutorial progress, the codex and the tips (not the volume settings), then reloads. */
export function startNewGame(): void {
  saveDisabled = true;
  try {
    Object.keys(localStorage).forEach(k => { if (k !== 'rs_music_vol_v2' && k !== 'rs_sfx_vol_v2') localStorage.removeItem(k); });
  } catch { /* storage blocked: nothing to wipe */ }
  location.reload();
}

export function saveGame(state: GameState): void {
  if (saveDisabled) return;
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
