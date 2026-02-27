import { useState, useMemo, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, MODEL_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Search, ChevronLeft, ChevronRight, ShoppingCart, Sparkles } from 'lucide-react';

const PER_PAGE = 8; // Reduced per page for 2-column layout
type SortMode = 'rarity' | 'name' | 'newest';

interface SlimeGalleryProps {
  onSelect?: (id: string) => void;
}

export function SlimeGallery({ onSelect }: SlimeGalleryProps = {}) {
  const { state, dispatch } = useGameState();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
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

  return (
    <div className="flex flex-col h-full bg-[#0a140a]/95 backdrop-blur-xl border-r-4 border-primary/20 p-8"
      style={{ fontFamily: "'VT323', monospace" }}>
      
      <div className="flex items-center justify-center gap-3 mb-8">
        <Sparkles className="w-5 h-5 text-[#FF7EB6]" />
        <h2 className="text-sm text-[#FF7EB6] animate-soft-inscription-glow font-black uppercase tracking-[0.3em]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Slime Gallery
        </h2>
        <Sparkles className="w-5 h-5 text-[#FF7EB6]" />
      </div>

      {state.slimes.length <= 3 && (
        <div className="flex items-center justify-center gap-2 mb-8 py-1 animate-pulse text-[13px] text-primary font-black uppercase tracking-widest border-b border-primary/20 pb-4">
          <ShoppingCart className="w-4 h-4" />
          <span>Visit Bazaar to summon slimes</span>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Filter slimes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-12 pr-4 py-4 bg-black/40 border-2 border-primary/10 rounded-2xl text-white placeholder:text-white/10 font-bold focus:border-primary/40 outline-none transition-all shadow-inner"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortMode)}
          className="bg-black/40 border-2 border-primary/10 rounded-2xl px-6 py-2 text-white font-bold outline-none cursor-pointer hover:border-primary/30 transition-all appearance-none text-center"
        >
          <option value="rarity">Tier</option>
          <option value="name">A-Z</option>
          <option value="newest">New</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-none">
        <div className="grid grid-cols-2 gap-6 pb-4">
          {pageSlimes.map(slime => (
            <div
              key={slime.id}
              className={`group relative flex flex-col items-center p-5 rounded-3xl border-2 transition-all duration-500 ${
                state.selectedSlimeId === slime.id ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.2)]' :
                'border-white/5 bg-white/5 hover:border-primary/30 hover:bg-white/10 hover:scale-105'
              } cursor-pointer`}
              onClick={() => {
                if (onSelect) onSelect(slime.id);
                else dispatch({ type: 'SELECT_SLIME', id: slime.id });
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" 
                     style={{ backgroundColor: RARITY_TIER_COLORS[slime.rarityTier] }} />
                <SlimeCanvas slime={slime} size={100} animated />
              </div>
              <div className="mt-4 w-full text-center">
                <p className="text-base font-black text-white uppercase leading-none mb-1 break-words px-1">{slime.name}</p>
                <p className="text-[11px] font-black tracking-widest" style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}>
                  {slime.rarityTier}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-white/5">
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} 
                className="p-3 hover:bg-white/10 rounded-2xl disabled:opacity-10 transition-all hover:scale-110 active:scale-90">
          <ChevronLeft className="w-8 h-8 text-primary" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-primary/40 tracking-[0.3em] uppercase mb-1">Slime Log</span>
          <span className="text-sm font-black text-white tracking-widest">
            {page + 1} <span className="text-primary/40 mx-1">/</span> {totalPages}
          </span>
        </div>
        <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                className="p-3 hover:bg-white/10 rounded-2xl disabled:opacity-10 transition-all hover:scale-110 active:scale-90">
          <ChevronRight className="w-8 h-8 text-primary" />
        </button>
      </div>
    </div>
  );
}
