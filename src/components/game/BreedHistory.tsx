import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { ArrowRight } from 'lucide-react';

export function BreedHistory() {
  const { state, dispatch } = useGameState();

  if (state.breedHistory.length === 0) return null;

  return (
    <div className="w-full mt-3" style={{ fontFamily: "'VT323', monospace" }}>
      <h3 className="text-xs text-muted-foreground mb-1 text-center" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px' }}>
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
              <SlimeCanvas slime={p1} size={24} />
              <span className="text-[10px] text-muted-foreground">+</span>
              <SlimeCanvas slime={p2} size={24} />
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <SlimeCanvas slime={child} size={28} />
              <span className="text-[9px] text-foreground truncate max-w-[60px]">
                {child.name.split(' ').pop()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
