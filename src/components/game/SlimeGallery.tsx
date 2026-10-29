import { useState, useMemo, useEffect } from 'react';
import { useGameState, getStage } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, MODEL_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Search, ChevronLeft, ChevronRight, ShoppingCart, Sparkles } from 'lucide-react';

import { SlimeElement } from '@/types/slime';

const PER_PAGE = 8; // Reduced per page for 2-column layout
type SortMode = 'rarity' | 'name' | 'newest';

interface SlimeGalleryProps {
  onSelect?: (id: string) => void;
  filterElement?: SlimeElement;
}

export function SlimeGallery({ onSelect, filterElement }: SlimeGalleryProps = {}) {
  const { state, dispatch } = useGameState();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const unhatchedId = state.activeHatching?.slime.id;
    let list = state.slimes.filter(s => s.id !== unhatchedId);
    
    if (filterElement) {
      list = list.filter(s => s.elements.includes(filterElement));
    }

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
  }, [state.slimes, state.activeHatching, search, sort, filterElement]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageSlimes = filtered.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);

  const handleSlimeSelect = (slimeId: string) => {
    // Set the selected slime
    dispatch({ type: 'SELECT_SLIME', id: slimeId });
    
    // Check slime age before placing in breeding slot
    const selectedSlime = state.slimes.find(s => s.id === slimeId);
    if (selectedSlime) {
      const stage = getStage(selectedSlime.level);
      if (stage !== 'adult') {
        // Don't place baby/teen slimes in breeding slots
        // Just call onSelect without placing
        if (onSelect) onSelect(slimeId);
        return;
      }
    }
    
    // Also place it on the first available breeding slot (only for adult slimes)
    if (!state.breedSlot1) {
      dispatch({ type: 'SET_BREED_SLOT', slot: 1, id: slimeId });
    } else if (!state.breedSlot2) {
      dispatch({ type: 'SET_BREED_SLOT', slot: 2, id: slimeId });
    }
    
    // Call the original onSelect prop if provided
    if (onSelect) onSelect(slimeId);
  };

  return (
    <div className="flex flex-col h-full bg-rose-50/90 backdrop-blur-xl border-r-4 border-[#FF7EB6]/20 p-8"
      style={{ fontFamily: "'VT323', monospace" }}>
      
      <style>{`.gallery-card { background: url(${import.meta.env.BASE_URL}ui/baz_card.png) center / 100% 100% no-repeat; filter: drop-shadow(0 4px 6px rgba(70,40,10,0.35)); } .gallery-card-on { filter: drop-shadow(0 0 10px #ffd34d) drop-shadow(0 4px 6px rgba(70,40,10,0.35)) brightness(1.06); }`}</style>
      <div className="relative mx-auto mb-5" style={{ width: 'min(88%, 300px)' }}>
        <img src={`${import.meta.env.BASE_URL}ui/../altar/ui_plate_title.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.35))' }} />
        <div className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif", fontSize: 24, color: '#fff3d0', WebkitTextStroke: '4px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.08em' }}>Collection</div>
      </div>

      {state.slimes.length <= 3 && (
        <div className="flex items-center justify-center gap-2 mb-8 py-1 animate-pulse text-[13px] text-[#6b4a2c] font-bold tracking-wide border-b border-[#4a2f17]/25 pb-4 [font-family:Fredoka,sans-serif]">
          <ShoppingCart className="w-4 h-4" />
          <span>Visit Bazaar to summon slimes</span>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b4a2c] group-focus-within:text-[#f2b632] transition-colors" />
          <input
            type="text"
            placeholder="Filter slimes..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-12 pr-4 py-3 bg-[#fff7dc] border-[3px] border-[#4a2f17] rounded-full text-[#4a2f17] placeholder:text-[#9a8460] font-bold focus:border-[#f2b632] [font-family:Fredoka,sans-serif] outline-none transition-all shadow-inner"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortMode)}
          className="bg-[#fff7dc] border-[3px] border-[#4a2f17] rounded-full px-5 py-2 text-[#4a2f17] font-bold outline-none cursor-pointer hover:border-[#f2b632] [font-family:Fredoka,sans-serif] transition-all appearance-none text-center"
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
              className={`gallery-card group relative flex flex-col items-center px-5 pt-8 pb-5 transition-all duration-300 cursor-pointer hover:scale-105 ${state.selectedSlimeId === slime.id ? 'gallery-card-on' : ''}`}
              onClick={() => handleSlimeSelect(slime.id)}
              onMouseEnter={() => window.dispatchEvent(new CustomEvent('breedHover', { detail: { id: slime.id } }))}
              onMouseLeave={() => window.dispatchEvent(new CustomEvent('breedHover', { detail: { id: null } }))}
            >
              <div>
                <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" 
                     style={{ backgroundColor: RARITY_TIER_COLORS[slime.rarityTier] }} />
                <SlimeCanvas slime={slime} size={100} animated sizeMultiplier={2.0} animationStyle="calm" />
                <span className="absolute top-4 left-5 z-10 flex items-center justify-center font-black text-white rounded-full" style={{ minWidth: 34, height: 34, padding: '0 6px', fontSize: 13, background: 'radial-gradient(circle at 35% 30%, #ffe98a, #e09a1a)', border: '3px solid #4a2f17', boxShadow: '0 2px 4px rgba(0,0,0,0.35)', WebkitTextStroke: '2px #4a2f17', paintOrder: 'stroke fill' }} title={`Level ${slime.level}`}>{slime.level}</span>
              </div>
              <div className="mt-4 w-full text-center">
                <p className="text-base font-bold text-[#4a2f17] uppercase leading-none mb-1 break-words px-1 [font-family:Fredoka,sans-serif]">{slime.name}</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-[11px] font-black tracking-widest" style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}>
                    {slime.rarityTier}
                  </p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
                    getStage(slime.level) === 'baby' ? 'bg-blue-100 text-blue-500' :
                    getStage(slime.level) === 'teen' ? 'bg-orange-100 text-orange-500' :
                    'bg-purple-100 text-purple-500'
                  }`}>
                    {getStage(slime.level)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t-[3px] border-[#4a2f17]/25">
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} aria-label="Previous page" className="transition-transform hover:scale-110 active:scale-90 disabled:opacity-25" style={{ width: 52, background: 'transparent', border: 'none', padding: 0 }}>
          <img src={`${import.meta.env.BASE_URL}ui/dlg_next.png`} alt="" draggable={false} style={{ width: '100%', imageRendering: 'auto', transform: 'scaleX(-1)' }} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-[#6b4a2c] tracking-[0.3em] uppercase mb-1 [font-family:Fredoka,sans-serif]">Slime Log</span>
          <span className="text-sm font-bold text-[#4a2f17] tracking-widest [font-family:Fredoka,sans-serif]">
            {page + 1} <span className="text-slate-300 mx-1">/</span> {totalPages}
          </span>
        </div>
        <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} aria-label="Next page" className="transition-transform hover:scale-110 active:scale-90 disabled:opacity-25" style={{ width: 52, background: 'transparent', border: 'none', padding: 0 }}>
          <img src={`${import.meta.env.BASE_URL}ui/dlg_next.png`} alt="" draggable={false} style={{ width: '100%', imageRendering: 'auto', transform: 'none' }} />
        </button>
      </div>
    </div>
  );
}
