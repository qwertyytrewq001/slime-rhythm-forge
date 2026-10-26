import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { BattleSlime, SlimeElement } from '@/types/slime';
import { calculateBattleRewards, getTypeMultiplier, isBossLevel } from '@/utils/battleEngine';
import {
  Action, ActionKind, Battle, BattleEvent, ENERGY_PER_ATTACK, SKILLS, SKILL_COST, ULTIMATE_COST, Unit,
  alive, canAfford, chooseAction, createBattle, endTurn, opponentsOf, resolveAction, skillFor, startTurn, ultimateOf, unitById, upcomingOrder, winner,
} from '@/utils/battleCore';
import { SlimeCanvas } from './SlimeCanvas';
import { getStage } from '@/utils/slimeRenderer';
import { audioEngine } from '@/utils/audioEngine';
import { X } from 'lucide-react';

interface BattleArenaProps {
  level: number;
  playerTeam: BattleSlime[];
  opponentTeam: BattleSlime[];
  onClose: () => void;
  onBattleComplete?: (result: { winner: 'player' | 'opponent'; level: number }) => void;
}

// ---------------------------------------------------------------------------
// Look and layout
// ---------------------------------------------------------------------------

const BASE = import.meta.env.BASE_URL;
const bt = (file: string) => `${BASE}battle/${file}`;
const PARCHMENT = '#f6e8c3';
const INK = '#4a2f17';
const GOLD = '#f2b632';

const TINT: Record<SlimeElement, string> = {
  fire: '#ff6a2b', water: '#3da5ff', plant: '#4cc94a', earth: '#c08850', wind: '#9fd6ee',
  ice: '#7fd8ff', electric: '#ffd83a', metal: '#b8c0c8', light: '#fff0a0', shadow: '#9a6be0',
};

// Where the three slimes of each side stand on the platform, as % of the stage (feet position)
const PLAYER_SPOTS = [{ x: 41, y: 55 }, { x: 31, y: 66 }, { x: 41, y: 77 }];
const ENEMY_SPOTS = PLAYER_SPOTS.map(p => ({ x: 100 - p.x, y: p.y }));

const arenaIndex = (level: number) => Math.min(5, Math.floor((level - 1) / 10) + 1);

type Mood = 'idle' | 'hurt' | 'tired' | 'cheer' | 'sad';
interface View {
  hp: number;
  maxHp: number;
  energy: number;
  alive: boolean;
  burn: boolean;
  freeze: boolean;
  shield: number;
  atkUp: boolean;
  atkDown: boolean;
  mood: Mood;
  hit: boolean;
}

type Fx =
  | { id: number; kind: 'pop'; x: number; y: number; text: string; color: string; size: number; label?: string; labelColor?: string }
  | { id: number; kind: 'impact'; x: number; y: number; element: SlimeElement; scale: number }
  | { id: number; kind: 'orb'; x: number; y: number; toX: number; toY: number; color: string }
  | { id: number; kind: 'ring'; x: number; y: number; color: string; big?: boolean }
  | { id: number; kind: 'burst'; x: number; y: number; emojis: string[]; count: number };
type FxInput = Fx extends infer T ? (T extends { id: number } ? Omit<T, 'id'> : never) : never;

interface Callout {
  id: number;
  text: string;
  element: SlimeElement;
  kind: ActionKind;
  who: string;
}

type Cmd =
  | { actorId: string; mode: 'choose' }
  | { actorId: string; mode: 'target'; pending: { kind: ActionKind; element: SlimeElement } }
  | { actorId: string; mode: 'timing'; action: Action; x: number; y: number };

class Cancelled extends Error {}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** SlimeCanvas multiplies its size by 2.5 and by the growth stage (baby 0.6, teen 0.85, adult 1). In battle every slime is drawn at a size we choose. */
const spriteMult = (slime: { level: number }) => {
  const st = getStage(slime.level || 1);
  const stageScale = st === 'baby' ? 0.6 : st === 'teen' ? 0.85 : 1;
  const look = st === 'baby' ? 0.9 : st === 'teen' ? 0.95 : 1;
  return look / (2.5 * stageScale) * 1; // actual px = size * look
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const BattleArena: React.FC<BattleArenaProps> = ({ level, playerTeam, opponentTeam, onClose, onBattleComplete }) => {
  const { dispatch } = useGameState();
  const boss = isBossLevel(level);

  const [battle] = useState<Battle>(() => createBattle(playerTeam, opponentTeam));
  const [view, setView] = useState<Record<string, View>>(() =>
    Object.fromEntries(
      battle.units.map(u => [u.id, { hp: u.hp, maxHp: u.maxHp, energy: 0, alive: u.alive, burn: false, freeze: false, shield: 0, atkUp: false, atkDown: false, mood: 'idle' as Mood, hit: false }]),
    ),
  );
  const [order, setOrder] = useState<string[]>([]);
  const [actorId, setActorId] = useState<string | null>(null);
  const [cmd, setCmd] = useState<Cmd | null>(null);
  const [fx, setFx] = useState<Fx[]>([]);
  const [callout, setCallout] = useState<Callout | null>(null);
  const [dim, setDim] = useState(false);
  const [flash, setFlash] = useState(0);
  const [bossBanner, setBossBanner] = useState(false);
  const [result, setResult] = useState<null | { won: boolean; goo: number; xp: number; perfects: number }>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [auto, setAuto] = useState(false);
  const [timingOn, setTimingOn] = useState(() => {
    try { return localStorage.getItem('battle_timing') !== 'off'; } catch { return true; }
  });
  const [sw, setSw] = useState(1000);
  const [hint, setHint] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const els = useRef<Record<string, { outer: HTMLElement | null; body: HTMLElement | null; squash: HTMLElement | null; bob: HTMLElement | null }>>({});
  const runRef = useRef(0);
  const speedRef = useRef(1);
  const autoRef = useRef(false);
  const timingRef = useRef(true);
  const resolverRef = useRef<((r: { action: Action; bonus: number }) => void) | null>(null);
  const perfectsRef = useRef(0);
  const fxId = useRef(0);
  const calloutId = useRef(0);
  speedRef.current = speed;
  autoRef.current = auto;
  timingRef.current = timingOn;

  // ---- stage size ----
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSw(el.clientWidth || 1000);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- tiny helpers ----
  const wait = useCallback((ms: number) => new Promise<void>(r => setTimeout(r, ms / speedRef.current)), []);
  const patch = useCallback((id: string, p: Partial<View>) => setView(v => ({ ...v, [id]: { ...v[id], ...p } })), []);
  const addFx = useCallback((item: FxInput, life = 900) => {
    const id = ++fxId.current;
    setFx(list => [...list, { ...item, id } as Fx]);
    setTimeout(() => setFx(list => list.filter(f => f.id !== id)), life);
  }, []);

  const stageRect = () => stageRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 1000, height: 560 };
  /** Centre of a slime's body, in stage pixels */
  const centerOf = (id: string, dy = 0.45) => {
    const b = els.current[id]?.body;
    const s = stageRect();
    if (!b) return { x: s.width / 2, y: s.height / 2 };
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2 - s.left, y: r.top + r.height * dy - s.top };
  };
  const animate = (el: Element | null | undefined, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
    try { return el?.animate?.(frames, { fill: 'forwards', ...opts }); } catch { return undefined; }
  };
  const shake = (amount: number) => {
    const px = amount;
    animate(stageRef.current, [
      { transform: 'translate(0,0)' }, { transform: `translate(${-px}px, ${px * 0.4}px)` }, { transform: `translate(${px}px, ${-px * 0.5}px)` },
      { transform: `translate(${-px * 0.6}px, 0)` }, { transform: `translate(${px * 0.4}px, ${px * 0.2}px)` }, { transform: 'translate(0,0)' },
    ], { duration: 300 / speedRef.current, fill: 'none' });
  };
  const isPlayer = (id: string) => unitById(battle, id)?.team === 'player';

  // ---- reactions ----
  const hurtReaction = (targetId: string, fromId: string, strong: boolean) => {
    const e = els.current[targetId];
    const t = centerOf(targetId);
    const a = centerOf(fromId);
    const dir = t.x >= a.x ? 1 : -1;
    animate(e?.body, [
      { transform: 'translate(0,0)' }, { transform: `translate(${dir * (strong ? 34 : 22)}px, ${strong ? -14 : -8}px)` },
      { transform: `translate(${dir * 10}px, 0)` }, { transform: 'translate(0,0)' },
    ], { duration: 420 / speedRef.current, easing: 'cubic-bezier(.2,.8,.3,1)' });
    animate(e?.squash, [
      { transform: 'scale(1,1) rotate(0deg)' }, { transform: `scale(1.28,0.7) rotate(${dir * 9}deg)` },
      { transform: 'scale(0.92,1.1) rotate(0deg)' }, { transform: 'scale(1,1) rotate(0deg)' },
    ], { duration: 460 / speedRef.current });
    animate(e?.bob, [
      { filter: 'brightness(1)' }, { filter: 'brightness(2.6) saturate(0.2)' }, { filter: 'sepia(1) saturate(6) hue-rotate(-35deg) brightness(1.05)' }, { filter: 'brightness(1)' },
    ], { duration: 340 / speedRef.current });
    patch(targetId, { mood: 'hurt', hit: true });
    setTimeout(() => patch(targetId, { hit: false }), 380);
    setTimeout(() => {
      const u = unitById(battle, targetId);
      setView(v => (v[targetId].mood === 'hurt' ? { ...v, [targetId]: { ...v[targetId], mood: u.alive ? (u.hp / u.maxHp < 0.35 ? 'tired' : 'idle') : 'idle' } } : v));
    }, 950 / speedRef.current);
  };

  const faint = (id: string) => {
    const e = els.current[id];
    const dir = isPlayer(id) ? -1 : 1;
    patch(id, { alive: false, mood: 'idle', burn: false, freeze: false, shield: 0, atkUp: false, atkDown: false });
    const c = centerOf(id);
    addFx({ kind: 'burst', x: c.x, y: c.y, emojis: ['💨', '✨'], count: 7 }, 900);
    animate(e?.squash, [
      { transform: 'rotate(0deg) scale(1)', opacity: 1 }, { transform: `rotate(${dir * 40}deg) scale(1.05)`, opacity: 1, offset: 0.35 },
      { transform: `rotate(${dir * 90}deg) scale(0.8) translateY(20px)`, opacity: 0 },
    ], { duration: 800 / speedRef.current, easing: 'ease-in' });
  };

  // ---- playing events ----
  const popupColor = (ev: Extract<BattleEvent, { type: 'hit' }>) =>
    ev.crit ? '#ffe14d' : ev.effectiveness === 'super' ? '#8dff9e' : ev.effectiveness === 'weak' ? '#c5ccd6' : '#ffffff';

  const playEvent = async (ev: BattleEvent, castFrom?: string) => {
    switch (ev.type) {
      case 'hit': {
        const c = centerOf(ev.targetId);
        const label = ev.crit ? 'CRITICAL!' : ev.effectiveness === 'super' ? '▲ SUPER' : ev.effectiveness === 'weak' ? '▼ RESIST' : undefined;
        addFx({ kind: 'impact', x: c.x, y: c.y, element: ev.element, scale: ev.crit ? 1.35 : 1 }, 620);
        if (ev.damage > 0) {
          addFx({ kind: 'pop', x: c.x, y: c.y - sw * 0.07, text: `-${ev.damage}`, color: popupColor(ev), size: ev.crit ? 1.9 : ev.effectiveness === 'super' ? 1.5 : 1.2, label, labelColor: popupColor(ev) }, 1100);
        } else {
          addFx({ kind: 'pop', x: c.x, y: c.y - sw * 0.07, text: 'BLOCKED', color: '#b8d8ff', size: 1.0 }, 1000);
        }
        audioEngine.playSfx(ev.crit ? 'discovery' : 'hatch');
        shake(ev.crit ? 14 : ev.effectiveness === 'super' ? 9 : 5);
        if (castFrom) hurtReaction(ev.targetId, castFrom, ev.crit || ev.effectiveness === 'super');
        setView(v => {
          const cur = v[ev.targetId];
          return { ...v, [ev.targetId]: { ...cur, hp: ev.hpAfter, shield: Math.max(0, cur.shield - ev.absorbed) } };
        });
        await wait(ev.crit ? 150 : 85); // hit-stop
        if (ev.hits > 1 && ev.hit < ev.hits) await wait(70);
        break;
      }
      case 'faint':
        faint(ev.unitId);
        await wait(520);
        break;
      case 'heal': {
        const c = centerOf(ev.targetId);
        addFx({ kind: 'pop', x: c.x, y: c.y - sw * 0.07, text: `+${ev.amount}`, color: '#7cffb2', size: 1.3 }, 1100);
        addFx({ kind: 'burst', x: c.x, y: c.y, emojis: ['💚', '✨'], count: 8 }, 1000);
        patch(ev.targetId, { hp: ev.hpAfter });
        audioEngine.playSfx('collect');
        animate(els.current[ev.targetId]?.squash, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.12,0.92)' }, { transform: 'scale(0.96,1.08)' }, { transform: 'scale(1,1)' }], { duration: 420 / speedRef.current });
        await wait(300);
        break;
      }
      case 'shield': {
        const c = centerOf(ev.targetId);
        addFx({ kind: 'ring', x: c.x, y: c.y, color: TINT[ev.element] }, 800);
        addFx({ kind: 'pop', x: c.x, y: c.y - sw * 0.07, text: `+${ev.amount} 🛡️`, color: '#ffd9a0', size: 1.1 }, 1000);
        setView(v => ({ ...v, [ev.targetId]: { ...v[ev.targetId], shield: ev.amount } }));
        await wait(260);
        break;
      }
      case 'status': {
        const c = centerOf(ev.targetId);
        const names = { burn: ['BURNING!', '#ff9a52'], freeze: ['FROZEN!', '#9fe6ff'], atkDown: ['WEAKENED', '#caa0ff'], atkUp: ['POWER UP!', '#ffe14d'], shield: ['', '#fff'] } as const;
        const [text, color] = names[ev.status];
        if (text) addFx({ kind: 'pop', x: c.x, y: c.y - sw * 0.1, text, color, size: 0.95 }, 1000);
        patch(ev.targetId, { [ev.status]: true } as Partial<View>);
        if (ev.status === 'freeze') animate(els.current[ev.targetId]?.bob, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.3) saturate(0.6) hue-rotate(170deg)' }], { duration: 300, fill: 'forwards' });
        await wait(150);
        break;
      }
      case 'expire':
        patch(ev.unitId, { [ev.status]: ev.status === 'shield' ? 0 : false } as Partial<View>);
        if (ev.status === 'freeze') animate(els.current[ev.unitId]?.bob, [{ filter: 'brightness(1)' }], { duration: 200, fill: 'forwards' });
        break;
      case 'dot': {
        const c = centerOf(ev.targetId);
        addFx({ kind: 'pop', x: c.x, y: c.y - sw * 0.07, text: `-${ev.damage}`, color: '#ff9a52', size: 1.0, label: '🔥 BURN', labelColor: '#ff9a52' }, 900);
        patch(ev.targetId, { hp: ev.hpAfter, mood: 'hurt' });
        animate(els.current[ev.targetId]?.squash, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.15,0.85)' }, { transform: 'scale(1,1)' }], { duration: 300 / speedRef.current });
        setTimeout(() => patch(ev.targetId, { mood: 'idle' }), 700);
        await wait(500);
        break;
      }
      case 'skip': {
        const c = centerOf(ev.actorId);
        addFx({ kind: 'pop', x: c.x, y: c.y - sw * 0.1, text: 'FROZEN SOLID', color: '#9fe6ff', size: 0.95 }, 1000);
        await wait(500);
        break;
      }
      case 'energy':
        patch(ev.unitId, { energy: ev.energy });
        break;
      default:
        break;
    }
  };

  const showCallout = (ev: Extract<BattleEvent, { type: 'cast' }>) => {
    const who = unitById(battle, ev.actorId).name;
    setCallout({ id: ++calloutId.current, text: ev.name, element: ev.element, kind: ev.kind, who });
    setTimeout(() => setCallout(c => (c && c.id === calloutId.current ? null : c)), (ev.kind === 'ultimate' ? 1700 : 1150) / speedRef.current);
  };

  const playAction = async (events: BattleEvent[]) => {
    const cast = events[0];
    if (cast.type !== 'cast') return;
    const actor = unitById(battle, cast.actorId);
    const e = els.current[cast.actorId];
    const first = cast.targetIds[0];
    const tint = TINT[cast.element];
    const lastTarget = first ? centerOf(first) : { x: sw / 2, y: 200 };
    const me = centerOf(cast.actorId);
    const damaging = events.some(x => x.type === 'hit');
    const toEnemies = cast.targetIds.length > 0 && unitById(battle, cast.targetIds[0]).team !== actor.team;

    if (e?.outer) e.outer.style.zIndex = '500';

    if (cast.kind === 'attack') {
      showCalloutQuiet(cast);
      // wind-up, then dash into the target
      animate(e?.squash, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.18,0.78)' }], { duration: 110 / speedRef.current });
      await wait(110);
      audioEngine.playSfx('tap');
      const dx = lastTarget.x - me.x;
      const dy = lastTarget.y - me.y;
      const dist = Math.hypot(dx, dy) || 1;
      const stop = Math.max(0, dist - sw * 0.085);
      animate(e?.body, [{ transform: 'translate(0,0)' }, { transform: `translate(${(dx / dist) * stop}px, ${(dy / dist) * stop - sw * 0.02}px)` }], { duration: 150 / speedRef.current, easing: 'cubic-bezier(.6,0,1,.6)' });
      animate(e?.squash, [{ transform: 'scale(1.18,0.78)' }, { transform: 'scale(0.82,1.22)' }], { duration: 150 / speedRef.current });
      await wait(150);
    } else {
      showCallout(cast);
      const ult = cast.kind === 'ultimate';
      if (ult) setDim(true);
      // charge: glow, rise, shake
      addFx({ kind: 'ring', x: me.x, y: me.y, color: tint, big: ult }, ult ? 1200 : 800);
      animate(e?.bob, [{ filter: 'brightness(1)' }, { filter: `brightness(1.5) drop-shadow(0 0 ${ult ? 28 : 18}px ${tint})` }], { duration: 300 / speedRef.current });
      animate(e?.body, [{ transform: 'translate(0,0)' }, { transform: `translate(0,${-sw * 0.03}px)` }], { duration: (ult ? 500 : 300) / speedRef.current, easing: 'ease-out' });
      animate(e?.squash, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.15,0.82)' }, { transform: 'scale(0.9,1.18)' }], { duration: (ult ? 500 : 300) / speedRef.current });
      audioEngine.playSfx(ult ? 'achievement' : 'breed');
      await wait(ult ? 650 : 340);
      if (damaging && toEnemies && cast.targetIds.length === 1) {
        addFx({ kind: 'orb', x: me.x, y: me.y - sw * 0.03, toX: lastTarget.x, toY: lastTarget.y, color: tint }, 420);
        await wait(210);
      } else if (damaging && toEnemies) {
        for (const id of cast.targetIds) {
          const c = centerOf(id);
          addFx({ kind: 'orb', x: me.x, y: me.y - sw * 0.03, toX: c.x, toY: c.y, color: tint }, 420);
        }
        await wait(260);
      }
      if (ult) {
        setFlash(f => f + 1);
        shake(18);
        await wait(120);
      }
    }

    for (const ev of events.slice(1)) {
      if (ev.type === 'energy' && ev.unitId !== cast.actorId) {
        await playEvent(ev, cast.actorId);
        continue;
      }
      await playEvent(ev, cast.actorId);
    }

    // back to the spot
    animate(e?.body, [{ transform: e?.body?.style.transform || 'translate(0,0)' }, { transform: 'translate(0,0)' }], { duration: 240 / speedRef.current, easing: 'ease-out' });
    animate(e?.squash, [{ transform: 'scale(1,1)' }, { transform: 'scale(1,1)' }], { duration: 10 });
    animate(e?.bob, [{ filter: 'brightness(1)' }], { duration: 250 });
    // a bounce of satisfaction after a hit that landed
    if (damaging) animate(e?.squash, [{ transform: 'scale(1,1)' }, { transform: 'scale(0.94,1.1)' }, { transform: 'scale(1,1)' }], { duration: 340 / speedRef.current });
    setDim(false);
    await wait(160);
    setTimeout(() => { if (e?.outer) e.outer.style.zIndex = ''; }, 300);
  };

  // plain attacks announce themselves quietly, so skills and ultimates stand out
  const showCalloutQuiet = (ev: Extract<BattleEvent, { type: 'cast' }>) => {
    const me = centerOf(ev.actorId);
    addFx({ kind: 'pop', x: me.x, y: me.y - sw * 0.11, text: ev.name, color: TINT[ev.element], size: 0.8 }, 700);
  };

  // ---- player's command ----
  const awaitPlayer = (actor: Unit) =>
    new Promise<{ action: Action; bonus: number }>(resolve => {
      resolverRef.current = resolve;
      setCmd({ actorId: actor.id, mode: 'choose' });
    });

  const commit = (action: Action, bonus: number) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setCmd(null);
    setHint(null);
    r?.({ action, bonus });
  };

  const needsEnemyTarget = (kind: ActionKind, element: SlimeElement) => {
    if (kind === 'attack') return true;
    const def = skillFor({ kind, element });
    return def?.target === 'enemy';
  };

  const afterTargetKnown = (action: Action) => {
    // damaging actions can earn a timing bonus
    const def = skillFor(action);
    const damaging = action.kind === 'attack' || (def?.power ?? 0) > 0;
    if (damaging && timingRef.current) {
      const targetIds = action.targetId ? [action.targetId] : opponentsOf(battle, unitById(battle, cmd!.actorId)).map(u => u.id);
      const pts = targetIds.map(id => centerOf(id));
      const x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const y = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      setCmd({ actorId: cmd!.actorId, mode: 'timing', action, x, y });
    } else {
      commit(action, 1);
    }
  };

  const chooseKind = (kind: ActionKind, element: SlimeElement) => {
    if (!cmd) return;
    const actor = unitById(battle, cmd.actorId);
    if (!canAfford(actor, kind)) return;
    audioEngine.playSfx('tap');
    if (needsEnemyTarget(kind, element)) {
      const foes = opponentsOf(battle, actor);
      if (foes.length === 1) {
        const action: Action = { kind, element: kind === 'attack' ? bestEl(actor, foes[0]) : element, targetId: foes[0].id };
        afterTargetKnown(action);
      } else {
        setCmd({ actorId: cmd.actorId, mode: 'target', pending: { kind, element } });
      }
    } else {
      afterTargetKnown({ kind, element });
    }
  };

  const bestEl = (a: Unit, t: Unit): SlimeElement => {
    let best = a.elements[0];
    let m = -1;
    for (const el of a.elements) {
      const v = getTypeMultiplier(el, t.elements);
      if (v > m) { m = v; best = el; }
    }
    return best;
  };

  const pickTarget = (targetId: string) => {
    if (!cmd || cmd.mode !== 'target') return;
    const actor = unitById(battle, cmd.actorId);
    const target = unitById(battle, targetId);
    if (!target.alive) return;
    audioEngine.playSfx('tap');
    const { kind, element } = cmd.pending;
    afterTargetKnown({ kind, element: kind === 'attack' ? bestEl(actor, target) : element, targetId });
  };

  // Auto-battle takes over a waiting command
  useEffect(() => {
    if (!auto || !cmd || cmd.mode === 'timing' && false) return;
    const actor = unitById(battle, cmd.actorId);
    const choice = chooseAction(battle, actor, 0.92);
    if (choice) commit(choice, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, cmd]);

  // ---- timing ring result ----
  const finishTiming = (bonus: number, label: string) => {
    if (!cmd || cmd.mode !== 'timing') return;
    const { action, x, y } = cmd;
    if (bonus > 1.2) perfectsRef.current += 1;
    if (label) addFx({ kind: 'pop', x, y: y - sw * 0.12, text: label, color: bonus > 1.2 ? '#ffe14d' : bonus > 1 ? '#8dff9e' : '#c5ccd6', size: 1.5 }, 900);
    commit(action, bonus);
  };

  // ---- the battle loop ----
  useEffect(() => {
    const myRun = ++runRef.current;
    const stop = () => runRef.current !== myRun;
    const guard = () => { if (stop()) throw new Cancelled(); };

    (async () => {
      try {
        await new Promise(r => setTimeout(r, 120));
        guard();
        // drop in
        battle.units.forEach((u, i) => {
          const e = els.current[u.id];
          animate(e?.body, [{ transform: `translateY(${-sw * 0.5}px)` }, { transform: 'translateY(0)' }], { duration: 520, delay: i * 90, easing: 'cubic-bezier(.3,1.4,.5,1)' });
          animate(e?.squash, [{ transform: 'scale(0.9,1.2)' }, { transform: 'scale(1.25,0.75)', offset: 0.7 }, { transform: 'scale(1,1)' }], { duration: 620, delay: i * 90 });
        });
        await new Promise(r => setTimeout(r, 900));
        guard();
        if (boss) {
          setBossBanner(true);
          audioEngine.playSfx('discovery');
          await new Promise(r => setTimeout(r, 1900));
          guard();
          setBossBanner(false);
        }

        while (!stop()) {
          const turn = startTurn(battle);
          if (!turn) break;
          setActorId(turn.actorId);
          setOrder(upcomingOrder(battle, 8));
          if (turn.events.length) {
            await playEventsList(turn.events);
            guard();
          }
          if (winner(battle)) break;
          if (turn.skipped) {
            await wait(200);
            guard();
            continue;
          }
          const actor = unitById(battle, turn.actorId);
          let choice: { action: Action; bonus: number } | null;
          if (actor.team === 'player' && !autoRef.current) {
            choice = await awaitPlayer(actor);
          } else {
            await wait(actor.team === 'player' ? 220 : 380);
            choice = { action: chooseAction(battle, actor, actor.team === 'player' ? 0.92 : 0.75)!, bonus: 1 };
          }
          guard();
          if (!choice.action) break;
          const events = resolveAction(battle, actor.id, choice.action, choice.bonus);
          await playAction(events);
          guard();
          const end = endTurn(battle, actor.id);
          if (end.length) await playEventsList(end);
          guard();
          setOrder(upcomingOrder(battle, 8));
        }
        if (!stop()) await finish();
      } catch (e) {
        if (!(e instanceof Cancelled)) console.error(e);
      }
    })();

    return () => {
      runRef.current++;
      resolverRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playEventsList = async (events: BattleEvent[]) => {
    for (const ev of events) await playEvent(ev);
  };

  const finish = async () => {
    const won = winner(battle) === 'player';
    setActorId(null);
    setOrder([]);
    setCmd(null);
    // victory dance or defeat droop
    battle.units.filter(u => u.team === 'player').forEach(u => {
      if (won && u.alive) patch(u.id, { mood: 'cheer' });
      else if (!won && u.alive) patch(u.id, { mood: 'sad' });
    });
    audioEngine.playSfx(won ? 'achievement' : 'tap');
    const c = { x: sw / 2, y: sw * 0.3 };
    if (won) addFx({ kind: 'burst', x: c.x, y: c.y, emojis: ['🎉', '⭐', '✨', '💖'], count: 24 }, 2200);
    const { goo, xp } = calculateBattleRewards(level, won);
    dispatch({
      type: 'BATTLE_REWARD',
      result: { playerTeam, opponentTeam, winner: won ? 'player' : 'opponent', gooReward: goo, xpReward: xp, levelReached: level },
    });
    await new Promise(r => setTimeout(r, won ? 1500 : 1100));
    setResult({ won, goo, xp, perfects: perfectsRef.current });
  };

  const cont = () => onBattleComplete?.({ winner: result?.won ? 'player' : 'opponent', level });
  const leave = () => onClose();

  // ---- keyboard ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmQuit) return;
      if (cmd?.mode === 'timing' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        return; // handled by the ring itself
      }
      if (cmd?.mode === 'choose') {
        const actor = unitById(battle, cmd.actorId);
        const list = commandList(actor);
        const idx = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
        if (idx >= 0 && list[idx]) chooseKind(list[idx].kind, list[idx].element);
      }
      if (e.code === 'Escape' && cmd?.mode === 'target') setCmd({ actorId: cmd.actorId, mode: 'choose' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // =========================================================================
  // Render
  // =========================================================================

  const units = battle.units;
  const currentActor = actorId ? unitById(battle, actorId) : null;
  const targetMode = cmd?.mode === 'target' ? cmd : null;
  const selectedActor = cmd ? unitById(battle, cmd.actorId) : null;

  const unitPx = Math.max(84, Math.min(190, sw * 0.098));

  const renderUnit = (u: Unit, idx: number) => {
    const spots = u.team === 'player' ? PLAYER_SPOTS : ENEMY_SPOTS;
    const teamIdx = units.filter(x => x.team === u.team).findIndex(x => x.id === u.id);
    const spot = spots[teamIdx] ?? spots[0];
    const v = view[u.id];
    const isActor = actorId === u.id && !result;
    const foeTarget = !!targetMode && u.team === 'enemy' && v.alive;
    let chip: { text: string; color: string } | null = null;
    if (foeTarget && targetMode) {
      const a = unitById(battle, targetMode.actorId);
      const el = targetMode.pending.kind === 'attack' ? bestEl(a, u) : targetMode.pending.element;
      const m = getTypeMultiplier(el, u.elements);
      chip = m >= 1.2 ? { text: `▲ ×${m.toFixed(1)}`, color: '#1f9d55' } : m <= 0.85 ? { text: `▼ ×${m.toFixed(1)}`, color: '#c0392b' } : { text: '● ×1.0', color: '#8a6d3b' };
    }
    const hpPct = Math.max(0, (v.hp / v.maxHp) * 100);
    const hpColor = hpPct > 55 ? 'linear-gradient(#7dff7d,#2fbf2f)' : hpPct > 28 ? 'linear-gradient(#ffe066,#f0a020)' : 'linear-gradient(#ff8a7a,#d93025)';
    const emoji = v.mood === 'hurt' ? (v.hit ? '😣' : '😢') : v.mood === 'tired' ? '😰' : v.mood === 'sad' ? '😭' : v.mood === 'cheer' ? '🥳' : null;

    return (
      <div
        key={u.id}
        ref={el => { (els.current[u.id] ||= { outer: null, body: null, squash: null, bob: null }).outer = el; }}
        className="absolute"
        style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: unitPx, height: unitPx, transform: 'translate(-50%, -88%)', zIndex: Math.round(spot.y) }}
      >
        {/* podium */}
        <img
          src={bt('ui_podium.png')}
          alt=""
          draggable={false}
          className="absolute left-1/2 pointer-events-none"
          style={{ width: unitPx * 1.15, bottom: -unitPx * 0.28, transform: 'translateX(-50%)', filter: isActor ? `drop-shadow(0 0 ${unitPx * 0.1}px ${GOLD})` : 'drop-shadow(0 6px 6px rgba(0,0,0,0.4))', imageRendering: 'auto' }}
        />

        <div ref={el => { (els.current[u.id] ||= { outer: null, body: null, squash: null, bob: null }).body = el; }} className="absolute inset-0">
          <div ref={el => { (els.current[u.id] ||= { outer: null, body: null, squash: null, bob: null }).squash = el; }} className="absolute inset-0" style={{ transformOrigin: '50% 100%' }}>
            <div
              ref={el => { (els.current[u.id] ||= { outer: null, body: null, squash: null, bob: null }).bob = el; }}
              className={`absolute inset-0 flex items-end justify-center ${v.mood === 'cheer' ? 'bt-cheer' : v.mood === 'tired' || v.mood === 'sad' ? 'bt-tired' : 'bt-bob'} ${foeTarget ? 'cursor-pointer' : ''}`}
              style={{ animationDelay: `${idx * -0.4}s`, opacity: v.alive ? 1 : undefined, filter: v.mood === 'tired' || v.mood === 'sad' ? 'saturate(0.75)' : undefined }}
              onClick={() => foeTarget && pickTarget(u.id)}
            >
              <SlimeCanvas slime={u.slime} size={unitPx * 1.3} sizeMultiplier={spriteMult(u.slime) * 2.5} animated={v.alive} isHurt={v.hit} />
            </div>
          </div>
        </div>

        {/* tears and sweat when hurt */}
        {v.alive && (v.mood === 'hurt' || v.mood === 'sad') && (
          <>
            <span className="absolute bt-tear" style={{ left: '34%', top: '34%', fontSize: unitPx * 0.14 }}>💧</span>
            <span className="absolute bt-tear" style={{ left: '60%', top: '34%', fontSize: unitPx * 0.14, animationDelay: '0.25s' }}>💧</span>
          </>
        )}
        {v.alive && v.mood === 'tired' && <span className="absolute bt-sweat" style={{ left: '66%', top: '18%', fontSize: unitPx * 0.15 }}>💦</span>}
        {v.alive && emoji && (
          <span className="absolute pointer-events-none rounded-full bg-white/90 shadow px-1.5 leading-none" style={{ left: '68%', top: '-2%', fontSize: unitPx * 0.15 }}>{emoji}</span>
        )}

        {/* target ring */}
        {foeTarget && (
          <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateY(8%)' }}>
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 rounded-full bt-ring-pulse" style={{ width: unitPx * 1.2, height: unitPx * 0.42, border: `3px solid ${GOLD}`, boxShadow: `0 0 18px ${GOLD}` }} />
          </div>
        )}

        {/* plate */}
        {v.alive && (
          <div className="absolute left-1/2 pointer-events-none" style={{ bottom: '82%', width: unitPx * 1.0, transform: 'translateX(-50%)' }}>
            {isActor && <div className="bt-marker text-center leading-none" style={{ fontSize: unitPx * 0.2, color: GOLD, textShadow: '0 2px 0 rgba(0,0,0,0.6)', marginBottom: -unitPx * 0.03 }}>▼</div>}
            {chip && (
              <div className="text-center mb-0.5">
                <span className="rounded-full px-2 py-0.5 font-bold text-white shadow whitespace-nowrap" style={{ background: chip.color, fontSize: Math.max(10, unitPx * 0.1) }}>{chip.text}</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-1" style={{ fontFamily: "'Fredoka', sans-serif", marginBottom: unitPx * 0.01 }}>
              <span className="inline-block rounded-full shrink-0" style={{ width: unitPx * 0.055, height: unitPx * 0.055, background: u.team === 'player' ? '#4aa8ff' : '#ff5a4a', boxShadow: '0 0 4px rgba(0,0,0,0.6)' }} />
              <span className="font-bold text-white truncate" style={{ fontSize: Math.max(9, unitPx * 0.095), textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.95)', maxWidth: unitPx * 0.62 }}>{u.name}</span>
              <span className="font-bold shrink-0" style={{ fontSize: Math.max(8, unitPx * 0.08), color: '#ffe08a', textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}>Lv{u.level}</span>
            </div>
            {/* hp: frame first, fill on top of its dark groove */}
            <div className="relative" style={{ width: '100%', aspectRatio: '569 / 82' }}>
              <img src={bt('ui_bar_hp.png')} alt="" draggable={false} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'auto' }} />
              <div className="absolute overflow-hidden rounded-full" style={{ left: '3.8%', right: '3.8%', top: '27%', bottom: '27%' }}>
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${hpPct}%`, background: hpColor, boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.5)' }} />
                {v.shield > 0 && <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 0 2px #ffd9a0' }} />}
              </div>
            </div>
            {u.team === 'player' && (
              <div className="text-center font-bold text-white leading-none" style={{ fontSize: Math.max(8, unitPx * 0.075), textShadow: '0 1px 2px #000', fontFamily: "'Fredoka', sans-serif", marginTop: unitPx * 0.01 }}>
                {Math.ceil(v.hp)}<span className="opacity-60">/{v.maxHp}</span>
              </div>
            )}
            {/* energy */}
            <div className="relative mx-auto" style={{ width: '70%', aspectRatio: '433 / 54', marginTop: unitPx * 0.012 }}>
              <img src={bt('ui_bar_energy.png')} alt="" draggable={false} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'auto' }} />
              <div className="absolute overflow-hidden rounded-full" style={{ left: '3.5%', right: '3.5%', top: '28%', bottom: '28%' }}>
                <div className={`h-full rounded-full transition-[width] duration-300 ${v.energy >= 100 ? 'bt-ready' : ''}`} style={{ width: `${v.energy}%`, background: v.energy >= SKILL_COST ? 'linear-gradient(#ffe98a,#f2b632)' : 'linear-gradient(#cbd3da,#8d99a6)' }} />
              </div>
            </div>
            {/* statuses */}
            <div className="flex justify-center gap-0.5" style={{ fontSize: Math.max(11, unitPx * 0.12), marginTop: unitPx * 0.01 }}>
              {v.burn && <span title="Burning">🔥</span>}
              {v.freeze && <span title="Frozen">🧊</span>}
              {v.shield > 0 && <span title="Shielded">🛡️</span>}
              {v.atkUp && <span title="Attack up">⬆️</span>}
              {v.atkDown && <span title="Attack down">⬇️</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden select-none animate-in fade-in duration-500" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}>
      <style>{CSS}</style>

      {/* letterbox fill */}
      <div className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60" style={{ backgroundImage: `url("${bt(`arena_${arenaIndex(level)}.jpg`)}")` }} />

      <div
        ref={stageRef}
        className="relative"
        style={{
          ['--sw' as string]: 'min(100vw, calc(100vh * 16 / 9))',
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
          touchAction: 'manipulation',
        }}
      >
        {/* arena */}
        <img src={bt(`arena_${arenaIndex(level)}.jpg`)} alt="" draggable={false} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'auto' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 60%, transparent 50%, rgba(0,0,0,0.45) 100%)' }} />
        {dim && <div className="absolute inset-0 pointer-events-none transition-opacity" style={{ background: 'radial-gradient(circle at 50% 55%, rgba(0,0,0,0.25), rgba(0,0,0,0.72))' }} />}

        {/* the fighters */}
        {units.map((u, i) => renderUnit(u, i))}

        {/* effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 800 }}>
          {fx.map(f => <FxView key={f.id} fx={f} sw={sw} />)}
          {flash > 0 && <div key={flash} className="absolute inset-0 bt-flash" style={{ background: 'white' }} />}
        </div>

        {/* turn order */}
        <TurnBar order={order} battle={battle} view={view} unitPx={sw} />

        {/* skill callout */}
        {callout && (
          <div key={callout.id} className="absolute left-1/2 pointer-events-none bt-callout" style={{ top: sw * 0.085, zIndex: 850 }}>
            <div className="relative flex items-center justify-center" style={{ width: sw * (callout.kind === 'ultimate' ? 0.36 : 0.28), aspectRatio: '358 / 116' }}>
              <img src={bt('ui_ribbon.png')} alt="" className="absolute inset-0 w-full h-full" draggable={false} style={{ imageRendering: 'auto', filter: callout.kind === 'ultimate' ? `drop-shadow(0 0 ${sw * 0.02}px ${TINT[callout.element]})` : undefined }} />
              <img src={bt(`badge_${callout.element}.png`)} alt="" className="absolute" style={{ left: '8%', width: '17%' }} draggable={false} />
              <div className="relative text-center" style={{ color: INK, marginLeft: '12%' }}>
                <div className="font-bold leading-none" style={{ fontSize: sw * (callout.kind === 'ultimate' ? 0.026 : 0.021) }}>{callout.text}</div>
                <div className="font-semibold opacity-70 leading-none" style={{ fontSize: sw * 0.0105, marginTop: sw * 0.003 }}>{callout.who}{callout.kind === 'ultimate' ? ' · ULTIMATE' : ''}</div>
              </div>
            </div>
          </div>
        )}

        {/* boss intro */}
        {bossBanner && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bt-boss" style={{ zIndex: 900, background: 'linear-gradient(transparent, rgba(60,0,0,0.55), transparent)' }}>
            <div className="text-center">
              <div className="font-bold text-white" style={{ fontSize: sw * 0.07, letterSpacing: '0.12em', textShadow: `0 4px 0 #7a0f0f, 0 0 ${sw * 0.03}px #ff3b30`, WebkitTextStroke: `${sw * 0.002}px #3a0505` }}>BOSS BATTLE</div>
              <div className="font-semibold" style={{ fontSize: sw * 0.026, color: '#ffd9a0', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {battle.units.filter(u => u.team === 'enemy').slice(-1)[0]?.name} blocks the way!
              </div>
            </div>
          </div>
        )}

        {/* top-right controls */}
        <div className="absolute flex items-center gap-2" style={{ top: sw * 0.012, right: sw * 0.012, zIndex: 860 }}>
          <Pill label={`⏩ x${speed}`} on={speed === 2} onClick={() => setSpeed(s => (s === 1 ? 2 : 1))} sw={sw} />
          <Pill label="🤖 Auto" on={auto} onClick={() => setAuto(a => !a)} sw={sw} />
          <Pill
            label="🎯 Timing"
            on={timingOn}
            onClick={() => {
              setTimingOn(t => {
                try { localStorage.setItem('battle_timing', t ? 'off' : 'on'); } catch { /* ignore */ }
                return !t;
              });
            }}
            sw={sw}
          />
          <button onClick={() => setConfirmQuit(true)} aria-label="Leave battle" className="hover:scale-110 transition-transform" style={{ width: sw * 0.034, height: sw * 0.034 }}>
            <img src={bt('ui_btn_close.png')} alt="" className="w-full h-full" draggable={false} style={{ imageRendering: 'auto' }} />
          </button>
        </div>

        {/* command bar */}
        {cmd?.mode === 'choose' && selectedActor && !auto && (
          <CommandBar actor={selectedActor} sw={sw} onChoose={chooseKind} />
        )}
        {cmd?.mode === 'target' && (
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-3 rounded-full shadow-lg" style={{ bottom: sw * 0.03, zIndex: 850, background: PARCHMENT, border: `3px solid ${INK}`, color: INK, padding: `${sw * 0.007}px ${sw * 0.018}px`, fontSize: sw * 0.0135 }}>
            <span className="font-bold">Choose a target</span>
            <button onClick={() => setCmd({ actorId: cmd.actorId, mode: 'choose' })} className="font-semibold underline opacity-70 hover:opacity-100">Back (Esc)</button>
          </div>
        )}

        {/* timing ring */}
        {cmd?.mode === 'timing' && <TimingRing x={cmd.x} y={cmd.y} sw={sw} onDone={finishTiming} />}

        {/* first-time hint */}
        {hint && <div className="absolute left-1/2 -translate-x-1/2 text-white font-bold" style={{ top: sw * 0.16 }}>{hint}</div>}

        {/* result */}
        {result && <ResultScreen result={result} sw={sw} team={units.filter(u => u.team === 'player')} view={view} onContinue={cont} />}

        {/* leave? */}
        {confirmQuit && !result && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60" style={{ zIndex: 950 }}>
            <div className="rounded-2xl p-6 text-center shadow-2xl" style={{ background: PARCHMENT, border: `4px solid ${INK}`, color: INK, width: sw * 0.34 }}>
              <p className="font-bold" style={{ fontSize: sw * 0.024 }}>Leave the battle?</p>
              <p className="font-semibold opacity-70" style={{ fontSize: sw * 0.0135, marginTop: 4 }}>You won't get any rewards.</p>
              <div className="flex gap-3 justify-center" style={{ marginTop: sw * 0.018 }}>
                <button onClick={() => setConfirmQuit(false)} className="rounded-full font-bold border-[3px] px-5 py-2 hover:scale-105 transition-transform" style={{ background: '#fff7dc', borderColor: INK, fontSize: sw * 0.0145 }}>Keep fighting</button>
                <button onClick={leave} className="rounded-full font-bold text-white border-[3px] px-5 py-2 hover:scale-105 transition-transform" style={{ background: '#c0392b', borderColor: '#5b1a12', fontSize: sw * 0.0145 }}>Leave</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

const Pill: React.FC<{ label: string; on: boolean; onClick: () => void; sw: number }> = ({ label, on, onClick, sw }) => (
  <button
    onClick={onClick}
    className="rounded-full font-bold border-[3px] shadow-lg hover:scale-105 transition-transform whitespace-nowrap"
    style={{ background: on ? 'linear-gradient(#ffe98a,#f2b632)' : PARCHMENT, borderColor: INK, color: INK, fontSize: sw * 0.0125, padding: `${sw * 0.004}px ${sw * 0.012}px` }}
  >
    {label}
  </button>
);

function commandList(actor: Unit): Array<{ kind: ActionKind; element: SlimeElement; label: string; sub: string; cost: number; desc: string }> {
  const list: Array<{ kind: ActionKind; element: SlimeElement; label: string; sub: string; cost: number; desc: string }> = [
    { kind: 'attack', element: actor.elements[0], label: 'Attack', sub: `+${ENERGY_PER_ATTACK} energy`, cost: 0, desc: 'A basic hit with your best element against the target.' },
  ];
  for (const el of actor.elements.slice(0, 2)) {
    const s = SKILLS[el];
    list.push({ kind: 'skill', element: el, label: s.name, sub: `${SKILL_COST} energy`, cost: SKILL_COST, desc: s.desc });
  }
  const u = ultimateOf(actor.elements[0]);
  list.push({ kind: 'ultimate', element: actor.elements[0], label: u.name, sub: 'Full energy', cost: ULTIMATE_COST, desc: u.desc });
  return list;
}

const CommandBar: React.FC<{ actor: Unit; sw: number; onChoose: (k: ActionKind, el: SlimeElement) => void }> = ({ actor, sw, onChoose }) => {
  const list = commandList(actor);
  return (
    <div className="absolute left-1/2 -translate-x-1/2 flex items-end gap-3 bt-rise" style={{ bottom: sw * 0.018, zIndex: 850 }}>
      <div className="relative shrink-0" style={{ width: sw * 0.085 }}>
        <img src={bt('ui_ring_portrait.png')} alt="" draggable={false} className="w-full" style={{ imageRendering: 'auto' }} />
        <div className="absolute inset-[13%] overflow-hidden rounded-full flex items-end justify-center" style={{ background: 'radial-gradient(circle at 50% 40%, #e3f1ff, #6fb2ff)' }}>
          <SlimeCanvas slime={actor.slime} size={Math.round(sw * 0.07)} sizeMultiplier={spriteMult(actor.slime) * 2.5} animated={false} />
        </div>
      </div>
      <div className="flex items-stretch gap-2">
        {list.map((c, i) => {
          const can = canAfford(actor, c.kind);
          const primary = c.kind === 'attack';
          const ult = c.kind === 'ultimate';
          return (
            <button
              key={`${c.kind}-${c.element}`}
              onClick={() => can && onChoose(c.kind, c.element)}
              disabled={!can}
              title={`${c.desc}${can ? '' : ' (not enough energy)'}`}
              className={`relative flex items-center gap-2 text-left transition-transform ${can ? 'hover:scale-105 hover:-translate-y-1 active:scale-95' : 'opacity-55 grayscale-[0.4] cursor-not-allowed'} ${ult && can ? 'bt-ready-btn' : ''}`}
              style={{ width: sw * (primary ? 0.15 : 0.165), aspectRatio: '393 / 126', backgroundImage: `url("${bt(primary || ult ? 'ui_btn_primary.png' : 'ui_btn_secondary.png')}")`, backgroundSize: '100% 100%', padding: `0 ${sw * 0.014}px 0 ${sw * 0.016}px`, color: primary || ult ? '#fff' : INK, filter: ult && can ? `drop-shadow(0 0 ${sw * 0.012}px ${GOLD})` : undefined }}
            >
              <img src={bt(`badge_${c.element}.png`)} alt="" draggable={false} style={{ width: sw * 0.034, imageRendering: 'auto' }} />
              <span className="min-w-0">
                <span className="block font-bold leading-tight truncate" style={{ fontSize: sw * 0.0135, textShadow: primary || ult ? '0 1px 2px rgba(80,0,40,0.7)' : undefined }}>{c.label}</span>
                <span className="block font-semibold leading-tight opacity-80" style={{ fontSize: sw * 0.0095 }}>{c.sub}</span>
              </span>
              <span className="absolute -top-2 -left-1 rounded-full bg-black/70 text-white font-bold px-1.5" style={{ fontSize: sw * 0.0085 }}>{i + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TurnBar: React.FC<{ order: string[]; battle: Battle; view: Record<string, View>; unitPx: number }> = ({ order, battle, view, unitPx: sw }) => {
  if (!order.length) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none" style={{ top: sw * 0.008, gap: sw * 0.004, zIndex: 840 }}>
      {order.slice(0, 7).map((id, i) => {
        const u = unitById(battle, id);
        if (!u) return null;
        const first = i === 0;
        const size = sw * (first ? 0.058 : 0.044);
        const dead = !view[id]?.alive;
        return (
          <div key={`${i}-${id}`} className={`relative ${first ? 'bt-turn-first' : ''}`} style={{ width: size, height: size, opacity: dead ? 0.35 : 1 - i * 0.07 }}>
            <img src={bt('ui_ring_portrait.png')} alt="" className="absolute inset-0 w-full h-full" draggable={false} style={{ imageRendering: 'auto', filter: first ? `drop-shadow(0 0 ${sw * 0.008}px ${GOLD})` : undefined }} />
            <div className="absolute inset-[13%] rounded-full overflow-hidden flex items-end justify-center" style={{ background: u.team === 'player' ? 'radial-gradient(circle at 50% 40%, #e3f1ff, #6fb2ff)' : 'radial-gradient(circle at 50% 40%, #ffe0db, #ff7a6a)' }}>
              <SlimeCanvas slime={u.slime} size={Math.round(size * 0.95)} sizeMultiplier={spriteMult(u.slime) * 2.5} animated={false} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TimingRing: React.FC<{ x: number; y: number; sw: number; onDone: (bonus: number, label: string) => void }> = ({ x, y, sw, onDone }) => {
  const start = useRef(performance.now());
  const done = useRef(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const DURATION = 1350;
  const scaleAt = (ms: number) => 2.6 - 2.1 * (ms / DURATION);

  const evaluate = useCallback(() => {
    if (done.current) return;
    done.current = true;
    const ms = performance.now() - start.current;
    const err = Math.abs(scaleAt(ms) - 1);
    if (err <= 0.14) onDone(1.25, 'PERFECT!');
    else if (err <= 0.4) onDone(1.1, 'GOOD');
    else onDone(1, 'MISS');
  }, [onDone]);

  useEffect(() => {
    try { ringRef.current?.animate([{ transform: 'translate(-50%,-50%) scale(2.6)' }, { transform: 'translate(-50%,-50%) scale(0.5)' }], { duration: DURATION, fill: 'forwards', easing: 'linear' }); } catch { /* ignore */ }
    const timeout = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      onDone(1, 'MISS');
    }, DURATION + 40);
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); evaluate(); } };
    const onPointer = () => evaluate();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer, true);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const base = sw * 0.075;
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 870 }}>
      <div className="absolute rounded-full" style={{ left: x, top: y, width: base, height: base, transform: 'translate(-50%,-50%)', border: `${Math.max(3, sw * 0.004)}px solid ${GOLD}`, boxShadow: `0 0 ${sw * 0.014}px ${GOLD}, inset 0 0 ${sw * 0.01}px rgba(255,225,120,0.6)`, background: 'rgba(255,230,140,0.15)' }} />
      <div ref={ringRef} className="absolute rounded-full" style={{ left: x, top: y, width: base, height: base, transform: 'translate(-50%,-50%) scale(2.6)', border: `${Math.max(3, sw * 0.004)}px solid #fff`, boxShadow: '0 0 14px rgba(255,255,255,0.9)' }} />
      <div className="absolute left-1/2 -translate-x-1/2 text-center text-white font-bold animate-pulse" style={{ bottom: sw * 0.035, fontSize: sw * 0.0145, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
        Tap when the rings meet!
      </div>
    </div>
  );
};

const FxView: React.FC<{ fx: Fx; sw: number }> = ({ fx, sw }) => {
  switch (fx.kind) {
    case 'pop':
      return (
        <div className="absolute text-center bt-pop whitespace-nowrap" style={{ left: fx.x, top: fx.y, transform: 'translate(-50%,-50%)' }}>
          {fx.label && <div className="font-bold leading-none" style={{ fontSize: sw * 0.0135, color: fx.labelColor ?? '#fff', textShadow: '0 2px 3px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>{fx.label}</div>}
          <div className="font-bold leading-none" style={{ fontSize: sw * 0.03 * fx.size, color: fx.color, WebkitTextStroke: `${Math.max(2, sw * 0.003)}px #2a1408`, paintOrder: 'stroke fill', textShadow: '0 4px 0 rgba(30,12,4,0.85)' }}>{fx.text}</div>
        </div>
      );
    case 'impact':
      return <img src={bt(`fx_${fx.element}.png`)} alt="" draggable={false} className="absolute bt-impact" style={{ left: fx.x, top: fx.y, width: sw * 0.19 * fx.scale, transform: 'translate(-50%,-50%)', imageRendering: 'auto', mixBlendMode: fx.element === 'shadow' ? 'normal' : 'screen' }} />;
    case 'orb':
      return <Orb fx={fx} sw={sw} />;
    case 'ring':
      return <div className="absolute rounded-full bt-ring" style={{ left: fx.x, top: fx.y, width: sw * (fx.big ? 0.14 : 0.09), height: sw * (fx.big ? 0.14 : 0.09), transform: 'translate(-50%,-50%)', border: `${sw * 0.005}px solid ${fx.color}`, boxShadow: `0 0 ${sw * 0.02}px ${fx.color}` }} />;
    case 'burst':
      return (
        <div className="absolute" style={{ left: fx.x, top: fx.y }}>
          {Array.from({ length: fx.count }).map((_, i) => {
            const a = (i / fx.count) * Math.PI * 2 + (fx.id % 5);
            const d = sw * (0.04 + ((i * 37) % 30) / 700);
            return (
              <span key={i} className="absolute bt-burst" style={{ fontSize: sw * 0.022, ['--dx' as string]: `${Math.cos(a) * d}px`, ['--dy' as string]: `${Math.sin(a) * d - sw * 0.02}px`, animationDelay: `${i * 0.025}s` }}>
                {fx.emojis[i % fx.emojis.length]}
              </span>
            );
          })}
        </div>
      );
  }
};

const Orb: React.FC<{ fx: Extract<Fx, { kind: 'orb' }>; sw: number }> = ({ fx, sw }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try { ref.current?.animate([{ transform: 'translate(-50%,-50%) scale(0.6)' }, { transform: `translate(calc(-50% + ${fx.toX - fx.x}px), calc(-50% + ${fx.toY - fx.y}px)) scale(1.2)` }], { duration: 260, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' }); } catch { /* ignore */ }
  }, [fx]);
  const s = sw * 0.04;
  return <div ref={ref} className="absolute rounded-full" style={{ left: fx.x, top: fx.y, width: s, height: s, transform: 'translate(-50%,-50%)', background: `radial-gradient(circle, #fff, ${fx.color} 55%, transparent 75%)`, boxShadow: `0 0 ${s}px ${fx.color}` }} />;
};

const ResultScreen: React.FC<{ result: { won: boolean; goo: number; xp: number; perfects: number }; sw: number; team: Unit[]; view: Record<string, View>; onContinue: () => void }> = ({ result, sw, team, view, onContinue }) => {
  const [goo, setGoo] = useState(0);
  const [xp, setXp] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0 - 600) / 900);
      if (p >= 0) { setGoo(Math.round(result.goo * p)); setXp(Math.round(result.xp * p)); }
      if (p >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [result]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bt-result" style={{ zIndex: 960, background: 'rgba(8,4,2,0.72)' }}>
      <div className="relative bt-banner" style={{ width: sw * 0.36, aspectRatio: result.won ? '643 / 590' : '647 / 557' }}>
        <img src={bt(result.won ? 'banner_victory.png' : 'banner_defeat.png')} alt="" className="absolute inset-0 w-full h-full" draggable={false} style={{ imageRendering: 'auto' }} />
        <div className="absolute left-0 right-0 text-center font-bold" style={{ top: '19%', fontSize: sw * 0.036, color: result.won ? '#6b4210' : '#e5e9ef', textShadow: result.won ? '0 2px 0 rgba(255,245,200,0.8)' : '0 3px 0 rgba(0,0,0,0.6)', letterSpacing: '0.06em' }}>
          {result.won ? 'VICTORY!' : 'DEFEAT'}
        </div>
        {/* rewards on a plate inside the ribbon loop (the loop itself is see-through) */}
        <div
          className="absolute flex flex-col items-center justify-center rounded-2xl"
          style={{
            left: '25%', right: '25%', top: '41%', bottom: '17%', gap: sw * 0.004,
            background: result.won ? `linear-gradient(${PARCHMENT}, #ecd9a8)` : 'linear-gradient(#3a424d, #262c34)',
            border: `3px solid ${result.won ? INK : '#11151a'}`,
            color: result.won ? INK : '#f2f4f7',
            boxShadow: '0 6px 14px rgba(0,0,0,0.45)',
          }}
        >
          <div className="font-bold flex items-center gap-2 leading-none" style={{ fontSize: sw * 0.024 }}>💧 +{goo} <span className="font-semibold opacity-70" style={{ fontSize: sw * 0.012 }}>Goo</span></div>
          <div className="font-bold flex items-center gap-2 leading-none" style={{ fontSize: sw * 0.024 }}>⭐ +{xp} <span className="font-semibold opacity-70" style={{ fontSize: sw * 0.012 }}>XP each</span></div>
          {result.perfects > 0 && <div className="font-bold leading-none" style={{ fontSize: sw * 0.0125, color: result.won ? '#a8650a' : '#ffe14d' }}>🎯 {result.perfects} perfect timing{result.perfects > 1 ? 's' : ''}</div>}
        </div>
      </div>
      <div className="flex items-end justify-center" style={{ gap: sw * 0.01, marginTop: sw * 0.008 }}>
        {team.map(u => (
          <div key={u.id} className="relative flex flex-col items-center" style={{ opacity: view[u.id]?.alive ? 1 : 0.4, filter: view[u.id]?.alive ? undefined : 'grayscale(1)' }}>
            <div className={view[u.id]?.alive && result.won ? 'bt-cheer' : ''}><SlimeCanvas slime={u.slime} size={Math.round(sw * 0.085)} sizeMultiplier={spriteMult(u.slime) * 2.5} animated={view[u.id]?.alive} /></div>
          </div>
        ))}
      </div>
      <button
        onClick={onContinue}
        className="rounded-full font-bold text-white uppercase border-[3px] hover:scale-105 active:translate-y-1 transition-transform"
        style={{ marginTop: sw * 0.012, fontSize: sw * 0.02, padding: `${sw * 0.008}px ${sw * 0.04}px`, background: 'linear-gradient(#ff7eb6,#ff1493)', borderColor: '#fff3c0', boxShadow: '0 6px 0 #8a0f55, 0 10px 24px rgba(0,0,0,0.5)', textShadow: '0 2px 3px rgba(80,0,40,0.6)' }}
      >
        Continue
      </button>
    </div>
  );
};

const CSS = `
  @keyframes btBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4%) } }
  @keyframes btTired { 0%,100% { transform: translateY(2%) scaleY(0.96) rotate(-2deg) } 50% { transform: translateY(3.5%) scaleY(0.93) rotate(2deg) } }
  @keyframes btCheer { 0%,100% { transform: translateY(0) scale(1,1) } 30% { transform: translateY(-14%) scale(0.95,1.08) } 55% { transform: translateY(0) scale(1.08,0.92) } }
  @keyframes btPop { 0% { transform: translate(-50%,-30%) scale(0.5); opacity: 0 } 15% { transform: translate(-50%,-60%) scale(1.25); opacity: 1 } 70% { opacity: 1 } 100% { transform: translate(-50%,-190%) scale(1); opacity: 0 } }
  @keyframes btImpact { 0% { transform: translate(-50%,-50%) scale(0.3) rotate(-10deg); opacity: 0 } 25% { transform: translate(-50%,-50%) scale(1.15) rotate(4deg); opacity: 1 } 100% { transform: translate(-50%,-50%) scale(1.35) rotate(8deg); opacity: 0 } }
  @keyframes btRing { 0% { transform: translate(-50%,-50%) scale(0.4); opacity: 0.95 } 100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0 } }
  @keyframes btBurst { 0% { transform: translate(0,0) scale(0.4); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(1.1); opacity: 0 } }
  @keyframes btTear { 0% { transform: translateY(0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(160%); opacity: 0 } }
  @keyframes btSweat { 0%,100% { transform: translateY(0); opacity: 0.9 } 50% { transform: translateY(14%); opacity: 0.6 } }
  @keyframes btMarker { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-30%) } }
  @keyframes btFlash { 0% { opacity: 0.85 } 100% { opacity: 0 } }
  @keyframes btCallout { 0% { transform: translate(-50%, -30px) scale(0.7); opacity: 0 } 14% { transform: translate(-50%, 0) scale(1.08); opacity: 1 } 24% { transform: translate(-50%, 0) scale(1) } 86% { opacity: 1 } 100% { transform: translate(-50%, -10px); opacity: 0 } }
  @keyframes btBoss { 0% { opacity: 0; transform: scale(1.3) } 14% { opacity: 1; transform: scale(1) } 85% { opacity: 1 } 100% { opacity: 0 } }
  @keyframes btRise { 0% { transform: translate(-50%, 30px); opacity: 0 } 100% { transform: translate(-50%, 0); opacity: 1 } }
  @keyframes btReady { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.35) } }
  @keyframes btResult { 0% { opacity: 0 } 100% { opacity: 1 } }
  @keyframes btBanner { 0% { transform: scale(0.3) rotate(-8deg); opacity: 0 } 60% { transform: scale(1.08) rotate(2deg); opacity: 1 } 100% { transform: scale(1) rotate(0) } }
  @keyframes btTurn { 0% { transform: scale(0.7) } 60% { transform: scale(1.15) } 100% { transform: scale(1) } }
  @keyframes btRingPulse { 0%,100% { transform: translateX(-50%) scale(1); opacity: 1 } 50% { transform: translateX(-50%) scale(1.12); opacity: 0.6 } }
  .bt-bob { animation: btBob 2.4s ease-in-out infinite }
  .bt-tired { animation: btTired 2.8s ease-in-out infinite }
  .bt-cheer { animation: btCheer 0.7s ease-in-out infinite }
  .bt-pop { animation: btPop 1.05s ease-out forwards }
  .bt-impact { animation: btImpact 0.55s ease-out forwards }
  .bt-ring { animation: btRing 0.8s ease-out forwards }
  .bt-burst { animation: btBurst 0.9s ease-out forwards }
  .bt-tear { animation: btTear 0.9s ease-in infinite }
  .bt-sweat { animation: btSweat 1.6s ease-in-out infinite }
  .bt-marker { animation: btMarker 0.9s ease-in-out infinite }
  .bt-flash { animation: btFlash 0.35s ease-out forwards }
  .bt-callout { animation: btCallout 1.4s ease-out forwards }
  .bt-boss { animation: btBoss 1.9s ease-out forwards }
  .bt-rise { animation: btRise 0.3s ease-out forwards }
  .bt-ready { animation: btReady 0.8s ease-in-out infinite }
  .bt-ready-btn { animation: btReady 1s ease-in-out infinite }
  .bt-result { animation: btResult 0.4s ease-out forwards }
  .bt-banner { animation: btBanner 0.7s cubic-bezier(.3,1.3,.5,1) forwards }
  .bt-turn-first { animation: btTurn 0.35s ease-out }
  .bt-ring-pulse { animation: btRingPulse 0.9s ease-in-out infinite }
`;
