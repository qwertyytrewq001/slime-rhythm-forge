import React, { useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Habitat, SlimeFoodType } from '@/types/slime';
import { ELEMENT_DISPLAY_NAMES, HABITAT_THEMES } from '@/data/traitData';
import { foodSpriteUrl } from '@/data/foodSprites';
import { audioEngine } from '@/utils/audioEngine';
import {
  DECOR, ELEMENT_PERKS, JOY_MAX, MAX_SANCT_LEVEL, UPGRADE_COST, canAffordUpgrade, decorById, decorSlots, giftCap, habitatCapacity, habitatLevel,
  minutesToNextGift, perksFrom, CAPACITY_AT, GIFT_CAP_AT,
} from '@/utils/sanctuaryCore';
import { ArtImg, DECOR_EMOJI, Emblem, Heart, formatMinutes } from './sanctuary/sanctArt';

const PARCHMENT = '#f6e8c3';
const INK = '#4a2f17';

interface PanelProps {
  habitat: Habitat;
  /** Pixel width of the stage so sizes scale with the screen; omit to use a fixed comfortable size. */
  sw?: number;
  onClose: () => void;
}

export function SanctuaryPanel({ habitat: habitatProp, sw = 1000, onClose }: PanelProps) {
  const { state, dispatch } = useGameState();
  // Always read the live habitat so the panel updates as the player upgrades or decorates.
  const habitat = state.habitats.find(h => h.id === habitatProp.id) ?? habitatProp;
  const theme = HABITAT_THEMES[habitat.element];
  const perks = useMemo(() => perksFrom(state.habitats, state.slimes), [state.habitats, state.slimes]);
  const level = habitatLevel(habitat);
  const perk = ELEMENT_PERKS[habitat.element];
  const nextCost = level < MAX_SANCT_LEVEL ? UPGRADE_COST[level + 1] : null;
  const canUpgrade = nextCost ? canAffordUpgrade(state, nextCost) : false;
  const slots = decorSlots(habitat);
  const placed = habitat.decor ?? [];
  const eta = minutesToNextGift(habitat, state.slimes, perks);
  const joy = (habitat.joy ?? 0) / JOY_MAX;
  const f = sw / 1000;

  const upgrade = () => {
    if (!canUpgrade) return;
    audioEngine.playSfx('purchase');
    dispatch({ type: 'SANCT_UPGRADE', habitatId: habitat.id });
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/55" style={{ zIndex: 600 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="rounded-3xl shadow-2xl overflow-y-auto" style={{ width: 680 * f, maxHeight: '92%', background: `linear-gradient(${PARCHMENT}, #ecd9a8)`, border: `4px solid ${INK}`, color: INK, padding: 16 * f, fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}>
        {/* header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 10 * f }}>
          <div className="flex items-center" style={{ gap: 10 * f }}>
            <Emblem element={habitat.element} size={52 * f} />
            <div>
              <div className="font-bold leading-none" style={{ fontSize: 24 * f }}>{ELEMENT_DISPLAY_NAMES[habitat.element]} Sanctuary</div>
              <div className="font-semibold opacity-70" style={{ fontSize: 12 * f }}>Level {level} of {MAX_SANCT_LEVEL} · {habitat.assignedSlimeIds.length}/{habitatCapacity(habitat)} slimes</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full font-bold border-2 hover:scale-110 transition-transform" style={{ width: 32 * f, height: 32 * f, borderColor: INK, background: '#fff7dc', fontSize: 18 * f }}>×</button>
        </div>

        {/* joy and gifts */}
        <Card f={f} title="Joy and gifts" icon={<Heart size={20 * f} />}>
          <div className="rounded-full overflow-hidden" style={{ height: 14 * f, background: 'rgba(0,0,0,0.25)', border: `2px solid ${INK}` }}>
            <div className="h-full" style={{ width: `${joy * 100}%`, background: 'linear-gradient(90deg,#ff9ac8,#ff4f9d)' }} />
          </div>
          <div className="flex justify-between font-semibold" style={{ fontSize: 12 * f, marginTop: 4 * f }}>
            <span>Next gift: {formatMinutes(eta)}</span>
            <span>Waiting: {habitat.gifts?.length ?? 0} / {giftCap(habitat, perks)}</span>
          </div>
          <div className="opacity-75" style={{ fontSize: 11 * f, marginTop: 4 * f }}>Pet, feed and play with slimes here to fill Joy faster. They also build Joy on their own while you are away.</div>
        </Card>

        {/* perk */}
        <Card f={f} title={`Perk: ${perk.title}`}>
          <div className="font-semibold" style={{ fontSize: 13 * f }}>Now: {perk.text(level)}</div>
          {level < MAX_SANCT_LEVEL && <div className="opacity-75" style={{ fontSize: 12 * f }}>Next level: {perk.text(level + 1)}</div>}
          {!habitat.assignedSlimeIds.length && <div style={{ fontSize: 12 * f, color: '#a8461a' }} className="font-bold">Move in a {ELEMENT_DISPLAY_NAMES[habitat.element]} slime to switch this on.</div>}
        </Card>

        {/* upgrade */}
        <Card f={f} title="Upgrade">
          {nextCost ? (
            <>
              <div style={{ fontSize: 12 * f }} className="font-semibold opacity-80">
                Level {level + 1}: room for {CAPACITY_AT[level + 1]} slimes, holds {GIFT_CAP_AT[level + 1]} gifts, {decorSlots({ ...habitat, level: level + 1 })} decor slots, stronger perk.
              </div>
              <div className="flex items-center flex-wrap" style={{ gap: 8 * f, margin: `${6 * f}px 0` }}>
                <Cost f={f} ok={state.goo >= nextCost.goo}>{nextCost.goo.toLocaleString()} 💧</Cost>
                {(Object.entries(nextCost.food) as Array<[SlimeFoodType, number]>).map(([c, n]) => (
                  <Cost key={c} f={f} ok={(state.inventory[c] || 0) >= n}>
                    <img src={foodSpriteUrl(c)} alt="" draggable={false} style={{ width: 22 * f, imageRendering: 'auto' }} /> {state.inventory[c] || 0}/{n}
                  </Cost>
                ))}
              </div>
              <button onClick={upgrade} disabled={!canUpgrade} className={`rounded-full font-bold border-[3px] shadow-lg transition-transform ${canUpgrade ? 'hover:scale-105 active:scale-95' : 'opacity-55 cursor-not-allowed'}`} style={{ background: canUpgrade ? 'linear-gradient(#ffe98a,#f2b632)' : '#e8dfc9', borderColor: INK, fontSize: 14 * f, padding: `${4 * f}px ${16 * f}px` }}>
                {canUpgrade ? `Upgrade to Level ${level + 1}` : 'Not enough yet. Grow food on the farm!'}
              </button>
            </>
          ) : (
            <div className="font-bold" style={{ fontSize: 13 * f }}>Fully upgraded. ✨</div>
          )}
        </Card>

        {/* decor */}
        <Card f={f} title={`Decor (${placed.length}/${slots} slots)`}>
          <div className="grid grid-cols-4" style={{ gap: 8 * f }}>
            {DECOR.map(d => {
              const isPlaced = placed.includes(d.id);
              const canPlace = !isPlaced && placed.length < slots && state.goo >= d.cost;
              return (
                <button
                  key={d.id}
                  onClick={() => dispatch({ type: 'SANCT_DECOR', habitatId: habitat.id, decorId: d.id, place: !isPlaced })}
                  disabled={!isPlaced && !canPlace}
                  className={`rounded-2xl border-[3px] text-center transition-transform ${isPlaced || canPlace ? 'hover:scale-[1.04]' : 'opacity-50 cursor-not-allowed'}`}
                  style={{ background: isPlaced ? '#d9f7c8' : '#fff7dc', borderColor: INK, padding: 6 * f }}
                  title={isPlaced ? 'Tap to put away' : `${d.name}: +${Math.round(d.joy * 100)}% Joy`}
                >
                  <ArtImg file={`decor_${d.id}.png`} className="mx-auto" style={{ width: 44 * f, height: 44 * f, objectFit: 'contain' }} fallback={<div style={{ fontSize: 30 * f, lineHeight: 1.1 }}>{DECOR_EMOJI[d.id]}</div>} />
                  <div className="font-bold leading-tight" style={{ fontSize: 11 * f }}>{d.name}</div>
                  <div className="font-semibold" style={{ fontSize: 10 * f }}>{isPlaced ? 'Placed' : `${d.cost} 💧`} · +{Math.round(d.joy * 100)}%</div>
                </button>
              );
            })}
          </div>
          {placed.length >= slots && <div style={{ fontSize: 11 * f }} className="opacity-75 font-semibold">Slots full. Upgrade to unlock more, or tap a placed item to put it away.</div>}
          {placed.length > 0 && <div style={{ fontSize: 11 * f }} className="opacity-75">Decor total: +{Math.round(placed.reduce((n, id) => n + (decorById(id)?.joy ?? 0), 0) * 100)}% Joy speed</div>}
        </Card>
      </div>
    </div>
  );
}

const Card: React.FC<{ f: number; title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ f, title, icon, children }) => (
  <div className="rounded-2xl" style={{ background: 'rgba(255,255,255,0.45)', border: `2px solid ${INK}33`, padding: 10 * f, marginBottom: 10 * f }}>
    <div className="font-bold flex items-center" style={{ fontSize: 14 * f, marginBottom: 4 * f, gap: 5 * f }}>{icon}{title}</div>
    {children}
  </div>
);

const Cost: React.FC<{ f: number; ok: boolean; children: React.ReactNode }> = ({ f, ok, children }) => (
  <span className="inline-flex items-center rounded-full font-bold" style={{ background: ok ? '#d9f7c8' : '#ffd9d0', border: `2px solid ${ok ? '#3a8a2a' : '#c0392b'}`, padding: `0 ${8 * f}px`, fontSize: 13 * f, gap: 3 * f }}>{children}</span>
);
