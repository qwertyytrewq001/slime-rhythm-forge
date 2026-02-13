import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { GameState, GameAction, Achievement } from '@/types/slime';
import { createStarterSlimes } from '@/utils/slimeGenerator';
import { saveGame, loadGame } from '@/utils/gameStorage';
import { audioEngine } from '@/utils/audioEngine';

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_fusion', name: 'First Fusion', description: 'Breed your first slime', reward: '50 goo', rewardAmount: 50, unlocked: false },
  { id: 'rare_find', name: 'Rare Find', description: 'Obtain a 3★+ slime', reward: 'Free Mutation Juice', rewardAmount: 0, unlocked: false },
  { id: 'slime_hoarder', name: 'Slime Hoarder', description: 'Collect 20 slimes', reward: '200 goo', rewardAmount: 200, unlocked: false },
  { id: 'mythic_hunter', name: 'Mythic Hunter', description: 'Obtain a 5★ Mythic slime', reward: '500 goo + Crown', rewardAmount: 500, unlocked: false },
  { id: 'rhythm_master', name: 'Rhythm Master', description: 'Hit 10 perfect rhythm taps in a row', reward: '100 goo', rewardAmount: 100, unlocked: false },
];

function createInitialState(): GameState {
  const saved = loadGame();
  if (saved && saved.slimes && saved.slimes.length > 0) {
    return {
      slimes: saved.slimes,
      goo: saved.goo ?? 0,
      selectedSlimeId: null,
      breedSlot1: null,
      breedSlot2: null,
      breedHistory: saved.breedHistory ?? [],
      achievements: saved.achievements ?? DEFAULT_ACHIEVEMENTS,
      mutationJuiceActive: saved.mutationJuiceActive ?? false,
      totalBreeds: saved.totalBreeds ?? 0,
      perfectTaps: saved.perfectTaps ?? 0,
      muted: saved.muted ?? false,
    };
  }
  return {
    slimes: createStarterSlimes(),
    goo: 10,
    selectedSlimeId: null,
    breedSlot1: null,
    breedSlot2: null,
    breedHistory: [],
    achievements: DEFAULT_ACHIEVEMENTS,
    mutationJuiceActive: false,
    totalBreeds: 0,
    perfectTaps: 0,
    muted: false,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_SLIME':
      return { ...state, slimes: [...state.slimes, action.slime] };
    case 'SELECT_SLIME':
      return { ...state, selectedSlimeId: action.id };
    case 'SET_BREED_SLOT':
      return action.slot === 1
        ? { ...state, breedSlot1: action.id }
        : { ...state, breedSlot2: action.id };
    case 'CLEAR_BREED_SLOTS':
      return { ...state, breedSlot1: null, breedSlot2: null };
    case 'ADD_GOO':
      return { ...state, goo: Math.round((state.goo + action.amount) * 100) / 100 };
    case 'SPEND_GOO':
      return { ...state, goo: Math.max(0, Math.round((state.goo - action.amount) * 100) / 100) };
    case 'ACTIVATE_MUTATION_JUICE':
      return { ...state, mutationJuiceActive: true };
    case 'DEACTIVATE_MUTATION_JUICE':
      return { ...state, mutationJuiceActive: false };
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.id === action.id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        ),
      };
    case 'ADD_BREED_HISTORY':
      return {
        ...state,
        breedHistory: [action.result, ...state.breedHistory].slice(0, 5),
      };
    case 'INCREMENT_BREEDS':
      return { ...state, totalBreeds: state.totalBreeds + 1 };
    case 'INCREMENT_PERFECT_TAPS':
      return { ...state, perfectTaps: state.perfectTaps + 1 };
    case 'RESET_PERFECT_TAPS':
      return { ...state, perfectTaps: 0 };
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted };
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    case 'BOOST_TRAIT': {
      const slimes = state.slimes.map(s => {
        if (s.id !== action.slimeId) return s;
        const traits = { ...s.traits };
        const key = action.trait;
        if (key === 'size') {
          traits[key] = Math.min(2.0, Math.round((traits[key] + (Math.random() - 0.3) * 0.4) * 10) / 10);
        } else {
          const maxes: Record<string, number> = { shape: 14, color1: 19, color2: 19, eyes: 14, mouth: 9, spikes: 9, pattern: 14, glow: 5, aura: 4, rhythm: 5, accessory: 10 };
          traits[key] = Math.min(maxes[key] || 14, traits[key] + Math.floor(Math.random() * 3));
        }
        return { ...s, traits };
      });
      return { ...state, slimes };
    }
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auto-save debounced
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveGame(state), 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state]);

  // Goo production ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const gooPerTick = state.slimes.reduce((sum, s) => sum + s.rarityScore * 0.1, 0) / 10; // per 100ms
      if (gooPerTick > 0) dispatch({ type: 'ADD_GOO', amount: gooPerTick });
    }, 100);
    return () => clearInterval(interval);
  }, [state.slimes]);

  // Audio mute sync
  useEffect(() => {
    if (state.muted !== audioEngine.muted) audioEngine.toggleMute();
  }, [state.muted]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState must be used within GameProvider');
  return ctx;
}
