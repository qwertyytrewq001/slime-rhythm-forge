import { useStageSize } from '@/utils/stage';
import React, { useState, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { createCodexSlime } from '@/utils/slimeGenerator';
import { CodexSlime, ALL_CODEX_SLIMES } from '@/data/slimeCodex';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { RARITY_TIER_COLORS } from '@/data/traitData';

interface CodexGalleryProps {
  onClose?: () => void;
}

export function CodexGallery({ onClose }: CodexGalleryProps) {
  const short = useStageSize().h < 560; // a phone held sideways: slimmer header, smaller cards, more of them on screen
  const { codexManager } = useGameState();
  const [selectedFamily, setSelectedFamily] = useState<string>('elemental-foundations');
  const [page, setPage] = useState(0);
  const [selectedSlime, setSelectedSlime] = useState<CodexSlime | null>(null);

  const SLIMES_PER_PAGE = 16;

  // Get all slimes with discovery status
  const allSlimes = useMemo(() => {
    return codexManager.getAllSlimes();
  }, [codexManager]);

  // Get unique families for the sidebar
  const familyOptions = useMemo(() => {
    const families = [...new Set(ALL_CODEX_SLIMES.map(s => s.family).filter(Boolean))] as string[];
    // Starter families first, rare ones last (unknown names go to the end).
    const ORDER = ['elemental-foundations', 'natures-garden', 'aquatic-worlds', 'molten-fires', 'earthen-wilds', 'frozen-realms', 'storm-forces', 'metal-forged', 'sweet-confections', 'playroom', 'celestial-lights', 'shadow-realm', 'ancient-mysteries'];
    const rank = (f: string) => (ORDER.indexOf(f) < 0 ? 99 : ORDER.indexOf(f));
    return families.sort((a, b) => rank(a) - rank(b));
  }, []);

  // Get slimes for selected family only
  const familySlimes = useMemo(() => {
    return allSlimes.filter(slime => slime.family === selectedFamily);
  }, [allSlimes, selectedFamily]);

  // Pagination for family slimes
  const totalPages = Math.max(1, Math.ceil(familySlimes.length / SLIMES_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedSlimes = familySlimes.slice(
    currentPage * SLIMES_PER_PAGE,
    (currentPage + 1) * SLIMES_PER_PAGE
  );

  // Get discovery progress
  const discoveryProgress = codexManager.getDiscoveryProgress();

  // Get family-specific stats
  const familyStats = useMemo(() => {
    const stats = new Map<string, { total: number; discovered: number; completion: number }>();
    
    familyOptions.forEach(family => {
      const familySlimes = allSlimes.filter(s => s.family === family);
      const discoveredInFamily = familySlimes.filter(s => (s as any).isDiscovered);
      const completion = familySlimes.length > 0 ? (discoveredInFamily.length / familySlimes.length) * 100 : 0;
      
      stats.set(family, {
        total: familySlimes.length,
        discovered: discoveredInFamily.length,
        completion
      });
    });
    
    return stats;
  }, [allSlimes, familyOptions]);

  const handleSlimeClick = (slime: CodexSlime) => {
    if ((slime as any).isDiscovered) {
      setSelectedSlime(slime);
    }
  };

  const INK = '#4a2f17';
  const PARCH = 'linear-gradient(#f6e8c3, #ecd9a8)';
  const FRED = "'Fredoka', 'Trebuchet MS', sans-serif";

  const renderFamilySidebarItem = (family: string) => {
    const stats = familyStats.get(family);
    if (!stats) return null;
    const isSelected = selectedFamily === family;
    const isComplete = stats.completion === 100;
    const displayName = family.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return (
      <button
        key={family}
        onClick={() => { setSelectedFamily(family); setPage(0); }}
        className="relative w-full text-left rounded-xl px-3 py-2 transition-transform hover:translate-x-0.5"
        style={{
          fontFamily: FRED,
          background: isSelected ? 'linear-gradient(#ffe9a3, #f2b632)' : PARCH,
          border: `3px solid ${INK}`,
          color: INK,
          boxShadow: isSelected ? '0 3px 0 #8a5a14, 0 0 14px rgba(242,182,50,0.55)' : '0 2px 0 rgba(0,0,0,0.35)',
          marginLeft: isSelected ? 6 : 0,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-[15px] leading-tight">{displayName}</span>
          {isComplete && <Trophy className="w-4 h-4 shrink-0" style={{ color: '#b8860b' }} />}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(74,47,23,0.25)', border: `1.5px solid ${INK}` }}>
            <div className="h-full rounded-full" style={{ width: `${stats.completion}%`, background: isComplete ? 'linear-gradient(#ffd54a,#e0a000)' : 'linear-gradient(#ff9ec8,#ff5aa5)' }} />
          </div>
          <span className="text-xs font-bold tabular-nums">{stats.discovered}/{stats.total}</span>
        </div>
      </button>
    );
  };

  const renderSlimeCard = (slime: CodexSlime) => {
    const isDiscovered = (slime as any).isDiscovered;
    const displaySlime = createCodexSlime(slime.id);
    const tier = RARITY_TIER_COLORS[slime.rarityTier];
    return (
      <div
        key={slime.id}
        onClick={() => handleSlimeClick(slime)}
        className={`relative rounded-2xl ${short ? 'p-1.5' : 'p-2.5'} transition-transform ${isDiscovered ? 'cursor-pointer hover:scale-105 hover:-translate-y-0.5' : 'cursor-default'}`}
        style={{
          fontFamily: FRED,
          background: isDiscovered ? PARCH : 'linear-gradient(#cdbf9d, #b7a781)',
          border: `3px solid ${INK}`,
          boxShadow: '0 3px 0 rgba(0,0,0,0.35)',
        }}
      >
        {isDiscovered && <div className="absolute left-3 right-3 top-0 h-1.5 rounded-b-full" style={{ background: tier }} />}
        <div className={`w-full ${short ? 'h-24 mb-1' : 'h-40 mb-2'} flex items-center justify-center rounded-xl`} style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)' }}>
          <div
            className="transition-all duration-500"
            style={{
              // an undiscovered slime is a solid dark shape: you can see its outline, not its colours
              filter: isDiscovered ? 'none' : 'url(#codex-silhouette)',
            }}
          >
            <SlimeCanvas slime={displaySlime} size={short ? 72 : 120} animated={false} sizeMultiplier={2.2} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold leading-tight truncate" style={{ color: isDiscovered ? INK : '#6f6247' }}>
            {isDiscovered ? slime.name : '???'}
          </p>
          {isDiscovered ? (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white inline-block mt-1" style={{ background: tier, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{slime.rarityTier}</span>
          ) : (
            <span className="text-xs font-semibold block mt-1" style={{ color: '#6f6247' }}>Not discovered yet</span>
          )}
        </div>
      </div>
    );
  };

  const pageBtn = 'w-9 h-9 flex items-center justify-center rounded-full border-[3px] disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 transition-transform';

  return (
    <div className="relative flex h-full text-slate-900 custom-scrollbar" style={{ background: '#1d1630' }}>
      {/* turns any sprite into one solid dark shape, even a see-through ghost: colour off, transparency pushed to solid */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <filter id="codex-silhouette" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.09  0 0 0 7 -0.9" />
        </filter>
      </svg>
      {/* painted library behind the panels, darkened so the parchment reads */}
      <img src={`${import.meta.env.BASE_URL}ui/codex_bg.jpg`} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ imageRendering: 'auto' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(rgba(24,12,40,0.62), rgba(24,12,40,0.78))' }} />

      {/* Left: families */}
      <div className={`relative ${short ? 'w-44' : 'w-64'} shrink-0 flex flex-col`} style={{ background: 'linear-gradient(#3b2358, #2a1840)', borderRight: `4px solid ${INK}`, boxShadow: '4px 0 18px rgba(0,0,0,0.5)' }}>
        <div className="p-3 text-center" style={{ borderBottom: '3px solid rgba(242,182,50,0.55)' }}>
          <div className="relative mx-auto" style={{ width: '92%' }}>
            <img src={`${import.meta.env.BASE_URL}altar/ui_plate_title.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.45))' }} />
            <div className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontFamily: FRED, fontSize: 17, color: '#fff3d0', WebkitTextStroke: '3.5px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.06em' }}>Collections</div>
          </div>
          <div className="text-xs font-bold mt-1" style={{ fontFamily: FRED, color: '#f2d98a' }}>
            {familyOptions.filter(f => (familyStats.get(f)?.discovered ?? 0) > 0).length} / {familyOptions.length} started
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">{familyOptions.map(renderFamilySidebarItem)}</div>
      </div>

      {/* Right: the chosen family */}
      <div className="relative flex-1 flex flex-col min-w-0">
        <div className={short ? 'px-4 py-1' : 'px-6 py-4'} style={{ background: 'linear-gradient(#4b2c6b, #3a2152)', borderBottom: `4px solid ${INK}`, boxShadow: '0 4px 14px rgba(0,0,0,0.45)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="relative" style={{ width: short ? 150 : 260, maxWidth: '50cqw' }}>
                <img src={`${import.meta.env.BASE_URL}altar/ui_plate_title.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.45))' }} />
                <div className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontFamily: FRED, fontSize: short ? 15 : 24, color: '#fff3d0', WebkitTextStroke: short ? '3px #3a2150' : '4.5px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.07em' }}>Slime Codex</div>
              </div>
            </div>
            <div className="flex-1 max-w-md min-w-[180px]" style={{ fontFamily: FRED }}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-bold" style={{ color: '#fff3d0', fontSize: 17 }}>All slimes</span>
                <span className="font-bold tabular-nums" style={{ color: '#f2d98a', fontSize: 14 }}>{discoveryProgress.discovered} / {discoveryProgress.total} found</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '2px solid #f2b632' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${discoveryProgress.percentage}%`, background: 'linear-gradient(#ffe27a, #f2a81d)' }} />
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} aria-label="Close codex" className="shrink-0 hover:scale-110 transition-transform">
                <img src={`${import.meta.env.BASE_URL}ui/baz_close.png`} alt="Close" draggable={false} style={{ width: short ? 36 : 44, height: short ? 36 : 44, maxWidth: 'none', imageRendering: 'auto' }} />
              </button>
            )}
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${short ? 'p-2' : 'p-5'}`}>
          {familySlimes.length > 0 ? (
            <>
              <div className={`grid ${short ? 'grid-cols-4 gap-2 pb-2' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4'}`}>{paginatedSlimes.map(renderSlimeCard)}</div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4" style={{ fontFamily: FRED }}>
                  <button onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className={pageBtn} style={{ background: PARCH, borderColor: INK, color: INK }}><ChevronLeft className="w-4 h-4" /></button>
                  <span className="px-4 py-1 rounded-full font-bold text-sm" style={{ background: PARCH, border: `3px solid ${INK}`, color: INK }}>{currentPage + 1} / {totalPages}</span>
                  <button onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1} className={pageBtn} style={{ background: PARCH, borderColor: INK, color: INK }}><ChevronRight className="w-4 h-4" /></button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div><div className="text-6xl mb-4">🔍</div><p className="text-lg font-semibold" style={{ color: '#f2d98a', fontFamily: FRED }}>No slimes found in this family</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Slime detail */}
      {selectedSlime && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSlime(null)}>
          <div className="rounded-3xl p-5 max-w-md w-full" style={{ fontFamily: FRED, background: PARCH, border: `4px solid ${INK}`, color: INK, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">{selectedSlime.name}</h2>
              <button onClick={() => setSelectedSlime(null)} aria-label="Close" className="w-9 h-9 rounded-full font-bold text-xl border-[3px] hover:scale-110 transition-transform" style={{ background: '#fff7dc', borderColor: INK }}>×</button>
            </div>
            <div className="flex justify-center mb-3 rounded-2xl" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.7), rgba(255,255,255,0) 70%)' }}>
              <SlimeCanvas slime={createCodexSlime(selectedSlime.id)} size={150} animated sizeMultiplier={2} />
            </div>
            <div className="space-y-2 text-sm font-semibold">
              <div className="flex justify-between items-center"><span className="opacity-70">Rarity</span><span className="px-2.5 py-0.5 rounded-full text-white font-bold" style={{ background: RARITY_TIER_COLORS[selectedSlime.rarityTier], textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{selectedSlime.rarityTier}</span></div>
              <div className="flex justify-between items-center"><span className="opacity-70">Elements</span><span className="font-bold capitalize">{selectedSlime.elements.join(', ')}</span></div>
              <div className="flex justify-between items-center"><span className="opacity-70">Family</span><span className="font-bold capitalize">{selectedSlime.family?.replace(/-/g, ' ')}</span></div>
              <div className="mt-3 p-3 rounded-xl text-[13px] leading-relaxed" style={{ background: 'rgba(74,47,23,0.1)', border: '2px solid rgba(74,47,23,0.35)' }}>{selectedSlime.description}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
