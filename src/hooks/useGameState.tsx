import React, { createContext, useContext, useReducer, useEffect, useRef, useMemo } from 'react';
import { GameState, GameAction, Achievement, SlimeElement, Habitat, SlimeEvolutionStage, Slime, SLIME_FOODS, SlimeFoodType } from '@/types/slime';
import { createStarterSlimes } from '@/utils/slimeGenerator';
import { saveGame, loadGame } from '@/utils/gameStorage';
import { deriveElement, deriveSecondaryElement, getRarityTier, RARITY_TIER_STARS, getPlayerLevel } from '@/data/traitData';
import { audioEngine } from '@/utils/audioEngine';

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_fusion', name: 'First Fusion', description: 'Breed your first slime', reward: '50 goo', rewardAmount: 50, unlocked: false, claimed: false },
  { id: 'rare_find', name: 'Rare Find', description: 'Obtain a Rare+ slime', reward: '50 goo', rewardAmount: 50, unlocked: false, claimed: false },
  { id: 'slime_hoarder', name: 'Slime Hoarder', description: 'Collect 20 slimes', reward: '200 goo', rewardAmount: 200, unlocked: false, claimed: false },
  { id: 'mythic_hunter', name: 'Legendary Hunter', description: 'Obtain a Legendary slime', reward: '500 goo', rewardAmount: 500, unlocked: false, claimed: false },
  { id: 'rhythm_master', name: 'Rhythm Master', description: 'Hit 10 perfect rhythm taps in a row', reward: '100 goo', rewardAmount: 100, unlocked: false, claimed: false },
];

export function getStage(level: number): SlimeEvolutionStage {
  if (level < 5) return 'baby';
  if (level < 10) return 'teen';
  return 'adult';
}

function migrateRarityTier(tier: string): string {
  if (tier === 'Mythic') return 'Divine';
  if (tier === 'Supreme') return 'Ancient';
  return tier;
}

function migrateSlime(s: any): Slime {
  if (!s || typeof s !== 'object') return s;

  const rawTraits = s.traits ?? {};
  const traits = {
    shape: rawTraits.shape ?? 0,
    color1: rawTraits.color1 ?? 0,
    color2: rawTraits.color2 ?? rawTraits.color1 ?? 0,
    eyes: rawTraits.eyes ?? 0,
    mouth: rawTraits.mouth ?? 0,
    spikes: rawTraits.spikes ?? 0,
    pattern: rawTraits.pattern ?? 0,
    glow: rawTraits.glow ?? 0,
    size: rawTraits.size ?? 1.0,
    aura: rawTraits.aura ?? 0,
    rhythm: rawTraits.rhythm ?? 0,
    accessory: rawTraits.accessory ?? 0,
    model: rawTraits.model ?? 0,
  };

  const primary: SlimeElement = s.element ?? deriveElement(traits.color1, traits.shape);
  const secondary = deriveSecondaryElement(traits.spikes, traits.pattern, traits.aura, traits.glow);
  const elements: SlimeElement[] = [primary];
  if (secondary && secondary !== primary) elements.push(secondary);
  const score = s.rarityScore ?? 0;
  const tier = migrateRarityTier(s.rarityTier ?? getRarityTier(score));
  const stars = Math.min(7, RARITY_TIER_STARS[tier] ?? 1);

  return {
    ...s,
    traits,
    element: primary,
    elements: s.elements ?? elements,
    rarityTier: tier,
    rarityStars: stars,
    level: s.level ?? 1,
    xp: s.xp ?? 0,
  };
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function findNextGridSlot(habitats: Habitat[]): { x: number; y: number } {
  const occupied = new Set(habitats.map(h => `${h.gridX},${h.gridY}`));
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (!occupied.has(`${x},${y}`)) return { x, y };
    }
  }
  return { x: 0, y: 0 }; // Grid full, stack
}

function createInitialState(): GameState {
  const saved = loadGame();
  if (saved && saved.slimes && saved.slimes.length > 0) {
    const migratedSlimes = saved.slimes.map(migrateSlime);
    return {
      slimes: migratedSlimes,
      goo: saved.goo ?? 0,
      selectedSlimeId: null,
      breedSlot1: null,
      breedSlot2: null,
      activeBreeding: saved.activeBreeding ?? null,
      activeHatching: saved.activeHatching ?? null,
      breedHistory: saved.breedHistory ?? [],
      achievements: saved.achievements ?? DEFAULT_ACHIEVEMENTS,
      mutationJuiceActive: saved.mutationJuiceActive ?? false,
      totalBreeds: saved.totalBreeds ?? 0,
      perfectTaps: saved.perfectTaps ?? 0,
      muted: saved.muted ?? false,
      bestRarity: saved.bestRarity ?? 0,
      discoveredModels: saved.discoveredModels ?? [],
      discoveredElements: saved.discoveredElements ?? [],
      habitats: saved.habitats ?? [],
      happiness: saved.happiness ?? {},
      lastEvolution: null,
      lastLevelUp: null,
    };
  }
  return {
    slimes: createStarterSlimes(),
    goo: 500,
    selectedSlimeId: null,
    breedSlot1: null,
    breedSlot2: null,
    activeBreeding: null,
    activeHatching: null,
    breedHistory: [],
    achievements: DEFAULT_ACHIEVEMENTS,
    mutationJuiceActive: false,
    totalBreeds: 0,
    perfectTaps: 0,
    muted: false,
    bestRarity: 0,
    discoveredModels: [0],
    discoveredElements: [],
    habitats: [],
    happiness: {},
    lastEvolution: null,
    lastLevelUp: null,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_SLIME': {
      const slime = action.slime;
      // Find available habitat
      const availableHabitat = state.habitats.find(h => 
        slime.elements.includes(h.element) && h.assignedSlimeIds.length < h.capacity
      );

      if (availableHabitat) {
        const habitats = state.habitats.map(h => {
          if (h.id === availableHabitat.id) {
            return { ...h, assignedSlimeIds: [...h.assignedSlimeIds, slime.id] };
          }
          return h;
        });
        return { ...state, slimes: [...state.slimes, slime], habitats };
      }
      return { ...state, slimes: [...state.slimes, slime] };
    }
    case 'SELECT_SLIME':
      return { ...state, selectedSlimeId: action.id };
    case 'SET_BREED_SLOT':
      return action.slot === 1
        ? { ...state, breedSlot1: action.id }
        : { ...state, breedSlot2: action.id };
    case 'CLEAR_BREED_SLOTS':
      return { ...state, breedSlot1: null, breedSlot2: null };
    case 'START_BREEDING':
      return { ...state, activeBreeding: action.ritual, breedSlot1: null, breedSlot2: null };
    case 'COLLECT_EGG':
      return { ...state, activeBreeding: null };
    case 'START_HATCHING':
      return { ...state, activeHatching: { slime: action.slime, endTime: Date.now() + action.duration } };
    case 'FINISH_HATCHING':
      return { ...state, activeHatching: null };
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
    case 'SET_BEST_RARITY':
      return { ...state, bestRarity: Math.max(state.bestRarity, action.score) };
    case 'ADD_DISCOVERED_MODEL':
      return {
        ...state,
        discoveredModels: state.discoveredModels.includes(action.model)
          ? state.discoveredModels
          : [...state.discoveredModels, action.model],
      };
    case 'ADD_DISCOVERED_ELEMENT':
      return {
        ...state,
        discoveredElements: state.discoveredElements.includes(action.element)
          ? state.discoveredElements
          : [...state.discoveredElements, action.element],
      };
    case 'CLEAR_NEW_BADGE':
      return {
        ...state,
        slimes: state.slimes.map(s => s.id === action.slimeId ? { ...s, isNew: false } : s),
      };
    case 'BOOST_TRAIT': {
      const slimes = state.slimes.map(s => {
        if (s.id !== action.slimeId) return s;
        const traits = { ...s.traits };
        const key = action.trait;
        if (key === 'size') {
          traits[key] = Math.min(2.0, Math.round((traits[key] + (Math.random() - 0.3) * 0.4) * 10) / 10);
        } else {
          const maxes: Record<string, number> = { shape: 14, color1: 19, color2: 19, eyes: 14, mouth: 9, spikes: 9, pattern: 14, glow: 5, aura: 4, rhythm: 5, accessory: 10, model: 2 };
          traits[key] = Math.min(maxes[key] || 14, traits[key] + Math.floor(Math.random() * 3));
        }
        return { ...s, traits };
      });
      return { ...state, slimes };
    }
    case 'BUY_HABITAT': {
      const slot = findNextGridSlot(state.habitats);
      const newHabitat: Habitat = {
        id: randomId(),
        element: action.element,
        gridX: slot.x,
        gridY: slot.y,
        assignedSlimeIds: [],
        capacity: 2,
      };
      return { ...state, habitats: [...state.habitats, newHabitat] };
    }
    case 'ASSIGN_SLIME_TO_HABITAT': {
      const slime = state.slimes.find(s => s.id === action.slimeId);
      const habitat = state.habitats.find(h => h.id === action.habitatId);
      
      if (!slime || !habitat) return state;
      
      // Enforce elemental match: slime must have at least one element matching habitat
      if (!slime.elements.includes(habitat.element)) return state;
      
      // Enforce capacity
      if (habitat.assignedSlimeIds.length >= habitat.capacity && !habitat.assignedSlimeIds.includes(action.slimeId)) return state;

      // Remove slime from any other habitat first
      const habitats = state.habitats.map(h => ({
        ...h,
        assignedSlimeIds: h.assignedSlimeIds.filter(id => id !== action.slimeId),
      })).map(h => {
        if (h.id === action.habitatId) {
          return { ...h, assignedSlimeIds: [...new Set([...h.assignedSlimeIds, action.slimeId])] };
        }
        return h;
      });
      return { ...state, habitats };
    }
    case 'REMOVE_SLIME_FROM_HABITAT': {
      const habitats = state.habitats.map(h => {
        if (h.id === action.habitatId) {
          return { ...h, assignedSlimeIds: h.assignedSlimeIds.filter(id => id !== action.slimeId) };
        }
        return h;
      });
      return { ...state, habitats };
    }
    case 'FEED_SLIME_XP': {
      const food = SLIME_FOODS[action.foodType];
      if (state.goo < food.cost) return state;

      let evolved: { slimeId: string; stage: SlimeEvolutionStage; timestamp: number } | null = null;

      const slimes = state.slimes.map(s => {
        if (s.id !== action.slimeId) return s;
        
        let newXp = s.xp + food.xpValue;
        let newLevel = s.level;
        let xpToNext = 5 + newLevel * 3;
        let didLevelUp = false;

        const oldStage = getStage(newLevel);

        while (newXp >= xpToNext && newLevel < 15) {
          newXp -= xpToNext;
          newLevel++;
          xpToNext = 5 + newLevel * 3;
          didLevelUp = true;
        }

        const newStage = getStage(newLevel);
        if (newStage !== oldStage) {
          evolved = { slimeId: s.id, stage: newStage, timestamp: Date.now() };
        }

        return { ...s, level: newLevel, xp: newXp };
      });

      // Find if any slime leveled up for celebration
      const fedSlime = slimes.find(s => s.id === action.slimeId);
      const originalSlime = state.slimes.find(s => s.id === action.slimeId);
      const leveledUp = fedSlime && originalSlime && fedSlime.level > originalSlime.level 
        ? { slimeId: fedSlime.id, slimeName: fedSlime.name, oldLevel: originalSlime.level, newLevel: fedSlime.level, timestamp: Date.now() }
        : null;

      return { 
        ...state, 
        slimes, 
        goo: Math.round((state.goo - food.cost) * 100) / 100,
        lastEvolution: evolved || state.lastEvolution,
        lastLevelUp: leveledUp || state.lastLevelUp
      };
    }
    case 'CLEAR_EVOLUTION':
      return { ...state, lastEvolution: null };
    case 'CLEAR_LEVEL_UP':
      return { ...state, lastLevelUp: null };
    case 'CLEAR_PLAYER_LEVEL_UP':
      return { ...state, lastPlayerLevelUp: null };
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  playerLevel: number;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastKnownLevel = useRef<number>(0);

  const playerLevel = useMemo(() =>
    getPlayerLevel(state.totalBreeds, state.slimes.length),
    [state.totalBreeds, state.slimes.length]
  );

  // Initialize and track player level changes
  useEffect(() => {
    if (lastKnownLevel.current === 0) {
      lastKnownLevel.current = playerLevel;
      return;
    }

    if (playerLevel > lastKnownLevel.current) {
      dispatch({ 
        type: 'LOAD_STATE', 
        state: { 
          lastPlayerLevelUp: { 
            level: playerLevel, 
            timestamp: Date.now() 
          } 
        } as Partial<GameState> 
      });
      lastKnownLevel.current = playerLevel;
    }
  }, [playerLevel]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveGame(state), 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Base goo output multiplied by 1 + (level - 1) * 0.1, then cut to 20% total
      let gooPerTick = (state.slimes.reduce((sum, s) => {
        const levelMult = 1 + (s.level - 1) * 0.1;
        return sum + (s.rarityScore * 0.1 * levelMult);
      }, 0) / 10) * 0.2;

      // Habitat bonus: element-matched slimes produce 2x, also cut to 20%
      for (const habitat of state.habitats) {
        for (const slimeId of habitat.assignedSlimeIds) {
          const slime = state.slimes.find(s => s.id === slimeId);
          if (slime && slime.elements.includes(habitat.element)) {
            const levelMult = 1 + (slime.level - 1) * 0.1;
            gooPerTick += ((slime.rarityScore * 0.1 * levelMult) / 10) * 0.2; // Double their contribution
          }
        }
      }

      // Happiness bonus, cut to 20%
      for (const [slimeId, happiness] of Object.entries(state.happiness)) {
        if (happiness > 50) {
          const slime = state.slimes.find(s => s.id === slimeId);
          if (slime) {
            const levelMult = 1 + (slime.level - 1) * 0.1;
            gooPerTick += ((happiness / 100) * (slime.rarityScore * 0.05 * levelMult) / 10) * 0.2;
          }
        }
      }

      if (gooPerTick > 0) dispatch({ type: 'ADD_GOO', amount: gooPerTick });
    }, 100);
    return () => clearInterval(interval);
  }, [state.slimes, state.habitats, state.happiness]);

  useEffect(() => {
    if (state.muted !== audioEngine.muted) audioEngine.toggleMute();
  }, [state.muted]);

  return (
    <GameContext.Provider value={{ state, dispatch, playerLevel }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState must be used within GameProvider');
  return ctx;
}
