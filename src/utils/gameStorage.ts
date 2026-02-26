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
      totalBreeds: state.totalBreeds,
      perfectTaps: state.perfectTaps,
      muted: state.muted,
      bestRarity: state.bestRarity,
      discoveredModels: state.discoveredModels,
      discoveredElements: state.discoveredElements,
      habitats: state.habitats,
      happiness: state.happiness,
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
