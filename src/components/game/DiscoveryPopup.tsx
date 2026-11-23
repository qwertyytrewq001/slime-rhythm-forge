import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { stageSize, onStageChange } from '@/utils/stage';
import { Slime } from '@/types/slime';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Star } from 'lucide-react';
import { Emblem } from './sanctuary/sanctArt';
import { getCodexSlime, SLIME_CODEX_MAP } from '@/data/slimeCodex';
import { ELEMENT_EFFECTIVENESS, deriveBattleStats } from '@/utils/battleEngine';
import { useGameState } from '@/hooks/useGameState';

interface DiscoveryPopupProps {
  slime: Slime;
  reason: string;
  onClose: () => void;
}

const FRED = "'Fredoka', 'Trebuchet MS', sans-serif";
const INK = '#4a2f17';

/** Rough ceilings so the stat bars fill sensibly for a fresh slime. */
const STAT_REF = { hp: 320, attack: 110, defense: 70, speed: 40 };

export function DiscoveryPopup({ slime, onClose }: DiscoveryPopupProps) {
  const { state, dispatch } = useGameState();
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [vh, setVh] = useState(() => stageSize().h);
  const [vw, setVw] = useState(() => stageSize().w);
  useEffect(() => {
    const on = () => { setVh(stageSize().h); setVw(stageSize().w); };
    return onStageChange(on);
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // how many different species you now own, out of all of them
  const discovered = useMemo(() => {
    const ids = new Set<string>();
    state.slimes.forEach(s => ids.add(s.codexId ?? s.name));
    ids.add(slime.codexId ?? slime.name);
    return ids.size;
  }, [state.slimes, slime]);

  if (!mounted) return null;

  const compatibleHabitats = state.habitats.filter(h =>
    slime.elements.includes(h.element) && h.assignedSlimeIds.length < h.capacity
  );

  const handleAssignToHabitat = (habitatId: string) => {
    dispatch({ type: 'ASSIGN_SLIME_TO_HABITAT', habitatId, slimeId: slime.id });
    onClose();
  };

  const BASE = import.meta.env.BASE_URL;
  const tier = slime.rarityTier;
  const codex = getCodexSlime(slime);
  const fullLore = codex?.description || 'A mysterious slime with unknown origins.';
  // keep the one-line joke that opens each entry; the second "It remembers..." sentence is filler
  const lore = fullLore.split(/(?<=[.!?])s+(?=Its)/)[0];
  const family = (codex?.family ?? '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const stats = deriveBattleStats(slime);
  const strong = [...new Set(slime.elements.flatMap(e => ELEMENT_EFFECTIVENESS[e]?.strong ?? []))];
  const weak = [...new Set(slime.elements.flatMap(e => ELEMENT_EFFECTIVENESS[e]?.weak ?? []))];
  const totalSpecies = SLIME_CODEX_MAP.size;

  const wide = vw >= 720;
  const stageZoom = wide ? Math.min(1.05, Math.max(0.6, (vh - 260) / 330)) : Math.min(1, Math.max(0.5, (vh - 520) / 270));
  const chip = 'inline-flex items-center gap-1.5 rounded-full font-bold';
  const chipStyle = { background: '#fff7dc', border: `2px solid ${INK}`, fontSize: 14, fontFamily: FRED } as const;

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center gap-3" style={{ minHeight: 30 }}>
      <div className="font-bold uppercase" style={{ width: 92, flexShrink: 0, fontSize: 11, letterSpacing: '0.12em', color: '#8a5a24', textAlign: 'left' }}>{label}</div>
      <div className="flex flex-wrap items-center gap-1.5 font-semibold" style={{ fontSize: 14, color: INK, textAlign: 'left' }}>{children}</div>
    </div>
  );

  const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="flex items-center gap-2" style={{ fontFamily: FRED }}>
      <div className="font-bold" style={{ width: 54, fontSize: 12, color: '#6b4a2c', textAlign: 'left' }}>{label}</div>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: 'rgba(74,47,23,0.18)', border: '1px solid rgba(74,47,23,0.35)' }}>
        <div style={{ width: `${Math.min(100, Math.round((value / max) * 100))}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
      <div className="font-bold" style={{ width: 34, fontSize: 12, color: INK, textAlign: 'right' }}>{value}</div>
    </div>
  );

  const stage = (
    <div className="relative mx-auto" style={{ width: 300, height: 270, zoom: stageZoom }}>
      <div className="absolute rounded-full pointer-events-none" style={{ left: '50%', top: '50%', width: 270, height: 270, background: 'radial-gradient(circle, rgba(255,226,130,0.9), rgba(255,226,130,0) 68%)', animation: 'discGlow 2.4s ease-in-out infinite' }} />
      <img src={`${BASE}altar/love_confetti.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '40%', width: 300, imageRendering: 'auto', animation: 'discConfetti 1.8s ease-out 0.4s both' }} />
      <img src={`${BASE}altar/denp_plate.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', bottom: 4, width: 190, transform: 'translateX(-50%)', imageRendering: 'auto' }} />
      <div className="absolute flex items-end justify-center" style={{ left: 0, right: 0, top: 0, bottom: 34, animation: 'discHop 2.2s ease-in-out infinite' }}>
        <SlimeCanvas slime={slime} size={150} animated sizeMultiplier={3} animationStyle="excited" />
      </div>
    </div>
  );

  const actions = compatibleHabitats.length > 0 ? (
    <button onClick={() => handleAssignToHabitat(compatibleHabitats[0].id)} className="relative block hover:scale-105 active:scale-95 transition-transform" style={{ width: 'min(100%, 280px)', background: 'transparent', border: 'none', padding: 0 }}>
      <img src={`${BASE}altar/ui_btn_begin.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 0 10px rgba(190,120,255,0.7))' }} />
      <span className="absolute flex items-center justify-center font-bold whitespace-nowrap" style={{ left: '20%', right: '20%', top: 0, bottom: 0, fontSize: 'clamp(13px, 1.5cqw, 16px)', color: '#fff', WebkitTextStroke: '3px #4a1d7a', paintOrder: 'stroke fill', letterSpacing: '0.02em', fontFamily: FRED }}>Move to habitat</span>
    </button>
  ) : (
    <div className="flex items-center gap-3 flex-wrap">
      <button onClick={onClose} className="relative hover:scale-105 active:scale-95 transition-transform" style={{ width: 170, background: 'transparent', border: 'none', padding: 0 }}>
        <img src={`${BASE}ui/dlg_choice_glow.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto' }} />
        <span className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontSize: 16, fontFamily: FRED, color: INK }}>Got it</span>
      </button>
      <span className="font-semibold" style={{ fontSize: 13, opacity: 0.8, maxWidth: 200, textAlign: 'left', lineHeight: 1.3, fontFamily: FRED }}>No matching habitat has room yet. Build one in the Bazaar and it can move in.</span>
    </div>
  );

  const info = (
    <div className="flex flex-col" style={{ gap: 8, textAlign: wide ? 'left' : 'center' }}>
      <div>
        <div className="font-bold uppercase" style={{ color: '#b8660e', fontSize: 13, letterSpacing: '0.18em', fontFamily: FRED }}>Species unlocked</div>
        <div className="font-bold" style={{ fontSize: 'clamp(28px, 4cqw, 38px)', lineHeight: 1.1, fontFamily: FRED, color: INK }}>{slime.name}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2" style={{ justifyContent: wide ? 'flex-start' : 'center' }}>
        {slime.elements.map(e => (
          <span key={e} className={chip} style={{ ...chipStyle, padding: '2px 12px 2px 4px' }}>
            <Emblem element={e} size={26} />{ELEMENT_DISPLAY_NAMES[e]}
          </span>
        ))}
        <span className={chip} style={{ ...chipStyle, padding: '2px 12px 2px 6px', color: RARITY_TIER_COLORS[tier] }}>
          <img src={`${BASE}altar/gem_${tier.toLowerCase()}.png`} alt="" draggable={false} style={{ width: 24, height: 24, objectFit: 'contain', imageRendering: 'auto' }} />{tier}
        </span>
        <span className={chip} style={{ ...chipStyle, padding: '2px 10px' }}>
          {[...Array(slime.rarityStars || 1)].map((_, i) => <Star key={i} className="w-4 h-4 text-[#f2b632] fill-current" />)}
        </span>
      </div>

      <div className="rounded-2xl" style={{ background: 'rgba(255,255,255,0.55)', border: '2px solid rgba(74,47,23,0.25)', padding: '10px 14px' }}>
        <p className="font-semibold italic" style={{ fontSize: 15, lineHeight: 1.4, fontFamily: FRED, margin: 0 }}>{lore}</p>
      </div>

      <div className="rounded-2xl flex flex-col" style={{ background: 'rgba(255,247,220,0.7)', border: '2px solid rgba(74,47,23,0.25)', padding: '8px 14px', gap: 2, fontFamily: FRED }}>
        {family && <Row label="Family">{family}</Row>}
        <Row label="Strong vs">{strong.length ? strong.map(e => <span key={e} className="inline-flex items-center gap-1 mr-1"><Emblem element={e} size={22} />{ELEMENT_DISPLAY_NAMES[e]}</span>) : 'Nothing in particular'}</Row>
        <Row label="Weak vs">{weak.length ? weak.map(e => <span key={e} className="inline-flex items-center gap-1 mr-1"><Emblem element={e} size={22} />{ELEMENT_DISPLAY_NAMES[e]}</span>) : 'Nothing in particular'}</Row>
        <Row label="Codex">{discovered} of {totalSpecies} species found</Row>
      </div>

      <div className="rounded-2xl grid" style={{ background: 'rgba(255,247,220,0.7)', border: '2px solid rgba(74,47,23,0.25)', padding: '8px 14px', gap: '6px 18px', gridTemplateColumns: wide ? '1fr 1fr' : '1fr' }}>
        <Bar label="Health" value={stats.hp} max={STAT_REF.hp} color="linear-gradient(90deg,#5fcf6a,#2f9e44)" />
        <Bar label="Attack" value={stats.attack} max={STAT_REF.attack} color="linear-gradient(90deg,#ff9a5a,#e0531c)" />
        <Bar label="Defense" value={stats.defense} max={STAT_REF.defense} color="linear-gradient(90deg,#6aa8ff,#2f6fd8)" />
        <Bar label="Speed" value={stats.speed} max={STAT_REF.speed} color="linear-gradient(90deg,#ffe066,#e0b01c)" />
      </div>

      <div style={{ display: 'flex', justifyContent: wide ? 'flex-start' : 'center', marginTop: 2 }}>{actions}</div>
    </div>
  );

  const content = (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-3 transition-all duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
      <style>{`
        @keyframes discBanner { 0% { opacity: 0; transform: translateY(-24px) scale(0.7) } 60% { transform: translateY(3px) scale(1.04) } 100% { opacity: 1; transform: none } }
        @keyframes discConfetti { 0% { opacity: 0; transform: translate(-50%,-30%) scale(0.5) } 30% { opacity: 1 } 100% { opacity: 0; transform: translate(-50%,30%) scale(1.25) } }
        @keyframes discGlow { 0%,100% { opacity: 0.55; transform: translate(-50%,-50%) scale(1) } 50% { opacity: 0.95; transform: translate(-50%,-50%) scale(1.08) } }
        @keyframes discHop { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        .disc-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .disc-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="absolute inset-0 bg-[#1d1235]/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full flex flex-col items-center" style={{ maxWidth: wide ? 860 : 520, maxHeight: '98cqh' }} onClick={(e) => e.stopPropagation()}>
        {/* ribbon straddling the card's top edge */}
        <div className="relative pointer-events-none" style={{ width: 'min(86%, 360px)', marginBottom: -26, zIndex: 3, animation: 'discBanner 0.6s ease-out both' }}>
          <img src={`${BASE}altar/love_banner.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.4))' }} />
          <span className="absolute flex items-center justify-center font-bold" style={{ left: '16%', right: '16%', top: 0, bottom: '30%', fontFamily: FRED, fontSize: 'clamp(20px, 4.4cqw, 30px)', color: '#fff3d0', WebkitTextStroke: '5px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.05em' }}>NEW SLIME!</span>
        </div>

        <div className="disc-scroll relative w-full overflow-x-hidden overflow-y-auto" style={{ background: 'linear-gradient(#f6e8c3,#ecd9a8)', border: `5px solid ${INK}`, borderRadius: 28, boxShadow: '0 22px 50px rgba(0,0,0,0.55)', color: INK, padding: wide ? '38px 26px 18px' : '38px 18px 18px', maxHeight: 'calc(98cqh - 50px)', overscrollBehavior: 'contain' }}>
          <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 hover:scale-110 active:scale-90 transition-transform z-10">
            <img src={`${BASE}ui/baz_close.png`} alt="Close" draggable={false} style={{ width: 40, height: 40, imageRendering: 'auto' }} />
          </button>

          {wide ? (
            <div className="grid items-center" style={{ gridTemplateColumns: '300px 1fr', gap: 24 }}>
              <div>{stage}</div>
              {info}
            </div>
          ) : (
            <div className="text-center">
              {stage}
              {info}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.getElementById('root') ?? document.body);
}
