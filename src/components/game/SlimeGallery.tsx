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
    <div className="flex flex-col h-full bg-rose-50/90 backdrop-blur-xl border-r-4 border-[#FF7EB6]/20 p-8"
      style={{ fontFamily: "'VT323', monospace" }}>
      
      <div className="flex items-center justify-center gap-3 mb-8">
        <Sparkles className="w-5 h-5 text-[#FF7EB6]" />
        <h2 className="text-sm text-[#FF7EB6] font-black uppercase tracking-[0.3em]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Collection
        </h2>
        <Sparkles className="w-5 h-5 text-[#FF7EB6]" />
      </div>

      {state.slimes.length <= 3 && (
        <div className="flex items-center justify-center gap-2 mb-8 py-1 animate-pulse text-[13px] text-[#FF7EB6] font-black uppercase tracking-widest border-b border-[#FF7EB6]/20 pb-4">
          <ShoppingCart className="w-4 h-4" />
          <span>Visit Bazaar to summon slimes</span>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF7EB6] transition-colors" />
          <input
            type="text"
            placeholder="Filter slimes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#FF7EB6]/10 rounded-2xl text-slate-700 placeholder:text-slate-300 font-bold focus:border-[#FF7EB6]/40 outline-none transition-all shadow-inner"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortMode)}
          className="bg-white border-2 border-[#FF7EB6]/10 rounded-2xl px-6 py-2 text-slate-600 font-bold outline-none cursor-pointer hover:border-[#FF7EB6]/30 transition-all appearance-none text-center"
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
                state.selectedSlimeId === slime.id ? 'border-[#FF7EB6] bg-white shadow-lg' :
                'border-[#FF7EB6]/10 bg-white/60 hover:border-[#FF7EB6]/30 hover:bg-white hover:scale-105'
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
                <p className="text-base font-black text-slate-700 uppercase leading-none mb-1 break-words px-1">{slime.name}</p>
                <p className="text-[11px] font-black tracking-widest" style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}>
                  {slime.rarityTier}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-[#FF7EB6]/10">
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} 
                className="p-3 hover:bg-[#FF7EB6]/10 rounded-2xl disabled:opacity-10 transition-all hover:scale-110 active:scale-90">
          <ChevronLeft className="w-8 h-8 text-[#FF7EB6]" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-1">Slime Log</span>
          <span className="text-sm font-black text-slate-700 tracking-widest">
            {page + 1} <span className="text-slate-300 mx-1">/</span> {totalPages}
          </span>
        </div>
        <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                className="p-3 hover:bg-[#FF7EB6]/10 rounded-2xl disabled:opacity-10 transition-all hover:scale-110 active:scale-90">
          <ChevronRight className="w-8 h-8 text-[#FF7EB6]" />
        </button>
      </div>
    </div>
  );
}
