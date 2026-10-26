import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Habitat, HabitatGift } from '@/types/slime';
import { ELEMENT_DISPLAY_NAMES, HABITAT_THEMES } from '@/data/traitData';
import { audioEngine } from '@/utils/audioEngine';
import { JOY_MAX, activePerks, collectAll, giftCap, habitatLevel, perksFrom, totalGifts } from '@/utils/sanctuaryCore';
import { SlimeCanvas } from './SlimeCanvas';
import { SanctuaryPanel } from './SanctuaryPanel';
import { ArtImg, BASE, Emblem, Heart, giftLabel } from './sanctuary/sanctArt';

interface SanctuaryHubProps {
  onClose: () => void;
  onOpenHabitat: (habitatId: string) => void;
  onOpenBazaar: () => void;
}

const PARCHMENT = '#f6e8c3';
const INK = '#4a2f17';
const GOLD = '#f2b632';
const SLOTS = 8;
// Two rows of four floating islands; the lower row is staggered so it feels like a scatter, not a table.
const SLOT_POS = [
  { x: 0.16, y: 0.4 }, { x: 0.385, y: 0.36 }, { x: 0.615, y: 0.4 }, { x: 0.84, y: 0.36 },
  { x: 0.16, y: 0.74 }, { x: 0.385, y: 0.7 }, { x: 0.615, y: 0.74 }, { x: 0.84, y: 0.7 },
];

type Pop = { id: number; x: number; y: number; text: string; big?: boolean };

export function SanctuaryHub({ onClose, onOpenHabitat, onOpenBazaar }: SanctuaryHubProps) {
  const { state, dispatch } = useGameState();
  const stageRef = useRef<HTMLDivElement>(null);
  const [sw, setSw] = useState(1000);
  const [pops, setPops] = useState<Pop[]>([]);
  const [manage, setManage] = useState<string | null>(null);
  const popId = useRef(0);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSw(el.clientWidth || 1000);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sh = (sw * 9) / 16;
  const { habitats, slimes, pendingHabitatPlacement } = state;
  const gifts = totalGifts(habitats);
  const perks = useMemo(() => perksFrom(habitats, slimes), [habitats, slimes]);
  const perkLines = useMemo(() => activePerks(habitats, slimes), [habitats, slimes]);

  const addPop = useCallback((x: number, y: number, text: string, big = false) => {
    const id = ++popId.current;
    setPops(p => [...p, { id, x, y, text, big }]);
    setTimeout(() => setPops(p => p.filter(q => q.id !== id)), 1500);
  }, []);

  const collectFrom = (habitat: Habitat, at: { x: number; y: number }) => {
    const list: HabitatGift[] = habitat.gifts ?? [];
    if (!list.length) return;
    list.forEach((g, i) => setTimeout(() => addPop(at.x + (i - (list.length - 1) / 2) * sw * 0.03, at.y - i * sw * 0.012, giftLabel(g), g.kind === 'jackpot'), i * 160));
    audioEngine.playSfx('collect');
    list.forEach(g => dispatch({ type: 'SANCT_COLLECT', habitatId: habitat.id, giftId: g.id }));
  };

  const collectEverything = () => {
    if (!gifts) return;
    habitats.forEach((h, i) => collectFrom(h, { x: SLOT_POS[i % SLOTS].x * sw, y: SLOT_POS[i % SLOTS].y * sh }));
    // collectFrom already dispatches per gift; nothing more to do
  };

  const placeHere = (slotIndex: number) => {
    if (!pendingHabitatPlacement) {
      addPop(SLOT_POS[slotIndex].x * sw, SLOT_POS[slotIndex].y * sh, 'Build one in the Bazaar', false);
      return;
    }
    dispatch({ type: 'PLACE_HABITAT_IN_SLOT', element: pendingHabitatPlacement.element, gridX: slotIndex % 4, gridY: Math.floor(slotIndex / 4) });
    audioEngine.playSfx('purchase');
  };

  const managed = manage ? habitats.find(h => h.id === manage) : null;
  const island = sw * 0.2;

  return (
    <div className="fixed inset-0 z-[95] bg-black flex items-center justify-center overflow-hidden select-none animate-in fade-in duration-300" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}>
      <style>{CSS}</style>
      <div className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60" style={{ backgroundImage: `url("${BASE}second_screen_background.png")` }} />
      <div ref={stageRef} className="relative" style={{ width: 'min(100vw, calc(100vh * 16 / 9))', height: 'min(100vh, calc(100vw * 9 / 16))' }}>
        {/* painted sky if it exists, otherwise the existing backdrop */}
        <ArtImg file="sanct_hub_background.jpg" className="absolute inset-0 w-full h-full" fallback={<div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${BASE}second_screen_background.png")` }}><div className="absolute inset-0 bg-black/50" /></div>} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 55%, transparent 50%, rgba(20,8,40,0.4) 100%)' }} />

        {/* ambient glints */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="absolute rounded-full sanct-spark" style={{ left: `${6 + ((i * 47) % 88)}%`, top: `${12 + ((i * 31) % 76)}%`, width: sw * 0.004, height: sw * 0.004, background: i % 2 ? '#fff3b0' : '#d9e6ff', boxShadow: '0 0 8px #fff3b0', animationDelay: `${-(i * 1.3) % 8}s`, animationDuration: `${6 + (i % 4)}s` }} />
          ))}
        </div>

        {/* the islands */}
        {Array.from({ length: SLOTS }).map((_, i) => {
          const habitat = habitats[i];
          const pos = SLOT_POS[i];
          return (
            <div key={i} className="absolute" style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, width: island, height: island * 0.7, transform: 'translate(-50%, -50%)', zIndex: 10 + Math.floor(i / 4) * 5 }}>
              {habitat ? (
                <IslandView
                  habitat={habitat}
                  index={i}
                  sw={sw}
                  w={island}
                  cap={giftCap(habitat, perks)}
                  onOpen={() => onOpenHabitat(habitat.id)}
                  onManage={() => setManage(habitat.id)}
                  onCollect={() => collectFrom(habitat, { x: pos.x * sw, y: pos.y * sh - island * 0.3 })}
                />
              ) : (
                <EmptySite w={island} pending={!!pendingHabitatPlacement} onClick={() => placeHere(i)} />
              )}
            </div>
          );
        })}

        {/* floating text */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 400 }}>
          {pops.map(p => (
            <div key={p.id} className="absolute whitespace-nowrap font-bold sanct-pop" style={{ left: p.x, top: p.y, fontSize: sw * (p.big ? 0.026 : 0.019), color: p.big ? '#ffe14d' : '#fff', WebkitTextStroke: `${Math.max(2, sw * 0.0028)}px #2a1408`, paintOrder: 'stroke fill', textShadow: '0 3px 0 rgba(30,12,4,0.8)' }}>{p.text}</div>
          ))}
        </div>

        {/* HUD */}
        <div className="absolute flex items-center" style={{ left: sw * 0.014, top: sw * 0.012, gap: sw * 0.01, zIndex: 300 }}>
          <button onClick={onClose} className="rounded-full font-bold border-[3px] shadow-lg hover:scale-105 transition-transform whitespace-nowrap" style={{ background: PARCHMENT, borderColor: INK, color: INK, fontSize: sw * 0.0135, padding: `${sw * 0.005}px ${sw * 0.014}px` }}>
            ← Altar
          </button>
          <div>
            <div className="font-bold leading-none text-white" style={{ fontSize: sw * 0.026, WebkitTextStroke: `${sw * 0.003}px #2a1408`, paintOrder: 'stroke fill', letterSpacing: '0.02em' }}>Sanctuary Isles</div>
            <div className="font-semibold text-white/90" style={{ fontSize: sw * 0.0105, textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>Happy slimes leave gifts. Tap an island to visit.</div>
          </div>
        </div>
        <div className="absolute flex items-center" style={{ right: sw * 0.014, top: sw * 0.012, gap: sw * 0.008, zIndex: 300 }}>
          <button
            onClick={collectEverything}
            disabled={!gifts}
            className={`relative rounded-full font-bold border-[3px] shadow-lg transition-transform whitespace-nowrap ${gifts ? 'hover:scale-105 sanct-ready' : 'opacity-60 cursor-not-allowed'}`}
            style={{ background: gifts ? 'linear-gradient(#ff7eb6,#ff1493)' : PARCHMENT, borderColor: gifts ? '#fff3c0' : INK, color: gifts ? '#fff' : INK, fontSize: sw * 0.0135, padding: `${sw * 0.005}px ${sw * 0.014}px` }}
          >
            🎁 Collect All
            {gifts > 0 && <span className="absolute -top-2 -right-2 rounded-full font-bold text-white flex items-center justify-center" style={{ background: '#e8344c', border: '2px solid #fff', minWidth: sw * 0.021, height: sw * 0.021, fontSize: sw * 0.011, padding: '0 4px' }}>{gifts}</span>}
          </button>
          <div className="rounded-full font-bold shadow-lg" style={{ background: PARCHMENT, border: `3px solid ${INK}`, color: INK, fontSize: sw * 0.0135, padding: `${sw * 0.004}px ${sw * 0.012}px` }}>
            {Math.floor(state.goo).toLocaleString()} 💧
          </div>
        </div>

        {/* active perks */}
        {perkLines.length > 0 && (
          <div className="absolute flex flex-wrap justify-center" style={{ left: '12%', right: '12%', bottom: sw * 0.012, gap: sw * 0.005, zIndex: 300 }}>
            {perkLines.map(p => (
              <span key={p.element} className="rounded-full font-bold whitespace-nowrap" style={{ background: 'rgba(30,14,40,0.82)', color: '#ffe9a8', border: '1px solid rgba(255,255,255,0.35)', fontSize: sw * 0.0098, padding: `${sw * 0.0012}px ${sw * 0.007}px` }}>
                <Emblem element={p.element} size={sw * 0.014} style={{ marginRight: 3 }} />{p.title}: {p.text.replace(/^(Farm|Gifts): /, '')}
              </span>
            ))}
          </div>
        )}

        {/* placement banner / first-time nudge */}
        {pendingHabitatPlacement ? (
          <Banner sw={sw}>Place your {ELEMENT_DISPLAY_NAMES[pendingHabitatPlacement.element]} Sanctuary: tap a glowing site.
            <button onClick={() => dispatch({ type: 'CANCEL_HABITAT_PLACEMENT' })} className="ml-3 rounded-full border-2 font-bold" style={{ borderColor: INK, background: '#fff7dc', padding: `0 ${sw * 0.008}px`, fontSize: sw * 0.011 }}>Cancel</button>
          </Banner>
        ) : habitats.length === 0 ? (
          <Banner sw={sw}>No sanctuaries yet. Build one in the Bazaar and your slimes will have a home.
            <button onClick={onOpenBazaar} className="ml-3 rounded-full border-2 font-bold" style={{ borderColor: INK, background: 'linear-gradient(#ffe98a,#f2b632)', padding: `0 ${sw * 0.008}px`, fontSize: sw * 0.011 }}>Open Bazaar</button>
          </Banner>
        ) : null}

        {managed && <SanctuaryPanel habitat={managed} sw={sw} onClose={() => setManage(null)} />}
      </div>
    </div>
  );
}

const Banner: React.FC<{ sw: number; children: React.ReactNode }> = ({ sw, children }) => (
  <div className="absolute left-1/2 -translate-x-1/2 rounded-2xl shadow-xl font-bold text-center sanct-rise" style={{ top: sw * 0.075, background: PARCHMENT, border: `3px solid ${INK}`, color: INK, fontSize: sw * 0.0125, padding: `${sw * 0.006}px ${sw * 0.014}px`, zIndex: 350, maxWidth: '70%' }}>{children}</div>
);

const EmptySite: React.FC<{ w: number; pending: boolean; onClick: () => void }> = ({ w, pending, onClick }) => (
  <button onClick={onClick} className="absolute inset-0 sanct-bob" style={{ animationDelay: '-1s' }} aria-label={pending ? 'Place sanctuary here' : 'Empty sanctuary site'}>
    <ArtImg
      file="island_empty.png"
      className="absolute inset-0 w-full h-full"
      style={{ objectFit: 'contain', objectPosition: 'center bottom', opacity: pending ? 1 : 0.85, filter: pending ? 'drop-shadow(0 0 14px #f2b632)' : 'drop-shadow(0 8px 6px rgba(30,10,50,0.3))' }}
      fallback={
        <div className="absolute" style={{ left: '8%', right: '8%', top: '18%', height: '50%', borderRadius: '50%', border: `3px dashed ${pending ? GOLD : 'rgba(255,255,255,0.55)'}`, background: pending ? 'rgba(242,182,50,0.18)' : 'rgba(255,255,255,0.1)' }} />
      }
    />
    {pending && <div className="absolute rounded-full sanct-ring" style={{ left: '8%', right: '8%', top: '18%', height: '50%', border: `3px solid ${GOLD}` }} />}
    <div className="absolute inset-x-0 text-center font-bold text-white" style={{ top: '38%', fontSize: w * 0.09, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{pending ? 'Place here' : '+'}</div>
  </button>
);

const IslandView: React.FC<{
  habitat: Habitat; index: number; sw: number; w: number; cap: number;
  onOpen: () => void; onManage: () => void; onCollect: () => void;
}> = ({ habitat, index, sw, w, cap, onOpen, onManage, onCollect }) => {
  const { state } = useGameState();
  const theme = HABITAT_THEMES[habitat.element];
  const living = habitat.assignedSlimeIds.map(id => state.slimes.find(s => s.id === id)).filter(Boolean);
  const level = habitatLevel(habitat);
  const giftCount = habitat.gifts?.length ?? 0;
  const joy = (habitat.joy ?? 0) / JOY_MAX;
  return (
    <div className="absolute inset-0 sanct-bob" style={{ animationDelay: `${-index * 0.9}s` }}>
      <div className="absolute inset-0 cursor-pointer" onClick={onOpen} role="button" aria-label={`${ELEMENT_DISPLAY_NAMES[habitat.element]} sanctuary`}>
        <ArtImg
          file={`island_${habitat.element}.png`}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'contain', objectPosition: 'center bottom', filter: 'drop-shadow(0 10px 8px rgba(30,10,50,0.35))' }}
          fallback={
            <>
              <div className="absolute" style={{ left: '14%', right: '14%', top: '44%', bottom: '2%', background: 'linear-gradient(#7a5a48,#3e2a2e)', clipPath: 'polygon(0 0,100% 0,84% 62%,62% 100%,42% 82%,20% 64%)', border: `2px solid ${theme.accent}` }} />
              <div className="absolute overflow-hidden" style={{ left: '2%', right: '2%', top: '6%', height: '56%', borderRadius: '50%', border: `4px solid ${theme.accent}`, boxShadow: `0 0 18px ${theme.accent}88, 0 6px 0 rgba(0,0,0,0.35)`, backgroundImage: theme.bgImage ? `url("${theme.bgImage}")` : undefined, backgroundColor: theme.bg, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </>
          }
        />
        {/* the slimes living here */}
        {living.map((s, k) => s && (
          <div key={s.id} className="absolute sanct-hop pointer-events-none" style={{ left: `${living.length === 1 ? 50 : 34 + (k * 32) / (living.length - 1)}%`, marginLeft: -w * 0.12, top: '13%', width: w * 0.24, height: w * 0.24, animationDelay: `${-k * 0.8 - index * 0.3}s` }}>
            <SlimeCanvas slime={s} size={Math.round(w * 0.24)} animated={false} />
          </div>
        ))}
        {!living.length && <div className="absolute inset-x-0 text-center font-bold text-white/85 pointer-events-none" style={{ top: '30%', fontSize: w * 0.075, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>Empty</div>}
      </div>

      {/* nameplate, level and joy */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none" style={{ top: '84%', width: '92%' }}>
        <div className="inline-flex items-center rounded-full font-bold whitespace-nowrap" style={{ background: 'rgba(30,14,40,0.85)', color: '#fff', border: `2px solid ${theme.accent}`, fontSize: sw * 0.0105, padding: `0 ${sw * 0.007}px`, gap: sw * 0.004 }}>
          <Emblem element={habitat.element} size={sw * 0.02} />
          <span>{ELEMENT_DISPLAY_NAMES[habitat.element]}</span>
          <span style={{ color: '#ffe9a8' }}>Lv {level}</span>
        </div>
        <div className="mx-auto flex items-center justify-center" style={{ gap: sw * 0.003, marginTop: sw * 0.002 }}>
          <Heart size={sw * 0.016} kind={joy >= 0.99 ? 'full' : joy > 0.15 ? 'half' : 'empty'} />
          <div className="rounded-full overflow-hidden" style={{ width: '50%', height: Math.max(4, sw * 0.0045), background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.4)' }}>
            <div className="h-full" style={{ width: `${joy * 100}%`, background: 'linear-gradient(90deg,#ff9ac8,#ff4f9d)', transition: 'width 1s' }} />
          </div>
        </div>
      </div>

      {/* gift bubble */}
      {giftCount > 0 && (
        <button onClick={e => { e.stopPropagation(); onCollect(); }} aria-label="Collect gifts" className="absolute sanct-gift" style={{ left: '50%', top: '-12%', width: w * 0.26, height: w * 0.26, transform: 'translateX(-50%)' }}>
          <ArtImg file="icon_gift_bubble.png" className="w-full h-full" fallback={<div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle at 35% 30%, #ffffffcc, #b9e4ff99)', border: '3px solid #fff', fontSize: w * 0.12, boxShadow: '0 0 14px #bfe9ff' }}>🎁</div>} />
          <span className="absolute rounded-full font-bold text-white flex items-center justify-center" style={{ right: -2, top: -2, minWidth: w * 0.1, height: w * 0.1, background: '#e8344c', border: '2px solid #fff', fontSize: w * 0.06, padding: '0 3px' }}>{giftCount}/{cap}</span>
        </button>
      )}

      <button onClick={e => { e.stopPropagation(); onManage(); }} className="absolute rounded-full font-bold border-2 hover:scale-110 transition-transform" style={{ right: '4%', top: '4%', background: PARCHMENT, borderColor: INK, color: INK, fontSize: sw * 0.0095, padding: `0 ${sw * 0.006}px`, zIndex: 5 }} aria-label="Manage sanctuary">⚙ Manage</button>
    </div>
  );
};

const CSS = `
  @keyframes sanctBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3.5%) } }
  @keyframes sanctHop { 0%,70%,100% { transform: translateY(0) scale(1,1) } 78% { transform: translateY(2%) scale(1.08,0.9) } 88% { transform: translateY(-22%) scale(0.95,1.08) } 95% { transform: translateY(0) scale(1.06,0.94) } }
  @keyframes sanctGift { 0%,100% { transform: translateX(-50%) translateY(0) scale(1) } 50% { transform: translateX(-50%) translateY(-10%) scale(1.06) } }
  @keyframes sanctPop { 0% { transform: translate(-50%,-30%) scale(0.5); opacity: 0 } 15% { transform: translate(-50%,-70%) scale(1.2); opacity: 1 } 70% { opacity: 1 } 100% { transform: translate(-50%,-220%) scale(1); opacity: 0 } }
  @keyframes sanctSpark { 0% { transform: translate(0,0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translate(30px,-60px); opacity: 0 } }
  @keyframes sanctRing { 0% { opacity: 0.95; transform: scale(0.92) } 100% { opacity: 0; transform: scale(1.18) } }
  @keyframes sanctRise { 0% { opacity: 0; margin-top: 12px } 100% { opacity: 1; margin-top: 0 } }
  @keyframes sanctReady { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.25) } }
  .sanct-bob { animation: sanctBob 5s ease-in-out infinite }
  .sanct-hop { animation: sanctHop 3.2s ease-in-out infinite }
  .sanct-gift { animation: sanctGift 1.6s ease-in-out infinite }
  .sanct-pop { animation: sanctPop 1.4s ease-out forwards }
  .sanct-spark { animation: sanctSpark 7s ease-out infinite }
  .sanct-ring { animation: sanctRing 1.5s ease-out infinite }
  .sanct-rise { animation: sanctRise 0.25s ease-out forwards }
  .sanct-ready { animation: sanctReady 1s ease-in-out infinite }
`;
