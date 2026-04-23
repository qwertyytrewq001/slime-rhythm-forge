import React, { useState, useEffect, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Slime } from '@/types/slime';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { ALL_CODEX_SLIMES } from '@/data/slimeCodex';
import { X, Heart, Sparkles, Plus, ChevronLeft } from 'lucide-react';
import { calculateBreedingResult } from '@/utils/breedingCalculator';
import { createCodexSlime } from '@/utils/slimeGenerator';

interface BreedingDenProps {
  onRequestGallery?: (slot: 1 | 2) => void;
  onBackToAltar?: () => void;
  onNavigateToHatchery?: () => void;
}

export function BreedingDen({ onRequestGallery, onBackToAltar, onNavigateToHatchery }: BreedingDenProps) {
  const { state, dispatch } = useGameState();
  const [possibleOutcomes, setPossibleOutcomes] = useState<Slime[]>([]);

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
    
    const outcomes = [];
    const breedingResult = calculateBreedingResult(slot1Slime.id, slot2Slime.id, slot1Slime.level || 1, slot2Slime.level || 1);
    
    if (breedingResult) {
      // Get all slimes that have the same elements as the breeding result
      const combinedElements = [...new Set([...slot1Slime.elements, ...slot2Slime.elements])];
      
      ALL_CODEX_SLIMES.forEach(slime => {
        if (slime.elements.every(element => combinedElements.includes(element))) {
          outcomes.push(slime);
        }
      });
    }
    
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

      {/* Possible outcomes section */}
      {slot1Slime && slot2Slime && possibleOutcomes.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl mx-auto px-8">
          <div className="bg-black/80 rounded-2xl border-2 border-yellow-400/50 p-6">
            <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-wider mb-4 text-center">
              Possible Offspring
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-32 overflow-y-auto">
              {possibleOutcomes.map(slime => (
                <div key={slime.id} className="relative group">
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600/50 p-2 hover:border-yellow-400/50 transition-all">
                    <div className="w-full h-12 flex items-center justify-center">
                      <SlimeCanvas slime={slime} size={30} animated={false} sizeMultiplier={1.2} />
                    </div>
                    <div className="text-center mt-1">
                      <p className="text-xs text-white font-bold truncate">{slime.name}</p>
                      <div className="flex items-center justify-center gap-1">
                        <span 
                          className="text-xs font-bold"
                          style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}
                        >
                          {slime.rarityTier}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {/* Start breeding button - centered between incubators */}
      {slot1Slime && slot2Slime && !state.activeBreeding && (
        <div className="absolute" style={{ top: '380px', left: '50%', transform: 'translateX(-41.5%)' }}>
          <button
            onClick={handleStartBreeding}
            className="px-8 py-4 bg-gradient-to-r from-pink-200/80 to-purple-200/80 hover:from-pink-100/80 hover:to-purple-100/80 text-purple-900 font-bold rounded-xl border-2 border-purple-300/60 transition-all hover:scale-105 shadow-lg backdrop-blur-sm"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
          >
            <Heart className="w-5 h-5 inline mr-2" />
            Begin Breeding
          </button>
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
                  // Pass the actual slime elements to breeding calculator
                  const breedingResult = calculateBreedingResult(
                    slot1Slime.elements[0] as any, // Cast to any to handle type issues
                    slot2Slime.elements[0] as any, // Cast to any to handle type issues
                    slot1Slime.level || 1,
                    slot2Slime.level || 1
                  );
                  
                  console.log('🔍 BreedingDen: breedingResult =', breedingResult);
                  
                  if (breedingResult) {
                    // Create the baby slime using the same function as bazaar
                    const babySlime = createCodexSlime(breedingResult.slimeId, [
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
  );
}
