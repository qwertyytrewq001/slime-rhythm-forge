import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { HABITAT_THEMES, ELEMENT_DISPLAY_NAMES } from '@/data/traitData';
import { Habitat } from '@/types/slime';
import { useCallback, useState } from 'react';
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;
const COLS = 4;

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

  // Fill the rest of the 8 slots with null if they don't exist
  const displayHabitats = [...pageHabitats];
  while (displayHabitats.length < ITEMS_PER_PAGE) {
    displayHabitats.push(null as any);
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ fontFamily: "'VT323', monospace" }}>
      <div className="flex items-center justify-between w-full mb-8 px-4">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          className="p-3 bg-black/60 border-2 border-[#FF7EB6] rounded-full hover:bg-[#FF7EB6] hover:text-black disabled:opacity-10 transition-all shadow-[0_0_15px_rgba(255,126,182,0.3)]"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <h3 className="text-xl text-center text-[#FF7EB6] font-black uppercase tracking-[0.4em] drop-shadow-[0_2px_10px_#FF7EB660]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Mystic Sanctuaries ({currentPage + 1}/{totalPages})
        </h3>

        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage >= totalPages - 1}
          className="p-3 bg-black/60 border-2 border-[#FF7EB6] rounded-full hover:bg-[#FF7EB6] hover:text-black disabled:opacity-10 transition-all shadow-[0_0_15px_rgba(255,126,182,0.3)]"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      <div className="grid gap-8 w-full max-w-6xl" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {displayHabitats.map((habitat, i) => {
          if (!habitat) {
            return (
              <div key={`empty-${i}`} className="aspect-square rounded-[2.5rem] border-4 border-dashed border-white/10 bg-black/20 flex items-center justify-center">
                <span className="text-xs text-white/20 font-black uppercase tracking-widest">Available Slot</span>
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
              className="aspect-square rounded-[2.5rem] border-[6px] p-4 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-all hover:scale-105 group shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              style={{
                borderColor: theme.accent + '99',
                backgroundColor: theme.bgImage ? 'transparent' : theme.bg + 'CC',
                backgroundImage: theme.bgImage ? `url("${theme.bgImage}")` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: `0 15px 40px rgba(0,0,0,0.7), inset 0 0 30px ${theme.accent}30`,
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop(habitat.id)}
              onClick={() => onHabitatClick?.(habitat.id)}
              title={theme.desc}
            >
              <div
                className="absolute inset-0 opacity-30 rounded-lg"
                style={{ background: `radial-gradient(circle, ${theme.accent}60, transparent)` }}
              />

              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black/60 border-2 border-white/10 backdrop-blur-md z-10">
                <span className="text-[12px] font-black uppercase tracking-[0.2em] relative z-10" style={{ color: theme.accent }}>
                  {ELEMENT_DISPLAY_NAMES[habitat.element]}
                </span>
              </div>

              <div className="flex gap-4 relative z-10 mt-6">
                {assignedSlimes.map(slime => slime && (
                  <div key={slime.id} className="flex flex-col items-center animate-float-slow" style={{ animationDelay: `${Math.random() * 3}s`, animationDuration: '6s' }}>
                    <SlimeCanvas slime={slime} size={84} animated={false} />
                  </div>
                ))}
                {assignedSlimes.length < habitat.capacity && (
                  <div className="w-20 h-20 rounded-2xl border-4 border-dashed flex items-center justify-center bg-black/50 backdrop-blur-sm transition-colors group-hover:border-[#FF7EB6]/60" style={{ borderColor: theme.accent + '40' }}>
                    <span className="text-3xl font-black text-white/20 group-hover:text-[#FF7EB6] animate-pulse">+</span>
                  </div>
                )}
              </div>

              {assignedSlimes.some(s => s && s.elements.includes(habitat.element)) && (
                <div className="absolute bottom-4 px-3 py-1 rounded-lg bg-green-500/30 border-2 border-green-500/40 backdrop-blur-md z-10 animate-bounce">
                  <span className="text-[10px] text-green-300 font-black uppercase tracking-[0.15em]">Goo Mastery x2</span>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHabitatClick?.(habitat.id);
                }}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-[#FF7EB6] hover:text-black rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl border-2 border-white/10"
              >
                <Maximize2 className="w-5 h-5" />
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
