import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS, MODEL_NAMES } from '@/data/traitData';
import { generateSlimeLore } from '@/utils/loreGenerator';
import { getStage } from '@/utils/slimeRenderer';
import { SLIME_FOODS, SlimeFoodType } from '@/types/slime';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, BookOpen, Layers, Star, Zap, Utensils } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { audioEngine } from '@/utils/audioEngine';

interface StatsPanelProps {
  onRequestGallery?: () => void;
}

export function StatsPanel({ onRequestGallery }: StatsPanelProps) {
  const { state, dispatch } = useGameState();
  const slime = state.slimes.find(s => s.id === state.selectedSlimeId);

  const getElementNames = (s: any) => {
    const elems = s.elements || [s.element];
    return elems.map((e: string) => ELEMENT_DISPLAY_NAMES[e as keyof typeof ELEMENT_DISPLAY_NAMES] || e).join(', ');
  };

  const handleFeed = (foodType: SlimeFoodType) => {
    if (!slime) return;
    dispatch({ type: 'FEED_SLIME_XP', slimeId: slime.id, foodType });
  };

  const xpToNext = slime ? 5 + (slime.level ?? 1) * 3 : 0;
  const xpProgress = slime ? Math.min(100, ((slime.xp ?? 0) / xpToNext) * 100) : 0;
  const stage = slime ? getStage(slime.level ?? 1) : 'baby';
  const lastLevelUpRef = useRef<number>(0);

  // Level-up celebration toast
  useEffect(() => {
    const lu = state.lastLevelUp;
    if (lu && lu.timestamp > lastLevelUpRef.current) {
      lastLevelUpRef.current = lu.timestamp;
      audioEngine.playSfx('achievement');
      const stageEmoji = lu.newLevel >= 10 ? '👑' : lu.newLevel >= 5 ? '⚔️' : '🌱';
      toast(`⚡ LEVEL UP! ${stageEmoji}`, {
        description: `${lu.slimeName} reached Lv ${lu.newLevel}!`,
        duration: 2000,
      });
    }
  }, [state.lastLevelUp]);

  return (
    <div className="flex flex-col h-full bg-rose-50/90 text-slate-900 border-l-4 border-[#FF7EB6]/20 p-8 overflow-y-auto"
      style={{ fontFamily: "'VT323', monospace" }}>

      <div className="flex items-center justify-center gap-4 mb-8">
        <BookOpen className="w-6 h-6 text-[#FF7EB6] animate-soft-pulse" />
        <h2 className="text-center text-sm text-[#FF7EB6] uppercase tracking-[0.3em] font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Spirit Codex
        </h2>
      </div>

      {slime ? (
        <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-right-10 duration-500">
          {/* Slime Portrait with Glow */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity animate-soft-pulse"
                style={{ backgroundColor: RARITY_TIER_COLORS[slime.rarityTier] }} />
            <div className="relative z-10 bg-white rounded-3xl p-8 border-4 border-[#FF7EB6]/10 backdrop-blur-md shadow-xl">
              <SlimeCanvas slime={slime} size={180} animated />
            </div>
          </div>

          {/* Level & Stage */}
          <div className="w-full space-y-4">
            <div className="flex justify-between items-end px-1">
              <span className={`text-[13px] font-black uppercase tracking-widest ${
                stage === 'baby' ? 'text-blue-500' : stage === 'teen' ? 'text-orange-500' : 'text-purple-500'
              }`}>
                {stage}
              </span>
              <span className="text-xl font-black text-slate-700">LV.{slime.level ?? 1}</span>
            </div>
            <div className="h-4 w-full bg-slate-200/50 rounded-full overflow-hidden border-2 border-white shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#FF7EB6] to-[#FF9AD1] transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>

            {/* Food Selection */}
            <div className="grid grid-cols-1 gap-2 mt-4 max-h-48">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1 text-center shrink-0">Nourishment</span>
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-2">
                  {(Object.keys(SLIME_FOODS) as SlimeFoodType[]).map(foodId => {
                    const food = SLIME_FOODS[foodId];
                    const canAfford = state.goo >= food.cost;
                    const isMaxLevel = (slime.level ?? 1) >= 15;

                    return (
                      <button 
                        key={foodId}
                        onClick={() => handleFeed(foodId)}
                        disabled={!canAfford || isMaxLevel}
                        className={`w-full group relative flex items-center justify-between px-4 py-2 border-2 rounded-2xl transition-all active:scale-95 shadow-sm ${
                          canAfford ? 'bg-white border-[#FF7EB6] hover:bg-[#FF7EB6] hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{food.icon}</span>
                          <div className="flex flex-col items-start text-left">
                            <span className="text-[12px] font-black uppercase leading-none">{food.name}</span>
                            <span className="text-[9px] font-bold opacity-60">+{food.xpValue} XP</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 font-black text-[13px]">
                          <span>{food.cost}</span>
                          <span className="text-[10px] opacity-60">💧</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Species name */}
          <div className="text-center">
            <h3 className="text-3xl text-slate-800 font-black uppercase tracking-wider">{slime.name}</h3>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#FF7EB6]/40 to-transparent mx-auto mt-2" />
          </div>

          {/* Rarity Tier Tag */}
          <div className="flex items-center gap-2 px-6 py-2 rounded-2xl border-2 font-black uppercase text-sm tracking-widest shadow-md bg-white"
            style={{ color: RARITY_TIER_COLORS[slime.rarityTier], borderColor: RARITY_TIER_COLORS[slime.rarityTier] + '80' }}>
            <Star className="w-4 h-4 fill-current" />
            {slime.rarityTier}
          </div>

          {/* Detailed Info Cards */}
          <div className="w-full space-y-4 mt-4">
            {/* Elements */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#FF7EB6]/10 hover:border-[#FF7EB6]/30 transition-all group">
              <div className="flex items-center gap-2 mb-2 text-slate-400 group-hover:text-[#FF7EB6] transition-colors">
                <Layers className="w-4 h-4" />
                <span className="text-[11px] uppercase font-black tracking-widest">Elemental Essence</span>
              </div>
              <span className="text-lg font-bold text-slate-700 tracking-wide">
                {getElementNames(slime)}
              </span>
            </div>

            {/* Unique Lore/Story */}
            <div className="bg-white/60 p-6 rounded-2xl border-2 border-[#FF7EB6]/10 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                <BookOpen className="w-24 h-24 text-[#FF7EB6]" />
              </div>
              <div className="flex items-center gap-2 mb-3 text-[#FF7EB6]/60">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] uppercase font-black tracking-widest">Spirit Origins</span>
              </div>
              <p className="text-[15px] leading-relaxed text-slate-600 italic font-bold">
                "{generateSlimeLore(slime)}"
              </p>
            </div>

            {/* Production */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#FF7EB6]/10 flex justify-between items-center group hover:border-[#FF7EB6]/20 transition-all">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1 text-slate-400 group-hover:text-[#FF7EB6] transition-colors">
                  <Zap className="w-4 h-4" />
                  <span className="text-[11px] uppercase font-black tracking-widest">Resonance Strength</span>
                </div>
                <span className="text-lg font-bold text-slate-700">
                  {(((slime.rarityScore * 0.1) * (1 + ((slime.level ?? 1) - 1) * 0.1)) * 0.1).toFixed(2)} 
                  <span className="text-xs text-slate-400 font-normal"> Goo/Cycle</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border-2 border-[#FF7EB6]/10 animate-float">
                <div className="text-2xl">💧</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={onRequestGallery}
          className="flex-1 flex flex-col items-center justify-center text-center px-8 group cursor-pointer hover:bg-white/40 rounded-[40px] transition-all duration-700"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#FF7EB6]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="w-32 h-32 rounded-3xl bg-white border-4 border-dashed border-[#FF7EB6]/20 flex items-center justify-center relative group-hover:border-[#FF7EB6]/60 transition-all duration-500 group-hover:rotate-12">
              <span className="text-6xl text-[#FF7EB6]/20 group-hover:text-[#FF7EB6]/60 transition-all group-hover:scale-110">?</span>
            </div>
          </div>
          <p className="text-lg text-slate-400 uppercase tracking-[0.2em] font-black leading-relaxed group-hover:text-[#FF7EB6] transition-colors">
            Invoke a spirit<br />to read the codex
          </p>
          <div className="mt-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
            <Sparkles className="w-4 h-4 text-[#FF7EB6]" />
            <span className="text-xs text-[#FF7EB6] font-black uppercase tracking-widest">Select From Gallery</span>
            <Sparkles className="w-4 h-4 text-[#FF7EB6]" />
          </div>
        </div>
      )}
    </div>
  );
}
