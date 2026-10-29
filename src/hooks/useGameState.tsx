import React, { createContext, useContext, useReducer, useEffect, useRef, useMemo } from 'react';
import { GameState, GameAction, Achievement, SlimeElement, Habitat, SlimeEvolutionStage, Slime, SLIME_FOODS, SlimeFoodType, BreedResult, FarmPlot, FarmState } from '@/types/slime';
import { FarmSlice, createFarmPlots, createFarmState, migrateFarm, plant as farmPlant, plantAll as farmPlantAll, harvest as farmHarvest, harvestAll as farmHarvestAll, water as farmWater, waterAll as farmWaterAll, rush as farmRush, unlockPlot as farmUnlock } from '@/utils/farmCore';
import { SanctSlice, FEED_JOY, addJoy, collectAll, collectGift, normalizeHabitat, perksFrom, petHabitat, placeDecor, removeDecor, rollerFrom, tickHabitat, upgradeHabitat } from '@/utils/sanctuaryCore';
import { visitorTick, deliver as visitorDeliver } from '@/utils/visitorCore';
import { GOO_RATE } from '@/utils/gooEconomy';
import { createStarterSlimes } from '@/utils/slimeGenerator';
import { saveGame, loadGame } from '@/utils/gameStorage';
import { deriveElement, deriveSecondaryElement, getRarityTier, RARITY_TIER_STARS, getPlayerLevel, ALL_ELEMENTS } from '@/data/traitData';
import { audioEngine } from '@/utils/audioEngine';
import { CodexManager } from '@/utils/codexManager';
import { getCodexSlime } from '@/data/slimeCodex';
import { ACHIEVEMENT_DEFS, DEFAULT_STATS, createAchievementState, mergeAchievements } from '@/data/achievements';
import { toast } from '@/hooks/use-toast';

export function getStage(level: number): SlimeEvolutionStage {
  if (level < 5) return 'baby';
  if (level < 10) return 'teen';
  return 'adult';
}

// XP needed to go from this level to the next one
export function xpToNextLevel(level: number): number {
  if (level < 15) return 8 + level * 4;          // levels 1-14
  if (level < 30) return 60 + (level - 15) * 12; // levels 15-29
  return 240 + (level - 30) * 25;                // levels 30-49
}

const MAX_SLIME_LEVEL = 50;

// Single source of truth for giving a slime XP (battles, feeding, floor food).
// Also reports level-ups and evolutions so the popups can fire for every source.
export function addXp(slime: Slime, amount: number): {
  slime: Slime;
  leveledUp: GameState['lastLevelUp'];
  evolved: GameState['lastEvolution'];
} {
  const oldLevel = slime.level;
  const oldStage = getStage(oldLevel);
  let level = slime.level;
  let xp = slime.xp + amount;
  while (level < MAX_SLIME_LEVEL && xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level++;
  }
  const newStage = getStage(level);
  const now = Date.now();
  return {
    slime: { ...slime, level, xp },
    leveledUp: level > oldLevel
      ? { slimeId: slime.id, slimeName: slime.name, oldLevel, newLevel: level, timestamp: now }
      : null,
    evolved: newStage !== oldStage ? { slimeId: slime.id, stage: newStage, timestamp: now } : null,
  };
}

function returnFloorFood(inventory: any, floorFood: any): GameState['inventory'] {
  const bag = { basic: 0, elemental: 0, royal: 0, ...(inventory ?? {}) };
  if (Array.isArray(floorFood)) {
    for (const f of floorFood) if (f && f.foodId in bag) bag[f.foodId as keyof typeof bag] += 1;
  }
  return bag;
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
    codexId: s.codexId ?? getCodexSlime(s)?.id,
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
  // Support up to 100x100 grid if needed, though we primarily use array index for display
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 4; x++) {
      if (!occupied.has(`${x},${y}`)) return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

function createInitialState(): GameState {
  const saved = loadGame();
  if (saved && saved.slimes && saved.slimes.length > 0) {
    // Older saves can contain several slimes sharing one id (two eggs of the same species).
    // Give every duplicate after the first its own id so lookups by id are unambiguous.
    const seenIds = new Set<string>();
    const migratedSlimes = saved.slimes.map(migrateSlime).map((slime: Slime) => {
      if (!seenIds.has(slime.id)) {
        seenIds.add(slime.id);
        return slime;
      }
      const freshId = `${slime.codexId ?? slime.id}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      seenIds.add(freshId);
      return { ...slime, id: freshId };
    });
    return {
      slimes: migratedSlimes,
      goo: saved.goo ?? 500,
      selectedSlimeId: null,
      breedSlot1: null,
      breedSlot2: null,
      activeBreeding: saved.activeBreeding ?? null,
      activeHatching: saved.activeHatching ?? null,
      breedHistory: saved.breedHistory ?? [],
      achievements: mergeAchievements(saved.achievements),
      mutationJuiceActive: saved.mutationJuiceActive ?? false,
      totalBreeds: saved.totalBreeds ?? 0,
      perfectTaps: saved.perfectTaps ?? 0,
      muted: saved.muted ?? false,
      bestRarity: saved.bestRarity ?? 0,
      discoveredModels: saved.discoveredModels ?? [],
      discoveredElements: saved.discoveredElements ?? [],
      visitor: saved.visitor ?? null,
      nextVisitAt: saved.nextVisitAt,
      habitats: (saved.habitats ?? []).map((h: Habitat) => normalizeHabitat(h, Date.now())),
      pendingHabitatPlacement: saved.pendingHabitatPlacement ?? null,
      lastEvolution: null,
      lastLevelUp: null,
      lastPlayerLevelUp: saved.lastPlayerLevelUp ?? null,
      currentLevel: saved.currentLevel ?? 1,
      tutorialCompleted: saved.tutorialCompleted ?? false,
      completedTutorialChapters: saved.completedTutorialChapters ?? [],
      // Food left lying on a Sanctuary floor (old drag-and-drop feeding) goes back to the bag
      inventory: returnFloorFood(saved.inventory, saved.floorFood),
      floorFood: [],
      ...(() => { const m = migrateFarm(saved.farmPlots, saved.farm, saved.seeds); return { farmPlots: m.plots, farm: m.farm }; })(),
      seeds: saved.seeds ?? { basic: 0, elemental: 0, royal: 0 },
      stats: { ...DEFAULT_STATS, ...(saved.stats ?? {}) },
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
    achievements: createAchievementState(),
    mutationJuiceActive: false,
    totalBreeds: 0,
    perfectTaps: 0,
    muted: false,
    bestRarity: 0,
    discoveredModels: [0],
    discoveredElements: [],
    habitats: [],
    visitor: null,
    pendingHabitatPlacement: null,
    lastEvolution: null,
    lastLevelUp: null,
    lastPlayerLevelUp: null,
    currentLevel: 1,
    tutorialCompleted: false,
    completedTutorialChapters: [],
    inventory: { basic: 3, elemental: 0, royal: 0 },
    floorFood: [],
    farmPlots: createFarmPlots(),
    farm: createFarmState(),
    seeds: { basic: 0, elemental: 0, royal: 0 },
    stats: { ...DEFAULT_STATS },
  };
}

export interface LocalGameState {
  slimes: Slime[];
  goo: number;
  selectedSlimeId: string | null;
  breedSlot1: string | null;
  breedSlot2: string | null;
  activeBreeding: { ritual: string } | null;
  activeHatching: { slime: Slime; endTime: number } | null;
  breedHistory: BreedResult[];
  achievements: Achievement[];
  mutationJuiceActive: boolean;
  totalBreeds: number;
  perfectTaps: number;
  muted: boolean;
  bestRarity: number;
  discoveredModels: number[];
  discoveredElements: SlimeElement[];
  habitats: Habitat[];
  lastEvolution: { slimeId: string; stage: SlimeEvolutionStage } | null;
  lastLevelUp: { slimeId: string; newLevel: number } | null;
  lastPlayerLevelUp: { newLevel: number } | null;
  currentLevel: number;
  tutorialCompleted: boolean;
  completedTutorialChapters: string[];
  inventory: Record<SlimeFoodType, number>;
  floorFood: Array<{ id: string; x: number; y: number; foodId: SlimeFoodType; timestamp: number }>;
  farmPlots: FarmPlot[];
  farm: FarmState;
  seeds: Record<SlimeFoodType, number>;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BATTLE_REWARD': {
      const { result } = action;
      const isWin = result.winner === 'player';

      // Run XP through the shared helper so battle XP triggers the same
      // level-up / evolution popups as feeding does.
      let levelUp: GameState['lastLevelUp'] = null;
      let evolution: GameState['lastEvolution'] = null;
      const updatedSlimes: Slime[] = [];
      for (const s of state.slimes) {
        if (!result.playerTeam.find(ps => ps.id === s.id)) {
          updatedSlimes.push(s);
          continue;
        }
        const gained = addXp(s, result.xpReward);
        levelUp = levelUp ?? gained.leveledUp;
        evolution = evolution ?? gained.evolved;
        updatedSlimes.push(gained.slime);
      }

      const nextLevel = isWin ? Math.max(state.currentLevel, result.levelReached + 1) : state.currentLevel;

      return {
        ...state,
        slimes: updatedSlimes,
        goo: Math.round((state.goo + result.gooReward) * 100) / 100,
        currentLevel: nextLevel,
        stats: {
          ...state.stats,
          battlesWon: state.stats.battlesWon + (isWin ? 1 : 0),
          bossesDefeated: state.stats.bossesDefeated + (isWin && result.levelReached % 5 === 0 ? 1 : 0),
        },
        lastLevelUp: levelUp ?? state.lastLevelUp,
        lastEvolution: evolution ?? state.lastEvolution,
      };
    }
    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.level };
    case 'ADD_SLIME': {
      const slime = action.slime;
      
      // Discover slime in codex
      codexManager.discoverSlime(getCodexSlime(slime)?.id ?? slime.id);
      codexManager.saveState();
      
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
    case 'CLAIM_ACHIEVEMENT': {
      const ach = state.achievements.find(a => a.id === action.id);
      if (!ach || !ach.unlocked || ach.claimed) return state;
      return {
        ...state,
        goo: Math.round((state.goo + ach.rewardAmount) * 100) / 100,
        achievements: state.achievements.map(a => (a.id === action.id ? { ...a, claimed: true } : a)),
      };
    }
    case 'SPEED_UP_HATCHING':
      // Make the egg ready to crack right now (it used to be deleted, losing the slime)
      return state.activeHatching
        ? { ...state, activeHatching: { ...state.activeHatching, endTime: Date.now() } }
        : state;
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
    case 'START_HABITAT_PLACEMENT': {
      return { ...state, pendingHabitatPlacement: { element: action.element } };
    }
    case 'PLACE_HABITAT_IN_SLOT': {
      if (!state.pendingHabitatPlacement) return state;

      // The grid renders habitats by their position in state.habitats, not by
      // stored gridX/gridY, so the clicked slot's computed gridX/gridY is only
      // a UI concept and can collide with an existing habitat's real coordinates
      // (silently blocking placement with no feedback). Always assign a
      // guaranteed-free slot instead, same as BUY_HABITAT does.
      const slot = findNextGridSlot(state.habitats);

      const newHabitat: Habitat = {
        id: randomId(),
        element: action.element,
        gridX: slot.x,
        gridY: slot.y,
        assignedSlimeIds: [],
        capacity: 2,
      };
      
      return { 
        ...state, 
        habitats: [...state.habitats, newHabitat],
        pendingHabitatPlacement: null 
      };
    }
    case 'CANCEL_HABITAT_PLACEMENT': {
      return { ...state, pendingHabitatPlacement: null };
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
    case 'ADD_TO_INVENTORY': {
      const currentQuantity = state.inventory[action.foodType] || 0;
      return { ...state, inventory: { ...state.inventory, [action.foodType]: currentQuantity + action.quantity } };
    }
    case 'REMOVE_FROM_INVENTORY': {
      const currentQuantity = state.inventory[action.foodType] || 0;
      const newQuantity = Math.max(0, currentQuantity - action.quantity);
      if (newQuantity === 0) {
        const { [action.foodType]: removed, ...rest } = state.inventory;
        return { ...state, inventory: { ...rest, basic: 0, elemental: 0, royal: 0 } };
      }
      return { ...state, inventory: { ...state.inventory, [action.foodType]: newQuantity } };
    }
    case 'ADD_FLOOR_FOOD': {
      const newFloorFood = {
        id: randomId(),
        x: action.x,
        y: action.y,
        foodId: action.foodId,
        timestamp: Date.now()
      };
      return { ...state, floorFood: [...state.floorFood, newFloorFood] };
    }
    case 'REMOVE_FLOOR_FOOD': {
      return { ...state, floorFood: state.floorFood.filter(food => food.id !== action.id) };
    }
    case 'SLIME_EAT_FOOD': {
      const floorFoodIndex = state.floorFood.findIndex(food => food.id === action.foodId);
      if (floorFoodIndex === -1) return state;

      const food = SLIME_FOODS[state.floorFood[floorFoodIndex].foodId];
      const slime = state.slimes.find(s => s.id === action.slimeId);
      if (!slime) return state;

      const newFloorFood = [...state.floorFood];
      newFloorFood.splice(floorFoodIndex, 1);

      const gained = addXp(slime, food.xpValue);

      return {
        ...state,
        slimes: state.slimes.map(s => (s.id === slime.id ? gained.slime : s)),
        floorFood: newFloorFood,
        stats: { ...state.stats, feeds: state.stats.feeds + 1 },
        lastLevelUp: gained.leveledUp ?? state.lastLevelUp,
        lastEvolution: gained.evolved ?? state.lastEvolution,
      };
    }
    case 'FEED_SLIME_XP': {
      const food = SLIME_FOODS[action.foodType];
      // Food only comes from the farm: seeds cost Goo, harvests fill the bag, feeding uses the bag
      const owned = state.inventory[action.foodType] || 0;
      if (owned < 1) return state;

      const target = state.slimes.find(s => s.id === action.slimeId);
      if (!target || target.level >= MAX_SLIME_LEVEL) return state;

      const gained = addXp(target, food.xpValue);

      return {
        ...state,
        slimes: state.slimes.map(s => (s.id === target.id ? gained.slime : s)),
        inventory: { ...state.inventory, [action.foodType]: owned - 1 },
        stats: { ...state.stats, feeds: state.stats.feeds + 1 },
        lastEvolution: gained.evolved ?? state.lastEvolution,
        lastLevelUp: gained.leveledUp ?? state.lastLevelUp,
      };
    }
    case 'CLEAR_EVOLUTION':
      return { ...state, lastEvolution: null };
    case 'CLEAR_LEVEL_UP':
      return { ...state, lastLevelUp: null };
    case 'CLEAR_PLAYER_LEVEL_UP':
      return { ...state, lastPlayerLevelUp: null };
    case 'UNLOCK_FARM_PLOT':
    case 'PLANT_CROP':
    case 'PLANT_ALL':
    case 'HARVEST_CROP':
    case 'HARVEST_ALL':
    case 'WATER_PLOT':
    case 'WATER_ALL':
    case 'RUSH_PLOT':
    case 'SET_AUTO_REPLANT': {
      const now = Date.now();
      const slice: FarmSlice = {
        goo: state.goo, seeds: state.seeds, inventory: state.inventory, farmPlots: state.farmPlots, farm: state.farm, stats: state.stats,
        perks: perksFrom(state.habitats, state.slimes),
      };
      let next: FarmSlice | null = null;
      switch (action.type) {
        case 'UNLOCK_FARM_PLOT': next = farmUnlock(slice, action.plotId); break;
        case 'PLANT_CROP': next = farmPlant(slice, action.plotId, action.cropType, now); break;
        case 'PLANT_ALL': { const r = farmPlantAll(slice, action.cropType, now); next = r.planted ? r.slice : null; break; }
        case 'HARVEST_CROP': next = farmHarvest(slice, action.plotId, action.rolls ?? [0.99, 0.99], now)?.slice ?? null; break;
        case 'HARVEST_ALL': { const r = farmHarvestAll(slice, action.rolls ?? [], now); next = r.outcomes.length ? r.slice : null; break; }
        case 'WATER_PLOT': next = farmWater(slice, action.plotId, now); break;
        case 'WATER_ALL': { const r = farmWaterAll(slice, now); next = r.watered ? r.slice : null; break; }
        case 'RUSH_PLOT': next = farmRush(slice, action.plotId, now); break;
        case 'SET_AUTO_REPLANT': next = { ...slice, farm: { ...slice.farm, autoReplant: action.value } }; break;
      }
      if (!next) return state;
      return { ...state, goo: next.goo, seeds: next.seeds, inventory: next.inventory, farmPlots: next.farmPlots, farm: next.farm, stats: next.stats };
    }
    case 'SANCT_TICK': {
      const perks = perksFrom(state.habitats, state.slimes);
      const next = rollerFrom(action.rolls);
      return { ...state, habitats: state.habitats.map(h => tickHabitat(h, state.slimes, action.now, next, perks)) };
    }
    case 'SANCT_JOY': {
      const perks = perksFrom(state.habitats, state.slimes);
      const next = rollerFrom(action.rolls);
      return {
        ...state,
        habitats: state.habitats.map(h => {
          if (h.id !== action.habitatId) return h;
          return action.source === 'pet' ? petHabitat(h, action.now, next, perks) : addJoy(h, FEED_JOY, action.now, next, perks);
        }),
      };
    }
    case 'VISITOR_TICK': {
      const r = rollerFrom(action.rolls);
      const res = visitorTick(state.visitor, state.nextVisitAt, action.now, state.habitats.length > 0, [r(), r(), r()], state.farm.level);
      if (res.visitor === state.visitor && res.nextVisitAt === state.nextVisitAt) return state;
      return { ...state, visitor: res.visitor, nextVisitAt: res.nextVisitAt };
    }
    case 'VISITOR_DELIVER': {
      const out = visitorDeliver({ goo: state.goo, inventory: state.inventory, habitats: state.habitats, visitor: state.visitor }, action.now, rollerFrom(action.rolls));
      if (!out) return state;
      return { ...state, goo: out.goo, inventory: out.inventory, habitats: out.habitats, visitor: out.visitor };
    }
    case 'SANCT_COLLECT':
    case 'SANCT_UPGRADE':
    case 'SANCT_DECOR': {
      const slice: SanctSlice = { goo: state.goo, inventory: state.inventory, seeds: state.seeds, habitats: state.habitats };
      let out: SanctSlice | null = null;
      if (action.type === 'SANCT_COLLECT') out = action.habitatId && action.giftId ? collectGift(slice, action.habitatId, action.giftId)?.slice ?? null : collectAll(slice).slice;
      else if (action.type === 'SANCT_UPGRADE') out = upgradeHabitat(slice, action.habitatId);
      else out = action.place ? placeDecor(slice, action.habitatId, action.decorId) : removeDecor(slice, action.habitatId, action.decorId);
      if (!out) return state;
      return { ...state, goo: out.goo, inventory: out.inventory, seeds: out.seeds, habitats: out.habitats };
    }
    case 'COMPLETE_TUTORIAL':
      return { ...state, tutorialCompleted: true };
    case 'COMPLETE_TUTORIAL_CHAPTER':
      return { 
        ...state, 
        completedTutorialChapters: [...state.completedTutorialChapters, action.chapterId].filter((id, index, arr) => arr.indexOf(id) === index)
      };
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  playerLevel: number;
  codexManager: CodexManager;
}

const GameContext = createContext<GameContextType | null>(null);

// Create global codex manager instance
const codexManager = new CodexManager();

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const lastKnownLevel = useRef<number>(0);

  // Initialize codex manager
  useEffect(() => {
    codexManager.initialize();
    
    // Discover existing slimes in the player's collection
    state.slimes.forEach(slime => {
      codexManager.discoverSlime(getCodexSlime(slime)?.id ?? slime.id);
    });
  }, [state.slimes.length]); // Only run when slime count changes

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

  const latestState = useRef(state);
  latestState.current = state;

  // Save on a fixed interval rather than debouncing on every state change:
  // goo ticks every 100ms while slimes are producing, which would otherwise
  // keep resetting a trailing-edge debounce forever and the game would never save.
  useEffect(() => {
    const interval = setInterval(() => saveGame(latestState.current), 3000);
    const handleUnload = () => saveGame(latestState.current);
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      saveGame(latestState.current);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Base goo output multiplied by 1 + (level - 1) * 0.1, then cut to 20% total
      let gooPerTick = (state.slimes.reduce((sum, s) => {
        const levelMult = 1 + (s.level - 1) * 0.1;
        return sum + (s.rarityScore * 0.1 * levelMult);
      }, 0) / 10) * GOO_RATE;

      // Habitat bonus: element-matched slimes produce 2x, also cut to 20%
      for (const habitat of state.habitats) {
        for (const slimeId of habitat.assignedSlimeIds) {
          const slime = state.slimes.find(s => s.id === slimeId);
          if (slime && slime.elements.includes(habitat.element)) {
            const levelMult = 1 + (slime.level - 1) * 0.1;
            gooPerTick += ((slime.rarityScore * 0.1 * levelMult) / 10) * GOO_RATE; // Double their contribution
          }
        }
      }

      if (gooPerTick > 0) dispatch({ type: 'ADD_GOO', amount: gooPerTick });
    }, 100);
    return () => clearInterval(interval);
  }, [state.slimes, state.habitats]);

  // Sanctuaries: slimes living there build Joy over time, including while the player was away.
  useEffect(() => {
    const tick = () => {
      dispatch({ type: 'SANCT_TICK', now: Date.now(), rolls: Array.from({ length: 48 }, Math.random) });
      dispatch({ type: 'VISITOR_TICK', now: Date.now(), rolls: Array.from({ length: 3 }, Math.random) });
    };
    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Unlock achievements as soon as their requirements are met. Deliberately NOT dependent
  // on goo (it changes every 100ms); only on the state the achievements actually read.
  useEffect(() => {
    for (const def of ACHIEVEMENT_DEFS) {
      const ach = state.achievements.find(a => a.id === def.id);
      if (!ach || ach.unlocked) continue;
      if (def.progress(state) >= def.target) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: def.id });
        toast({
          title: `🏆 Achievement unlocked: ${def.name}`,
          description: `${def.description} — claim ${def.rewardAmount} goo in the Achievements menu.`,
        });
      }
    }
  }, [state.slimes, state.totalBreeds, state.habitats, state.stats, state.currentLevel, state.farmPlots, state.farm, state.achievements]);

  useEffect(() => {
    if (state.muted !== audioEngine.muted) audioEngine.toggleMute();
  }, [state.muted]);

  return (
    <GameContext.Provider value={{ state, dispatch, playerLevel, codexManager }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState must be used within GameProvider');
  return ctx;
}
