import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { formatTime } from '@/utils/timeUtils';
import { SlimeElement, Slime } from '@/types/slime';
import { ELEMENT_COLORS, ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Sparkles, Zap, Wand2, MousePointer2, Trophy, X, ShoppingCart } from 'lucide-react';
import { audioEngine } from '@/utils/audioEngine';
import { drawEnhancedEgg } from '@/utils/eggRenderer';
import { SlimeCanvas } from './SlimeCanvas';
import { generateSlimeLore } from '@/utils/loreGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DiscoveryPopup } from './DiscoveryPopup';
import { FairySparkle } from './FairySparkle';

function HatchingEgg({ slime, crackProgress, shaking }: { slime: Slime; crackProgress: number; shaking?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawEnhancedEgg(ctx, {
      size: 140,
      slime,
      crackProgress,
      isShaking: shaking
    });
  }, [slime, crackProgress, shaking]);

  return (
    <canvas 
      ref={canvasRef} 
      width={140} 
      height={140} 
      className={`w-32 h-32 pixel-art transition-transform duration-75 ${shaking ? 'scale-110' : 'scale-100 hover:scale-105'}`}
    />
  );
}

export function Hatchery() {
  const { state, dispatch } = useGameState();
  const [now, setNow] = useState(Date.now());
  const [isHovered, setIsHovered] = useState(false);
  const [isHatching, setIsHatching] = useState(false);
  const [discoveredSlime, setDiscoveredSlime] = useState<Slime | null>(null);
  const [crackProgress, setCrackProgress] = useState(0);
  const [lastTapTime, setLastTapTap] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeHatching = state.activeHatching;
  const isFinished = activeHatching && now >= activeHatching.endTime;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.id = 'hatchery-bench';
    }
  }, []);

  useEffect(() => {
    if (!activeHatching) {
      setCrackProgress(0);
      setDiscoveredSlime(null);
    }
  }, [activeHatching]);

  const handleTap = () => {
    if (!isFinished || !activeHatching || isHatching || discoveredSlime) return;
    setCrackProgress(prev => Math.min(prev + 0.15, 1));
    setLastTapTap(Date.now());
    audioEngine.playSfx('tap');
    if (crackProgress >= 0.85) handleReveal();
  };

  const handleReveal = () => {
    if (!activeHatching) return;
    setIsHatching(true);
    audioEngine.playSfx('hatch');
    
    // Add slime to state immediately so it can be assigned to habitat in popup
    const newSlime = activeHatching.slime;
    dispatch({ type: 'ADD_SLIME', slime: newSlime });
    dispatch({ type: 'SELECT_SLIME', id: newSlime.id });
    dispatch({ type: 'SET_BEST_RARITY', score: newSlime.rarityScore });
    dispatch({ type: 'ADD_GOO', amount: 500 });
    
    setTimeout(() => {
      setDiscoveredSlime(newSlime);
      setIsHatching(false);
      audioEngine.playSfx('discovery');
    }, 800);
  };

  const finalizeHatch = () => {
    dispatch({ type: 'FINISH_HATCHING' });
    setDiscoveredSlime(null);
    setCrackProgress(0);
  };

  const isRecentlyTapped = Date.now() - lastTapTime < 100;

  return (
    <div ref={containerRef} className="fixed top-[78%] left-[68%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 group/hatchery">
      {discoveredSlime && <DiscoveryPopup slime={discoveredSlime} reason="Hatched from an Ancient Egg" onClose={finalizeHatch} />}

      <div className="relative w-56 h-56 flex items-center justify-center cursor-pointer group pointer-events-auto" onClick={handleTap}>
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(20)].map((_, i) => <FairySparkle key={i} index={i} />)}
          {!activeHatching && (
            <div className={`absolute left-[65%] top-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF7EB6]/50 blur-2xl animate-soft-pulse shadow-[0_0_40px_#FF7EB6] border-2 border-[#FF7EB6]/30 transition-all duration-500 ${isHovered ? 'w-24 h-28 opacity-100' : 'w-16 h-20 opacity-70'}`} />
          )}
        </div>
        <div className={`absolute bottom-8 w-32 h-8 rounded-[100%] blur-2xl transition-all duration-1000 ${activeHatching ? 'bg-[#FF7EB6]/30 opacity-100 shadow-[0_0_25px_#FF7EB6]' : 'bg-primary/10 opacity-40'}`} />
        {!activeHatching ? (
          <div className="flex flex-col items-center gap-2 translate-y-6"><div className="w-1 h-1" /></div>
        ) : (
          <div className="relative flex flex-col items-center">
            <div className="relative z-10 translate-x-12 translate-y-4">
              <HatchingEgg slime={activeHatching.slime} crackProgress={crackProgress} shaking={isRecentlyTapped || isHatching} />
              {isFinished && !isHatching && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Zap className={`w-20 h-20 text-[#FF7EB6] ${crackProgress > 0 ? 'animate-ping' : ''} opacity-70`} />
                </div>
              )}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 text-center pointer-events-none">
                {isFinished ? (
                  <div className={`flex flex-col items-center ${isHatching ? 'animate-pulse' : 'animate-bounce'}`}>
                    <div className="text-[12px] text-[#FF7EB6] animate-inscription-glow font-black uppercase whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider">
                      {isHatching ? 'LIFE AWAKENS...' : crackProgress > 0 ? 'TAP TO BREAK!' : 'READY TO HATCH!'}
                    </div>
                    {!isHatching && crackProgress === 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-white/60 uppercase font-bold animate-pulse"><MousePointer2 className="w-3 h-3" /> Click to Crack</div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-[14px] text-[#FF7EB6] font-black tracking-[0.2em] animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{formatTime(activeHatching.endTime - now)}</div>
                  </div>
                )}
              </div>
            </div>
            {!isFinished && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap translate-x-12">
                <p className="text-[11px] text-[#FF7EB6] animate-inscription-glow font-black uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{ELEMENT_DISPLAY_NAMES[activeHatching.slime.element]} Slime</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
