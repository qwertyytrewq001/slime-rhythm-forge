import { useState, useMemo, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, MODEL_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PER_PAGE = 12;
type SortMode = 'rarity' | 'name' | 'newest';

interface SlimeGalleryProps {
  /**
   * If provided, gallery will call this when a slime is clicked
   * instead of dispatching SELECT_SLIME. Used by the breeding pod picker.
   */
  onSelect?: (id: string) => void;
}

export function SlimeGallery({ onSelect }: SlimeGalleryProps = {}) {
  const { state, dispatch } = useGameState();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [page, setPage] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const timers = state.slimes
      .filter(s => s.isNew)
      .map(s => setTimeout(() => dispatch({ type: 'CLEAR_NEW_BADGE', slimeId: s.id }), 5 * 60 * 1000));
    return () => timers.forEach(clearTimeout);
  }, [state.slimes, dispatch]);

  const filtered = useMemo(() => {
    // Filter out the slime that is currently in the hatchery
    const unhatchedId = state.activeHatching?.slime.id;
    let list = state.slimes.filter(s => s.id !== unhatchedId);
    
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'rarity': list = [...list].sort((a, b) => b.rarityScore - a.rarityScore); break;
      case 'name': list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': list = [...list].sort((a, b) => b.createdAt - a.createdAt); break;
    }
    return list;
  }, [state.slimes, state.activeHatching, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageSlimes = filtered.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('slimeId', id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const rarityGlowStyle = (tier: string) => {
    const color = RARITY_TIER_COLORS[tier as keyof typeof RARITY_TIER_COLORS] || '#A0A0A0';
    const glowSize = { Common: 0, Uncommon: 0, Rare: 4, Epic: 6, Legendary: 8, Divine: 10, Ancient: 14 }[tier] || 0;
    if (glowSize < 4) return {};
    return { boxShadow: `0 0 ${glowSize}px ${color}50` };
  };

  const getElementNames = (slime: any) => {
    const elems = slime.elements || [slime.element];
    return elems.map((e: string) => ELEMENT_DISPLAY_NAMES[e as keyof typeof ELEMENT_DISPLAY_NAMES] || e).join(', ');
  };

  return (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-sm border-r-2 border-primary/15 p-2"
      style={{ fontFamily: "'VT323', monospace" }}>
      <h2 className="text-center text-[11px] mb-4 text-[#FF7EB6] animate-inscription-glow font-black tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
        SLIME GALLERY
      </h2>
      {onSelect && (
        <div className="text-center text-[14px] text-[#FF7EB6] animate-pulse font-black mb-4 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          Invoke a Parent
        </div>
      )}

      <div className="relative mb-3">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary font-bold" />
        <input
          type="text"
          placeholder="SEARCH..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="w-full pl-8 pr-2 py-1.5 text-xs bg-background/90 border-2 border-primary/40 rounded-lg text-foreground placeholder:text-muted-foreground font-black"
        />
      </div>

      <select
        value={sort}
        onChange={e => setSort(e.target.value as SortMode)}
        className="mb-3 text-xs bg-background/90 border-2 border-primary/40 rounded-lg px-2 py-1 text-foreground font-black"
      >
        <option value="rarity">Sort: Rarity</option>
        <option value="name">Sort: A-Z</option>
        <option value="newest">Sort: Newest</option>
      </select>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-1.5">
          {pageSlimes.map(slime => (
            <div
              key={slime.id}
              className={`relative flex flex-col items-center p-1 rounded cursor-pointer border transition-all ${
                hoveredId === slime.id ? 'scale-110 z-10' : ''
              } ${
                state.selectedSlimeId === slime.id ? 'border-primary bg-primary/10' :
                state.breedSlot1 === slime.id || state.breedSlot2 === slime.id ? 'border-accent bg-accent/10' :
                'border-transparent'
              }`}
              style={rarityGlowStyle(slime.rarityTier)}
              onClick={() => {
                if (onSelect) {
                  onSelect(slime.id);
                } else {
                  dispatch({ type: 'SELECT_SLIME', id: slime.id });
                }
              }}
              onMouseEnter={() => setHoveredId(slime.id)}
              onMouseLeave={() => setHoveredId(null)}
              draggable
              onDragStart={e => handleDragStart(e, slime.id)}
            >
              {slime.isNew && (
                <span className="absolute -top-1 -right-1 text-[6px] bg-accent text-accent-foreground px-0.5 rounded animate-pulse z-20"
                  style={{ fontFamily: "'Press Start 2P', cursive" }}>
                  New
                </span>
              )}

              <SlimeCanvas slime={slime} size={hoveredId === slime.id ? 64 : 48} animated={hoveredId === slime.id} />

              {/* Species name */}
              <span className="text-[9px] text-center leading-tight text-foreground truncate w-full mt-0.5">
                {slime.name}
              </span>

              {/* Rarity tier */}
              <span className="text-[7px] font-bold" style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}>
                {slime.rarityTier}
              </span>

              {/* Elements */}
              <span className="text-[6px] text-muted-foreground text-center leading-tight truncate w-full">
                {getElementNames(slime)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
        <button onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="p-0.5 disabled:opacity-30 hover:text-primary">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[10px]">{currentPage + 1}/{totalPages}</span>
        <button onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1} className="p-0.5 disabled:opacity-30 hover:text-primary">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center text-[9px] text-muted-foreground mt-1">
        {state.slimes.length} slimes
      </div>
    </div>
  );
}
