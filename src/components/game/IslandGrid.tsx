import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { HABITAT_THEMES, ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Habitat, SlimeElement } from '@/types/slime';
import { useCallback } from 'react';
import { Maximize2 } from 'lucide-react';

const GRID_SIZE = 4;

interface IslandGridProps {
  onHabitatClick?: (habitatId: string) => void;
}

export function IslandGrid({ onHabitatClick }: IslandGridProps = {}) {
  const { state, dispatch } = useGameState();

  const handleDrop = useCallback((habitatId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const slimeId = e.dataTransfer.getData('slimeId');
    if (slimeId) {
      dispatch({ type: 'ASSIGN_SLIME_TO_HABITAT', habitatId, slimeId });
    }
  }, [dispatch]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Build grid lookup
  const gridMap = new Map<string, Habitat>();
  state.habitats.forEach(h => gridMap.set(`${h.gridX},${h.gridY}`, h));

  return (
    <div className="w-full" style={{ fontFamily: "'VT323', monospace" }}>
      <h3 className="text-xs text-center text-muted-foreground mb-2" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px' }}>
        Island Habitats
      </h3>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const habitat = gridMap.get(`${x},${y}`);

          if (!habitat) {
            return (
              <div key={i} className="aspect-square rounded-lg border border-dashed border-border/20 bg-muted/5 flex items-center justify-center">
                <span className="text-[8px] text-muted-foreground/30">Empty</span>
              </div>
            );
          }

          const theme = HABITAT_THEMES[habitat.element];
          const assignedSlimes = habitat.assignedSlimeIds
            .map(id => state.slimes.find(s => s.id === id))
            .filter(Boolean);

          return (
            <div
              key={i}
              className="aspect-square rounded-lg border-2 p-1 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-all hover:scale-105 group"
              style={{
                borderColor: theme.accent + '80',
                backgroundColor: theme.bg + 'CC',
                boxShadow: `0 0 8px ${theme.accent}30, inset 0 0 12px ${theme.accent}15`,
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop(habitat.id)}
              onClick={() => onHabitatClick?.(habitat.id)}
              title={theme.desc}
            >
              {/* Element glow */}
              <div
                className="absolute inset-0 opacity-20 rounded-lg"
                style={{ background: `radial-gradient(circle, ${theme.accent}40, transparent)` }}
              />

              {/* Element label */}
              <span className="text-[7px] font-bold relative z-10" style={{ color: theme.accent }}>
                {ELEMENT_DISPLAY_NAMES[habitat.element]}
              </span>

              {/* Assigned slimes */}
              <div className="flex gap-0.5 relative z-10 mt-0.5">
                {assignedSlimes.map(slime => slime && (
                  <div key={slime.id} className="flex flex-col items-center">
                    <SlimeCanvas slime={slime} size={24} animated={false} />
                  </div>
                ))}
                {assignedSlimes.length < habitat.capacity && (
                  <div className="w-5 h-5 rounded border border-dashed flex items-center justify-center" style={{ borderColor: theme.accent + '50' }}>
                    <span className="text-[8px]" style={{ color: theme.accent + '60' }}>+</span>
                  </div>
                )}
              </div>

              {/* Match indicator */}
              {assignedSlimes.some(s => s && s.elements.includes(habitat.element)) && (
                <span className="text-[6px] text-green-400 relative z-10">2x goo</span>
              )}

              {/* Expand button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHabitatClick?.(habitat.id);
                }}
                className="absolute top-1 right-1 p-0.5 bg-white/10 hover:bg-white/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                title="Expand habitat"
              >
                <Maximize2 className="w-3 h-3" style={{ color: theme.accent }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
