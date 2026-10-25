import { useEffect, useRef, useState } from 'react';
import { useGameState, xpToNextLevel, getStage } from '@/hooks/useGameState';
import { SLIME_FOODS, SlimeFoodType, Slime } from '@/types/slime';
import { triggerDialogue } from '@/utils/dialogueTriggers';
import { ArrowUpCircle, Utensils, X } from 'lucide-react';

const MAX_LEVEL = 50;
const FOOD_ORDER: SlimeFoodType[] = ['basic', 'elemental', 'royal'];

interface FeedPanelProps {
  slimeId: string;
}

/**
 * The one place to feed a slime. Every food row shows what it gives and what it costs:
 * food you own (bought earlier or harvested on the farm) is used first and is free to feed,
 * otherwise the same button spends Goo.
 */
export function FeedPanel({ slimeId }: FeedPanelProps) {
  const { state, dispatch } = useGameState();
  const slime: Slime | undefined = state.slimes.find(s => s.id === slimeId);

  const prevRef = useRef<{ id: string; level: number } | null>(null);
  const [levelNote, setLevelNote] = useState<{ from: number; to: number; stage?: string } | null>(null);
  const [gains, setGains] = useState<Array<{ key: number; amount: number }>>([]);
  const lastGain = useRef(0);

  // Announce a level-up right where the player is looking, with a close button
  useEffect(() => {
    if (!slime) return;
    const prev = prevRef.current;
    if (prev && prev.id === slime.id && slime.level > prev.level) {
      const evolved = getStage(slime.level) !== getStage(prev.level) ? getStage(slime.level) : undefined;
      setLevelNote({ from: prev.level, to: slime.level, stage: evolved });
    }
    if (!prev || prev.id !== slime.id) setLevelNote(null);
    prevRef.current = { id: slime.id, level: slime.level };
  }, [slime?.id, slime?.level]);

  useEffect(() => {
    if (!levelNote) return;
    const t = setTimeout(() => setLevelNote(null), 6000);
    return () => clearTimeout(t);
  }, [levelNote]);

  if (!slime) return null;

  const isMax = slime.level >= MAX_LEVEL;
  const needed = xpToNextLevel(slime.level);
  const pct = isMax ? 100 : Math.min(100, (slime.xp / needed) * 100);
  const stage = getStage(slime.level);
  const nextStageLevel = slime.level < 5 ? 5 : slime.level < 10 ? 10 : null;

  const feed = (foodType: SlimeFoodType, fromInventory: boolean) => {
    triggerDialogue('firstFeed');
    dispatch({ type: 'FEED_SLIME_XP', slimeId: slime.id, foodType, fromInventory });
    const key = ++lastGain.current;
    setGains(g => [...g, { key, amount: SLIME_FOODS[foodType].xpValue }]);
    setTimeout(() => setGains(g => g.filter(x => x.key !== key)), 1100);
  };

  return (
    <div className="space-y-3">
      {levelNote && (
        <div className="relative flex items-center gap-3 rounded-2xl border-2 border-[#40E0D0] bg-gradient-to-r from-[#e8fffb] to-white px-4 py-3 shadow-md animate-in zoom-in-95 duration-300">
          <ArrowUpCircle className="w-8 h-8 text-[#20c2b0] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-800 leading-tight">Level up! Lv {levelNote.from} → Lv {levelNote.to}</p>
            {levelNote.stage && <p className="text-xs font-bold text-purple-600 capitalize">Evolved into a {levelNote.stage}!</p>}
          </div>
          <button
            onClick={() => setLevelNote(null)}
            aria-label="Dismiss"
            className="ml-auto shrink-0 w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100"
          >
            <X className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      )}

      {/* Level + XP */}
      <div className="rounded-2xl border border-[#FF7EB6]/40 bg-white/70 p-3">
        <div className="flex items-end justify-between mb-1.5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 capitalize">{stage}</p>
            <p className="text-lg font-black text-[#FF1493] leading-none">Level {slime.level}</p>
          </div>
          <p className="text-sm font-black text-slate-600 relative">
            {isMax ? 'MAX LEVEL' : `${Math.floor(slime.xp)} / ${needed} XP`}
            {gains.map(g => (
              <span key={g.key} className="absolute right-0 -top-5 text-sm font-black text-emerald-600 animate-out fade-out slide-out-to-top-4 duration-1000 fill-mode-forwards pointer-events-none">
                +{g.amount} XP
              </span>
            ))}
          </p>
        </div>
        <div className="h-3 w-full rounded-full bg-[#FFE4E1] overflow-hidden border border-white">
          <div className="h-full rounded-full bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        {!isMax && nextStageLevel && (
          <p className="text-[11px] font-bold text-slate-500 mt-1.5">
            Evolves at Level {nextStageLevel} ({nextStageLevel - slime.level} to go)
          </p>
        )}
      </div>

      {/* Foods */}
      <div className="flex items-center gap-2 text-[#FF1493]">
        <Utensils className="w-4 h-4" />
        <span className="text-xs font-black uppercase tracking-widest">Feed {slime.name}</span>
      </div>
      <p className="text-[11px] font-semibold text-slate-500 -mt-1">Food you own is used first. If you have none, feeding costs Goo.</p>

      <div className="space-y-2">
        {FOOD_ORDER.map(foodId => {
          const food = SLIME_FOODS[foodId];
          const owned = state.inventory[foodId] || 0;
          const useOwned = owned > 0;
          const canFeed = !isMax && (useOwned || state.goo >= food.cost);
          const toLevel = isMax ? 0 : Math.max(1, Math.ceil((needed - slime.xp) / food.xpValue));

          return (
            <button
              key={foodId}
              onClick={() => canFeed && feed(foodId, useOwned)}
              disabled={!canFeed}
              className={`w-full flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
                canFeed
                  ? 'bg-white border-[#FF7EB6] hover:border-[#FF1493] hover:bg-[#FFF0F5] shadow-md'
                  : 'bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="relative text-3xl shrink-0">
                {food.icon}
                {owned > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-[#FF1493] text-white text-[11px] font-black flex items-center justify-center border-2 border-white">
                    {owned}
                  </span>
                )}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-black text-slate-800 leading-tight truncate">{food.name}</span>
                <span className="block text-xs font-bold text-emerald-600">+{food.xpValue} XP</span>
                {!isMax && <span className="block text-[11px] text-slate-500">{toLevel} to level up</span>}
              </span>
              <span
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black text-white ${
                  useOwned ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#FF7EB6] to-[#FF1493]'
                }`}
              >
                {useOwned ? 'Feed' : `Feed · ${food.cost} 💧`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
