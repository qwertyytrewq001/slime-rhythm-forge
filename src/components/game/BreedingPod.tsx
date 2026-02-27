import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { formatTime } from '@/utils/timeUtils';
import { SlimeCanvas } from './SlimeCanvas';
import { breedSlimes } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Slime } from '@/types/slime';
import { Sparkles, Diamond } from 'lucide-react';
import { drawEnhancedEgg } from '@/utils/eggRenderer';
import { FairySparkle } from './FairySparkle';

interface BreedingPodProps {
  onRequestGallery?: (slot: 1 | 2) => void; 
}

function ResultEgg({ slime }: { slime: Slime }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawEnhancedEgg(ctx, {
      size: 120,
      slime,
      crackProgress: 0,
      isShaking: false
    });
  }, [slime]);

  return (
    <canvas 
      ref={canvasRef} 
      width={120} 
      height={120} 
      className="w-24 h-24 pixel-art transition-transform duration-300 hover:scale-110 drop-shadow-[0_0_15px_#40E0D0]"
    />
  );
}

const LORE_WHISPERS = [
  "The elements are converging...",
  "A new soul stirs in the ether...",
  "Ancient energies intertwine...",
  "The stars align for this birth...",
  "Nature hums a secret melody...",
  "Echoes of the past shape the future...",
  "A spirit approaches the threshold..."
];

const RitualInscription = ({ 
  children, 
  onClick, 
  sparkles = 10, 
  fontSize = '12px',
  className = "",
  blueGlow = true
}: { 
  children: React.ReactNode; 
  onClick?: (e: React.MouseEvent) => void; 
  sparkles?: number;
  fontSize?: string;
  className?: string;
  blueGlow?: boolean;
}) => (
  <div 
    onClick={onClick}
    className={`relative flex flex-col items-center group pointer-events-auto ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
  >
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(sparkles)].map((_, i) => <FairySparkle key={i} index={i} color="#40E0D0" />)}
    </div>
    <h3 
      className={`text-[#FF7EB6] uppercase tracking-[0.3em] font-black transition-all duration-300 ${blueGlow ? 'animate-intense-blue-inscription-glow' : 'animate-intense-inscription-glow'} ${onClick ? 'group-hover:scale-110 group-active:scale-95' : ''}`} 
      style={{ fontFamily: "'Press Start 2P', cursive", fontSize }}
    >
      {children}
    </h3>
  </div>
);

export function BreedingPod({ onRequestGallery }: BreedingPodProps = {}) {
  const { state, dispatch } = useGameState();
  const [mergeParticles, setMergeParticles] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [whisperIndex, setWhisperIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle whispers while breeding
  useEffect(() => {
    if (!!state.activeBreeding && now < state.activeBreeding.endTime) {
      const whisperTimer = setInterval(() => {
        setWhisperIndex(prev => (prev + 1) % LORE_WHISPERS.length);
      }, 4000);
      return () => clearInterval(whisperTimer);
    }
  }, [!!state.activeBreeding, now]);

  const slot1Slime = useMemo(() => 
    state.slimes.find(s => s.id === (state.activeBreeding ? state.activeBreeding.parent1Id : state.breedSlot1)),
    [state.slimes, state.breedSlot1, state.activeBreeding]
  );
  
  const slot2Slime = useMemo(() => 
    state.slimes.find(s => s.id === (state.activeBreeding ? state.activeBreeding.parent2Id : state.breedSlot2)),
    [state.slimes, state.breedSlot2, state.activeBreeding]
  );

  const breeding = !!state.activeBreeding && now < state.activeBreeding.endTime;
  const breedFinished = !!state.activeBreeding && now >= state.activeBreeding.endTime;

  const handleDrop = useCallback((slot: 1 | 2) => (e: React.DragEvent) => {
    if (state.activeBreeding) return;
    e.preventDefault();
    const id = e.dataTransfer.getData('slimeId');
    if (id) {
      if (slot === 1 && id === state.breedSlot2) return;
      if (slot === 2 && id === state.breedSlot1) return;
      dispatch({ type: 'SET_BREED_SLOT', slot, id });
    }
  }, [state.breedSlot1, state.breedSlot2, state.activeBreeding, dispatch]);

  const handleDragOver = (e: React.DragEvent) => {
    if (state.activeBreeding) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleBreed = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!slot1Slime || !slot2Slime || state.activeBreeding || state.activeHatching) return;

    setMergeParticles(true);
    audioEngine.playSfx('breed');

    const resultSlime = breedSlimes(slot1Slime, slot2Slime, state.mutationJuiceActive);
    const isEpicOrBetter = ['Epic', 'Legendary', 'Divine', 'Ancient'].includes(resultSlime.rarityTier);
    const duration = isEpicOrBetter ? 30000 : 10000;

    dispatch({ 
      type: 'START_BREEDING', 
      ritual: {
        parent1Id: slot1Slime.id,
        parent2Id: slot2Slime.id,
        endTime: Date.now() + duration,
        resultSlime: resultSlime
      }
    });

    if (state.mutationJuiceActive) dispatch({ type: 'DEACTIVATE_MUTATION_JUICE' });
    setTimeout(() => setMergeParticles(false), 2000);
  }, [slot1Slime, slot2Slime, state.activeBreeding, state.activeHatching, state.mutationJuiceActive, dispatch]);

  const handleHatchClick = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!state.activeBreeding || !breedFinished) return;
    const child = state.activeBreeding.resultSlime;
    
    dispatch({ type: 'START_HATCHING', slime: child, duration: 30000 });
    dispatch({ type: 'ADD_BREED_HISTORY', result: {
      parent1Id: state.activeBreeding.parent1Id,
      parent2Id: state.activeBreeding.parent2Id,
      childId: child.id,
      timestamp: Date.now(),
    }});
    
    dispatch({ type: 'INCREMENT_BREEDS' });
    dispatch({ type: 'COLLECT_EGG' });
    audioEngine.playSfx('achievement');
  }, [state.activeBreeding, breedFinished, dispatch]);

  const handleSlotClick = (slot: 1 | 2) => {
    if (state.activeBreeding) return;
    if (onRequestGallery) onRequestGallery(slot);
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 relative" style={{ fontFamily: "'VT323', monospace" }}>
      {/* Mystic Altar Title - Matches Ancient Hatchery style and permanently fixed */}
      <div className="h-16 flex flex-col items-center justify-center z-20 scale-125 min-w-[200px] translate-y-10">
         <RitualInscription sparkles={10} blueGlow={false}>
           Mystic Altar
         </RitualInscription>
      </div>

      {state.mutationJuiceActive && (
        <div className="text-[9px] text-[#FF7EB6] bg-[#FF7EB6]/5 px-2 py-0.5 rounded animate-pulse mt-10 shadow-[0_0_10px_#40E0D0]/20 backdrop-blur-sm border border-[#FF7EB6]/20">
          Mutation Juice Active
        </div>
      )}

      {/* Den visual container */}
      <div className="relative w-[28rem] h-[14rem] flex items-center justify-center">
        <div className="relative w-full h-full z-10">
          {/* Slot 1 - Left Pedestal moved UP */}
          <div
            className={`absolute left-[0%] top-[20%] w-32 h-32 flex items-center justify-center transition-all cursor-pointer ${breeding ? 'animate-spirit-pulse' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop(1)}
            onClick={() => handleSlotClick(1)}
          >
            {slot1Slime ? (
              <SlimeCanvas slime={slot1Slime} size={100} animated />
            ) : (
              <div className="relative">
                <RitualInscription fontSize="6px" sparkles={4} className="scale-110">
                  Select<br/>Parent
                </RitualInscription>
              </div>
            )}
          </div>

          {/* Slot 2 - Right Pedestal moved UP */}
          <div
            className={`absolute right-[0%] top-[20%] w-32 h-32 flex items-center justify-center transition-all cursor-pointer ${breeding ? 'animate-spirit-pulse' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop(2)}
            onClick={() => handleSlotClick(2)}
          >
            {slot2Slime ? (
              <SlimeCanvas slime={slot2Slime} size={100} animated />
            ) : (
              <div className="relative">
                <RitualInscription fontSize="6px" sparkles={4} className="scale-110">
                  Select<br/>Parent
                </RitualInscription>
              </div>
            )}
          </div>

          {/* CENTRAL ACTIONS */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center mt-4">
              {breeding ? (
                <div className="flex flex-col items-center">
                  <Sparkles className="w-8 h-8 text-[#40E0D0] animate-pulse" />
                  <span className="text-[10px] text-[#40E0D0] font-black mt-2 animate-pulse drop-shadow-[0_0_8px_#40E0D0]">{formatTime(state.activeBreeding!.endTime - now)}</span>
                </div>
              ) : breedFinished ? (
                <div className="relative group cursor-pointer animate-bounce" onClick={handleHatchClick}>
                   <div className="absolute inset-0 bg-[#40E0D0]/30 rounded-full blur-xl animate-pulse" />
                   <ResultEgg slime={state.activeBreeding!.resultSlime} />
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[8px] text-[#FF7EB6] font-black uppercase animate-inscription-glow" style={{ fontFamily: "'Press Start 2P', cursive" }}>READY!</span>
                   </div>
                </div>
              ) : slot1Slime && slot2Slime && !state.activeHatching ? (
                <div 
                  className="relative flex flex-col items-center cursor-pointer group"
                  onClick={handleBreed}
                >
                  <div className="w-10 h-10 relative transition-all group-hover:scale-125 active:scale-90 animate-spin-slow">
                    {/* Floating Mana Prism / Soul Gem */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#40E0D0]/80 to-[#40E0D0] shadow-[0_0_20px_#40E0D0] rotate-45 border border-white/40" />
                    <Diamond className="absolute inset-0 m-auto w-5 h-5 text-white/90 drop-shadow-[0_0_5px_white]" />
                    <div className="absolute inset-[-4px] border border-[#FF7EB6]/40 rounded-full animate-ping" />
                  </div>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <RitualInscription fontSize="7px" sparkles={4}>
                      Start the Ritual
                    </RitualInscription>
                  </div>
                </div>
              ) : (
                <Sparkles className="w-8 h-8 text-[#40E0D0]/20" />
              )}
              
              {mergeParticles && (
                <div className="absolute inset-0 w-16 h-16 -translate-x-4 -translate-y-4 rounded-full bg-[#40E0D0]/30 animate-ping" />
              )}
          </div>
        </div>
      </div>

      {/* Bottom Area - Clean status only */}
      <div className="flex flex-col items-center gap-2 mt-4 min-h-[30px] w-full relative z-50">
        {state.activeHatching && (breedFinished || (!state.activeBreeding && slot1Slime && slot2Slime)) && (
          <RitualInscription fontSize="9px" sparkles={0} className="opacity-60">
            Hatchery Occupied
          </RitualInscription>
        )}
      </div>
    </div>
  );
}
