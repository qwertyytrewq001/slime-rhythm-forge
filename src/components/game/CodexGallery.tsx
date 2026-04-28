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
    const families = [...new Set(ALL_CODEX_SLIMES.map(s => s.family).filter(Boolean))];
    return families;
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

  const renderFamilySidebarItem = (family: string) => {
    const stats = familyStats.get(family);
    if (!stats) return null;
    
    const isSelected = selectedFamily === family;
    const isComplete = stats.completion === 100;
    const hasAny = stats.discovered > 0;
    
    // Format family name for display
    const displayName = family.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return (
      <div
        key={family}
        onClick={() => {
          setSelectedFamily(family);
          setPage(0); // Reset page when changing family
        }}
        className={`
          relative p-4 cursor-pointer border-l-4 transition-all duration-300
          ${isSelected 
            ? 'bg-[#FF7EB6]/20 border-[#FF7EB6]' 
            : 'bg-gray-800/30 border-gray-600/30 hover:bg-gray-800/50 hover:border-gray-500/50'
          }
        `}
      >
        {/* Family name - vertical orientation */}
        <div className="flex flex-col items-center justify-center h-full">
          <h3 className={`text-sm font-bold text-center mb-3 leading-tight text-white`}>
            {displayName}
          </h3>
          
          {/* Trophy for completed families */}
          {isComplete && (
            <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
          )}
          
          {/* Progress indicator */}
          <div className="w-full">
            <div className="bg-gray-700/50 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  isComplete ? 'bg-yellow-400' : 
                  hasAny ? 'bg-[#FF7EB6]' : 'bg-gray-600'
                }`}
                style={{ width: `${stats.completion}%` }}
              />
            </div>
            
            {/* Stats */}
            <div className="text-center">
              <span className={`text-xs font-bold ${
                isComplete ? 'text-yellow-400' : 
                hasAny ? 'text-[#FF7EB6]' : 'text-gray-500'
              }`}>
                {stats.discovered}/{stats.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSlimeCard = (slime: CodexSlime) => {
    const isDiscovered = (slime as any).isDiscovered;
    const displaySlime = createCodexSlime(slime.id);

    return (
      <div
        key={slime.id}
        onClick={() => handleSlimeClick(slime)}
        className={`
          relative bg-gray-800/50 rounded-lg border-2 p-3
          transition-all duration-300 hover:scale-105 cursor-pointer
          ${isDiscovered 
            ? 'border-[#FF7EB6]/40 hover:border-[#FF7EB6]/60' 
            : 'border-gray-600/30 hover:border-gray-500/50'
          }
        `}
      >
        {/* Slime display */}
        <div className="w-full h-32 flex items-center justify-center mb-3">
          <div
            className="transition-all duration-500 ease-in-out"
            style={{
              filter: isDiscovered 
                ? 'grayscale(0%) opacity(100%)' 
                : 'grayscale(100%) opacity(60%)',
              transform: 'scale(1)'
            }}
          >
            <SlimeCanvas
              slime={displaySlime}
              size={120}
              animated={false}
              sizeMultiplier={2.2}
            />
          </div>
        </div>

        {/* Slime info */}
        <div className="text-center">
          <p className={`text-sm font-bold leading-tight mb-2 ${
            isDiscovered ? 'text-white' : 'text-gray-300'
          }`}>
            {slime.name}
          </p>
          
          {isDiscovered ? (
            <span 
              className="text-sm font-bold"
              style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}
            >
              {slime.rarityTier}
            </span>
          ) : (
            <span className="text-sm text-gray-400">
              ???
            </span>
          )}
        </div>

        {/* Discovery indicator */}
        {isDiscovered && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-rose-50/90 text-slate-900 border-l-4 border-[#FF7EB6]/20 custom-scrollbar">
      {/* Left Sidebar - Family Navigation */}
      <div className="w-64 bg-black/40 border-r border-[#FF7EB6]/10 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#FF7EB6]/10">
          <h2 className="text-sm font-bold text-[#FF7EB6] uppercase tracking-wider mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            Collections
          </h2>
          <div className="text-xs text-gray-300">
            {familyOptions.filter(f => familyStats.get(f)?.discovered! > 0).length} / {familyOptions.length} Discovered
          </div>
        </div>
        
        {/* Family List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {familyOptions.map(renderFamilySidebarItem)}
        </div>
      </div>

      {/* Right Content - Selected Family Collection */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-[#FF7EB6]/10 bg-white/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-black text-[#FF7EB6] uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                Slime Codex
              </h1>
              <div className="text-sm font-bold text-gray-600 mt-1 capitalize">
                {selectedFamily.replace(/-/g, ' ')}
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
              >
                <ChevronLeft className="w-4 h-4 text-[#FF7EB6]" />
              </button>
            )}
          </div>

          {/* Overall Progress Bar */}
          <div className="bg-black/30 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${discoveryProgress.percentage}%` }}
            />
          </div>
          <p className="text-sm font-bold text-[#FF7EB6] uppercase tracking-wide" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            {discoveryProgress.discovered} / {discoveryProgress.total} SLIMES ({discoveryProgress.percentage}%)
          </p>
        </div>

        {/* Family Slimes Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {familySlimes.length > 0 ? (
            <>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
                {paginatedSlimes.map(renderSlimeCard)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="p-2 rounded bg-black/30 border border-white/20 hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-4 py-2 bg-black/30 border border-white/20 rounded text-sm text-white">
                    {currentPage + 1} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 rounded bg-black/30 border border-white/20 hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-400 text-lg">No slimes found in this family</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slime detail modal */}
      {selectedSlime && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSlime(null)}
        >
          <div 
            className="bg-obsidian-glass rounded-xl p-6 max-w-md w-full border-2 border-[#FF7EB6]/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-game-ui text-white">{selectedSlime.name}</h2>
              <button
                onClick={() => setSelectedSlime(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-white"
              >
                ×
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <div
                className="transition-all duration-500 ease-in-out"
                style={{
                  filter: 'grayscale(0%) opacity(100%)',
                  transform: 'scale(1)'
                }}
              >
                <SlimeCanvas
                  slime={createCodexSlime(selectedSlime.id)}
                  size={120}
                  animated={true}
                  sizeMultiplier={2}
                />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Rarity:</span>
                <span 
                  className="font-bold text-lg"
                  style={{ color: RARITY_TIER_COLORS[selectedSlime.rarityTier] }}
                >
                  {selectedSlime.rarityTier}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Elements:</span>
                <span className="font-bold text-white">
                  {selectedSlime.elements.join(', ')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Family:</span>
                <span className="font-bold text-white capitalize">
                  {selectedSlime.family}
                </span>
              </div>

              <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/20">
                <p className="text-gray-200 text-xs leading-relaxed">
                  {selectedSlime.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
