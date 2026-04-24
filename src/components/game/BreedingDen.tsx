import React, { useState, useEffect, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Slime } from '@/types/slime';
import { CodexSlime } from '@/data/slimeCodex';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { ALL_CODEX_SLIMES, SLIME_CODEX_MAP } from '@/data/slimeCodex';
import { X, Heart, Sparkles, Plus, ChevronLeft, HelpCircle } from 'lucide-react';
import { calculateBreedingResult, getPossibleOutcomes } from '@/utils/breedingCalculator';
import { createCodexSlime } from '@/utils/slimeGenerator';

interface BreedingDenProps {
  onRequestGallery?: (slot: 1 | 2) => void;
  onBackToAltar?: () => void;
  onNavigateToHatchery?: () => void;
}

export function BreedingDen({ onRequestGallery, onBackToAltar, onNavigateToHatchery }: BreedingDenProps) {
  const { state, dispatch } = useGameState();
  const [possibleOutcomes, setPossibleOutcomes] = useState<CodexSlime[]>([]);
  const [showPossibleModal, setShowPossibleModal] = useState(false);

  // Precise positioning coordinates for incubators (can be fine-tuned)
  const leftIncubatorPosition = {
    left: '340px',
    top: '420px'
  };
  
  const rightIncubatorPosition = {
    right: '300px', 
    top: '420px'
  };

  // Get current breeding slots
  const slot1Slime = useMemo(() => 
    state.slimes.find(s => s.id === (state.activeBreeding ? state.activeBreeding.parent1Id : state.breedSlot1)),
    [state.slimes, state.breedSlot1, state.activeBreeding]
  );
  
  const slot2Slime = useMemo(() => 
    state.slimes.find(s => s.id === (state.activeBreeding ? state.activeBreeding.parent2Id : state.breedSlot2)),
    [state.slimes, state.breedSlot2, state.activeBreeding]
  );

  // Calculate possible outcomes when both slots are filled
  useEffect(() => {
    if (!slot1Slime || !slot2Slime) {
      setPossibleOutcomes([]);
      return;
    }
    
    // Use new Parent Union system - Element Subset Rule
    const outcomes = getPossibleOutcomes(slot1Slime.elements, slot2Slime.elements);
    
    setPossibleOutcomes(outcomes);
  }, [slot1Slime, slot2Slime]);

  const handleSlotClick = (slot: 1 | 2) => {
    if (state.activeBreeding) return;
    
    // Open gallery for slime selection
    if (onRequestGallery) {
      onRequestGallery(slot);
    }
  };

  const handleRemoveSlime = (slot: 1 | 2) => {
    if (state.activeBreeding) return;
    
    if (slot === 1) {
      dispatch({ type: 'SET_BREED_SLOT', slot: 1, id: null });
    } else {
      dispatch({ type: 'SET_BREED_SLOT', slot: 2, id: null });
    }
  };

  const handleStartBreeding = () => {
    if (slot1Slime && slot2Slime && !state.activeBreeding) {
      // Create breeding ritual object
      const breedingTime = 30000; // 30 seconds
      const ritual = {
        parent1Id: slot1Slime.id,
        parent2Id: slot2Slime.id,
        endTime: Date.now() + breedingTime,
        resultSlime: null // Will be calculated when breeding completes
      };
      dispatch({ type: 'START_BREEDING', ritual });
    }
  };

  const breeding = !!state.activeBreeding && Date.now() < state.activeBreeding.endTime;
  const breedFinished = !!state.activeBreeding && Date.now() >= state.activeBreeding.endTime;

  return (
    <>
      <div className="relative w-full h-full min-h-screen bg-black">
      {/* Main breeding den background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}breeding_den.png)` }}
      />
      
      {/* Dark overlay for better visibility */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Left incubator circle */}
      <div 
        className="absolute flex items-center justify-center cursor-pointer"
        style={{
          left: leftIncubatorPosition.left,
          top: leftIncubatorPosition.top,
          transform: 'translate(-50%, -50%)',
          width: '192px',
          height: '192px',
          borderRadius: '50%'
        }}
        onClick={() => handleSlotClick(1)}
      >
        {slot1Slime ? (
          <div className="relative flex items-center justify-center">
            <SlimeCanvas slime={slot1Slime} size={160} animated sizeMultiplier={1.8} animationStyle="playful" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSlime(1);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-gray-600/80 to-gray-700/80 rounded-full flex items-center justify-center animate-pulse hover:scale-110 transition-transform border-2 border-gray-500/50">
            <Plus className="w-8 h-8 text-white" style={{ color: 'white !important' }} />
          </div>
        )}
      </div>

      {/* Right incubator circle */}
      <div 
        className="absolute flex items-center justify-center cursor-pointer"
        style={{
          right: rightIncubatorPosition.right,
          top: rightIncubatorPosition.top,
          transform: 'translate(50%, -50%)',
          width: '192px',
          height: '192px',
          borderRadius: '50%'
        }}
        onClick={() => handleSlotClick(2)}
      >
        {slot2Slime ? (
          <div className="relative flex items-center justify-center">
            <SlimeCanvas slime={slot2Slime} size={160} animated sizeMultiplier={1.8} animationStyle="playful" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSlime(2);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-gray-600/80 to-gray-700/80 rounded-full flex items-center justify-center animate-pulse hover:scale-110 transition-transform border-2 border-gray-500/50">
            <Plus className="w-8 h-8 text-white" style={{ color: 'white !important' }} />
          </div>
        )}
      </div>

      
      {/* Breeding controls */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        {onBackToAltar && (
          <button
            onClick={onBackToAltar}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-xl border-2 border-gray-500/50 transition-all hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4 inline mr-2" />
            Back
          </button>
        )}
      </div>

      {/* Breeding title centered at top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400 uppercase tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Breeding Den
          </h1>
          <p className="text-yellow-300 text-sm font-bold uppercase tracking-wider mt-2">
            Select Parents to Breed
          </p>
        </div>
      </div>

      {/* Question mark egg - centered between incubators when both parents selected */}
      {slot1Slime && slot2Slime && !state.activeBreeding && (
        <div className="absolute" style={{ top: '380px', left: '50%', transform: 'translateX(-41.5%)' }}>
          <div className="flex flex-col items-center gap-3">
            {/* Question mark egg */}
            <button
              onClick={() => setShowPossibleModal(true)}
              className="relative group cursor-pointer transition-all hover:scale-110"
            >
              <div className="w-16 h-20 bg-gradient-to-br from-yellow-200/80 to-amber-300/80 rounded-full border-2 border-yellow-400/60 shadow-lg backdrop-blur-sm flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-yellow-700" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-900/90 text-white text-xs font-bold px-2 py-1 rounded-full border border-purple-400/60">
                Possible Slimes
              </div>
            </button>
            
            {/* Start breeding button */}
            <button
              onClick={handleStartBreeding}
              className="px-8 py-4 bg-gradient-to-r from-pink-200/80 to-purple-200/80 hover:from-pink-100/80 hover:to-purple-100/80 text-purple-900 font-bold rounded-xl border-2 border-purple-300/60 transition-all hover:scale-105 shadow-lg backdrop-blur-sm"
              style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Begin Breeding
            </button>
          </div>
        </div>
      )}

      {/* Breeding status - centered between incubators */}
      {breeding && (
        <div className="absolute text-center" style={{ top: '380px', left: '50%', transform: 'translateX(-41.5%)' }}>
          <div className="bg-gradient-to-r from-pink-100/90 to-purple-100/90 rounded-xl p-6 border-2 border-purple-300/60 backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-purple-600 animate-pulse mx-auto mb-2" />
            <p className="text-purple-800 font-bold uppercase tracking-wider" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
              Breeding in Progress...
            </p>
            <p className="text-purple-700 text-sm font-bold">
              {Math.max(0, Math.ceil((state.activeBreeding!.endTime - Date.now()) / 1000))}s
            </p>
          </div>
        </div>
      )}

      {/* Breeding complete - centered between incubators */}
      {breedFinished && (
        <div className="absolute text-center" style={{ top: '340px', left: '50%', transform: 'translateX(-41.5%)' }}>
          <div className="bg-gradient-to-r from-pink-200/90 to-purple-200/90 rounded-xl p-4 border-2 border-purple-300/60 animate-pulse backdrop-blur-sm">
            <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-purple-800 font-bold uppercase tracking-wider mb-3" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
              Breeding Complete!
            </p>
            <button
              onClick={() => {
                console.log('🔍 BreedingDen: Go to Hatchery button clicked');
                console.log('🔍 BreedingDen: activeBreeding =', state.activeBreeding);
                
                // Calculate breeding result and create egg in hatchery
                if (state.activeBreeding && slot1Slime && slot2Slime) {
                  // Use new Parent Union breeding system
                  const breedingResult = calculateBreedingResult(
                    slot1Slime.elements,
                    slot2Slime.elements,
                    slot1Slime.level || 1,
                    slot2Slime.level || 1,
                    slot1Slime.rarityTier || 'Common',
                    slot2Slime.rarityTier || 'Common'
                  );
                  
                  let selectedSlime = null;
                  if (breedingResult) {
                    selectedSlime = SLIME_CODEX_MAP.get(breedingResult.slimeId);
                  }
                  
                  console.log('🔍 BreedingDen: selected slime =', selectedSlime?.name);
                  
                  if (selectedSlime) {
                    // Create the baby slime using the selected slime
                    const babySlime = createCodexSlime(selectedSlime.id, [
                      slot1Slime.id, 
                      slot2Slime.id
                    ]);
                    
                    console.log('🔍 BreedingDen: babySlime created =', babySlime);
                    
                    // Start hatching process in hatchery
                    const hatchingDuration = 45000; // 45 seconds
                    console.log('🔍 BreedingDen: Dispatching START_HATCHING with duration =', hatchingDuration);
                    dispatch({ 
                      type: 'START_HATCHING', 
                      slime: babySlime, 
                      duration: hatchingDuration 
                    });
                    
                    console.log('🔍 BreedingDen: START_HATCHING dispatched');
                  } else {
                    console.log('🔍 BreedingDen: No breeding result found');
                  }
                } else {
                  console.log('🔍 BreedingDen: Missing active breeding or parent slimes');
                }
                
                // Clear active breeding
                dispatch({ type: 'COLLECT_EGG' });
                
                // Navigate to hatchery
                if (onNavigateToHatchery) {
                  onNavigateToHatchery();
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-pink-300/90 to-purple-300/90 hover:from-pink-200/90 hover:to-purple-200/90 text-purple-900 font-bold rounded-lg border-2 border-purple-400/60 transition-all hover:scale-105 shadow-lg backdrop-blur-sm"
              style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Go to Hatchery
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Possible Slimes Modal - Outside main container */}
    {showPossibleModal && (
      <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={() => setShowPossibleModal(false)}
      >
        <div 
          className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] border-2 border-purple-400/40 shadow-2xl backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Possible Breeding Outcomes
            </h2>
            <button
              onClick={() => setShowPossibleModal(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Parent Info */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-yellow-300 text-sm font-bold uppercase mb-2">Parent 1</p>
              <div className="w-20 h-20 bg-black/30 rounded-lg p-2">
                {slot1Slime && (
                  <SlimeCanvas
                    slime={slot1Slime}
                    size={60}
                    animated={false}
                    sizeMultiplier={1.5}
                  />
                )}
              </div>
              <p className="text-white text-xs mt-2 font-bold">{slot1Slime?.name}</p>
            </div>
            
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-400 animate-pulse" />
            </div>
            
            <div className="text-center">
              <p className="text-yellow-300 text-sm font-bold uppercase mb-2">Parent 2</p>
              <div className="w-20 h-20 bg-black/30 rounded-lg p-2">
                {slot2Slime && (
                  <SlimeCanvas
                    slime={slot2Slime}
                    size={60}
                    animated={false}
                    sizeMultiplier={1.5}
                  />
                )}
              </div>
              <p className="text-white text-xs mt-2 font-bold">{slot2Slime?.name}</p>
            </div>
          </div>

          {/* Possible Outcomes Grid */}
          <div className="max-h-[50vh] overflow-y-auto">
            {possibleOutcomes.length > 0 ? (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {possibleOutcomes.map((slime) => (
                  <div
                    key={slime.id}
                    className="bg-black/30 rounded-lg p-3 border border-purple-400/30 hover:border-purple-400/60 transition-all hover:scale-105"
                  >
                    <div className="w-full h-16 flex items-center justify-center mb-2">
                      <SlimeCanvas
                        slime={createCodexSlime(slime.id)}
                        size={50}
                        animated={false}
                        sizeMultiplier={1.2}
                      />
                    </div>
                    <p className="text-white text-xs font-bold text-center leading-tight">
                      {slime.name}
                    </p>
                    <div className="flex justify-center mt-1">
                      <span 
                        className="text-xs font-bold px-1 py-0.5 rounded"
                        style={{ 
                          backgroundColor: RARITY_TIER_COLORS[slime.rarityTier as keyof typeof RARITY_TIER_COLORS] + '40',
                          color: RARITY_TIER_COLORS[slime.rarityTier as keyof typeof RARITY_TIER_COLORS]
                        }}
                      >
                        {slime.rarityTier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-yellow-300 text-lg font-bold">No possible breeding outcomes found</p>
                <p className="text-white/70 text-sm mt-2">This combination may not produce any valid slimes</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-yellow-300 text-sm font-bold">
              {possibleOutcomes.length} Possible {possibleOutcomes.length === 1 ? 'Slime' : 'Slimes'}
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
