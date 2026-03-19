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
}
