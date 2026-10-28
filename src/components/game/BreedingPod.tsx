import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { formatTime } from '@/utils/timeUtils';
import { SlimeCanvas } from './SlimeCanvas';
import { breedSlimes } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Slime } from '@/types/slime';
import { Sparkles, Diamond, AlertCircle } from 'lucide-react';
import { drawEnhancedEgg } from '@/utils/eggRenderer';
import { FairySparkle } from './FairySparkle';
import { getStage } from '@/utils/slimeRenderer';
import { toast } from '@/hooks/use-toast';
import { triggerDialogue } from '@/utils/dialogueTriggers';

// Check if event has been seen (same as LoreTutorial)
const hasSeenEvent = (eventName: string): boolean => {
  return localStorage.getItem(`glim_event_${eventName}`) === 'true';
};

interface BreedingPodProps {
  onRequestGallery?: (slot: 1 | 2) => void; 
  onNavigateToBreedingDen?: () => void;
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
    className={`relative flex flex-col items-center group pointer-events-auto transition-all duration-500 cursor-pointer ${className}`}
  >
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(sparkles)].map((_, i) => <FairySparkle key={i} index={i} color="#FFD1DC" />)}
    </div>
    <h3 
      className={`text-[#FFD1DC] uppercase tracking-[0.3em] font-black transition-all duration-500 ${blueGlow ? 'animate-intense-blue-inscription-glow' : 'animate-intense-inscription-glow'} group-hover:scale-[1.35] group-hover:brightness-125 group-hover:drop-shadow-[0_0_20px_#FFD1DC]`} 
      style={{ 
        fontFamily: "'Press Start 2P', cursive", 
        fontSize,
        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 0 15px rgba(0,0,0,0.8)'
      }}
    >
      {children}
    </h3>
  </div>
);

const ART = `${import.meta.env.BASE_URL}altar/`;
const FRED = "'Fredoka', 'Trebuchet MS', sans-serif";

export function BreedingPod(props: BreedingPodProps) {
  const { state, dispatch } = useGameState();
  const { onRequestGallery, onNavigateToBreedingDen } = props;
  const [mergeParticles, setMergeParticles] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [whisperIndex, setWhisperIndex] = useState(0);

  useEffect(() => {
    // NOTE: the 'breeding-intro' dialogue ("head to the hatchery") is fired when
    // the first egg is bought (BazaarModal). It used to fire here on mount, which
    // marked it as seen at launch so it never played at the right time.
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
      const slime = state.slimes.find(s => s.id === id);
      if (slime && getStage(slime.level) !== 'adult') {
        toast({
          title: "Invalid Spirit",
          description: "Only Adult spirits (Lv.10+) can participate in the ritual!",
          variant: "destructive"
        });
        return;
      }
      if (slot === 1 && id === state.breedSlot2) return;
      if (slot === 2 && id === state.breedSlot1) return;
      dispatch({ type: 'SET_BREED_SLOT', slot, id });
    }
  }, [state.slimes, state.breedSlot1, state.breedSlot2, state.activeBreeding, dispatch]);

  const handleDragOver = (e: React.DragEvent) => {
    if (state.activeBreeding) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleBreed = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!slot1Slime || !slot2Slime || state.activeBreeding || state.activeHatching) return;

    if (getStage(slot1Slime.level) !== 'adult' || getStage(slot2Slime.level) !== 'adult') {
      toast({
        title: "Incomplete Spirit",
        description: "Both spirits must be Adults to begin the ritual.",
        variant: "destructive"
      });
      return;
    }

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

    if (!state.tutorialCompleted) {
      triggerDialogue('breeding-complete');
    }

    if (state.mutationJuiceActive) dispatch({ type: 'DEACTIVATE_MUTATION_JUICE' });
    setTimeout(() => setMergeParticles(false), 2000);
  }, [slot1Slime, slot2Slime, state.activeBreeding, state.activeHatching, state.mutationJuiceActive, dispatch]);

  const handleHatchClick = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!state.activeBreeding || !breedFinished) return;
    const child = state.activeBreeding.resultSlime;
    
    // Check if there is an available habitat for this child
    const availableHabitat = state.habitats.find(h => 
      child.elements.includes(h.element) && h.assignedSlimeIds.length < h.capacity
    );

    if (!availableHabitat) {
      toast({
        title: "No Sanctum Available",
        description: "There's no sanctum available for the spirit. Please build a matching habitat first!",
        variant: "destructive"
      });
      return;
    }

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
  }, [state.activeBreeding, breedFinished, state.habitats, dispatch]);

  const handleSlotClick = (slot: 1 | 2) => {
    if (state.activeBreeding) return;
    console.log(`Navigating to BreedingDen for slot ${slot}`);
    
    // Only navigate to BreedingDen, don't open gallery
    if (onNavigateToBreedingDen) {
      onNavigateToBreedingDen();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 relative" style={{ fontFamily: "'VT323', monospace" }}>
      <style>{`
        @keyframes podSlotPulse { 0%,100% { opacity: 0.75; transform: scale(1) } 50% { opacity: 1; transform: scale(1.04) } }
        @keyframes podPulse { 0%,100% { transform: scale(1); filter: brightness(1) } 50% { transform: scale(1.06); filter: brightness(1.18) } }
        @keyframes podRing { 0%,100% { opacity: 0.6; transform: scale(0.96) } 50% { opacity: 1; transform: scale(1.04) } }
        @keyframes podBeam { 0%,100% { opacity: 0.55 } 50% { opacity: 1 } }
        @keyframes podSpin { to { transform: rotate(360deg) } }
      `}</style>
      {/* Mystic Altar Title - Matches Ancient Hatchery style and permanently fixed */}
      <div className="h-16 flex flex-col items-center justify-center z-20 scale-125 min-w-[200px] -translate-y-2">
         <RitualInscription sparkles={10} blueGlow={false}>
           Mystic Altar
         </RitualInscription>
      </div>

      {state.mutationJuiceActive && (
        <div className="text-[9px] text-[#FF7EB6] font-black uppercase animate-pulse mt-0 drop-shadow-[0_0_8px_#FF7EB6] tracking-widest">
          Mutation Juice Active
        </div>
      )}

      {/* Den visual container */}
      <div className="relative w-[28rem] h-[14rem] flex items-center justify-center">
        {/* Glow behind the altar */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#40E0D0]/5 via-transparent to-[#40E0D0]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative w-full h-full z-10">
          {/* Slot 1 - Left Pedestal */}
          <div
            className={`absolute left-[0%] top-[0%] w-32 h-32 flex items-center justify-center transition-all cursor-pointer ${breeding ? 'animate-spirit-pulse' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop(1)}
            onClick={() => handleSlotClick(1)}
          >
            {/* Grounding shadow/base for the slime */}
            <div className="absolute bottom-4 w-16 h-4 bg-black/40 rounded-full blur-md" />
            
            {slot1Slime ? (
              <div className="relative -translate-y-14">
                <SlimeCanvas slime={slot1Slime} size={100} animated sizeMultiplier={2.0} animationStyle="playful" />
              </div>
            ) : (
              <div className="relative -translate-y-14">
                <RitualInscription fontSize="6px" sparkles={4} className="scale-110">
                  Select<br/>Parent
                </RitualInscription>
              </div>
            )}
          </div>

          {/* Slot 2 - Right Pedestal */}
          <div
            className={`absolute right-[0%] top-[0%] w-32 h-32 flex items-center justify-center transition-all cursor-pointer ${breeding ? 'animate-spirit-pulse' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop(2)}
            onClick={() => handleSlotClick(2)}
          >
            {/* Grounding shadow/base for the slime */}
            <div className="absolute bottom-4 w-16 h-4 bg-black/40 rounded-full blur-md" />

            {slot2Slime ? (
              <div className="relative -translate-y-14">
                <SlimeCanvas slime={slot2Slime} size={100} animated sizeMultiplier={2.0} animationStyle="playful" />
              </div>
            ) : (
              <div className="relative -translate-y-14">
                <RitualInscription 
                  fontSize="6px" 
                  sparkles={4} 
                  className="scale-110"
                  onClick={(e) => {
                    console.log(`🖼️ RitualInscription clicked - opening gallery`);
                    const event = new CustomEvent('openBreedingGallery', { detail: { slot: 2 } });
                    window.dispatchEvent(event);
                  }}
                >
                  Select<br/>Parent
                </RitualInscription>
              </div>
            )}
          </div>

          {/* CENTRAL ACTIONS */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center mt-4">
              {breeding ? (
                <div className="flex flex-col items-center relative">
                  <img src={`${ART}fx_ring.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ width: 230, top: '55%', imageRendering: 'auto', animation: 'podRing 3s ease-in-out infinite' }} />
                  <img src={`${ART}fx_beam.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ height: 200, bottom: '40%', imageRendering: 'auto', mixBlendMode: 'screen', animation: 'podBeam 2.2s ease-in-out infinite' }} />
                  <img src={`${ART}fx_swirl.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ width: 130, top: '-20%', imageRendering: 'auto', animation: 'podSpin 7s linear infinite' }} />
                  <span className="relative font-bold px-3 py-0.5 rounded-full" style={{ marginTop: 56, fontFamily: FRED, fontSize: 13, color: '#fff3d0', background: 'rgba(30,14,40,0.82)', border: '2px solid #f2d68a', textShadow: '0 1px 0 rgba(0,0,0,0.6)' }}>{formatTime(state.activeBreeding!.endTime - now)}</span>
                </div>
              ) : breedFinished ? (
                <div className="relative group cursor-pointer animate-bounce" onClick={handleHatchClick}>
                   <img src={`${ART}fx_starburst.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ width: 190, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', imageRendering: 'auto', animation: 'podSpin 14s linear infinite', opacity: 0.9 }} />
                   <div className="absolute inset-0 bg-[#40E0D0]/30 rounded-full blur-xl animate-pulse" />
                   <ResultEgg slime={state.activeBreeding!.resultSlime} />
                   <img src={`${ART}gem_${state.activeBreeding!.resultSlime.rarityTier.toLowerCase()}.png`} alt={state.activeBreeding!.resultSlime.rarityTier} draggable={false} className="absolute pointer-events-none" style={{ width: 46, left: '50%', top: -58, transform: 'translateX(-50%)', imageRendering: 'auto', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))' }} />
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[8px] text-[#FF7EB6] font-black uppercase animate-inscription-glow" style={{ fontFamily: "'Press Start 2P', cursive" }}>READY!</span>
                   </div>
                </div>
              ) : slot1Slime && slot2Slime && !state.activeHatching ? (
                <button
                  onClick={handleBreed}
                  aria-label="Begin the ritual"
                  className="relative outline-none hover:scale-110 active:scale-95 transition-transform"
                  style={{ width: 154, background: 'transparent', border: 'none', padding: 0, animation: 'podPulse 1.6s ease-in-out infinite' }}
                >
                  <img src={`${ART}ui_btn_begin.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 0 12px rgba(190,120,255,0.75))' }} />
                  <span className="absolute inset-0 flex items-center justify-center font-bold whitespace-nowrap" style={{ fontFamily: FRED, fontSize: 15, color: '#fff', WebkitTextStroke: '3px #4a1d7a', paintOrder: 'stroke fill', letterSpacing: '0.04em' }}>Begin Ritual</span>
                </button>
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
