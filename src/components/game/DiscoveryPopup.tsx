import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Slime } from '@/types/slime';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS, HABITAT_THEMES } from '@/data/traitData';
import { X, Sparkles, Trophy, Star, Home } from 'lucide-react';
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

  const content = (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
      {/* 1. BEAUTIFUL GRADIENT OVERLAY (Light Pinkish Whitish Theme) */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/90 via-white/80 to-amber-100/90 backdrop-blur-sm" onClick={onClose} />
      
      {/* painted celebration: ribbon banner, rarity gem and confetti */}
      <div className="absolute left-1/2 pointer-events-none" style={{ top: '5%', transform: 'translateX(-50%)', width: 'min(86vw, 520px)', zIndex: 5 }}>
        <style>{`@keyframes discBanner { 0% { opacity: 0; transform: translateY(-30px) scale(0.7) } 60% { transform: translateY(4px) scale(1.04) } 100% { opacity: 1; transform: none } } @keyframes discConfetti { 0% { opacity: 0; transform: translate(-50%,-30%) scale(0.5) } 30% { opacity: 1 } 100% { opacity: 0; transform: translate(-50%,40%) scale(1.3) } }`}</style>
        <div className="relative" style={{ animation: 'discBanner 0.6s ease-out both' }}>
          <img src={`${import.meta.env.BASE_URL}altar/love_banner.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))' }} />
          <span className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 'clamp(20px, 4vw, 34px)', color: '#fff3d0', WebkitTextStroke: '5px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.08em' }}>NEW SLIME!</span>
        </div>
        <img src={`${import.meta.env.BASE_URL}altar/love_confetti.png`} alt="" draggable={false} className="absolute" style={{ left: '50%', top: '50%', width: '90%', imageRendering: 'auto', animation: 'discConfetti 1.8s ease-out 0.4s both' }} />
        <img src={`${import.meta.env.BASE_URL}altar/gem_${slime.rarityTier.toLowerCase()}.png`} alt={slime.rarityTier} draggable={false} className="mx-auto block" style={{ width: 64, marginTop: 6, imageRendering: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }} />
      </div>

      {/* 2. MAGICAL BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Magical sparkles */}
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full animate-pulse"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 backgroundColor: i % 3 === 0 ? '#FFB3D1' : i % 3 === 1 ? '#FF7EB6' : '#F8BBD9',
                 animationDelay: `${Math.random() * 3}s`,
                 opacity: 0.6
               }} />
        ))}
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white/40 rounded-full"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 animation: `float ${5 + Math.random() * 3}s ease-in-out infinite`,
                 animationDelay: `${Math.random() * 2}s`
               }} />
        ))}
      </div>

      {/* 3. BEAUTIFUL MAIN CARD (Light Pinkish Whitish Theme) */}
      <div 
        className={`relative w-full max-w-2xl lg:max-w-3xl bg-gradient-to-br from-pink-100 via-white to-amber-100 border-4 border-pink-300/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-1000 transform ${animate ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Decorative border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-300/20 via-transparent to-amber-300/20 animate-pulse" />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 hover:scale-110 active:scale-90 transition-transform z-10"
        >
          <img src={`${import.meta.env.BASE_URL}ui/baz_close.png`} alt="Close" draggable={false} style={{ width: 38, height: 38, maxWidth: 'none', imageRendering: 'auto' }} />
        </button>

        {/* TOP DECORATIVE BANNER */}
        <div className="bg-gradient-to-r from-pink-300/30 to-amber-300/30 p-3 border-b-2 border-pink-400/50">
          <div className="text-center">
            <span className="text-lg font-bold text-white uppercase tracking-wider drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              ✨ NEW DISCOVERY ✨
            </span>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex flex-col lg:flex-row">
          {/* LEFT PANEL: SLIME SHOWCASE */}
          <div className="w-full lg:w-1/3 bg-gradient-to-br from-pink-100/50 to-amber-100/50 p-4 flex flex-col items-center justify-center relative">
            {/* Magical glow background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-300/20 to-amber-300/20 blur-xl animate-pulse" />
            
            {/* Slime display */}
            <div className="relative z-10">
              <div className="absolute -inset-6 bg-gradient-to-br from-pink-300/30 to-transparent rounded-full blur-lg animate-spin-slow" />
              <SlimeCanvas slime={slime} size={160} animated sizeMultiplier={2.0} animationStyle="excited" />
            </div>

            {/* Discovery badge */}
            <div className="mt-4 px-3 py-1 bg-gradient-to-r from-pink-400 to-amber-500 rounded-xl border-2 border-white/50 shadow-lg animate-bounce">
              <span className="text-xs font-bold text-white uppercase tracking-wider" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                NEW SPIRIT!
              </span>
            </div>
          </div>

          {/* RIGHT PANEL: DETAILS */}
          <div className="w-full lg:w-2/3 p-6 bg-gradient-to-br from-pink-200/50 to-amber-200/50">
            <div className="text-center mb-4">
              <p className="text-sm font-bold text-pink-600 uppercase tracking-wider mb-2" style={{ textShadow: '1px 1px 2px rgba(255,126,182,0.5)' }}>
                SPECIES UNLOCKED!
              </p>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(255,126,182,0.5)' }}>
                {slime.name}
              </h2>
            </div>

            {/* Slime details */}
            <div className="bg-white/30 rounded-xl p-4 mb-4 border border-pink-300/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-pink-600">Rarity:</span>
                <span className="text-sm font-bold text-gray-800 capitalize" style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}>
                  {slime.rarityTier}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-pink-600">Element:</span>
                <span className="text-sm font-bold text-gray-800 capitalize">
                  {ELEMENT_DISPLAY_NAMES[slime.element]}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-pink-600">Stars:</span>
                <div className="flex gap-1">
                  {[...Array(slime.rarityStars || 1)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-pink-600 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Lore */}
            <div className="bg-white/30 rounded-xl p-4 mb-4 border border-pink-300/30">
              <p className="text-sm font-medium text-gray-700 italic leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(255,126,182,0.3)' }}>
                "{getCodexSlime(slime)?.description || 'A mysterious slime with unknown origins.'}"
              </p>
            </div>

            {/* Habitat assignment */}
            {compatibleHabitats.length > 0 ? (
              <button
                onClick={() => {
                  // Auto-assign to first available habitat and close popup
                  handleAssignToHabitat(compatibleHabitats[0].id);
                }}
                className="w-full p-3 bg-gradient-to-r from-pink-400 to-amber-500 hover:from-pink-300 hover:to-amber-400 text-white font-bold rounded-xl border-2 border-white/50 transition-all hover:scale-105 hover:shadow-lg"
              >
                ASSIGN TO HABITAT
              </button>
            ) : (
              <div className="w-full p-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-xl border-2 border-white/50 text-center">
                NO HABITAT AVAILABLE
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
