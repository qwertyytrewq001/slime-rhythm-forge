import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS, MODEL_NAMES } from '@/data/traitData';
import { generateSlimeLore } from '@/utils/loreGenerator';
import { Sparkles, BookOpen } from 'lucide-react';

interface StatsPanelProps {
  onRequestGallery?: () => void;
}

export function StatsPanel({ onRequestGallery }: StatsPanelProps) {
  const { state } = useGameState();
  const slime = state.slimes.find(s => s.id === state.selectedSlimeId);

  const getElementNames = (s: any) => {
    const elems = s.elements || [s.element];
    return elems.map((e: string) => ELEMENT_DISPLAY_NAMES[e as keyof typeof ELEMENT_DISPLAY_NAMES] || e).join(', ');
  };

  return (
    <div className="flex flex-col h-full bg-[#1a2418]/90 text-primary-foreground border-l-4 border-primary/30 p-4 overflow-y-auto"
      style={{ fontFamily: "'VT323', monospace", backgroundImage: 'radial-gradient(circle at top right, rgba(74, 93, 69, 0.2) 0%, transparent 70%)' }}>
      
      <div className="flex items-center justify-center gap-3 mb-6">
        <BookOpen className="w-5 h-5 text-primary animate-soft-pulse" />
        <h2 className="text-center text-sm text-primary uppercase tracking-widest font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Spirit Codex
        </h2>
      </div>

      {slime ? (
        <div className="flex flex-col items-center gap-4 animate-scale-in">
          {/* Slime Portrait with Glow */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-soft-pulse"
                style={{
                  backgroundColor: RARITY_TIER_COLORS[slime.rarityTier],
                }} />
            <div className="relative z-10 bg-black/40 rounded-full p-4 border-2 border-primary/20 backdrop-blur-sm shadow-inner">
              <SlimeCanvas slime={slime} size={140} animated />
            </div>
          </div>

          {/* Species name */}
          <div className="text-center mt-2">
            <h3 className="text-lg text-primary font-black uppercase tracking-wider">{slime.name}</h3>
            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-1" />
          </div>

          {/* Rarity Tier Tag */}
          <span className="text-[10px] px-4 py-1 rounded-full border-2 font-black uppercase tracking-tighter shadow-md"
            style={{
              color: RARITY_TIER_COLORS[slime.rarityTier],
              borderColor: RARITY_TIER_COLORS[slime.rarityTier] + '60',
              backgroundColor: 'rgba(0,0,0,0.4)',
              fontFamily: "'Press Start 2P', cursive",
            }}>
            {slime.rarityTier}
          </span>

          {/* Detailed Info Cards */}
          <div className="w-full grid grid-cols-1 gap-3 mt-4">
            {/* Elements */}
            <div className="bg-black/30 p-3 rounded-xl border border-primary/10 hover:border-primary/30 transition-colors">
              <span className="text-[9px] text-primary/60 uppercase font-bold block mb-1">Elemental Essence</span>
              <span className="text-sm font-bold text-primary-foreground">
                {getElementNames(slime)}
              </span>
            </div>

            {/* Unique Lore/Story */}
            <div className="bg-black/40 p-4 rounded-xl border-2 border-primary/10 relative overflow-hidden">
              <div className="absolute -top-2 -right-2 opacity-10">
                <BookOpen className="w-12 h-12" />
              </div>
              <span className="text-[9px] text-primary/60 uppercase font-black block mb-2 tracking-widest">Spirit Origins</span>
              <p className="text-sm leading-relaxed text-primary-foreground/90 italic">
                {generateSlimeLore(slime)}
              </p>
            </div>

            {/* Production */}
            <div className="bg-black/30 p-3 rounded-xl border border-primary/10 flex justify-between items-center">
              <div>
                <span className="text-[9px] text-primary/60 uppercase font-bold block">Goo Resonace</span>
                <span className="text-sm font-bold text-primary-foreground">{(slime.rarityScore * 0.1).toFixed(1)} <span className="text-[10px] text-primary/60 font-normal">per cycle</span></span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 animate-float">
                <div className="text-xl">💧</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={onRequestGallery}
          className="flex-1 flex flex-col items-center justify-center text-center px-6 group cursor-pointer hover:bg-white/5 rounded-3xl transition-all duration-500"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            <div className="w-24 h-24 rounded-full bg-black/40 border-4 border-dashed border-primary/30 flex items-center justify-center mb-6 relative group-hover:border-primary transition-colors">
              <span className="text-4xl text-primary/40 group-hover:text-primary transition-all group-hover:scale-110">?</span>
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-soft-pulse group-hover:animate-none opacity-0 group-hover:opacity-100" />
            </div>
          </div>
          <p className="text-sm text-primary/40 animate-soft-inscription-glow uppercase tracking-[0.2em] font-black leading-relaxed group-hover:text-primary transition-colors">
            Tap to Invoke<br />a Spirit Spirit
          </p>
          <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-primary uppercase font-bold">Open Gallery</span>
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
