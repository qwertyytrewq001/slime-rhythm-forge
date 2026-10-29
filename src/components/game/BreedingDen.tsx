import React, { useState, useEffect, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { NavPlate } from './TopBar';
import { DenPeekers } from './DenPeekers';
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
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [bondAt, setBondAt] = useState(0);

  // Precise positioning coordinates for incubators (can be fine-tuned)
  const leftIncubatorPosition = {
    left: '30%',
    top: '68%'
  };
  
  const rightIncubatorPosition = {
    right: '30%',
    top: '68%'
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

  // The gallery tells us which slime the pointer is over while choosing a partner
  useEffect(() => {
    const on = (e: Event) => setHoverId((e as CustomEvent<{ id: string | null }>).detail?.id ?? null);
    window.addEventListener('breedHover', on);
    return () => window.removeEventListener('breedHover', on);
  }, []);

  // The parent already chosen reacts to a candidate: shy and happy if they could breed, worried if not
  const hovered = hoverId ? state.slimes.find(s => s.id === hoverId) : undefined;
  const waitingSlot: 1 | 2 | null = slot1Slime && !slot2Slime ? 1 : slot2Slime && !slot1Slime ? 2 : null;
  const waiting = waitingSlot === 1 ? slot1Slime : waitingSlot === 2 ? slot2Slime : undefined;
  const reaction: 'shy' | 'cool' | 'smitten' | 'worried' | null = !waiting || !hovered || hovered.id === waiting.id
    ? null
    : getPossibleOutcomes(waiting.elements, hovered.elements).length > 0 ? (['shy', 'cool', 'smitten'] as const)[(waiting.id.length + hovered.id.charCodeAt(hovered.id.length - 1)) % 3] : 'worried';

  // Both parents chosen: a little burst of hearts between them
  const bothChosen = !!(slot1Slime && slot2Slime);
  const wasBoth = React.useRef(false);
  useEffect(() => {
    if (bothChosen && !wasBoth.current) setBondAt(Date.now());
    wasBoth.current = bothChosen;
  }, [bothChosen]);

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
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}altar/den_bg.jpg)` }}
      />
      
      {/* Dark overlay for better visibility */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 60%, transparent 55%, rgba(12,6,30,0.45) 100%)' }} />

      {/* discovered slimes play peek-a-boo in the wall alcoves */}
      <DenPeekers />

      {/* the central egg altar */}
      <img src={`${import.meta.env.BASE_URL}altar/denp_egg_altar.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '74%', width: 'min(17vw, 230px)', transform: 'translate(-50%, -50%)', imageRendering: 'auto' }} />

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
        <img src={`${import.meta.env.BASE_URL}altar/denp_${slot1Slime ? 'platform_glow' : 'platform'}.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', bottom: -58, width: 'min(25vw, 340px)', transform: 'translateX(-50%)', imageRendering: 'auto' }} />
        <img src={`${import.meta.env.BASE_URL}altar/denp_dome.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', bottom: -46, width: 'min(18vw, 250px)', transform: 'translateX(-50%)', imageRendering: 'auto', opacity: 0.5, zIndex: 5 }} />
        {slot1Slime ? (
          <div className="relative flex items-center justify-center" style={{ animation: reaction && waitingSlot === 1 ? (reaction === 'shy' ? 'denShy 0.5s ease-in-out infinite' : 'denWorry 0.6s ease-in-out infinite') : bothChosen && Date.now() - bondAt < 1800 ? 'denHop 0.6s ease-out 2' : undefined }}>
            <SlimeCanvas slime={slot1Slime} size={160} animated sizeMultiplier={1.8} animationStyle="playful" />
              {reaction && waitingSlot === 1 && (
                <>
                  {reaction === 'cool' && <img src={`${import.meta.env.BASE_URL}ui/react_sunglasses.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '40%', width: 78, transform: 'translateX(-50%)', imageRendering: 'auto', animation: 'denDrop 0.4s ease-out' }} />}
                  {reaction === 'smitten' && <img src={`${import.meta.env.BASE_URL}ui/react_hearteyes.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '40%', width: 74, transform: 'translateX(-50%)', imageRendering: 'auto', animation: 'denBlush 0.7s ease-in-out infinite' }} />}
                  {reaction === 'shy' && (
                    <>
                    <img src={`${import.meta.env.BASE_URL}altar/love_blush.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '40%', width: 96, transform: 'translateX(-50%)', imageRendering: 'auto', animation: 'denBlush 0.9s ease-in-out infinite' }} />
                      <img src={`${import.meta.env.BASE_URL}altar/love_hearts.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ width: 110, left: '50%', top: -34, transform: 'translateX(-50%)', imageRendering: 'auto', animation: 'denFloat 1.3s ease-in-out infinite' }} />
                    </>
                  )}
                  {reaction === 'worried' && (
                    <img src={`${import.meta.env.BASE_URL}altar/love_drop.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ width: 28, left: '66%', top: '12%', imageRendering: 'auto', animation: 'denDrip 1.1s ease-in infinite' }} />
                  )}
                </>
              )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSlime(1);
              }}
              className="absolute -top-3 -right-3 hover:scale-110 active:scale-90 transition-transform z-10"
            >
              <img src={`${import.meta.env.BASE_URL}ui/baz_close.png`} alt="Remove" draggable={false} style={{ width: 30, height: 30, imageRendering: 'auto' }} />
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
        <img src={`${import.meta.env.BASE_URL}altar/denp_${slot2Slime ? 'platform_glow' : 'platform'}.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', bottom: -58, width: 'min(25vw, 340px)', transform: 'translateX(-50%)', imageRendering: 'auto' }} />
        <img src={`${import.meta.env.BASE_URL}altar/denp_dome.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', bottom: -46, width: 'min(18vw, 250px)', transform: 'translateX(-50%)', imageRendering: 'auto', opacity: 0.5, zIndex: 5 }} />
        {slot2Slime ? (
          <div className="relative flex items-center justify-center" style={{ animation: reaction && waitingSlot === 2 ? (reaction === 'shy' || reaction === 'smitten' ? 'denShy 0.5s ease-in-out infinite' : reaction === 'cool' ? 'denCool 1.4s ease-in-out infinite' : 'denWorry 0.6s ease-in-out infinite') : bothChosen && Date.now() - bondAt < 1800 ? 'denHop 0.6s ease-out 2' : undefined }}>
            <SlimeCanvas slime={slot2Slime} size={160} animated sizeMultiplier={1.8} animationStyle="playful" />
              {reaction && waitingSlot === 2 && (
                <>
                  {reaction === 'cool' && <img src={`${import.meta.env.BASE_URL}ui/react_sunglasses.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '40%', width: 78, transform: 'translateX(-50%)', imageRendering: 'auto', animation: 'denDrop 0.4s ease-out' }} />}
                  {reaction === 'smitten' && <img src={`${import.meta.env.BASE_URL}ui/react_hearteyes.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '40%', width: 74, transform: 'translateX(-50%)', imageRendering: 'auto', animation: 'denBlush 0.7s ease-in-out infinite' }} />}
                  {reaction === 'shy' && (
                    <>
                    <img src={`${import.meta.env.BASE_URL}altar/love_blush.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '40%', width: 96, transform: 'translateX(-50%)', imageRendering: 'auto', animation: 'denBlush 0.9s ease-in-out infinite' }} />
                      <img src={`${import.meta.env.BASE_URL}altar/love_hearts.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ width: 110, left: '50%', top: -34, transform: 'translateX(-50%)', imageRendering: 'auto', animation: 'denFloat 1.3s ease-in-out infinite' }} />
                    </>
                  )}
                  {reaction === 'worried' && (
                    <img src={`${import.meta.env.BASE_URL}altar/love_drop.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ width: 28, left: '66%', top: '12%', imageRendering: 'auto', animation: 'denDrip 1.1s ease-in infinite' }} />
                  )}
                </>
              )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSlime(2);
              }}
              className="absolute -top-3 -right-3 hover:scale-110 active:scale-90 transition-transform z-10"
            >
              <img src={`${import.meta.env.BASE_URL}ui/baz_close.png`} alt="Remove" draggable={false} style={{ width: 30, height: 30, imageRendering: 'auto' }} />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-gray-600/80 to-gray-700/80 rounded-full flex items-center justify-center animate-pulse hover:scale-110 transition-transform border-2 border-gray-500/50">
            <Plus className="w-8 h-8 text-white" style={{ color: 'white !important' }} />
          </div>
        )}
      </div>

      
      {bothChosen && Date.now() - bondAt < 2000 && (
        <img key={bondAt} src={`${import.meta.env.BASE_URL}altar/love_hearts.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '66%', width: 280, transform: 'translate(-50%,-50%)', imageRendering: 'auto', animation: 'denBond 1.8s ease-out forwards', zIndex: 20 }} />
      )}
      {bothChosen && !state.activeBreeding && (
        <img src={`${import.meta.env.BASE_URL}altar/love_ribbon.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: '50%', top: '27%', width: '40%', minWidth: 240, transform: 'translate(-50%,-50%)', imageRendering: 'auto', animation: 'denRibbon 1.8s ease-in-out infinite', zIndex: 2, opacity: 0.85 }} />
      )}
      <style>{`
        @keyframes denTitle { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
        @keyframes denCool { 0%,100% { transform: rotate(-1.5deg) } 50% { transform: rotate(1.5deg) translateY(-3px) } }
        @keyframes denDrop { from { transform: translateX(-50%) translateY(-30px); opacity: 0 } to { transform: translateX(-50%) translateY(0); opacity: 1 } }
        @keyframes denEggBob { 0%,100% { transform: translateX(-50%) translateY(0) } 50% { transform: translateX(-50%) translateY(-8px) } }
        @keyframes denBeginPulse { 0%,100% { transform: translateX(-50%) scale(1) } 50% { transform: translateX(-50%) scale(1.05) } }
        @keyframes denRibbon { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }
        @keyframes denBlush { 0%,100% { opacity: 0.55 } 50% { opacity: 1 } }
        @keyframes denFloat { 0%,100% { transform: translateX(-50%) translateY(0) } 50% { transform: translateX(-50%) translateY(-10px) } }
        @keyframes denDrip { 0% { transform: translateY(-6px); opacity: 0 } 30% { opacity: 1 } 100% { transform: translateY(26px); opacity: 0 } }
        @keyframes denShy { 0%,100% { transform: rotate(-3deg) translateX(-2px) } 50% { transform: rotate(3deg) translateX(2px) } }
        @keyframes denWorry { 0%,100% { transform: translateY(0) } 50% { transform: translateY(2px) scale(0.98) } }
        @keyframes denHop { 0% { transform: translateY(0) scale(1,1) } 40% { transform: translateY(-26px) scale(0.95,1.07) } 100% { transform: translateY(0) scale(1,1) } }
        @keyframes denBond { 0% { opacity: 0; transform: translate(-50%,-30%) scale(0.5) } 25% { opacity: 1; transform: translate(-50%,-55%) scale(1.05) } 100% { opacity: 0; transform: translate(-50%,-90%) scale(1.15) } }
      `}</style>

      {/* Breeding controls */}
      <div className="absolute top-4 left-4">
        {onBackToAltar && <NavPlate art="altar" icon="ui/navicon_altar.png" color="#b2ebff" label="BACK" onClick={onBackToAltar} />}
      </div>

      {/* Breeding title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center" style={{ width: 'min(46vw, 430px)' }}>
        <div className="relative">
          <img src={`${import.meta.env.BASE_URL}altar/ui_plate_title.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))' }} />
          <span className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif", fontSize: 'clamp(18px, 2.4vw, 32px)', color: '#fff3d0', WebkitTextStroke: '5px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.08em' }}>Breeding Den</span>
        </div>
        <p className="font-bold mt-1" style={{ animation: 'denTitle 3s ease-in-out infinite', fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif", fontSize: 'clamp(11px, 1.1vw, 15px)', color: '#ffe9a8', WebkitTextStroke: '3px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.1em' }}>SELECT PARENTS TO BREED</p>
      </div>

      {/* The mystery egg floats above the altar; tap it to see what this pair could make */}
      {slot1Slime && slot2Slime && !state.activeBreeding && (
        <>
          <button
            onClick={() => setShowPossibleModal(true)}
            aria-label="Possible slimes"
            className="absolute flex flex-col items-center outline-none hover:scale-110 active:scale-95 transition-transform"
            style={{ left: '50%', top: '33%', width: 'min(9vw, 120px)', transform: 'translateX(-50%)', background: 'transparent', border: 'none', padding: 0, zIndex: 12, animation: 'denEggBob 2.6s ease-in-out infinite' }}
          >
            <img src={`${import.meta.env.BASE_URL}ui/mystery_egg.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 0 14px rgba(190,140,255,0.8)) drop-shadow(0 6px 6px rgba(0,0,0,0.45))' }} />
            <span className="relative" style={{ width: '170%', marginTop: -6 }}>
              <img src={`${import.meta.env.BASE_URL}ui/baz_tab.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto' }} />
              <span className="absolute inset-0 flex items-center justify-center font-bold whitespace-nowrap" style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 'clamp(10px, 1.05vw, 14px)', color: '#ffe9a8', textShadow: '0 2px 0 rgba(30,12,4,0.85)', letterSpacing: '0.05em' }}>Possible Slimes</span>
            </span>
          </button>

          <button
            onClick={handleStartBreeding}
            aria-label="Begin breeding"
            className="absolute outline-none hover:scale-110 active:scale-95 transition-transform"
            style={{ left: '50%', bottom: '3%', width: 'min(17vw, 230px)', transform: 'translateX(-50%)', background: 'transparent', border: 'none', padding: 0, zIndex: 12, animation: 'denBeginPulse 1.6s ease-in-out infinite' }}
          >
            <img src={`${import.meta.env.BASE_URL}ui/../altar/ui_btn_begin.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 0 12px rgba(190,120,255,0.75))' }} />
            <span className="absolute inset-0 flex items-center justify-center font-bold whitespace-nowrap" style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 'clamp(13px, 1.5vw, 20px)', color: '#fff', WebkitTextStroke: '3px #4a1d7a', paintOrder: 'stroke fill', letterSpacing: '0.04em' }}>Begin Breeding</span>
          </button>
        </>
      )}

      {/* Breeding status - centered between incubators */}
      {breeding && (
        <div className="absolute text-center" style={{ top: '50%', left: '50%', transform: 'translateX(-50%)' }}>
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
        <div className="absolute text-center" style={{ top: '46%', left: '50%', transform: 'translateX(-50%)' }}>
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
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={() => setShowPossibleModal(false)}
      >
        <div 
          className="bg-[#f6e8c3] rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border-4 border-[#4a2f17] shadow-2xl backdrop-blur-sm relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-3xl font-bold text-[#4a2f17] tracking-wide" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}>
              Possible Slimes
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPossibleModal(false);
              }}
              className="relative z-10 hover:scale-110 active:scale-95 transition-transform"
            >
              <img src={`${import.meta.env.BASE_URL}ui/baz_close.png`} alt="Close" className="w-12 h-12" style={{ imageRendering: 'auto' }} />
            </button>
          </div>

          
          {/* Possible Outcomes Grid */}
          {possibleOutcomes.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
              {possibleOutcomes.map((slime) => (
                <div
                  key={slime.id}
                  className="p-3 transition-all hover:scale-105 bg-white/55 rounded-2xl border-[3px] border-[#4a2f17]/40"
                >
                  <div className="w-full h-24 flex items-center justify-center mb-3">
                    <SlimeCanvas
                      slime={createCodexSlime(slime.id)}
                      size={80}
                      animated={false}
                      sizeMultiplier={1.8}
                    />
                  </div>
                  <p className="text-gray-800 text-sm font-bold text-center leading-tight">
                    {slime.name}
                  </p>
                  <div className="flex justify-center mt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4a2f17]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                      <img src={`${import.meta.env.BASE_URL}altar/gem_${slime.rarityTier.toLowerCase()}.png`} alt="" draggable={false} style={{ width: 22, height: 22, objectFit: 'contain', imageRendering: 'auto' }} />
                      {slime.rarityTier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-800 text-lg font-bold">No possible breeding outcomes found</p>
              <p className="text-gray-600 text-sm mt-2">This combination may not produce any valid slimes</p>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}
