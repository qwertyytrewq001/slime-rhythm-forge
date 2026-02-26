import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { ArrowRight } from 'lucide-react';

export function BreedHistory() {
  const { state, dispatch } = useGameState();

  if (state.breedHistory.length === 0) return null;

  const getElementNames = (s: any) => {
    const elems = s.elements || [s.element];
    return elems.map((e: string) => ELEMENT_DISPLAY_NAMES[e as keyof typeof ELEMENT_DISPLAY_NAMES] || e).join(', ');
  };

  return (
    <div className="w-full mt-3" style={{ fontFamily: "'VT323', monospace" }}>
      <h3 className="text-muted-foreground mb-1 text-center" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px' }}>
        Recent Breeds
      </h3>
      <div className="space-y-1">
        {state.breedHistory.map((result, i) => {
          const p1 = state.slimes.find(s => s.id === result.parent1Id);
          const p2 = state.slimes.find(s => s.id === result.parent2Id);
          const child = state.slimes.find(s => s.id === result.childId);
          if (!p1 || !p2 || !child) return null;

          return (
            <div
              key={i}
              className="flex items-center justify-center gap-1 p-1 bg-muted/30 rounded cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => dispatch({ type: 'SELECT_SLIME', id: child.id })}
            >
              <SlimeCanvas slime={p1} size={22} />
              <span className="text-[9px] text-muted-foreground">+</span>
              <SlimeCanvas slime={p2} size={22} />
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <SlimeCanvas slime={child} size={26} />
              <div className="flex flex-col ml-0.5">
                <span className="text-[7px] font-bold" style={{ color: RARITY_TIER_COLORS[child.rarityTier] }}>
                  {child.rarityTier}
                </span>
                <span className="text-[6px] text-muted-foreground truncate max-w-[55px]">
                  {getElementNames(child)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
