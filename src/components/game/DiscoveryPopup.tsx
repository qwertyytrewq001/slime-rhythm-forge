import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Slime } from '@/types/slime';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS, HABITAT_THEMES } from '@/data/traitData';
import { X, Sparkles, Trophy, Star, Home } from 'lucide-react';
import { generateSlimeLore } from '@/utils/loreGenerator';
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
      {/* 1. BEAUTIFUL GRADIENT OVERLAY (Like Dragon Mania Legends) */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-pink-900/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* 2. MAGICAL BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Magical sparkles */}
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full animate-pulse"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 backgroundColor: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF69B4' : '#00CED1',
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

      {/* 3. BEAUTIFUL MAIN CARD (Properly sized for screen) */}
      <div 
        className={`relative w-full max-w-2xl lg:max-w-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-4 border-yellow-400/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-1000 transform ${animate ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Decorative border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-transparent to-pink-400/20 animate-pulse" />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-[1010] border-2 border-white/50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* TOP DECORATIVE BANNER */}
        <div className="bg-gradient-to-r from-yellow-400/30 to-pink-400/30 p-3 border-b-2 border-yellow-400/50">
          <div className="text-center">
            <span className="text-lg font-bold text-white uppercase tracking-wider drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              ✨ NEW DISCOVERY ✨
            </span>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex flex-col lg:flex-row">
          {/* LEFT PANEL: SLIME SHOWCASE */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-800/50 to-purple-800/50 p-6 flex flex-col items-center justify-center relative">
            {/* Magical glow background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-pink-400/20 blur-xl animate-pulse" />
            
            {/* Slime display */}
            <div className="relative z-10">
              <div className="absolute -inset-8 bg-gradient-to-br from-yellow-400/30 to-transparent rounded-full blur-lg animate-spin-slow" />
              <SlimeCanvas slime={slime} size={180} animated sizeMultiplier={2.0} animationStyle="excited" />
            </div>

            {/* Discovery badge */}
            <div className="mt-6 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl border-2 border-white/50 shadow-lg animate-bounce">
              <span className="text-sm font-bold text-white uppercase tracking-wider" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                NEW SPIRIT!
              </span>
            </div>
          </div>

          {/* RIGHT PANEL: DETAILS */}
          <div className="w-full lg:w-1/2 p-6 bg-gradient-to-br from-purple-800/50 to-pink-800/50">
            <div className="text-center mb-4">
              <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                SPECIES UNLOCKED!
              </p>
              
              <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {slime.name}
              </h2>
            </div>

            {/* Slime details */}
            <div className="bg-black/30 rounded-xl p-4 mb-4 border border-yellow-400/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-yellow-400">Rarity:</span>
                <span className="text-sm font-bold text-white capitalize" style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}>
                  {slime.rarityTier}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-yellow-400">Element:</span>
                <span className="text-sm font-bold text-white capitalize">
                  {ELEMENT_DISPLAY_NAMES[slime.element]}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-yellow-400">Stars:</span>
                <div className="flex gap-1">
                  {[...Array(slime.rarityStars || 1)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Lore */}
            <div className="bg-black/30 rounded-xl p-4 mb-4 border border-yellow-400/30">
              <p className="text-sm font-medium text-white/90 italic leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                "{generateSlimeLore(slime)}"
              </p>
            </div>

            {/* Habitat assignment */}
            {compatibleHabitats.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-yellow-400 text-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  ASSIGN TO HABITAT:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {compatibleHabitats.map(habitat => (
                    <button
                      key={habitat.id}
                      onClick={() => handleAssignToHabitat(habitat.id)}
                      className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg border border-yellow-400/30 transition-all hover:scale-105 hover:shadow-lg"
                    >
                      <div className="text-center">
                        <p className="text-xs font-bold text-white uppercase mb-1">{getHabitatDisplayName(habitat)}</p>
                        <p className="text-xs text-white/70">
                          {habitat.assignedSlimeIds.length}/{habitat.capacity} Slimes
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full p-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-bold rounded-xl border-2 border-white/50 transition-all hover:scale-105 hover:shadow-lg"
            >
              CONTINUE ADVENTURE
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
