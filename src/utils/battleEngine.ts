import { Slime, SlimeElement, BattleSlime, BattleTurn, RarityTier } from '../types/slime';
import { ALL_CODEX_SLIMES, CodexSlime } from '../data/slimeCodex';
import { createCodexSlime } from './slimeGenerator';

// Element Type Effectiveness Chart (10 elements)
// super: 1.5x, weak: 0.6x, neutral: 1.0x
export const ELEMENT_EFFECTIVENESS: Record<SlimeElement, { strong: SlimeElement[]; weak: SlimeElement[] }> = {
  fire: { strong: ['plant', 'ice'], weak: ['water', 'earth'] },
  water: { strong: ['fire', 'earth'], weak: ['plant', 'electric'] },
  plant: { strong: ['water', 'earth'], weak: ['fire', 'ice'] },
  earth: { strong: ['electric', 'metal'], weak: ['water', 'plant', 'ice'] },
  wind: { strong: ['plant'], weak: ['ice', 'metal'] },
  ice: { strong: ['plant', 'earth', 'wind'], weak: ['fire', 'metal'] },
  electric: { strong: ['water', 'metal'], weak: ['earth', 'plant'] },
  metal: { strong: ['ice', 'wind'], weak: ['fire', 'electric'] },
  light: { strong: ['shadow'], weak: [] },
  shadow: { strong: ['light'], weak: [] },
};

export type Effectiveness = 'super' | 'weak' | 'neutral';

export function getEffectiveness(attacker: SlimeElement, defender: SlimeElement): Effectiveness {
  if (ELEMENT_EFFECTIVENESS[attacker]?.strong.includes(defender)) return 'super';
  if (ELEMENT_EFFECTIVENESS[attacker]?.weak.includes(defender)) return 'weak';
  return 'neutral';
}

export function getEffectivenessMultiplier(eff: Effectiveness): number {
  switch (eff) {
    case 'super':
      return 1.5;
    case 'weak':
      return 0.6;
    default:
      return 1.0;
  }
}

// Multi-element defenders: average the multiplier over each of their elements, so a
// Fire attack on a Plant+Water slime is neutral (1.5 and 0.6 roughly cancel) instead of
// only ever looking at the defender's first element.
export function getTypeMultiplier(attackElement: SlimeElement, defenderElements: SlimeElement[]): number {
  if (!defenderElements.length) return 1;
  const total = defenderElements.reduce(
    (sum, el) => sum + getEffectivenessMultiplier(getEffectiveness(attackElement, el)),
    0
  );
  return total / defenderElements.length;
}

export function effectivenessFromMultiplier(mult: number): Effectiveness {
  if (mult >= 1.25) return 'super';
  if (mult <= 0.8) return 'weak';
  return 'neutral';
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

// Every codex species has identical traits, so stats used to depend on level alone
// (a Legendary hit exactly as hard as a Common). Rarity now gives a real edge, which
// is what makes breeding for rare slimes worth it in battle.
export const RARITY_STAT_MULT: Record<RarityTier, number> = {
  Common: 1.0,
  Uncommon: 1.1,
  Rare: 1.25,
  Epic: 1.4,
  Legendary: 1.6,
  Ancient: 1.9,
  Divine: 2.2,
};

// Stable per-species flavour so species feel different at equal level/rarity.
// [hp, attack, defense] multipliers
const ARCHETYPES: Array<[number, number, number]> = [
  [1.0, 1.0, 1.0],  // balanced
  [1.2, 0.9, 1.2],  // sturdy
  [0.9, 1.2, 0.9],  // fierce
];

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

// Derive stats from traits, level, rarity and species archetype
export function deriveBattleStats(slime: Slime): BattleSlime['battleStats'] {
  const { traits, level } = slime;

  const levelMult = 1 + (level - 1) * 0.08;
  const rarityMult = RARITY_STAT_MULT[slime.rarityTier] ?? 1;
  const [hpA, atkA, defA] = ARCHETYPES[nameHash(slime.name) % ARCHETYPES.length];

  const hp = Math.floor((traits.size * 40 + 60) * levelMult * rarityMult * hpA);
  const attack = Math.floor((traits.spikes * 4 + traits.glow * 5 + 15) * levelMult * rarityMult * atkA);
  const defense = Math.floor((traits.pattern * 2 + traits.aura * 3 + 8) * levelMult * rarityMult * defA);
  const speed = Math.floor((traits.rhythm * 3 + 12) * levelMult);

  return { hp, maxHp: hp, attack, defense, speed };
}

export function toBattleSlime(slime: Slime): BattleSlime {
  return {
    ...slime,
    battleStats: deriveBattleStats(slime),
  };
}

// ---------------------------------------------------------------------------
// Opponents
// ---------------------------------------------------------------------------

// One region per world-map screen (10 levels each). Names match the painted maps in public/maps.
export const MAP_SCREENS: Array<{ upTo: number; name: string; elements: SlimeElement[] }> = [
  { upTo: 10, name: 'Verdant Lowlands', elements: ['water', 'plant', 'earth', 'wind'] },
  { upTo: 20, name: 'Whispering Wood & Golden Plains', elements: ['plant', 'earth', 'wind', 'light', 'electric'] },
  { upTo: 30, name: 'Ironcliff Mines & Murkmire Swamp', elements: ['earth', 'fire', 'metal', 'shadow', 'water', 'plant'] },
  { upTo: 40, name: 'Frostpeak Skyway', elements: ['ice', 'wind', 'electric', 'light', 'water', 'metal'] },
  { upTo: 50, name: 'The Forgotten Castle', elements: ['shadow', 'metal', 'electric', 'fire', 'light', 'ice'] },
];
const REGIONS = MAP_SCREENS;

export function getRegionForLevel(level: number) {
  return REGIONS.find(r => level <= r.upTo) ?? REGIONS[REGIONS.length - 1];
}

export function isBossLevel(level: number): boolean {
  return level > 0 && level % 5 === 0;
}

// How many enemies the player faces (they bring 1-3 slimes). Early levels are 1v1 so a
// brand-new player with a single starter slime can win the first fights.
export function getEnemyCount(level: number): number {
  if (level <= 2) return 1;
  if (level <= 5) return 2;
  return 3;
}

// Enemy slime level for a given map level.
// Players level fast early and slow down late (XP needs balloon), so a straight line
// would be trivial early and a wall late. This tracks the level a player reaches by
// clearing the map in order with battle XP alone (measured with a simulation), then
// sits just under it so keeping pace with the map wins most regular fights.
function expectedPlayerLevel(mapLevel: number): number {
  return mapLevel <= 20 ? 1.1 * mapLevel : 22 + 0.55 * (mapLevel - 20);
}
export function getEnemyLevel(level: number): number {
  const edge = level <= 5 ? 2 : level >= 38 ? 3 : ENEMY_LEVEL_EDGE;
  return Math.max(1, Math.min(50, Math.round(expectedPlayerLevel(level) - edge)));
}
const ENEMY_LEVEL_EDGE = 1;

const TIER_ORDER: RarityTier[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Ancient', 'Divine'];

function maxTierForLevel(level: number): RarityTier {
  if (level <= 8) return 'Uncommon';
  if (level <= 20) return 'Rare';
  return 'Legendary';
}

function pickEnemySpecies(level: number, boss: boolean): CodexSlime {
  const region = getRegionForLevel(level);
  const allowed = new Set(region.elements);
  let capIdx = TIER_ORDER.indexOf(maxTierForLevel(level));
  if (boss) capIdx = Math.min(TIER_ORDER.length - 1, capIdx + 1);

  let pool = ALL_CODEX_SLIMES.filter(
    s => s.elements.every(e => allowed.has(e)) && TIER_ORDER.indexOf(s.rarityTier) <= capIdx
  );
  if (!pool.length) pool = ALL_CODEX_SLIMES.filter(s => s.elements.length === 1);

  // Higher levels favour rarer species
  const weightOf = (s: CodexSlime): number => {
    const base = s.weight || 50;
    switch (s.rarityTier) {
      case 'Common': return base * Math.max(0.25, 1 - level / 60);
      case 'Uncommon': return base;
      case 'Rare': return base * (1 + level / 25);
      default: return base * (1 + level / 12);
    }
  };
  // Bosses lean on the rarest species available
  const weights = pool.map(s => (boss ? weightOf(s) * (1 + TIER_ORDER.indexOf(s.rarityTier) * 2) : weightOf(s)));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// Generate a themed opponent team for a map level: real codex species that fit the
// region's elements, scaled by the map level. Every 5th level is a boss fight.
export function generateAIOpponents(level: number, _playerAverageLevel?: number): BattleSlime[] {
  const count = getEnemyCount(level);
  const boss = isBossLevel(level);
  const baseLevel = getEnemyLevel(level);
  const team: BattleSlime[] = [];

  for (let i = 0; i < count; i++) {
    const isBossSlot = boss && i === count - 1;
    const species = pickEnemySpecies(level, isBossSlot);
    const slime = createCodexSlime(species.id);
    // Unique id so an enemy never collides with the player's copy of the same species
    // (battle animations and hit effects are keyed by id). codexId keeps the right sprite.
    slime.id = `enemy_${i}_${species.id}_${Math.random().toString(36).slice(2, 6)}`;
    slime.level = Math.max(1, Math.min(50, baseLevel + (isBossSlot ? 2 : 0)));
    const foe = toBattleSlime(slime);
    // Gentle on-ramp: the first few maps are easier than their level suggests
    const ease = level <= 2 ? 0.7 : level <= 5 ? 0.88 : 1;
    foe.battleStats.hp = Math.max(1, Math.floor(foe.battleStats.hp * ease));
    foe.battleStats.maxHp = foe.battleStats.hp;
    foe.battleStats.attack = Math.max(1, Math.floor(foe.battleStats.attack * ease));
    team.push(foe);
  }

  return team;
}

// ---------------------------------------------------------------------------
// Moves, damage, AI
// ---------------------------------------------------------------------------

export interface Move {
  name: string;
  type: SlimeElement;
  power: number;
}

// One "Burst" per element, up to 3 (so a multi-element slime can pick its best matchup)
export function getSlimeMoves(slime: Slime): Move[] {
  return slime.elements.slice(0, 3).map(el => ({
    name: `${el.charAt(0).toUpperCase() + el.slice(1)} Burst`,
    type: el,
    power: 1.0,
  }));
}

export function calculateDamage(
  attacker: BattleSlime,
  defender: BattleSlime,
  moveElement?: SlimeElement
): {
  damage: number;
  effectiveness: Effectiveness;
  isCritical: boolean;
} {
  const attackElement = moveElement || attacker.element;
  const mult = getTypeMultiplier(attackElement, defender.elements);
  const effectiveness = effectivenessFromMultiplier(mult);
  const isCritical = Math.random() < 0.1;
  const critMult = isCritical ? 1.5 : 1.0;

  const randomFactor = 0.85 + Math.random() * 0.3;

  const baseDamage = attacker.battleStats.attack * mult * randomFactor * critMult;
  const defenseReduction = defender.battleStats.defense * 0.3;
  const damage = Math.max(1, Math.floor(baseDamage - defenseReduction));

  return { damage, effectiveness, isCritical };
}

function expectedDamage(attacker: BattleSlime, defender: BattleSlime, el: SlimeElement): number {
  const mult = getTypeMultiplier(el, defender.elements);
  return Math.max(1, attacker.battleStats.attack * mult - defender.battleStats.defense * 0.3);
}

export interface BattleAction {
  attacker: BattleSlime;
  move: Move;
  target: BattleSlime;
}

// Pick an attacker, move and target. Mostly the best option (favouring super-effective
// moves and finishing blows) with some randomness so fights are not perfectly predictable.
export function chooseBattleAction(
  attackers: BattleSlime[],
  defenders: BattleSlime[],
  smartness = 0.75
): BattleAction | null {
  const aliveA = attackers.filter(s => s.battleStats.hp > 0);
  const aliveD = defenders.filter(s => s.battleStats.hp > 0);
  if (!aliveA.length || !aliveD.length) return null;

  const options: Array<BattleAction & { score: number }> = [];
  for (const attacker of aliveA) {
    for (const move of getSlimeMoves(attacker)) {
      for (const target of aliveD) {
        const dmg = expectedDamage(attacker, target, move.type);
        const finisher = dmg >= target.battleStats.hp ? 40 : 0;
        const wounded = (1 - target.battleStats.hp / target.battleStats.maxHp) * 5;
        options.push({ attacker, move, target, score: dmg + finisher + wounded });
      }
    }
  }

  if (Math.random() < smartness) {
    return options.reduce((best, o) => (o.score > best.score ? o : best));
  }
  return options[Math.floor(Math.random() * options.length)];
}

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------

export function calculateBattleRewards(level: number, won: boolean): { goo: number; xp: number } {
  const rand = (n: number) => Math.floor(Math.random() * n);
  if (!won) return { goo: 5, xp: 8 + Math.floor(level / 2) };
  const bossBonus = isBossLevel(level) ? 1.5 : 1;
  return {
    goo: Math.round((20 + level * 2 + rand(16)) * bossBonus),
    xp: Math.round((24 + level * 3 + rand(16)) * bossBonus),
  };
}

// ---------------------------------------------------------------------------
// Headless fight (same turn rules as the arena). Used for balance testing.
// ---------------------------------------------------------------------------

export function simulateArenaFight(
  playerTeam: BattleSlime[],
  opponentTeam: BattleSlime[],
  opts: { playerSmartness?: number; aiSmartness?: number } = {}
): { winner: 'player' | 'opponent'; actions: number } {
  const p = playerTeam.map(s => ({ ...s, battleStats: { ...s.battleStats } }));
  const o = opponentTeam.map(s => ({ ...s, battleStats: { ...s.battleStats } }));
  let playerTurn = true;
  let actions = 0;

  while (actions < 400 && p.some(s => s.battleStats.hp > 0) && o.some(s => s.battleStats.hp > 0)) {
    const act = playerTurn
      ? chooseBattleAction(p, o, opts.playerSmartness ?? 0.9)
      : chooseBattleAction(o, p, opts.aiSmartness ?? 0.75);
    if (!act) break;
    const { damage } = calculateDamage(act.attacker, act.target, act.move.type);
    act.target.battleStats.hp = Math.max(0, act.target.battleStats.hp - damage);
    playerTurn = !playerTurn;
    actions++;
  }

  return { winner: p.some(s => s.battleStats.hp > 0) ? 'player' : 'opponent', actions };
}

// Legacy auto-resolved 3v3 simulation (kept for compatibility; the arena is interactive)
export function simulateBattle(
  playerTeam: BattleSlime[],
  opponentTeam: BattleSlime[]
): {
  turns: BattleTurn[];
  winner: 'player' | 'opponent';
  rewards: { goo: number; xp: number };
} {
  const turns: BattleTurn[] = [];
  const pTeam = playerTeam.map((s) => ({ ...s, battleStats: { ...s.battleStats } }));
  const oTeam = opponentTeam.map((s) => ({ ...s, battleStats: { ...s.battleStats } }));

  let playerIndex = 0;
  let opponentIndex = 0;

  while (playerIndex < pTeam.length && opponentIndex < oTeam.length) {
    const pSlime = pTeam[playerIndex];
    const oSlime = oTeam[opponentIndex];

    const playerFirst = pSlime.battleStats.speed >= oSlime.battleStats.speed;

    const executeTurn = (attacker: typeof pSlime, defender: typeof oSlime) => {
      const { damage, effectiveness, isCritical } = calculateDamage(attacker, defender);
      defender.battleStats.hp = Math.max(0, defender.battleStats.hp - damage);

      const message = `${attacker.name} attacked ${defender.name} for ${damage} damage! ${
        effectiveness === 'super' ? 'Super effective!' : effectiveness === 'weak' ? 'Not very effective...' : 'Neutral hit.'
      }${isCritical ? ' CRITICAL HIT!' : ''}`;

      turns.push({
        attackerId: attacker.id,
        defenderId: defender.id,
        damage,
        effectiveness,
        isCritical,
        message,
        remainingHp: defender.battleStats.hp,
      });

      return defender.battleStats.hp === 0;
    };

    if (playerFirst) {
      if (executeTurn(pSlime, oSlime)) {
        opponentIndex++;
        if (opponentIndex >= oTeam.length) break;
      } else if (executeTurn(oSlime, pSlime)) {
        playerIndex++;
      }
    } else if (executeTurn(oSlime, pSlime)) {
      playerIndex++;
      if (playerIndex >= pTeam.length) break;
    } else if (executeTurn(pSlime, oSlime)) {
      opponentIndex++;
    }
  }

  const winner = playerIndex < pTeam.length ? 'player' : 'opponent';
  const rewards = winner === 'player' ? { goo: 25, xp: 40 } : { goo: 8, xp: 12 };

  return { turns, winner, rewards };
}
