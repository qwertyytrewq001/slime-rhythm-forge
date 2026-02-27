import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { breedSlimes } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { BreedHistory } from './BreedHistory';
import { DiscoveryPopup } from './DiscoveryPopup';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Slime, SlimeElement } from '@/types/slime';
import { Sparkles, Timer, X } from 'lucide-react';
import { generateBreedPreviews } from '@/utils/breedPreviewGenerator';
import { drawEnhancedEgg } from '@/utils/eggRenderer';

interface BreedingPodProps {
  onRequestGallery?: (slot: 1 | 2) => void;
}

// Timer helper for breeding/hatching
export function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Small Canvas for the "Collect" button to show the unique DNA egg
function ButtonEggCanvas({ slime }: { slime: Slime }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawEnhancedEgg(ctx, { size: 40, slime });
  }, [slime]);
  return <canvas ref={canvasRef} width={40} height={40} className="w-8 h-8 pixel-art drop-shadow-[0_0_8px_rgba(255,126,182,0.5)]" />;
}

const MagicMote = ({ index }: { index: number }) => {
  const style = {
    '--mote-tx': `${(index % 3 - 1) * 30}px`,
    left: `${15 + (index * 20) % 70}%`,
    animationDelay: `${index * 0.4}s`,
  } as React.CSSProperties;
  
  return (
    <div 
      className="absolute bottom-0 w-1.5 h-1.5 bg-primary/60 rounded-full blur-[1px] animate-magic-mote pointer-events-none"
      style={style}
    />
  );
};

const BlueFairySparkle = ({ index }: { index: number }) => {
  const style = {
    '--tx': `${(Math.sin(index) * 50)}px`,
    '--ty': `${-30 - (Math.cos(index) * 40)}px`,
    left: `${50 + (Math.sin(index * 1.8) * 40)}%`,
    top: `${50 + (Math.cos(index * 1.2) * 30)}%`,
    animationDelay: `${index * 0.25}s`,
    backgroundColor: index % 2 === 0 ? '#40E0D0' : '#00CED1',
  } as React.CSSProperties;
  
  return (
    <div className="absolute w-1 h-1 rounded-full blur-[1px] animate-fairy-sparkle pointer-events-none z-0" style={style} />
  );
};

export function BreedingPod({ onRequestGallery }: BreedingPodProps = {}) {
  const { state, dispatch } = useGameState();
  const [mergeParticles, setMergeParticles] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<1 | 2 | null>(null);
  const [isAltarHovered, setIsAltarHovered] = useState(false);
  const [now, setNow] = useState(Date.now());

  const slot1Slime = state.slimes.find(s => s.id === (state.activeBreeding?.parent1Id || state.breedSlot1));
  const slot2Slime = state.slimes.find(s => s.id === (state.activeBreeding?.parent2Id || state.breedSlot2));

  const isRitualActive = !!state.activeBreeding;
  const isRitualFinished = isRitualActive && now >= state.activeBreeding!.endTime;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const possibleOffspring = useMemo(() => {
    if (!slot1Slime || !slot2Slime || isRitualActive) return [];
    return generateBreedPreviews(slot1Slime, slot2Slime, 6);
  }, [slot1Slime, slot2Slime, isRitualActive]);

  const handleDrop = useCallback((slot: 1 | 2) => (e: React.DragEvent) => {
    if (isRitualActive) return;
    e.preventDefault();
    const id = e.dataTransfer.getData('slimeId');
    if (id) {
      if (slot === 1 && id === state.breedSlot2) return;
      if (slot === 2 && id === state.breedSlot1) return;
      dispatch({ type: 'SET_BREED_SLOT', slot, id });
    }
  }, [state.breedSlot1, state.breedSlot2, dispatch, isRitualActive]);

  const handleDragOver = (e: React.DragEvent) => {
    if (isRitualActive) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleStartRitual = useCallback(() => {
    if (!slot1Slime || !slot2Slime || isRitualActive) return;
    audioEngine.playSfx('breed');
    setMergeParticles(true);
    const child = breedSlimes(slot1Slime, slot2Slime, state.mutationJuiceActive);
    const durations: Record<string, number> = {
      Common: 10000, Uncommon: 10000, Rare: 10000, 
      Epic: 30000, Legendary: 30000, Divine: 30000, Ancient: 30000
    };
    const duration = durations[child.rarityTier] || 30000;
    dispatch({ 
      type: 'START_BREEDING', 
      ritual: { 
        parent1Id: slot1Slime.id, 
        parent2Id: slot2Slime.id, 
        endTime: Date.now() + duration,
        resultSlime: child
      } 
    });
    setTimeout(() => setMergeParticles(false), 2000);
  }, [slot1Slime, slot2Slime, isRitualActive, state.mutationJuiceActive, dispatch]);

  const handleCollectEgg = () => {
    if (!isRitualFinished || !state.activeBreeding) return;
    const result = state.activeBreeding.resultSlime;
    dispatch({ type: 'ADD_BREED_HISTORY', result: {
      parent1Id: state.activeBreeding.parent1Id,
      parent2Id: state.activeBreeding.parent2Id,
      childId: result.id,
      timestamp: Date.now(),
    }});
    dispatch({ type: 'INCREMENT_BREEDS' });
    const durations: Record<string, number> = {
      Common: 10000, Uncommon: 10000, Rare: 10000, 
      Epic: 30000, Legendary: 30000, Divine: 30000, Ancient: 30000
    };
    const duration = durations[result.rarityTier] || 30000;
    dispatch({ type: 'START_HATCHING', slime: result, duration });
    dispatch({ type: 'COLLECT_EGG' });
    audioEngine.playSfx('achievement');
    setTimeout(() => {
      const bench = document.getElementById('hatchery-bench');
      if (bench) bench.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto" style={{ fontFamily: "'VT323', monospace" }}>
      <div className="flex flex-col items-center gap-8 p-4 relative mt-32 sm:mt-40 select-none">
        
        <div className="absolute -top-12 text-center opacity-100 scale-110 cursor-default pointer-events-auto"
             onMouseEnter={() => setIsAltarHovered(true)} onMouseLeave={() => setIsAltarHovered(false)}>
          <h2 className={`text-base sm:text-lg text-[#FF7EB6] uppercase tracking-[0.3em] font-black transition-all duration-300 ${isAltarHovered ? 'animate-intense-inscription-glow' : 'animate-soft-inscription-glow'}`} style={{ fontFamily: "'Press Start 2P', cursive" }}>
            Mystic Altar
          </h2>
        </div>

        <div className="relative">
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(15)].map((_, i) => <BlueFairySparkle key={i} index={i} />)}
          </div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => <MagicMote key={i} index={i} />)}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] opacity-30 pointer-events-none bg-primary" />

          <div className="relative w-[24rem] h-[12rem] flex items-center justify-center">        
            <div className="flex items-center gap-16 relative z-10 h-full">
              
              <div className="relative flex flex-col items-center">
                {!slot1Slime && (
                  <>
                    <div className="absolute -inset-6 bg-primary/10 rounded-full animate-spirit-pulse blur-xl" />
                    <div className="absolute bottom-6 w-16 h-40 bg-gradient-to-t from-primary/40 via-primary/10 to-transparent animate-float-beam pointer-events-none" style={{ borderRadius: '50% 50% 0 0' }} />
                    <div className={`absolute -top-12 text-[14px] text-[#FF7EB6] animate-soft-inscription-glow font-black uppercase tracking-widest whitespace-nowrap transition-opacity duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${isAltarHovered ? 'opacity-100' : 'opacity-60'}`}>
                      Invoke Parent
                    </div>
                  </>
                )}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative group/pedestal ${slot1Slime ? 'scale-110 filter drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]' : 'bg-primary/10 border-b-4 border-primary/30 hover:bg-primary/20 cursor-pointer shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]'} ${isRitualActive ? 'brightness-75' : ''}`}
                  onDragOver={handleDragOver} onDrop={handleDrop(1)} onClick={() => !isRitualActive && onRequestGallery?.(1)}
                  onMouseEnter={() => { setHoveredSlot(1); setIsAltarHovered(true); }} onMouseLeave={() => { setHoveredSlot(null); setIsAltarHovered(false); }}>
                  {slot1Slime ? (
                    <>
                      <SlimeCanvas slime={slot1Slime} size={110} animated={true} />
                      {!isRitualActive && (
                        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SET_BREED_SLOT', slot: 1, id: null }); }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF7EB6] text-black rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/pedestal:opacity-100 hover:scale-110 active:scale-90 transition-all border-2 border-black z-20">
                          <X className="w-4 h-4 stroke-[4px]" />
                        </button>
                      )}
                    </>
                  ) : <div className="opacity-40 transition-opacity hover:opacity-80 animate-pulse"><Sparkles className="w-14 h-14 text-primary" strokeWidth={1.5} /></div>}
                  {isRitualActive && <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse flex items-center justify-center"><Timer className="w-8 h-8 text-primary animate-spin-slow" /></div>}
                  <div className="absolute -bottom-2 w-24 h-6 bg-primary/20 rounded-[100%] blur-md pointer-events-none" />
                </div>
              </div>

              <div className="relative flex flex-col items-center justify-center">
                 <div className={`relative transition-all duration-500 ${slot1Slime && slot2Slime ? 'scale-125' : 'scale-90 opacity-60'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700
                      ${(slot1Slime && slot2Slime && !isRitualActive) ? 'bg-primary shadow-[0_0_40px_hsl(var(--primary))] cursor-pointer hover:rotate-90' 
                        : isRitualFinished ? 'bg-[#FF7EB6] shadow-[0_0_40px_#FF7EB6] cursor-pointer animate-bounce border-2 border-white/20'
                        : 'bg-muted/60 border-2 border-dashed border-primary/40'
                      }`} onClick={isRitualFinished ? handleCollectEgg : handleStartRitual}>
                      {isRitualFinished ? <ButtonEggCanvas slime={state.activeBreeding!.resultSlime} /> : <Sparkles className={`w-8 h-8 ${slot1Slime && slot2Slime ? 'text-primary-foreground' : 'text-primary/40'}`} />}
                    </div>
                    {(slot1Slime && slot2Slime) && (
                      <>
                        <div className={`absolute inset-0 -m-6 border-[3px] rounded-full animate-ping opacity-30 ${isRitualFinished ? 'border-[#FF7EB6]' : 'border-primary'}`} />
                        <div className={`absolute inset-0 -m-10 border-2 rounded-full animate-pulse ${isRitualFinished ? 'border-[#FF7EB6]/40' : 'border-primary/20'}`} />
                      </>
                    )}
                 </div>
                 {isRitualActive && !isRitualFinished && (
                    <div className="mt-12 text-center">
                      <div className="bg-black/60 px-3 py-1 rounded-full border border-primary/40 text-[10px] text-primary font-black uppercase tracking-widest animate-pulse">
                        {formatTime(state.activeBreeding!.endTime - now)}
                      </div>
                    </div>
                 )}
              </div>

              <div className="relative flex flex-col items-center">
                {!slot2Slime && (
                  <>
                    <div className="absolute -inset-6 bg-primary/10 rounded-full animate-spirit-pulse blur-xl" />
                    <div className="absolute bottom-6 w-16 h-40 bg-gradient-to-t from-primary/40 via-primary/10 to-transparent animate-float-beam pointer-events-none" style={{ borderRadius: '50% 50% 0 0' }} />
                    <div className={`absolute -top-12 text-[14px] text-[#FF7EB6] animate-soft-inscription-glow font-black uppercase tracking-widest whitespace-nowrap transition-opacity duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${isAltarHovered ? 'opacity-100' : 'opacity-60'}`}>
                      Invoke Parent
                    </div>
                  </>
                )}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative group/pedestal ${slot2Slime ? 'scale-110 filter drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]' : 'bg-primary/10 border-b-4 border-primary/30 hover:bg-primary/20 cursor-pointer shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]'} ${isRitualActive ? 'brightness-75' : ''}`}
                  onDragOver={handleDragOver} onDrop={handleDrop(2)} onClick={() => !isRitualActive && onRequestGallery?.(2)}
                  onMouseEnter={() => { setHoveredSlot(2); setIsAltarHovered(true); }} onMouseLeave={() => { setHoveredSlot(null); setIsAltarHovered(false); }}>
                  {slot2Slime ? (
                    <>
                      <SlimeCanvas slime={slot2Slime} size={110} animated={true} />
                      {!isRitualActive && (
                        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SET_BREED_SLOT', slot: 2, id: null }); }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF7EB6] text-black rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/pedestal:opacity-100 hover:scale-110 active:scale-90 transition-all border-2 border-black z-20">
                          <X className="w-4 h-4 stroke-[4px]" />
                        </button>
                      )}
                    </>
                  ) : <div className="opacity-40 transition-opacity hover:opacity-80 animate-pulse"><Sparkles className="w-14 h-14 text-primary" strokeWidth={1.5} /></div>}
                  {isRitualActive && <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse flex items-center justify-center"><Timer className="w-8 h-8 text-primary animate-spin-slow" /></div>}
                  <div className="absolute -bottom-2 w-24 h-6 bg-primary/20 rounded-[100%] blur-md pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center">
          {isRitualFinished ? (
            <button onClick={handleCollectEgg}
              className="group relative px-10 py-4 overflow-hidden bg-black text-[#FF7EB6] rounded-2xl border-[4px] border-[#FF7EB6] hover:bg-[#FF7EB6] hover:text-black active:scale-95 transition-all shadow-[0_0_30px_rgba(255,126,182,0.4)] animate-bounce flex items-center gap-4">
              <ButtonEggCanvas slime={state.activeBreeding!.resultSlime} />
              <span className="text-[12px] tracking-[0.2em] font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                COLLECT SLIME EGG
              </span>
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </button>
          ) : slot1Slime && slot2Slime && !isRitualActive ? (
            <div className="scale-110">
              <button onClick={handleStartRitual}
                className="group relative px-10 py-3 overflow-hidden bg-primary text-primary-foreground rounded-lg border-[3px] border-primary/50 hover:brightness-125 active:scale-95 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                <div className="relative z-10 flex items-center gap-4">
                  <Sparkles className="w-5 h-5 animate-spin-slow text-accent" />
                  <span className="text-[11px] tracking-[0.3em] font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                    BEGIN RITUAL
                  </span>
                  <Sparkles className="w-5 h-5 animate-spin-slow text-accent" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          ) : isRitualActive ? (
            <p className="text-primary text-xs uppercase tracking-widest font-black animate-pulse bg-black/20 px-4 py-2 rounded-full border border-primary/20">
               Slimes are Communing...
            </p>
          ) : null}
        </div>

        {possibleOffspring.length > 0 && !isRitualActive && (
          <div className="w-full mt-6 max-w-lg bg-black/10 backdrop-blur-md p-5 rounded-3xl border-2 border-primary/20 animate-scale-in shadow-xl">
            <h3 className="text-primary mb-4 text-center uppercase tracking-[0.2em] font-bold" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px' }}>
              Elemental Projections
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none justify-center">
              {possibleOffspring.map((preview, i) => (
                <div key={i} className="flex flex-col items-center flex-shrink-0 p-3 rounded-2xl bg-white/10 border-2 border-primary/10 hover:border-primary/40 transition-all hover:scale-105">
                  <SlimeCanvas slime={preview} size={56} animated />
                  <span className="text-[8px] font-black mt-2 uppercase" style={{ color: RARITY_TIER_COLORS[preview.rarityTier] }}>
                    {preview.rarityTier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <BreedHistory />
      </div>
    </div>
  );
}
