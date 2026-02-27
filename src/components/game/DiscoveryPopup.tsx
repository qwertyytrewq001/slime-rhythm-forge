import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Slime } from '@/types/slime';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { X, Sparkles, Trophy, Star } from 'lucide-react';
import { generateSlimeLore } from '@/utils/loreGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface DiscoveryPopupProps {
  slime: Slime;
  reason: string;
  onClose: () => void;
}

export function DiscoveryPopup({ slime, onClose }: DiscoveryPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const content = (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-12 transition-all duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
      {/* 1. SOLID DARK OVERLAY (Blocks everything out) */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      {/* 2. BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute animate-fairy-sparkle w-1.5 h-1.5 rounded-full"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 backgroundColor: i % 2 === 0 ? '#FF7EB6' : '#40E0D0',
                 animationDelay: `${Math.random() * 2}s`,
                 '--tx': `${(Math.random() - 0.5) * 300}px`,
                 '--ty': `${(Math.random() - 0.5) * 300}px`,
               } as any} />
        ))}
      </div>

      {/* 3. THE MAIN MASTER CARD (Scaled down for better screen fit) */}
      <div 
        className={`relative w-full max-w-2xl bg-[#0a140a] border-[6px] border-[#FF7EB6] rounded-[3rem] shadow-[0_0_100px_rgba(255,126,182,0.3),inset_0_0_40px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden transition-all duration-1000 transform ${animate ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* TACTILE CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-[#FF7EB6] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_#FF7EB6] hover:scale-110 active:scale-90 transition-all z-[1010] border-4 border-black"
        >
          <X className="w-7 h-7 stroke-[4px]" />
        </button>

        {/* LEFT PANEL: SHOWCASE */}
        <div className="w-full md:w-[45%] bg-black/60 p-8 flex flex-col items-center justify-center relative border-b-6 md:border-b-0 md:border-r-6 border-[#FF7EB6]/20">
          <div className="absolute inset-0 rounded-full blur-[80px] opacity-30 animate-pulse pointer-events-none" 
               style={{ backgroundColor: RARITY_TIER_COLORS[slime.rarityTier] }} />
          
          <div className="relative group">
             <div className="absolute -inset-12 bg-primary/20 rounded-full blur-3xl animate-spirit-pulse" />
             <SlimeCanvas slime={slime} size={200} animated />
          </div>

          <div className="mt-8 px-6 py-2 bg-primary rounded-xl border-2 border-white/20 shadow-xl animate-bounce">
            <span className="text-[9px] font-black text-primary-foreground uppercase tracking-[0.2em]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              NEW SPIRIT!
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: DETAILS */}
        <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col text-center sm:text-left">
          <p className="text-[11px] text-[#FF7EB6] font-black uppercase tracking-[0.4em] mb-4" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            NEW SPECIES UNLOCKED!
          </p>
          
          <h2 className="text-4xl text-white font-black uppercase tracking-tight mb-6 drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
            {slime.name}
          </h2>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl border-2 bg-black shadow-xl"
                  style={{ color: RARITY_TIER_COLORS[slime.rarityTier], borderColor: RARITY_TIER_COLORS[slime.rarityTier] }}>
              <Star className="w-4 h-4 fill-current" />
              <span className="text-[12px] font-black uppercase tracking-widest">{slime.rarityTier}</span>
            </div>
            <div className="h-6 w-1 bg-white/10 rounded-full" />
            <span className="text-[16px] text-primary font-black uppercase tracking-widest">{ELEMENT_DISPLAY_NAMES[slime.element]}</span>
          </div>

          {/* Lore Box */}
          <div className="bg-black/80 rounded-[2rem] p-6 border-2 border-white/5 shadow-inner mb-8 relative">
            <ScrollArea className="h-24 w-full pr-4">
              <p className="text-[16px] text-white/95 italic leading-relaxed font-bold tracking-wide" style={{ fontFamily: "'VT323', monospace" }}>
                "{generateSlimeLore(slime)}"
              </p>
            </ScrollArea>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-[#FF7EB6] hover:bg-[#FF7EB6]/90 text-black font-black py-8 rounded-[1.5rem] border-b-6 border-black/40 shadow-2xl transition-all uppercase tracking-[0.2em] hover:translate-y-1 hover:border-b-4 active:translate-y-2 active:border-b-0"
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
          >
            Summon to Gallery
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
