import React, { useState, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { createCodexSlime } from '@/utils/slimeGenerator';
import { CodexSlime, ALL_CODEX_SLIMES } from '@/data/slimeCodex';
import { Search, Filter, ChevronLeft, ChevronRight, Sparkles, Trophy, Star } from 'lucide-react';
import { RARITY_TIER_COLORS } from '@/data/traitData';

interface CodexGalleryProps {
  onClose?: () => void;
}

export function CodexGallery({ onClose }: CodexGalleryProps) {
  const { codexManager } = useGameState();
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedElement, setSelectedElement] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedSlime, setSelectedSlime] = useState<CodexSlime | null>(null);

  const SLIMES_PER_PAGE = 16; // 4x4 grid for bigger slimes

  // Get all slimes with discovery status
  const allSlimes = useMemo(() => {
    return codexManager.getAllSlimes();
  }, [codexManager]);

  // Get unique values for filters
  const rarityOptions = useMemo(() => {
    const rarities = [...new Set(ALL_CODEX_SLIMES.map(s => s.rarityTier))];
    return ['all', ...rarities];
  }, []);

  const elementOptions = useMemo(() => {
    const elements = [...new Set(ALL_CODEX_SLIMES.flatMap(s => s.elements))];
    return ['all', ...elements];
  }, []);

  const familyOptions = useMemo(() => {
    const families = [...new Set(ALL_CODEX_SLIMES.map(s => s.family).filter(Boolean))];
    return ['all', ...families];
  }, []);

  // Filter slimes based on filters
  const filteredSlimes = useMemo(() => {
    return allSlimes.filter(slime => {
      // Rarity filter
      if (selectedRarity !== 'all' && slime.rarityTier !== selectedRarity) {
        return false;
      }

      // Element filter
      if (selectedElement !== 'all' && !slime.elements.includes(selectedElement as any)) {
        return false;
      }

      // Family filter
      if (selectedFamily !== 'all' && slime.family !== selectedFamily) {
        return false;
      }

      return true;
    });
  }, [allSlimes, selectedRarity, selectedElement, selectedFamily]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSlimes.length / SLIMES_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedSlimes = filteredSlimes.slice(
    currentPage * SLIMES_PER_PAGE,
    (currentPage + 1) * SLIMES_PER_PAGE
  );

  // Get discovery progress
  const discoveryProgress = codexManager.getDiscoveryProgress();

  // Get family-specific stats
  const familyStats = useMemo(() => {
    const stats = new Map<string, { total: number; discovered: number; completion: number }>();
    
    familyOptions.forEach(family => {
      if (family === 'all') return;
      
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

  const renderFamilyCard = (family: string) => {
    if (family === 'all') return null;
    
    const stats = familyStats.get(family);
    if (!stats) return null;
    
    const isComplete = stats.completion === 100;
    const hasAny = stats.discovered > 0;
    
    return (
      <div
        key={family}
        onClick={() => setSelectedFamily(family)}
        className={`
          relative bg-gray-800/50 rounded-lg border-2 p-3 cursor-pointer
          transition-all duration-300 hover:scale-105
          ${selectedFamily === family 
            ? 'border-[#FF7EB6]/60' 
            : 'border-gray-600/30 hover:border-gray-500/50'
          }
        `}
      >
        {/* Family header - simplified */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold capitalize text-white">{family}</h3>
          {isComplete && (
            <Trophy className="w-4 h-4 text-yellow-400" />
          )}
        </div>
        
        {/* Progress bar - smaller */}
        <div className="bg-gray-700/50 rounded-full h-2 mb-1">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isComplete ? 'bg-yellow-400' : 
              hasAny ? 'bg-[#FF7EB6]' : 'bg-gray-600'
            }`}
            style={{ width: `${stats.completion}%` }}
          />
        </div>
        
        {/* Stats - cleaner */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-300">{stats.discovered}/{stats.total}</span>
          <span className={`text-xs font-bold ${
            isComplete ? 'text-yellow-400' : 
            hasAny ? 'text-[#FF7EB6]' : 'text-gray-500'
          }`}>
            {Math.round(stats.completion)}%
          </span>
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
        {/* Slime display - bigger silhouettes */}
        <div className="w-full h-32 flex items-center justify-center mb-3">
          <SlimeCanvas
            slime={displaySlime}
            size={120}
            animated={false}
            isSilhouette={!isDiscovered}
            sizeMultiplier={2.2}
          />
        </div>

        {/* Slime info - bigger names */}
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

        {/* Discovery indicator - smaller */}
        {isDiscovered && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-rose-50/90 text-slate-900 border-l-4 border-[#FF7EB6]/20 custom-scrollbar">
      {/* Header - bazaar colors only */}
      <div className="p-6 border-b-2 border-[#FF7EB6]/10 bg-white/40 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-black text-[#FF7EB6] uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            Slime Codex
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              <ChevronLeft className="w-4 h-4 text-[#FF7EB6]" />
            </button>
          )}
        </div>

        {/* Progress bar */}
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

      {/* Game-style filters */}
      <div className="bg-black/20 border-b border-white/10 p-4">
        <div className="grid grid-cols-3 gap-3">
          {/* Rarity Filter */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="relative w-full px-4 py-3 bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-2 border-purple-400/30 rounded-xl text-xs font-black text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:border-purple-300 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-500/25"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {rarityOptions.map(rarity => (
                <option key={rarity} value={rarity} className="bg-gradient-to-br from-purple-900 to-pink-900 text-white font-black">
                  {rarity === 'all' ? '⭐ ALL RARITIES' : rarity}
                </option>
              ))}
            </select>
          </div>

          {/* Element Filter */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
            <select
              value={selectedElement}
              onChange={(e) => setSelectedElement(e.target.value)}
              className="relative w-full px-4 py-3 bg-gradient-to-br from-blue-900/80 to-cyan-900/80 border-2 border-blue-400/30 rounded-xl text-xs font-black text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:border-blue-300 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/25"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {elementOptions.map(element => (
                <option key={element} value={element} className="bg-gradient-to-br from-blue-900 to-cyan-900 text-white font-black">
                  {element === 'all' ? '🌟 ALL ELEMENTS' : element}
                </option>
              ))}
            </select>
          </div>

          {/* Family Filter */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="relative w-full px-4 py-3 bg-gradient-to-br from-green-900/80 to-emerald-900/80 border-2 border-green-400/30 rounded-xl text-xs font-black text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 hover:border-green-300 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-green-500/25"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {familyOptions.map(family => (
                <option key={family} value={family} className="bg-gradient-to-br from-green-900 to-emerald-900 text-white font-black">
                  {family === 'all' ? '🎯 ALL FAMILIES' : (family || '').replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Compact family overview */}
      <div className="bg-black/10 border-b border-white/5 p-3">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {familyOptions.filter(f => f !== 'all').map(renderFamilyCard)}
        </div>
      </div>

      {/* Slimes grid - better spacing */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-4">
          {paginatedSlimes.map(renderSlimeCard)}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded bg-black/30 border border-white/20 hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            
            <span className="px-3 py-1 bg-black/30 border border-white/20 rounded text-xs text-white">
              {currentPage + 1} / {totalPages}
            </span>
            
            <button
              onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-1.5 rounded bg-black/30 border border-white/20 hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
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
              <SlimeCanvas
                slime={createCodexSlime(selectedSlime.id)}
                size={120}
                animated={true}
                sizeMultiplier={2}
              />
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
