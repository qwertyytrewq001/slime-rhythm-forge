<<<<<<< HEAD
import { Slime, SlimeElement, BattleSlime, BattleTurn, BattleResult } from '../types/slime';
import { ALL_ELEMENTS } from '../data/traitData';
import { createRandomSlime } from './slimeGenerator';

// Element Type Effectiveness Chart (18 elements)
// super: 1.5x, weak: 0.6x, neutral: 1.0x
export const ELEMENT_EFFECTIVENESS: Record<SlimeElement, { strong: SlimeElement[], weak: SlimeElement[] }> = {
  fire:     { strong: ['plant', 'ice', 'nature'], weak: ['water', 'lava', 'earth'] },
  water:    { strong: ['fire', 'lava', 'earth'], weak: ['plant', 'electric', 'toxic'] },
  plant:    { strong: ['water', 'earth', 'nature'], weak: ['fire', 'ice', 'toxic'] },
  earth:    { strong: ['electric', 'metal', 'toxic'], weak: ['water', 'plant', 'ice'] },
  wind:     { strong: ['plant', 'toxic', 'nature'], weak: ['ice', 'metal', 'arcane'] },
  ice:      { strong: ['plant', 'earth', 'wind'], weak: ['fire', 'metal', 'lava'] },
  electric: { strong: ['water', 'metal', 'cosmic'], weak: ['earth', 'plant', 'void'] },
  metal:    { strong: ['ice', 'crystal', 'wind'], weak: ['fire', 'electric', 'lava'] },
  light:    { strong: ['shadow', 'void', 'toxic'], weak: ['arcane', 'divine', 'cosmic'] },
  shadow:   { strong: ['light', 'cosmic', 'arcane'], weak: ['divine', 'void', 'light'] },
  toxic:    { strong: ['plant', 'nature', 'water'], weak: ['earth', 'metal', 'light'] },
  cosmic:   { strong: ['light', 'arcane', 'void'], weak: ['shadow', 'divine', 'electric'] },
  void:     { strong: ['shadow', 'electric', 'divine'], weak: ['light', 'cosmic', 'arcane'] },
  crystal:  { strong: ['fire', 'ice', 'light'], weak: ['metal', 'earth', 'void'] },
  lava:     { strong: ['ice', 'metal', 'plant'], weak: ['water', 'fire', 'crystal'] },
  nature:   { strong: ['earth', 'water', 'wind'], weak: ['fire', 'toxic', 'shadow'] },
  arcane:   { strong: ['light', 'void', 'wind'], weak: ['shadow', 'cosmic', 'divine'] },
  divine:   { strong: ['shadow', 'cosmic', 'arcane'], weak: ['void', 'light', 'void'] },
};

export function getEffectiveness(attacker: SlimeElement, defender: SlimeElement): 'super' | 'weak' | 'neutral' {
  if (ELEMENT_EFFECTIVENESS[attacker]?.strong.includes(defender)) return 'super';
  if (ELEMENT_EFFECTIVENESS[attacker]?.weak.includes(defender)) return 'weak';
  return 'neutral';
}

export function getEffectivenessMultiplier(eff: 'super' | 'weak' | 'neutral'): number {
  switch (eff) {
    case 'super': return 1.5;
    case 'weak': return 0.6;
    default: return 1.0;
  }
}

// Derive stats from traits
export function deriveBattleStats(slime: Slime): BattleSlime['battleStats'] {
  const { traits, level } = slime;
  
  // Base scaling factor by level
  const levelMult = 1 + (level - 1) * 0.15;

  // HP from size
  const hp = Math.floor((traits.size * 50 + 50) * levelMult);
  
  // Attack from spikes + glow
  const attack = Math.floor((traits.spikes * 2 + traits.glow * 3 + 10) * levelMult);
  
  // Defense from pattern + aura
  const defense = Math.floor((traits.pattern * 1.5 + traits.aura * 4 + 10) * levelMult);
  
  // Speed from rhythm
  const speed = Math.floor((traits.rhythm * 4 + 10) * levelMult);

  return {
    hp,
    maxHp: hp,
    attack,
    defense,
    speed
  };
}

export function toBattleSlime(slime: Slime): BattleSlime {
  return {
    ...slime,
    battleStats: deriveBattleStats(slime)
  };
}

// Generate AI opponent team for a given level
export function generateAIOpponents(level: number, playerAverageLevel: number): BattleSlime[] {
  const team: BattleSlime[] = [];
  
  for (let i = 0; i < 3; i++) {
    // Scaling to ±20% of player average level
    const variance = 0.8 + Math.random() * 0.4;
    const targetLevel = Math.max(1, Math.floor(playerAverageLevel * variance));
    
    const randomElement = ALL_ELEMENTS[Math.floor(Math.random() * ALL_ELEMENTS.length)];
    const aiSlime = createRandomSlime();
    aiSlime.level = targetLevel;
    aiSlime.element = randomElement;
    aiSlime.elements = [randomElement];
    aiSlime.name = `Wild ${randomElement.charAt(0).toUpperCase() + randomElement.slice(1)} Slime`;
    
    team.push(toBattleSlime(aiSlime));
  }
  
  return team;
}

// Damage calculation
export function calculateDamage(attacker: BattleSlime, defender: BattleSlime, moveElement?: SlimeElement): { 
  damage: number, 
  effectiveness: 'super' | 'weak' | 'neutral',
  isCritical: boolean 
} {
  const attackElement = moveElement || attacker.element;
  const eff = getEffectiveness(attackElement, defender.element);
  const mult = getEffectivenessMultiplier(eff);
  const isCritical = Math.random() < 0.1; // 10% crit chance
  const critMult = isCritical ? 1.5 : 1.0;
  
  const randomFactor = 0.85 + Math.random() * 0.3;
  
  // Damage formula: attack * effectiveness * random * crit - defense/2
  let damage = Math.floor((attacker.battleStats.attack * mult * randomFactor * critMult) - (defender.battleStats.defense / 2));
  damage = Math.max(1, damage); // Minimum 1 damage
  
  return { damage, effectiveness: eff, isCritical };
}

// 3v3 Battle Simulation
export function simulateBattle(playerTeam: BattleSlime[], opponentTeam: BattleSlime[]): { 
  turns: BattleTurn[], 
  winner: 'player' | 'opponent',
  rewards: { goo: number, xp: number }
} {
  const turns: BattleTurn[] = [];
  const pTeam = playerTeam.map(s => ({ ...s, battleStats: { ...s.battleStats } }));
  const oTeam = opponentTeam.map(s => ({ ...s, battleStats: { ...s.battleStats } }));
  
  let playerIndex = 0;
  let opponentIndex = 0;
  
  while (playerIndex < pTeam.length && opponentIndex < oTeam.length) {
    const pSlime = pTeam[playerIndex];
    const oSlime = oTeam[opponentIndex];
    
    // Speed check
    const playerFirst = pSlime.battleStats.speed >= oSlime.battleStats.speed;
    
    const executeTurn = (attacker: typeof pSlime, defender: typeof oSlime, isPlayerAttacking: boolean) => {
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
        remainingHp: defender.battleStats.hp
      });
      
      return defender.battleStats.hp === 0;
    };
    
    if (playerFirst) {
      if (executeTurn(pSlime, oSlime, true)) {
        opponentIndex++;
        if (opponentIndex >= oTeam.length) break;
      } else {
        if (executeTurn(oSlime, pSlime, false)) {
          playerIndex++;
        }
      }
    } else {
      if (executeTurn(oSlime, pSlime, false)) {
        playerIndex++;
        if (playerIndex >= pTeam.length) break;
      } else {
        if (executeTurn(pSlime, oSlime, true)) {
          opponentIndex++;
        }
      }
    }
  }
  
  const winner = playerIndex < pTeam.length ? 'player' : 'opponent';
  const rewards = winner === 'player' 
    ? { goo: 15 + Math.floor(Math.random() * 11), xp: 20 + Math.floor(Math.random() * 11) }
    : { goo: 5, xp: 5 };
    
  return { turns, winner, rewards };
=======
import { Slime, SlimeElement, BattleSlime, BattleMove, BattleTurn, BattleResult } from '@/types/slime';
import { ALL_ELEMENTS, ELEMENT_ICONS, ELEMENT_NAME_FRAGMENTS } from '@/data/traitData';

// Element effectiveness: attacker element -> list of elements it's super effective against
const SUPER_EFFECTIVE: Record<SlimeElement, SlimeElement[]> = {
  fire: ['plant', 'ice', 'metal', 'nature'],
  water: ['fire', 'earth', 'lava'],
  plant: ['water', 'earth', 'crystal'],
  earth: ['fire', 'electric', 'toxic'],
  wind: ['plant', 'toxic', 'nature'],
  ice: ['water', 'wind', 'cosmic'],
  electric: ['water', 'wind', 'metal'],
  metal: ['ice', 'crystal', 'arcane'],
  light: ['shadow', 'void', 'toxic'],
  shadow: ['light', 'cosmic', 'divine'],
  cosmic: ['arcane', 'void', 'earth'],
  void: ['cosmic', 'divine', 'light'],
  toxic: ['plant', 'nature', 'water'],
  crystal: ['shadow', 'electric', 'lava'],
  lava: ['ice', 'plant', 'metal'],
  nature: ['water', 'earth', 'crystal'],
  arcane: ['divine', 'cosmic', 'void'],
  divine: ['shadow', 'toxic', 'arcane'],
};

const WEAK_AGAINST: Partial<Record<SlimeElement, SlimeElement[]>> = {};
// Build reverse map
for (const [attacker, targets] of Object.entries(SUPER_EFFECTIVE)) {
  for (const target of targets) {
    if (!WEAK_AGAINST[target as SlimeElement]) WEAK_AGAINST[target as SlimeElement] = [];
    WEAK_AGAINST[target as SlimeElement].push(attacker as SlimeElement);
  }
}

function getEffectiveness(attackElement: SlimeElement, defenderElements: SlimeElement[]): 'super' | 'normal' | 'weak' {
  for (const def of defenderElements) {
    if (SUPER_EFFECTIVE[attackElement]?.includes(def)) return 'super';
  }
  for (const def of defenderElements) {
    if (WEAK_AGAINST[attackElement]?.includes(def)) return 'weak';
  }
  return 'normal';
}

export function deriveBattleStats(slime: Slime): BattleSlime {
  const levelMult = 1 + (slime.level - 1) * 0.15;
  const rarityMult = 1 + slime.rarityScore * 0.02;
  const base = 10;

  return {
    slime,
    maxHp: Math.round((base * 5 + slime.traits.size * 20) * levelMult * rarityMult),
    hp: Math.round((base * 5 + slime.traits.size * 20) * levelMult * rarityMult),
    attack: Math.round((base + slime.traits.spikes * 2 + slime.traits.glow) * levelMult * rarityMult),
    defense: Math.round((base + slime.traits.pattern + slime.traits.aura * 2) * levelMult * rarityMult),
    speed: Math.round((base + slime.traits.rhythm * 3 + (2.0 - slime.traits.size) * 5) * levelMult),
  };
}

// Generate an AI opponent scaled to the player's slime
export function generateOpponent(playerSlime: Slime): BattleSlime {
  const playerStats = deriveBattleStats(playerSlime);
  
  // Pick a random element, slightly favoring ones the player is weak to
  const elements = ALL_ELEMENTS.filter(e => e !== playerSlime.element);
  const element = elements[Math.floor(Math.random() * elements.length)];
  
  // Scale opponent to be close to player power (±20%)
  const scaleFactor = 0.8 + Math.random() * 0.4;
  const fragments = ELEMENT_NAME_FRAGMENTS[element];
  const name = `Wild ${fragments[Math.floor(Math.random() * fragments.length)]}`;
  
  const fakeSlime: Slime = {
    id: 'opponent_' + Date.now(),
    name,
    traits: {
      shape: Math.floor(Math.random() * 15),
      color1: Math.floor(Math.random() * 20),
      color2: Math.floor(Math.random() * 20),
      eyes: Math.floor(Math.random() * 15),
      mouth: Math.floor(Math.random() * 10),
      spikes: Math.floor(Math.random() * 10),
      pattern: Math.floor(Math.random() * 15),
      glow: Math.floor(Math.random() * 6),
      size: 0.7 + Math.random() * 0.8,
      aura: Math.floor(Math.random() * 5),
      rhythm: Math.floor(Math.random() * 6),
      accessory: Math.floor(Math.random() * 11),
      model: Math.floor(Math.random() * 3),
    },
    elements: [element],
    element,
    rarityScore: playerSlime.rarityScore * scaleFactor,
    rarityStars: playerSlime.rarityStars,
    rarityTier: playerSlime.rarityTier,
    createdAt: Date.now(),
    level: Math.max(1, playerSlime.level + Math.floor(Math.random() * 3) - 1),
    xp: 0,
  };

  const stats = deriveBattleStats(fakeSlime);
  // Scale stats to match player roughly
  const avgPlayerPower = (playerStats.maxHp + playerStats.attack * 3 + playerStats.defense * 2) / 6;
  const avgEnemyPower = (stats.maxHp + stats.attack * 3 + stats.defense * 2) / 6;
  const ratio = (avgPlayerPower / Math.max(1, avgEnemyPower)) * scaleFactor;
  
  return {
    slime: fakeSlime,
    maxHp: Math.round(stats.maxHp * ratio),
    hp: Math.round(stats.maxHp * ratio),
    attack: Math.round(stats.attack * ratio),
    defense: Math.round(stats.defense * ratio),
    speed: Math.round(stats.speed * ratio),
  };
}

const MOVE_NAMES: Record<SlimeElement, string[]> = {
  fire: ['Flame Burst', 'Scorch Slam'],
  water: ['Tidal Crash', 'Hydro Pulse'],
  plant: ['Vine Whip', 'Petal Storm'],
  earth: ['Rock Crush', 'Quake Slam'],
  wind: ['Gale Strike', 'Cyclone Rush'],
  ice: ['Frost Bite', 'Blizzard Blast'],
  electric: ['Volt Tackle', 'Thunder Shock'],
  metal: ['Iron Slam', 'Steel Cutter'],
  light: ['Prism Beam', 'Holy Flash'],
  shadow: ['Dark Pulse', 'Void Strike'],
  cosmic: ['Star Crash', 'Nebula Burst'],
  void: ['Rift Tear', 'Null Blast'],
  toxic: ['Venom Spit', 'Acid Rain'],
  crystal: ['Gem Shatter', 'Prism Lance'],
  lava: ['Magma Shot', 'Eruption'],
  nature: ['Root Slam', 'Wild Growth'],
  arcane: ['Arcane Bolt', 'Rune Blast'],
  divine: ['Holy Smite', 'Judgment'],
};

export function generateMove(attacker: BattleSlime, defender: BattleSlime): BattleMove {
  const element = attacker.slime.element;
  const names = MOVE_NAMES[element] || ['Slam'];
  const name = names[Math.floor(Math.random() * names.length)];
  const effectiveness = getEffectiveness(element, defender.slime.elements);
  
  const isCrit = Math.random() < 0.15;
  let baseDamage = attacker.attack * (0.8 + Math.random() * 0.4);
  baseDamage -= defender.defense * 0.3;
  baseDamage = Math.max(1, baseDamage);
  
  if (effectiveness === 'super') baseDamage *= 1.5;
  if (effectiveness === 'weak') baseDamage *= 0.6;
  if (isCrit) baseDamage *= 1.8;
  
  return {
    name,
    damage: Math.round(baseDamage),
    element,
    emoji: ELEMENT_ICONS[element],
    isCrit,
    effectiveness,
  };
}

export function simulateBattle(playerSlime: Slime): { playerStats: BattleSlime; enemyStats: BattleSlime; turns: BattleTurn[] } {
  const playerStats = deriveBattleStats(playerSlime);
  const enemyStats = generateOpponent(playerSlime);
  const turns: BattleTurn[] = [];
  
  let playerHp = playerStats.hp;
  let enemyHp = enemyStats.hp;
  
  // Determine turn order by speed
  const playerFirst = playerStats.speed >= enemyStats.speed;
  
  for (let i = 0; i < 20 && playerHp > 0 && enemyHp > 0; i++) {
    const first = playerFirst ? 'player' : 'enemy';
    const second = playerFirst ? 'enemy' : 'player';
    
    // First attacker
    if (first === 'player' && playerHp > 0 && enemyHp > 0) {
      const move = generateMove(playerStats, enemyStats);
      enemyHp = Math.max(0, enemyHp - move.damage);
      turns.push({ attacker: 'player', move, damageDealt: move.damage, remainingHp: enemyHp });
    } else if (first === 'enemy' && enemyHp > 0 && playerHp > 0) {
      const move = generateMove(enemyStats, playerStats);
      playerHp = Math.max(0, playerHp - move.damage);
      turns.push({ attacker: 'enemy', move, damageDealt: move.damage, remainingHp: playerHp });
    }
    
    if (playerHp <= 0 || enemyHp <= 0) break;
    
    // Second attacker
    if (second === 'player' && playerHp > 0 && enemyHp > 0) {
      const move = generateMove(playerStats, enemyStats);
      enemyHp = Math.max(0, enemyHp - move.damage);
      turns.push({ attacker: 'player', move, damageDealt: move.damage, remainingHp: enemyHp });
    } else if (second === 'enemy' && enemyHp > 0 && playerHp > 0) {
      const move = generateMove(enemyStats, playerStats);
      playerHp = Math.max(0, playerHp - move.damage);
      turns.push({ attacker: 'enemy', move, damageDealt: move.damage, remainingHp: playerHp });
    }
  }
  
  return { playerStats: { ...playerStats, hp: playerHp }, enemyStats: { ...enemyStats, hp: enemyHp }, turns };
}

export function calculateRewards(playerSlime: Slime, won: boolean, enemyLevel: number): { goo: number; xp: number } {
  if (!won) return { goo: Math.round(5 + enemyLevel), xp: Math.round(3 + enemyLevel) };
  return {
    goo: Math.round(20 + enemyLevel * 8 + playerSlime.rarityScore * 2),
    xp: Math.round(15 + enemyLevel * 5),
  };
>>>>>>> ee7780da1f8543a719a150126d95f2bb1838f514
}
