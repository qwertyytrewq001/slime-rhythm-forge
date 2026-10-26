import { BattleSlime, SlimeElement } from '../types/slime';
import { Effectiveness, effectivenessFromMultiplier, getTypeMultiplier } from './battleEngine';

/**
 * Turn-based battle engine for the arena.
 *
 * - Turn order is speed based (a "turn meter": the fastest slime acts first, and a slime that is much faster acts more often).
 * - Every slime has 3 actions: Attack (builds energy), an element Skill (costs energy) and an Ultimate (needs full energy).
 * - Skills have real effects: burn, freeze, shields, heals, attack buffs and debuffs, area hits, lifesteal.
 * - All of it is pure data in, events out. The arena replays the events as animation, and the
 *   headless balance simulation uses the very same code.
 */

export type Team = 'player' | 'enemy';

export interface Statuses {
  burn?: { turns: number; dmg: number };
  freeze?: number; // number of turns it will skip
  shield?: { amount: number; turns: number };
  atkUp?: number; // turns left
  atkDown?: number;
}
export type StatusName = 'burn' | 'freeze' | 'shield' | 'atkUp' | 'atkDown';

export interface Unit {
  id: string;
  team: Team;
  slime: BattleSlime;
  name: string;
  level: number;
  elements: SlimeElement[];
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  energy: number;
  gauge: number;
  statuses: Statuses;
  alive: boolean;
}

export interface Battle {
  units: Unit[];
  round: number;
}

export type ActionKind = 'attack' | 'skill' | 'ultimate';
export interface Action {
  kind: ActionKind;
  element: SlimeElement;
  targetId?: string; // for single-target actions
}

export type SkillTarget = 'enemy' | 'all-enemies' | 'lowest-ally' | 'all-allies';
export interface SkillDef {
  name: string;
  desc: string;
  target: SkillTarget;
  power?: number; // damage multiplier per hit
  hits?: number;
  heal?: number; // fraction of max HP
  shield?: number; // fraction of max HP
  burn?: number; // turns
  freeze?: number; // turns
  atkUp?: number;
  atkDown?: number;
  leech?: number; // fraction of damage dealt returned as HP
  pierce?: boolean;
  cost: number;
}

export const SKILL_COST = 40;
export const ULTIMATE_COST = 100;
export const ENERGY_PER_ATTACK = 30;
export const ENERGY_WHEN_HIT = 12;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const SKILLS: Record<SlimeElement, SkillDef> = {
  fire: { name: 'Ember Burst', desc: 'Strong hit that sets the enemy on fire.', target: 'enemy', power: 1.3, burn: 3, cost: SKILL_COST },
  water: { name: 'Healing Tide', desc: 'Heals your most hurt friend.', target: 'lowest-ally', heal: 0.25, cost: SKILL_COST },
  plant: { name: 'Leech Seed', desc: 'Hits and steals health.', target: 'enemy', power: 1.0, leech: 0.5, cost: SKILL_COST },
  earth: { name: 'Stone Wall', desc: 'Puts a shield on the whole team.', target: 'all-allies', shield: 0.16, cost: SKILL_COST },
  wind: { name: 'Gale Flurry', desc: 'Three quick hits.', target: 'enemy', power: 0.55, hits: 3, cost: SKILL_COST },
  ice: { name: 'Deep Freeze', desc: 'Hits and freezes the enemy for a turn.', target: 'enemy', power: 1.0, freeze: 1, cost: SKILL_COST },
  electric: { name: 'Chain Lightning', desc: 'Zaps every enemy.', target: 'all-enemies', power: 0.7, cost: SKILL_COST },
  metal: { name: 'Iron Slam', desc: 'Heavy hit that ignores half the armour.', target: 'enemy', power: 1.4, pierce: true, cost: SKILL_COST },
  light: { name: 'Blessing', desc: 'Heals the team and boosts their attack.', target: 'all-allies', heal: 0.08, atkUp: 3, cost: SKILL_COST },
  shadow: { name: 'Curse', desc: 'Hits and weakens the enemy\'s attack.', target: 'enemy', power: 1.0, atkDown: 3, cost: SKILL_COST },
};

/** The ultimate is the element's skill turned up: it hits every enemy, and helps the whole team where the skill helps. */
export function ultimateOf(element: SlimeElement): SkillDef {
  const s = SKILLS[element];
  return {
    name: `${cap(element)} Nova`,
    desc: 'Hits every enemy with the full power of the element.',
    target: 'all-enemies',
    power: Math.max(0.8, (s.power ?? 1.0) * 0.95),
    hits: s.hits,
    burn: s.burn,
    freeze: s.freeze,
    atkDown: s.atkDown,
    leech: s.leech,
    pierce: s.pierce,
    // allies share in it
    heal: s.heal ? 0.3 : s.atkUp ? 0.12 : undefined,
    shield: s.shield ? 0.22 : undefined,
    atkUp: s.atkUp,
    cost: ULTIMATE_COST,
  };
}

export type BattleEvent =
  | { type: 'cast'; actorId: string; name: string; element: SlimeElement; kind: ActionKind; targetIds: string[] }
  | { type: 'hit'; actorId: string; targetId: string; damage: number; absorbed: number; element: SlimeElement; effectiveness: Effectiveness; crit: boolean; hpAfter: number; hit: number; hits: number; fatal: boolean }
  | { type: 'heal'; targetId: string; amount: number; hpAfter: number; element: SlimeElement }
  | { type: 'shield'; targetId: string; amount: number; element: SlimeElement }
  | { type: 'status'; targetId: string; status: StatusName; turns: number }
  | { type: 'dot'; targetId: string; damage: number; hpAfter: number; fatal: boolean }
  | { type: 'skip'; actorId: string; reason: 'freeze' }
  | { type: 'energy'; unitId: string; energy: number }
  | { type: 'faint'; unitId: string }
  | { type: 'expire'; unitId: string; status: StatusName };

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const toUnit = (s: BattleSlime, team: Team): Unit => ({
  id: s.id,
  team,
  slime: s,
  name: s.name,
  level: s.level,
  elements: s.elements.length ? s.elements : [s.element],
  hp: s.battleStats.hp,
  maxHp: s.battleStats.maxHp,
  attack: s.battleStats.attack,
  defense: s.battleStats.defense,
  speed: Math.max(1, s.battleStats.speed),
  energy: 0,
  // a head start in proportion to speed, with a little luck, so the opening order isn't fixed
  gauge: s.battleStats.speed * (0.5 + Math.random() * 0.8),
  statuses: {},
  alive: s.battleStats.hp > 0,
});

export function createBattle(player: BattleSlime[], enemy: BattleSlime[]): Battle {
  return { units: [...player.map(s => toUnit(s, 'player')), ...enemy.map(s => toUnit(s, 'enemy'))], round: 0 };
}

export const unitById = (b: Battle, id: string) => b.units.find(u => u.id === id)!;
export const alive = (b: Battle, team?: Team) => b.units.filter(u => u.alive && (!team || u.team === team));
export const opponentsOf = (b: Battle, u: Unit) => alive(b, u.team === 'player' ? 'enemy' : 'player');
export const alliesOf = (b: Battle, u: Unit) => alive(b, u.team);

export function winner(b: Battle): Team | null {
  if (!alive(b, 'enemy').length) return 'player';
  if (!alive(b, 'player').length) return 'enemy';
  return null;
}

// ---------------------------------------------------------------------------
// Turn order
// ---------------------------------------------------------------------------

const TURN_AT = 100;

function nextByGauge(units: { gauge: number; speed: number; alive: boolean; team: Team; id: string }[]) {
  let best: (typeof units)[number] | null = null;
  let bestT = Infinity;
  for (const u of units) {
    if (!u.alive) continue;
    const t = Math.max(0, (TURN_AT - u.gauge) / u.speed);
    // ties go to the player
    if (t < bestT - 1e-9 || (Math.abs(t - bestT) < 1e-9 && best && u.team === 'player' && best.team !== 'player')) {
      best = u;
      bestT = t;
    }
  }
  return best ? { unit: best, time: bestT } : null;
}

/** Who acts next, in order (for the turn-order bar). Ignores freezes. */
export function upcomingOrder(b: Battle, count: number): string[] {
  const sim = b.units.map(u => ({ id: u.id, team: u.team, gauge: u.gauge, speed: u.speed, alive: u.alive }));
  const order: string[] = [];
  for (let i = 0; i < count; i++) {
    const n = nextByGauge(sim);
    if (!n) break;
    for (const u of sim) if (u.alive) u.gauge += u.speed * n.time;
    n.unit.gauge -= TURN_AT;
    order.push(n.unit.id);
  }
  return order;
}

function damageUnit(b: Battle, unit: Unit, amount: number): { dealt: number; absorbed: number } {
  let remaining = amount;
  let absorbed = 0;
  const sh = unit.statuses.shield;
  if (sh && sh.amount > 0) {
    absorbed = Math.min(sh.amount, remaining);
    sh.amount -= absorbed;
    remaining -= absorbed;
    if (sh.amount <= 0) delete unit.statuses.shield;
  }
  unit.hp = Math.max(0, unit.hp - remaining);
  if (unit.hp <= 0) {
    unit.alive = false;
    unit.statuses = {};
  }
  return { dealt: remaining, absorbed };
}

/** Advance to the next acting slime and apply start-of-turn effects (burn, freeze). */
export function startTurn(b: Battle): { actorId: string; events: BattleEvent[]; skipped: boolean } | null {
  if (winner(b)) return null;
  const n = nextByGauge(b.units);
  if (!n) return null;
  for (const u of b.units) if (u.alive) u.gauge += u.speed * n.time;
  const actor = unitById(b, n.unit.id);
  actor.gauge -= TURN_AT;
  b.round++;

  const events: BattleEvent[] = [];

  const burn = actor.statuses.burn;
  if (burn) {
    const { dealt } = damageUnit(b, actor, burn.dmg);
    burn.turns--;
    events.push({ type: 'dot', targetId: actor.id, damage: dealt, hpAfter: actor.hp, fatal: !actor.alive });
    if (!actor.alive) {
      events.push({ type: 'faint', unitId: actor.id });
      return { actorId: actor.id, events, skipped: true };
    }
    if (burn.turns <= 0) {
      delete actor.statuses.burn;
      events.push({ type: 'expire', unitId: actor.id, status: 'burn' });
    }
  }

  if (actor.statuses.freeze && actor.statuses.freeze > 0) {
    actor.statuses.freeze--;
    if (actor.statuses.freeze <= 0) delete actor.statuses.freeze;
    events.push({ type: 'skip', actorId: actor.id, reason: 'freeze' });
    events.push({ type: 'expire', unitId: actor.id, status: 'freeze' });
    endOfTurnUpkeep(actor, events);
    return { actorId: actor.id, events, skipped: true };
  }
  return { actorId: actor.id, events, skipped: false };
}

function endOfTurnUpkeep(actor: Unit, events: BattleEvent[]) {
  const st = actor.statuses;
  if (st.shield) {
    st.shield.turns--;
    if (st.shield.turns <= 0) {
      delete st.shield;
      events.push({ type: 'expire', unitId: actor.id, status: 'shield' });
    }
  }
  for (const key of ['atkUp', 'atkDown'] as const) {
    if (st[key] !== undefined) {
      st[key]!--;
      if (st[key]! <= 0) {
        delete st[key];
        events.push({ type: 'expire', unitId: actor.id, status: key });
      }
    }
  }
}

export function endTurn(b: Battle, actorId: string): BattleEvent[] {
  const actor = unitById(b, actorId);
  const events: BattleEvent[] = [];
  if (actor.alive) endOfTurnUpkeep(actor, events);
  return events;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export function skillFor(action: Pick<Action, 'kind' | 'element'>): SkillDef | null {
  if (action.kind === 'skill') return SKILLS[action.element];
  if (action.kind === 'ultimate') return ultimateOf(action.element);
  return null;
}

export function canAfford(unit: Unit, kind: ActionKind): boolean {
  if (kind === 'attack') return true;
  return unit.energy >= (kind === 'skill' ? SKILL_COST : ULTIMATE_COST);
}

/** The best element of this slime against a target (an Attack uses it automatically). */
export function bestElement(attacker: Unit, target: Unit): SlimeElement {
  let best = attacker.elements[0];
  let bestMult = -1;
  for (const el of attacker.elements) {
    const m = getTypeMultiplier(el, target.elements);
    if (m > bestMult) {
      bestMult = m;
      best = el;
    }
  }
  return best;
}

export function targetsFor(b: Battle, actor: Unit, action: Action): Unit[] {
  const def = skillFor(action);
  const enemies = opponentsOf(b, actor);
  const allies = alliesOf(b, actor);
  if (!def) {
    const t = action.targetId ? unitById(b, action.targetId) : null;
    return t && t.alive ? [t] : enemies.slice(0, 1);
  }
  switch (def.target) {
    case 'all-enemies':
      return enemies;
    case 'all-allies':
      return allies;
    case 'lowest-ally':
      return [allies.reduce((low, u) => (u.hp / u.maxHp < low.hp / low.maxHp ? u : low), allies[0])];
    default: {
      const t = action.targetId ? unitById(b, action.targetId) : null;
      return t && t.alive ? [t] : enemies.slice(0, 1);
    }
  }
}

interface Hit {
  damage: number;
  effectiveness: Effectiveness;
  crit: boolean;
}

function rollHit(attacker: Unit, target: Unit, element: SlimeElement, power: number, pierce: boolean, bonus: number): Hit {
  const mult = getTypeMultiplier(element, target.elements);
  const crit = Math.random() < 0.1;
  const atk = attacker.attack * (attacker.statuses.atkUp ? 1.25 : 1) * (attacker.statuses.atkDown ? 0.7 : 1);
  const base = atk * mult * (0.85 + Math.random() * 0.3) * (crit ? 1.5 : 1) * power * bonus;
  const damage = Math.max(1, Math.floor(base - target.defense * 0.3 * (pierce ? 0.5 : 1)));
  return { damage, effectiveness: effectivenessFromMultiplier(mult), crit };
}

export function expectedDamage(attacker: Unit, target: Unit, element: SlimeElement, power = 1, pierce = false): number {
  const mult = getTypeMultiplier(element, target.elements);
  return Math.max(1, attacker.attack * mult * power - target.defense * 0.3 * (pierce ? 0.5 : 1));
}

/**
 * Carry out an action. `bonus` is the timing bonus the player earned (1.0 = none) and only
 * multiplies damage. Returns the events, in order, for the arena to play.
 */
export function resolveAction(b: Battle, actorId: string, action: Action, bonus = 1): BattleEvent[] {
  const actor = unitById(b, actorId);
  const def = skillFor(action);
  const targets = targetsFor(b, actor, action);
  const events: BattleEvent[] = [];
  const el = action.element;

  events.push({
    type: 'cast',
    actorId,
    name: action.kind === 'attack' ? `${cap(el)} Strike` : def!.name,
    element: el,
    kind: action.kind,
    targetIds: targets.map(t => t.id),
  });

  if (action.kind !== 'attack') {
    actor.energy = Math.max(0, actor.energy - (action.kind === 'skill' ? SKILL_COST : ULTIMATE_COST));
  }

  const power = def?.power ?? (action.kind === 'attack' ? 1 : 0);
  const hits = def?.hits ?? 1;
  let totalDealt = 0;

  // damage
  if (power > 0) {
    for (const target of targets) {
      for (let h = 0; h < hits; h++) {
        if (!target.alive) break;
        const roll = rollHit(actor, target, el, power, !!def?.pierce, bonus);
        const { dealt, absorbed } = damageUnit(b, target, roll.damage);
        totalDealt += dealt;
        events.push({
          type: 'hit', actorId, targetId: target.id, damage: dealt, absorbed, element: el,
          effectiveness: roll.effectiveness, crit: roll.crit, hpAfter: target.hp, hit: h + 1, hits, fatal: !target.alive,
        });
        if (!target.alive) {
          events.push({ type: 'faint', unitId: target.id });
        } else {
          // being hit charges the victim's energy a little
          target.energy = Math.min(100, target.energy + ENERGY_WHEN_HIT);
          events.push({ type: 'energy', unitId: target.id, energy: target.energy });
        }
      }
    }
  }

  // effects on the enemies it hit
  if (def && power > 0) {
    for (const target of targets) {
      if (!target.alive) continue;
      if (def.burn) {
        target.statuses.burn = { turns: def.burn, dmg: Math.max(3, Math.round(target.maxHp * 0.06)) };
        events.push({ type: 'status', targetId: target.id, status: 'burn', turns: def.burn });
      }
      if (def.freeze) {
        target.statuses.freeze = def.freeze;
        events.push({ type: 'status', targetId: target.id, status: 'freeze', turns: def.freeze });
      }
      if (def.atkDown) {
        target.statuses.atkDown = def.atkDown;
        events.push({ type: 'status', targetId: target.id, status: 'atkDown', turns: def.atkDown });
      }
    }
  }

  // lifesteal
  if (def?.leech && totalDealt > 0 && actor.alive) {
    const amount = Math.min(actor.maxHp - actor.hp, Math.round(totalDealt * def.leech));
    if (amount > 0) {
      actor.hp += amount;
      events.push({ type: 'heal', targetId: actor.id, amount, hpAfter: actor.hp, element: el });
    }
  }

  // help for the team (skills that target allies, and the ally half of an ultimate)
  const helpTargets = def?.target === 'lowest-ally' || def?.target === 'all-allies' ? targets : action.kind === 'ultimate' ? alliesOf(b, actor) : [];
  if (def && helpTargets.length) {
    for (const ally of helpTargets) {
      if (!ally.alive) continue;
      if (def.heal) {
        const amount = Math.min(ally.maxHp - ally.hp, Math.round(ally.maxHp * def.heal));
        if (amount > 0) {
          ally.hp += amount;
          events.push({ type: 'heal', targetId: ally.id, amount, hpAfter: ally.hp, element: el });
        }
      }
      if (def.shield) {
        const amount = Math.round(ally.maxHp * def.shield);
        ally.statuses.shield = { amount: Math.max(ally.statuses.shield?.amount ?? 0, amount), turns: 3 }; // refreshes, never stacks
        events.push({ type: 'shield', targetId: ally.id, amount, element: el });
      }
      if (def.atkUp) {
        ally.statuses.atkUp = def.atkUp;
        events.push({ type: 'status', targetId: ally.id, status: 'atkUp', turns: def.atkUp });
      }
    }
  }

  // energy: an attack builds it
  if (action.kind === 'attack') actor.energy = Math.min(100, actor.energy + ENERGY_PER_ATTACK);
  events.push({ type: 'energy', unitId: actor.id, energy: actor.energy });

  return events;
}

// ---------------------------------------------------------------------------
// AI (used by the enemy, by Auto-battle, and by the balance simulation)
// ---------------------------------------------------------------------------

export function chooseAction(b: Battle, actor: Unit, smartness = 0.8): Action | null {
  const enemies = opponentsOf(b, actor);
  const allies = alliesOf(b, actor);
  if (!enemies.length) return null;

  const options: Array<{ action: Action; score: number }> = [];

  for (const target of enemies) {
    const el = bestElement(actor, target);
    const dmg = expectedDamage(actor, target, el);
    const finisher = dmg >= target.hp ? 40 : 0;
    const wounded = (1 - target.hp / target.maxHp) * 5;
    options.push({ action: { kind: 'attack', element: el, targetId: target.id }, score: dmg + finisher + wounded });
  }

  const evalSkill = (kind: 'skill' | 'ultimate', el: SlimeElement) => {
    const def = skillFor({ kind, element: el })!;
    const bonus = kind === 'ultimate' ? 30 : 0;
    const woundedAlly = allies.reduce((low, u) => Math.min(low, u.hp / u.maxHp), 1);
    // what a support effect is really worth, in the same units as damage
    const helpScore = () => {
      let s = 0;
      if (def.heal) {
        const hurt = allies.filter(u => u.hp / u.maxHp < 0.5);
        if (hurt.length) s += hurt.reduce((sum, u) => sum + Math.min(u.maxHp - u.hp, u.maxHp * def.heal!), 0) * 0.7;
      }
      if (def.shield) s += allies.filter(u => !u.statuses.shield).reduce((sum, u) => sum + u.maxHp * def.shield! * 0.35, 0);
      if (def.atkUp) s += allies.filter(u => !u.statuses.atkUp).reduce((sum, u) => sum + u.attack * 0.25 * 1.5, 0);
      return s;
    };
    if (def.target === 'enemy') {
      for (const t of enemies) {
        let score = expectedDamage(actor, t, el, (def.power ?? 1) * (def.hits ?? 1), !!def.pierce) + bonus;
        if (def.burn && !t.statuses.burn) score += 10;
        if (def.freeze && !t.statuses.freeze) score += 14;
        if (def.atkDown && !t.statuses.atkDown) score += 10;
        if (def.leech) score += 6;
        if (expectedDamage(actor, t, el, (def.power ?? 1) * (def.hits ?? 1)) >= t.hp) score += 40;
        options.push({ action: { kind, element: el, targetId: t.id }, score });
      }
    } else if (def.target === 'all-enemies') {
      let score = enemies.reduce((sum, t) => sum + expectedDamage(actor, t, el, (def.power ?? 1) * (def.hits ?? 1), !!def.pierce), 0) + bonus + helpScore();
      if (def.burn) score += 8;
      if (def.freeze) score += 12;
      options.push({ action: { kind, element: el }, score });
    } else {
      const s = helpScore();
      if (s > 0) options.push({ action: { kind, element: el }, score: s + bonus });
    }
  };

  if (actor.energy >= SKILL_COST) for (const el of actor.elements.slice(0, 2)) evalSkill('skill', el);
  if (actor.energy >= ULTIMATE_COST) evalSkill('ultimate', actor.elements[0]);

  if (Math.random() < smartness) return options.reduce((best, o) => (o.score > best.score ? o : best)).action;
  // otherwise one of the better few
  const sorted = [...options].sort((a, b2) => b2.score - a.score).slice(0, 3);
  return sorted[Math.floor(Math.random() * sorted.length)].action;
}

/** Headless fight with the same rules as the arena (used for balance testing). */
export function simulateFight(
  player: BattleSlime[],
  enemy: BattleSlime[],
  opts: { playerSmartness?: number; enemySmartness?: number } = {}
): { winner: Team; rounds: number } {
  const b = createBattle(player, enemy);
  let guard = 0;
  while (!winner(b) && guard++ < 600) {
    const turn = startTurn(b);
    if (!turn) break;
    if (!turn.skipped) {
      const actor = unitById(b, turn.actorId);
      const action = chooseAction(b, actor, actor.team === 'player' ? opts.playerSmartness ?? 0.9 : opts.enemySmartness ?? 0.75);
      if (action) resolveAction(b, actor.id, action);
      endTurn(b, actor.id);
    }
  }
  return { winner: winner(b) ?? 'enemy', rounds: b.round };
}
