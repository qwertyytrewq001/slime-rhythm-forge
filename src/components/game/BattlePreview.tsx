import React, { useEffect, useMemo, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Slime, BattleSlime, SlimeElement } from '@/types/slime';
import { generateAIOpponents, deriveBattleStats, toBattleSlime, getRegionForLevel, getTypeMultiplier, isBossLevel, MAP_SCREENS } from '@/utils/battleEngine';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_ICONS } from '@/data/traitData';
import { Skull, Swords, Wand2, X } from 'lucide-react';

interface BattlePreviewProps {
  level: number;
  onStartBattle: (playerTeam: BattleSlime[], opponentTeam: BattleSlime[]) => void;
  onClose: () => void;
}

const PARCHMENT = '#f6e8c3';
const INK = '#4a2f17';
const GOLD = '#f2b632';
const ALL_ELEMENTS = Object.keys(ELEMENT_ICONS) as SlimeElement[];

const powerOf = (s: { hp?: number; maxHp: number; attack: number; defense: number; speed: number }) =>
  Math.round(s.maxHp / 8 + s.attack * 2 + s.defense * 1.5 + s.speed);

/** How well a slime's best element does against the enemy team, averaged (1 = neutral) */
const matchupVs = (slime: Slime, foes: BattleSlime[]) => {
  if (!foes.length) return 1;
  const total = foes.reduce((sum, f) => sum + Math.max(...slime.elements.map(el => getTypeMultiplier(el, f.elements))), 0);
  return total / foes.length;
};

const verdict = (m: number) =>
  m >= 1.2 ? { label: 'Strong', color: '#1f9d55', arrow: '▲' } : m <= 0.85 ? { label: 'Weak', color: '#c0392b', arrow: '▼' } : { label: 'Even', color: '#8a6d3b', arrow: '●' };

export const BattlePreview: React.FC<BattlePreviewProps> = ({ level, onStartBattle, onClose }) => {
  const { state } = useGameState();
  const [playerTeam, setPlayerTeam] = useState<(Slime | null)[]>([null, null, null]);
  const [opponentTeam, setOpponentTeam] = useState<BattleSlime[]>([]);

  useEffect(() => {
    const avgLevel = state.slimes.reduce((sum, s) => sum + s.level, 0) / state.slimes.length || 1;
    setOpponentTeam(generateAIOpponents(level, avgLevel));
  }, [level, state.slimes]);

  const region = getRegionForLevel(level);
  const boss = isBossLevel(level);
  const mapIndex = Math.min(MAP_SCREENS.length - 1, Math.floor((level - 1) / 10)) + 1;
  const backdrop = `${import.meta.env.BASE_URL}maps/map${mapIndex}.jpg`;

  const picked = playerTeam.filter((s): s is Slime => s !== null);
  const isTeamReady = picked.length > 0;

  // The roster, best matchup first
  const roster = useMemo(
    () =>
      state.slimes
        .filter(s => !playerTeam.some(p => p?.id === s.id))
        .map(s => ({ slime: s, match: matchupVs(s, opponentTeam), power: powerOf(deriveBattleStats(s)) }))
        .sort((a, b) => b.match * b.power - a.match * a.power),
    [state.slimes, playerTeam, opponentTeam],
  );

  const addSlime = (slime: Slime) => {
    const idx = playerTeam.findIndex(s => s === null);
    if (idx === -1) return;
    const next = [...playerTeam];
    next[idx] = slime;
    setPlayerTeam(next);
  };
  const removeAt = (idx: number) => {
    const next = [...playerTeam];
    next[idx] = null;
    setPlayerTeam(next);
  };
  const autoPick = () => {
    const best = [...state.slimes]
      .map(s => ({ s, score: matchupVs(s, opponentTeam) * powerOf(deriveBattleStats(s)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.s);
    setPlayerTeam([best[0] ?? null, best[1] ?? null, best[2] ?? null]);
  };

  const yourPower = picked.reduce((sum, s) => sum + powerOf(deriveBattleStats(s)), 0);
  const theirPower = opponentTeam.reduce((sum, s) => sum + powerOf(s.battleStats), 0);
  const ratio = theirPower > 0 ? yourPower / theirPower : 1;
  const outlook =
    !picked.length ? { text: 'Pick your squad', color: '#d8c9a3' } : ratio >= 1.25 ? { text: 'Favoured', color: '#1f9d55' } : ratio >= 0.85 ? { text: 'Even fight', color: '#b8860b' } : { text: 'Tough fight', color: '#c0392b' };
  const youShare = yourPower + theirPower > 0 ? (yourPower / (yourPower + theirPower)) * 100 : 50;

  const panel: React.CSSProperties = { background: `linear-gradient(${PARCHMENT}, #ecd9a8)`, border: `3px solid ${INK}`, color: INK };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden animate-in fade-in duration-300 select-none" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}>
      {/* The region's own map, blurred and darkened */}
      <div className="absolute inset-0 bg-cover bg-center scale-110 blur-md" style={{ backgroundImage: `url("${backdrop}")` }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(20,10,5,0.35), rgba(10,5,2,0.85))' }} />

      <div className="relative w-full max-w-5xl h-full max-h-[100vh] flex flex-col gap-3 p-3 sm:p-5">
        {/* Banner */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative rounded-lg px-5 py-2 shadow-[0_6px_16px_rgba(0,0,0,0.5)]" style={panel}>
            <p className="font-bold leading-tight text-lg sm:text-2xl flex items-center gap-2">
              {boss && <Skull className="w-5 h-5 text-red-700" />}
              {boss ? 'Boss Battle' : 'Get Ready'} · Level {level}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest opacity-70">{region.name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 rounded-full flex items-center justify-center border-[3px] shadow-lg hover:scale-110 transition-transform"
            style={{ background: PARCHMENT, borderColor: INK, color: INK }}
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        {/* The two squads */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-center overflow-y-auto">
          {/* Yours */}
          <section>
            <p className="text-white font-bold text-sm uppercase tracking-widest mb-2 drop-shadow">Your squad</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {playerTeam.map((slime, idx) => {
                const m = slime ? verdict(matchupVs(slime, opponentTeam)) : null;
                const stats = slime ? deriveBattleStats(slime) : null;
                return slime && stats && m ? (
                  <div key={idx} className="relative rounded-2xl p-2 flex flex-col items-center text-center shadow-lg animate-in zoom-in-95 duration-200" style={panel}>
                    <button onClick={() => removeAt(idx)} aria-label={`Remove ${slime.name}`} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center border-2 border-white shadow hover:scale-110 transition-transform">
                      <X className="w-4 h-4" strokeWidth={3} />
                    </button>
                    <span className="absolute top-1 left-1 px-1.5 rounded text-[10px] font-bold text-white" style={{ background: m.color }}>{m.arrow} {m.label}</span>
                    <div className="w-full aspect-square flex items-center justify-center mt-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.7), rgba(255,255,255,0) 70%)' }}>
                      <SlimeCanvas slime={slime} size={96} animated />
                    </div>
                    <p className="font-bold text-sm leading-tight truncate w-full">{slime.name}</p>
                    <p className="text-[11px] font-semibold opacity-70">Lv {slime.level} · {slime.elements.map(e => ELEMENT_ICONS[e]).join(' ')}</p>
                    <div className="flex gap-2 mt-1 text-[11px] font-bold">
                      <span>❤️ {stats.maxHp}</span>
                      <span>⚔️ {stats.attack}</span>
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="rounded-2xl p-2 flex flex-col items-center justify-center text-center border-[3px] border-dashed aspect-[3/4] sm:aspect-auto sm:min-h-[200px]" style={{ borderColor: 'rgba(246,232,195,0.55)', background: 'rgba(0,0,0,0.3)', color: PARCHMENT }}>
                    <Swords className="w-8 h-8 opacity-60" />
                    <p className="text-xs font-bold mt-1 opacity-80">Slot {idx + 1}</p>
                    <p className="text-[10px] font-semibold opacity-60">tap a slime below</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* VS + outlook */}
          <div className="flex md:flex-col items-center justify-center gap-3 py-1">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl shadow-[0_0_24px_rgba(242,182,50,0.6)]" style={{ background: `radial-gradient(circle at 35% 30%, #fff3c0, ${GOLD})`, border: `3px solid ${INK}`, color: INK }}>
              VS
            </div>
            <div className="w-40 md:w-28 text-center">
              <div className="h-2.5 rounded-full overflow-hidden border-2 bg-red-500/80" style={{ borderColor: INK }}>
                <div className="h-full bg-sky-400 transition-all duration-500" style={{ width: `${picked.length ? youShare : 50}%` }} />
              </div>
              <p className="mt-1 text-xs font-bold drop-shadow" style={{ color: outlook.color === '#d8c9a3' ? PARCHMENT : '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                <span className="px-2 py-0.5 rounded-full" style={{ background: outlook.color }}>{outlook.text}</span>
              </p>
            </div>
          </div>

          {/* Theirs */}
          <section>
            <p className="text-white font-bold text-sm uppercase tracking-widest mb-2 text-right drop-shadow">Enemies</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {opponentTeam.map((foe, idx) => {
                const weakTo = ALL_ELEMENTS.filter(el => getTypeMultiplier(el, foe.elements) >= 1.2).slice(0, 3);
                return (
                  <div key={idx} className="rounded-2xl p-2 flex flex-col items-center text-center shadow-lg" style={{ background: 'linear-gradient(#f3d3c8, #e2b3a4)', border: `3px solid #5b2417`, color: '#4a1a10' }}>
                    <div className="w-full aspect-square flex items-center justify-center rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6), rgba(255,255,255,0) 70%)' }}>
                      <SlimeCanvas slime={foe} size={96} animated />
                    </div>
                    <p className="font-bold text-sm leading-tight truncate w-full">{foe.name}</p>
                    <p className="text-[11px] font-semibold opacity-70">Lv {foe.level} · {foe.elements.map(e => ELEMENT_ICONS[e]).join(' ')}</p>
                    <p className="mt-1 text-[10px] font-bold opacity-80">{weakTo.length ? `Weak to ${weakTo.map(e => ELEMENT_ICONS[e]).join(' ')}` : 'No clear weakness'}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Roster */}
        <div className="rounded-2xl p-2 sm:p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.4)]" style={panel}>
          <div className="flex items-center justify-between mb-2 gap-2">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Your slimes · best matchup first</p>
            <button onClick={autoPick} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border-2 hover:scale-105 transition-transform" style={{ background: '#fff7dc', borderColor: INK }}>
              <Wand2 className="w-3.5 h-3.5" /> Auto-pick best
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {roster.length === 0 && <p className="text-sm font-semibold opacity-60 py-4 px-2">{state.slimes.length ? 'Everyone is in your squad.' : 'Hatch a slime first!'}</p>}
            {roster.map(({ slime, match, power }) => {
              const v = verdict(match);
              const full = picked.length >= 3;
              return (
                <button
                  key={slime.id}
                  onClick={() => addSlime(slime)}
                  disabled={full}
                  className={`relative shrink-0 w-[104px] rounded-xl p-1.5 flex flex-col items-center border-2 transition-transform ${full ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:-translate-y-0.5'}`}
                  style={{ background: '#fff7dc', borderColor: INK }}
                >
                  <span className="absolute top-0.5 left-0.5 px-1 rounded text-[9px] font-bold text-white" style={{ background: v.color }}>{v.arrow} {v.label}</span>
                  <div className="mt-2"><SlimeCanvas slime={slime} size={64} animated /></div>
                  <p className="text-[11px] font-bold truncate w-full text-center">{slime.name}</p>
                  <p className="text-[10px] font-semibold opacity-70">Lv {slime.level} · {slime.elements.map(e => ELEMENT_ICONS[e]).join('')}</p>
                  <p className="text-[10px] font-bold">💪 {power}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Go */}
        <div className="flex justify-center">
          <button
            disabled={!isTeamReady}
            onClick={() => onStartBattle(picked.map(toBattleSlime), opponentTeam)}
            className={`h-14 px-10 rounded-full text-lg font-bold uppercase tracking-wide flex items-center gap-3 border-[3px] transition-all ${
              isTeamReady ? 'text-white shadow-[0_6px_0_#8a0f55,0_10px_24px_rgba(0,0,0,0.5)] hover:scale-105 active:translate-y-1 active:shadow-[0_2px_0_#8a0f55]' : 'opacity-60 cursor-not-allowed text-white/70'
            }`}
            style={{ background: isTeamReady ? 'linear-gradient(#ff7eb6, #ff1493)' : '#6b5a45', borderColor: isTeamReady ? '#fff3c0' : '#3a2e22' }}
          >
            <Swords className="w-6 h-6" />
            {isTeamReady ? 'Battle!' : 'Pick a slime to begin'}
          </button>
        </div>
      </div>
    </div>
  );
};
