import { useState, useMemo, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_ICONS, MODEL_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PER_PAGE = 12;

type SortMode = 'rarity' | 'name' | 'newest';

export function SlimeGallery() {
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
    let list = state.slimes;
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
  }, [state.slimes, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageSlimes = filtered.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('slimeId', id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const rarityGlowStyle = (tier: string) => {
    const color = RARITY_TIER_COLORS[tier as keyof typeof RARITY_TIER_COLORS] || '#A0A0A0';
    const stars = { Common: 0, Uncommon: 0, Rare: 4, Epic: 6, Legendary: 8, Mythic: 10, Supreme: 14 }[tier] || 0;
    if (stars < 4) return {};
    return { boxShadow: `0 0 ${stars}px ${color}50` };
  };

  return (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-sm border-r-4 border-primary/20 p-2"
      style={{ fontFamily: "'VT323', monospace" }}>
      <h2 className="text-center text-sm mb-2 text-primary" style={{ fontFamily: "'Press Start 2P', cursive" }}>
        Gallery
      </h2>

      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          className="w-full pl-7 pr-2 py-1 text-sm bg-background/80 border-2 border-input rounded text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <select
        value={sort}
        onChange={e => setSort(e.target.value as SortMode)}
        className="mb-2 text-xs bg-background/80 border-2 border-input rounded px-1 py-0.5 text-foreground"
      >
        <option value="rarity">★ Rarity</option>
        <option value="name">A-Z Name</option>
        <option value="newest">🕐 Newest</option>
      </select>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-1.5">
          {pageSlimes.map(slime => (
            <div
              key={slime.id}
              className={`relative flex flex-col items-center p-1 rounded cursor-pointer border-2 transition-all ${
                hoveredId === slime.id ? 'scale-110 z-10' : ''
              } ${
                state.selectedSlimeId === slime.id ? 'border-primary bg-primary/10' :
                state.breedSlot1 === slime.id || state.breedSlot2 === slime.id ? 'border-accent bg-accent/10' :
                'border-transparent'
              }`}
              style={rarityGlowStyle(slime.rarityTier)}
              onClick={() => dispatch({ type: 'SELECT_SLIME', id: slime.id })}
              onMouseEnter={() => setHoveredId(slime.id)}
              onMouseLeave={() => setHoveredId(null)}
              draggable
              onDragStart={e => handleDragStart(e, slime.id)}
            >
              {slime.isNew && (
                <span className="absolute -top-1 -right-1 text-[7px] bg-accent text-accent-foreground px-1 rounded animate-pulse z-20"
                  style={{ fontFamily: "'Press Start 2P', cursive" }}>
                  New!
                </span>
              )}

              <SlimeCanvas slime={slime} size={hoveredId === slime.id ? 64 : 52} animated={hoveredId === slime.id} />

              {/* Element icons (multi-element) */}
              <div className="flex items-center gap-0.5 mt-0.5">
                {(slime.elements || [slime.element]).slice(0, 3).map((elem, i) => (
                  <span key={elem + i} className="text-[7px]">{ELEMENT_ICONS[elem]}</span>
                ))}
                {(slime.elements?.length || 0) > 3 && <span className="text-[7px] text-muted-foreground">+</span>}
                <span className="text-[7px] text-muted-foreground">{MODEL_NAMES[slime.traits.model]?.[0]}</span>
              </div>

              <span className="text-[10px] text-center leading-tight text-foreground truncate w-full">
                {slime.name.split(' ').pop()}
              </span>

              {/* Rarity tier color-coded stars */}
              <span className="text-[8px]" style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}>
                {'★'.repeat(Math.min(slime.rarityStars, 7))}
              </span>

              {/* Hover personality preview */}
              {hoveredId === slime.id && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[7px] text-muted-foreground whitespace-nowrap bg-card/90 px-1.5 py-0.5 rounded border border-border z-30">
                  <span style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}>{slime.rarityTier}</span>
                  {' '}{slime.traits.model === 0 ? '😊' : slime.traits.model === 1 ? '😤' : '🌊'}
                  {' '}{(slime.elements || []).length > 1 ? `${slime.elements.length}x Hybrid` : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
        <button
          onClick={() => setPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="p-0.5 disabled:opacity-30 hover:text-primary"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span>{currentPage + 1}/{totalPages}</span>
        <button
          onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          className="p-0.5 disabled:opacity-30 hover:text-primary"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center text-[10px] text-muted-foreground mt-1">
        {state.slimes.length} slimes
      </div>
    </div>
  );
}
