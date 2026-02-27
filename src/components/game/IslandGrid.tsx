import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { HABITAT_THEMES, ELEMENT_DISPLAY_NAMES } from '@/data/traitData';
import { Habitat } from '@/types/slime';
import { useCallback, useState } from 'react';
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;
const COLS = 5;

interface IslandGridProps {
  onHabitatClick?: (habitatId: string) => void;
}

export function IslandGrid({ onHabitatClick }: IslandGridProps = {}) {
  const { state, dispatch } = useGameState();
  const [currentPage, setCurrentPage] = useState(0);

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

  const totalPages = Math.ceil(Math.max(1, state.habitats.length) / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const pageHabitats = state.habitats.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Fill the rest of the 10 slots with null if they don't exist
  const displayHabitats = [...pageHabitats];
  while (displayHabitats.length < ITEMS_PER_PAGE) {
    displayHabitats.push(null as any);
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ fontFamily: "'VT323', monospace" }}>
      <div className="flex items-center justify-between w-full mb-6 px-4">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          className="p-2 bg-black/40 border-2 border-[#FF7EB6]/40 rounded-full hover:bg-[#FF7EB6] hover:text-black disabled:opacity-10 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h3 className="text-sm text-center text-[#FF7EB6] font-black uppercase tracking-[0.3em]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Sanctuaries (Page {currentPage + 1}/{totalPages})
        </h3>

        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage >= totalPages - 1}
          className="p-2 bg-black/40 border-2 border-[#FF7EB6]/40 rounded-full hover:bg-[#FF7EB6] hover:text-black disabled:opacity-10 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="grid gap-6 w-full max-w-5xl" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {displayHabitats.map((habitat, i) => {
          if (!habitat) {
            return (
              <div key={`empty-${i}`} className="aspect-square rounded-[2rem] border-2 border-dashed border-white/5 bg-black/5 flex items-center justify-center">
                <span className="text-[10px] text-white/10 font-black uppercase tracking-tighter">Empty</span>
              </div>
            );
          }

          const theme = HABITAT_THEMES[habitat.element];
          const assignedSlimes = habitat.assignedSlimeIds
            .map(id => state.slimes.find(s => s.id === id))
            .filter(Boolean);

          return (
            <div
              key={habitat.id}
              className="aspect-square rounded-[2rem] border-4 p-2 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-all hover:scale-105 group shadow-2xl"
              style={{
                borderColor: theme.accent + '80',
                backgroundColor: theme.bgImage ? 'transparent' : theme.bg + 'CC',
                backgroundImage: theme.bgImage ? `url("${theme.bgImage}")` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: `0 8px 24px rgba(0,0,0,0.6), inset 0 0 12px ${theme.accent}20`,
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop(habitat.id)}
              onClick={() => onHabitatClick?.(habitat.id)}
              title={theme.desc}
            >
              <div
                className="absolute inset-0 opacity-20 rounded-lg"
                style={{ background: `radial-gradient(circle, ${theme.accent}40, transparent)` }}
              />

              <span className="text-[10px] font-black uppercase tracking-widest relative z-10" style={{ color: theme.accent }}>
                {ELEMENT_DISPLAY_NAMES[habitat.element]}
              </span>

              <div className="flex gap-2 relative z-10 mt-2">
                {assignedSlimes.map(slime => slime && (
                  <div key={slime.id} className="flex flex-col items-center animate-float-slow" style={{ animationDelay: `${Math.random() * 3}s`, animationDuration: '6s' }}>
                    <SlimeCanvas slime={slime} size={56} animated={false} />
                  </div>
                ))}
                {assignedSlimes.length < habitat.capacity && (
                  <div className="w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center bg-black/40" style={{ borderColor: theme.accent + '30' }}>
                    <span className="text-lg font-black text-white/20 group-hover:text-[#FF7EB6]">+</span>
                  </div>
                )}
              </div>

              {assignedSlimes.some(s => s && s.elements.includes(habitat.element)) && (
                <div className="absolute bottom-2 px-2 rounded-md bg-green-500/20 border border-green-500/30 z-10">
                  <span className="text-[8px] text-green-400 font-black uppercase tracking-widest">2x Goo</span>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHabitatClick?.(habitat.id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <Maximize2 className="w-4 h-4" style={{ color: theme.accent }} />
              </button>
            </div>
          );
        })}
      </div>
      
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-slow {
          animation: float-slow ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
