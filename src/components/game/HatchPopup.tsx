import { useEffect, useState } from 'react';
import { Slime } from '@/types/slime';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { X, Sparkles } from 'lucide-react';
import { generateSlimeLore } from '@/utils/loreGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HatchPopupProps {
  slime: Slime;
  onClose: () => void;
}

export function HatchPopup({ slime, onClose }: HatchPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  return (
    <div className={`fixed inset-0 z-[500] flex items-center justify-center p-4 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Celebration sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF1493' : '#00CED1',
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <div className={`relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 rounded-2xl shadow-[0_0_80px_rgba(99,102,241,0.4)] flex flex-col overflow-hidden transition-all duration-500 transform ${visible ? 'scale-100' : 'scale-95'}`}
        style={{
          borderColor: RARITY_TIER_COLORS[slime.rarityTier],
        }}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg border-2 border-red-400"
        >
          <X className="w-5 h-5 text-white stroke-[3px]" />
        </button>

        {/* Rarity glow accent */}
        <div className="absolute top-0 left-0 right-0 h-32 opacity-20 blur-3xl pointer-events-none" style={{
          background: `linear-gradient(to right, ${RARITY_TIER_COLORS[slime.rarityTier]}, transparent)`,
        }} />

        {/* Content wrapper */}
        <div className="relative z-10 p-8 sm:p-12">
          {/* Header: NEW SLIME! */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border-2 border-amber-500/50 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                New Slime Hatched!
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          {/* Main layout: Image on left, Info on right */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Slime Image */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {/* Glow background */}
                <div className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse" style={{
                  backgroundColor: RARITY_TIER_COLORS[slime.rarityTier],
                  width: '100%',
                  height: '100%',
                  transform: 'scale(1.2)',
                }} />
                
                {/* Slime canvas */}
                <div className="relative z-10 flex items-center justify-center">
                  <SlimeCanvas slime={slime} size={200} animated />
                </div>
              </div>

              {/* Rarity badge */}
              <div className="mt-6 px-6 py-3 rounded-xl border-2 font-black uppercase tracking-widest text-sm" style={{
                backgroundColor: `${RARITY_TIER_COLORS[slime.rarityTier]}20`,
                borderColor: RARITY_TIER_COLORS[slime.rarityTier],
                color: RARITY_TIER_COLORS[slime.rarityTier],
              }}>
                {slime.rarityTier}
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex flex-col gap-6">
              {/* Name */}
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tight break-words">
                  {slime.name}
                </h2>
              </div>

              {/* Element/Affinity */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600">
                <div className="w-3 h-3 rounded-full" style={{
                  backgroundColor: RARITY_TIER_COLORS[slime.element as any] || '#888888',
                }} />
                <span className="text-sm font-bold text-slate-200">
                  {ELEMENT_DISPLAY_NAMES[slime.element as keyof typeof ELEMENT_DISPLAY_NAMES] || slime.element} Affinity
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Rarity Score</p>
                  <p className="text-xl font-bold text-white">{slime.rarityScore}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Stars</p>
                  <p className="text-xl font-bold text-yellow-400">{'⭐'.repeat(slime.rarityStars)}</p>
                </div>
              </div>

              {/* Lore */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-600">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Lore</p>
                <ScrollArea className="h-24">
                  <p className="text-sm text-slate-200 leading-relaxed italic font-medium pr-4">
                    "{generateSlimeLore(slime)}"
                  </p>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Close hint */}
          <div className="text-center mt-6">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Click X or anywhere outside to dismiss
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
