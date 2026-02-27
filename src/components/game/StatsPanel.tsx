import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS, MODEL_NAMES } from '@/data/traitData';
import { generateSlimeLore } from '@/utils/loreGenerator';
import { Sparkles, BookOpen, Layers, Star, Zap } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-[#0a140a]/95 text-primary-foreground border-l-4 border-primary/20 p-8 overflow-y-auto"
      style={{ fontFamily: "'VT323', monospace", backgroundImage: 'radial-gradient(circle at top right, rgba(74, 93, 69, 0.1) 0%, transparent 70%)' }}>
      
      <div className="flex items-center justify-center gap-4 mb-8">
        <BookOpen className="w-6 h-6 text-primary animate-soft-pulse" />
        <h2 className="text-center text-sm text-primary uppercase tracking-[0.3em] font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Spirit Codex
        </h2>
      </div>

      {slime ? (
        <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-right-10 duration-500">
          {/* Slime Portrait with Glow */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity animate-soft-pulse"
                style={{ backgroundColor: RARITY_TIER_COLORS[slime.rarityTier] }} />
            <div className="relative z-10 bg-black/40 rounded-3xl p-8 border-4 border-primary/10 backdrop-blur-md shadow-2xl">
              <SlimeCanvas slime={slime} size={180} animated />
            </div>
          </div>

          {/* Species name */}
          <div className="text-center">
            <h3 className="text-3xl text-white font-black uppercase tracking-wider drop-shadow-lg">{slime.name}</h3>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mt-2" />
          </div>

          {/* Rarity Tier Tag */}
          <div className="flex items-center gap-2 px-6 py-2 rounded-2xl border-2 font-black uppercase text-sm tracking-widest shadow-xl bg-black/60"
            style={{ color: RARITY_TIER_COLORS[slime.rarityTier], borderColor: RARITY_TIER_COLORS[slime.rarityTier] + '80' }}>
            <Star className="w-4 h-4 fill-current" />
            {slime.rarityTier}
          </div>

          {/* Detailed Info Cards */}
          <div className="w-full space-y-4 mt-4">
            {/* Elements */}
            <div className="bg-white/5 p-5 rounded-2xl border-2 border-primary/10 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-2 mb-2 text-primary/60 group-hover:text-primary transition-colors">
                <Layers className="w-4 h-4" />
                <span className="text-[11px] uppercase font-black tracking-widest">Elemental Essence</span>
              </div>
              <span className="text-lg font-bold text-white tracking-wide">
                {getElementNames(slime)}
              </span>
            </div>

            {/* Unique Lore/Story */}
            <div className="bg-black/40 p-6 rounded-2xl border-2 border-primary/10 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                <BookOpen className="w-24 h-24 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-3 text-primary/60">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] uppercase font-black tracking-widest">Spirit Origins</span>
              </div>
              <p className="text-[15px] leading-relaxed text-white/80 italic font-bold">
                "{generateSlimeLore(slime)}"
              </p>
            </div>

            {/* Production */}
            <div className="bg-white/5 p-5 rounded-2xl border-2 border-primary/10 flex justify-between items-center group hover:border-primary/20 transition-all">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1 text-primary/60 group-hover:text-primary transition-colors">
                  <Zap className="w-4 h-4" />
                  <span className="text-[11px] uppercase font-black tracking-widest">Resonance Strength</span>
                </div>
                <span className="text-lg font-bold text-white">{(slime.rarityScore * 0.1).toFixed(1)} <span className="text-xs text-primary/40 font-normal">Goo/Cycle</span></span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 animate-float">
                <div className="text-2xl">💧</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={onRequestGallery}
          className="flex-1 flex flex-col items-center justify-center text-center px-8 group cursor-pointer hover:bg-white/5 rounded-[40px] transition-all duration-700"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="w-32 h-32 rounded-3xl bg-black/40 border-4 border-dashed border-primary/20 flex items-center justify-center relative group-hover:border-primary/60 transition-all duration-500 group-hover:rotate-12">
              <span className="text-6xl text-primary/20 group-hover:text-primary/60 transition-all group-hover:scale-110">?</span>
            </div>
          </div>
          <p className="text-lg text-primary/40 animate-soft-inscription-glow uppercase tracking-[0.2em] font-black leading-relaxed group-hover:text-primary transition-colors">
            Invoke a spirit<br />to read the codex
          </p>
          <div className="mt-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-black uppercase tracking-widest">Select From Gallery</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
