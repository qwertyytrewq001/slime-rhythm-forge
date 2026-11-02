import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Slime } from '@/types/slime';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS, HABITAT_THEMES } from '@/data/traitData';
import { X, Sparkles, Trophy, Star, Home } from 'lucide-react';
import { Emblem } from './sanctuary/sanctArt';
import { getCodexSlime } from '@/data/slimeCodex';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useGameState } from '@/hooks/useGameState';

interface DiscoveryPopupProps {
  slime: Slime;
  reason: string;
  onClose: () => void;
}

export function DiscoveryPopup({ slime, onClose }: DiscoveryPopupProps) {
  const { state, dispatch } = useGameState();
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const compatibleHabitats = state.habitats.filter(h => 
    slime.elements.includes(h.element) && h.assignedSlimeIds.length < h.capacity
  );

  const handleAssignToHabitat = (habitatId: string) => {
    dispatch({ type: 'ASSIGN_SLIME_TO_HABITAT', habitatId, slimeId: slime.id });
    onClose();
  };

  // Get habitat display name from ELEMENT_DISPLAY_NAMES
  const getHabitatDisplayName = (habitat: any) => {
    const elementKey = habitat.element as keyof typeof ELEMENT_DISPLAY_NAMES;
    return ELEMENT_DISPLAY_NAMES[elementKey] || 'Unknown Habitat';
  };

  const BASE = import.meta.env.BASE_URL;
  const tier = slime.rarityTier;
  const lore = getCodexSlime(slime)?.description || 'A mysterious slime with unknown origins.';
  const chip = 'inline-flex items-center gap-1.5 rounded-full font-bold [font-family:Fredoka,sans-serif]';

  const content = (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-3 transition-all duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
      <style>{`
        @keyframes discBanner { 0% { opacity: 0; transform: translateY(-24px) scale(0.7) } 60% { transform: translateY(3px) scale(1.04) } 100% { opacity: 1; transform: none } }
        @keyframes discConfetti { 0% { opacity: 0; transform: translate(-50%,-30%) scale(0.5) } 30% { opacity: 1 } 100% { opacity: 0; transform: translate(-50%,30%) scale(1.25) } }
        @keyframes discGlow { 0%,100% { opacity: 0.55; transform: translate(-50%,-50%) scale(1) } 50% { opacity: 0.95; transform: translate(-50%,-50%) scale(1.08) } }
        @keyframes discHop { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
      `}</style>
      <div className="absolute inset-0 bg-[#1d1235]/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full flex flex-col items-center" style={{ maxWidth: 520, maxHeight: '96vh' }} onClick={(e) => e.stopPropagation()}>
        {/* ribbon straddling the card's top edge */}
        <div className="relative pointer-events-none" style={{ width: 'min(86%, 380px)', marginBottom: -30, zIndex: 3, animation: 'discBanner 0.6s ease-out both' }}>
          <img src={`${BASE}altar/love_banner.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.4))' }} />
          <span className="absolute flex items-center justify-center font-bold" style={{ left: '16%', right: '16%', top: 0, bottom: '6%', fontFamily: "'Fredoka', sans-serif", fontSize: 'clamp(20px, 4.4vw, 30px)', color: '#fff3d0', WebkitTextStroke: '5px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.05em' }}>NEW SLIME!</span>
        </div>

        <div className="relative w-full overflow-hidden text-center" style={{ background: 'linear-gradient(#f6e8c3,#ecd9a8)', border: '5px solid #4a2f17', borderRadius: 28, boxShadow: '0 22px 50px rgba(0,0,0,0.55)', color: '#4a2f17', padding: '46px 26px 22px' }}>
          <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 hover:scale-110 active:scale-90 transition-transform z-10">
            <img src={`${BASE}ui/baz_close.png`} alt="Close" draggable={false} style={{ width: 40, height: 40, imageRendering: 'auto' }} />
          </button>

          {/* stage: glow, confetti, a gold plate, and a big slime in the middle of all three */}
          <div className="relative mx-auto" style={{ width: 300, height: 270 }}>
            <div className="absolute rounded-full pointer-events-none" style={{ left: '50%', top: '50%', width: 270, height: 270, background: 'radial-gradient(circle, rgba(255,226,130,0.9), rgba(255,226,130,0) 68%)', animation: 'discGlow 2.4s ease-in-out infinite' }} />
            <img src={`${BASE}altar/love_confetti.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '40%', width: 300, imageRendering: 'auto', animation: 'discConfetti 1.8s ease-out 0.4s both' }} />
            <img src={`${BASE}altar/denp_plate.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', bottom: 4, width: 190, transform: 'translateX(-50%)', imageRendering: 'auto' }} />
            <div className="absolute flex items-end justify-center" style={{ left: 0, right: 0, top: 0, bottom: 34, animation: 'discHop 2.2s ease-in-out infinite' }}>
              <SlimeCanvas slime={slime} size={150} animated sizeMultiplier={3} animationStyle="excited" />
            </div>
          </div>

          <div className="font-bold uppercase tracking-widest [font-family:Fredoka,sans-serif]" style={{ color: '#b8660e', fontSize: 14, marginTop: 2 }}>Species unlocked</div>
          <div className="font-bold [font-family:Fredoka,sans-serif]" style={{ fontSize: 'clamp(28px, 6vw, 38px)', lineHeight: 1.1, margin: '2px 0 10px' }}>{slime.name}</div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            {slime.elements.map(e => (
              <span key={e} className={chip} style={{ background: '#fff7dc', border: '2px solid #4a2f17', padding: '2px 12px 2px 4px', fontSize: 14 }}>
                <Emblem element={e} size={26} />{ELEMENT_DISPLAY_NAMES[e]}
              </span>
            ))}
            <span className={chip} style={{ background: '#fff7dc', border: '2px solid #4a2f17', padding: '2px 12px 2px 6px', fontSize: 14, color: RARITY_TIER_COLORS[tier] }}>
              <img src={`${BASE}altar/gem_${tier.toLowerCase()}.png`} alt="" draggable={false} style={{ width: 24, height: 24, objectFit: 'contain', imageRendering: 'auto' }} />{tier}
            </span>
            <span className={chip} style={{ background: '#fff7dc', border: '2px solid #4a2f17', padding: '2px 10px', fontSize: 14 }}>
              {[...Array(slime.rarityStars || 1)].map((_, i) => <Star key={i} className="w-4 h-4 text-[#f2b632] fill-current" />)}
            </span>
          </div>

          <div className="rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.55)', border: '2px solid rgba(74,47,23,0.25)', padding: '10px 16px' }}>
            <p className="font-semibold italic [font-family:Fredoka,sans-serif]" style={{ fontSize: 15, lineHeight: 1.4 }}>"{lore}"</p>
          </div>

          {compatibleHabitats.length > 0 ? (
            <button onClick={() => handleAssignToHabitat(compatibleHabitats[0].id)} className="relative mx-auto block hover:scale-105 active:scale-95 transition-transform" style={{ width: 'min(100%, 300px)', background: 'transparent', border: 'none', padding: 0 }}>
              <img src={`${BASE}altar/ui_btn_begin.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 0 10px rgba(190,120,255,0.7))' }} />
              <span className="absolute inset-0 flex items-center justify-center font-bold whitespace-nowrap" style={{ fontSize: 18, color: '#fff', WebkitTextStroke: '3px #4a1d7a', paintOrder: 'stroke fill', letterSpacing: '0.03em', fontFamily: "'Fredoka', sans-serif" }}>Move into a sanctum</span>
            </button>
          ) : (
            <div className="mx-auto" style={{ maxWidth: 360 }}>
              <div className="font-semibold [font-family:Fredoka,sans-serif]" style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>No matching sanctum has room yet. Build one in the Bazaar and it can move in.</div>
              <button onClick={onClose} className="relative mx-auto block hover:scale-105 active:scale-95 transition-transform" style={{ width: 180, background: 'transparent', border: 'none', padding: 0 }}>
                <img src={`${BASE}ui/dlg_choice_glow.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto' }} />
                <span className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontSize: 16, fontFamily: "'Fredoka', sans-serif" }}>Got it</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
