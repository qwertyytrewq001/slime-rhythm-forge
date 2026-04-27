import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { formatTime } from '@/utils/timeUtils';
import { Slime } from '@/types/slime';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Sparkles, Zap, MousePointer2, X } from 'lucide-react';
import { audioEngine } from '@/utils/audioEngine';
import { drawEnhancedEgg } from '@/utils/eggRenderer';
import { SlimeCanvas } from './SlimeCanvas';
import { FairySparkle } from './FairySparkle';
import { DiscoveryPopup } from './DiscoveryPopup';

interface HatcheryScreenProps {
  onClose: () => void;
}

function HatchingEgg({ slime, crackProgress, shaking }: { slime: Slime; crackProgress: number; shaking?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawEnhancedEgg(ctx, {
      size: 100,
      slime,
      crackProgress,
      isShaking: shaking
    });
  }, [slime, crackProgress, shaking]);

  return (
    <canvas 
      ref={canvasRef} 
      width={100} 
      height={100} 
      className={`w-24 h-24 pixel-art transition-transform duration-75 ${shaking ? 'scale-110' : 'scale-100 hover:scale-105'}`}
    />
  );
}

export function HatcheryScreen({ onClose }: HatcheryScreenProps) {
  const { state, dispatch } = useGameState();
  const [now, setNow] = useState(Date.now());
  const [isHatching, setIsHatching] = useState(false);
  const [discoveredSlime, setDiscoveredSlime] = useState<Slime | null>(null);
  const [crackProgress, setCrackProgress] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeHatching = state.activeHatching;
  const isFinished = activeHatching && now >= activeHatching.endTime;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.id = 'hatchery-screen';
    }
  }, []);

  useEffect(() => {
    if (!activeHatching) {
      setCrackProgress(0);
      setDiscoveredSlime(null);
    }
  }, [activeHatching]);

  const handleEggTap = () => {
    console.log('🥚 HatcheryScreen: Egg clicked!');
    
    // Only allow clicking when egg is finished cooking
    if (!isFinished || !activeHatching || isHatching || discoveredSlime) {
      console.log('❌ HatcheryScreen: Click blocked - egg not ready');
      return;
    }
    
    const newProgress = Math.min(crackProgress + 0.15, 1);
    console.log('🔨 HatcheryScreen: Cracking egg to', newProgress);
    
    setCrackProgress(newProgress);
    setLastTapTime(Date.now());
    audioEngine.playSfx('tap');
    
    if (newProgress >= 0.85) {
      console.log('🎉 HatcheryScreen: Egg ready to hatch!');
      handleReveal();
    }
  };

  const handleReveal = () => {
    if (!activeHatching) return;
    setIsHatching(true);
    audioEngine.playSfx('hatch');
    
    // Add slime to state immediately
    const newSlime = activeHatching.slime;
    dispatch({ type: 'ADD_SLIME', slime: newSlime });
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Main Hatchery Screen */}
      <div 
        ref={containerRef}
        className="relative w-full h-full max-w-6xl max-h-screen overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(./hatchery.png)' }}
        />
        
        {/* Dark overlay for better visibility */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-50 border-2 border-red-400/50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Central Nest Area - Egg positioned in the center of the nest */}
        {activeHatching ? (
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
            onClick={handleEggTap}
          >
            {/* Fairy sparkles around the nest */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {[...Array(20)].map((_, i) => <FairySparkle key={i} index={i} />)}
            </div>

            {/* Egg in nest center */}
            <div className="relative">
              <HatchingEgg slime={activeHatching.slime} crackProgress={crackProgress} shaking={isRecentlyTapped || isHatching} />
              
              {/* Zap icon when ready */}
              {isFinished && !isHatching && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Zap className={`w-16 h-16 text-[#FF7EB6] ${crackProgress > 0 ? 'animate-ping' : ''} opacity-70`} />
                </div>
              )}
            </div>

            {/* Status text */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 text-center pointer-events-none">
              {isFinished ? (
                <div className={`flex flex-col items-center ${isHatching ? 'animate-pulse' : 'animate-bounce'}`}>
                  <div className="text-[12px] text-[#FF7EB6] animate-inscription-glow font-black uppercase whitespace-nowrap tracking-wider drop-shadow-[0_2px_8px_rgba(255,126,182,0.4)]">
                    {isHatching ? 'LIFE AWAKENS...' : crackProgress > 0 ? 'TAP TO BREAK!' : 'READY TO HATCH!'}
                  </div>
                  {!isHatching && crackProgress === 0 && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-white/60 uppercase font-bold animate-pulse">
                      <MousePointer2 className="w-3 h-3" /> Click to Crack
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[14px] text-[#FF7EB6] font-black tracking-[0.2em] animate-pulse drop-shadow-[0_2px_8px_rgba(255,126,182,0.4)]">
                    {formatTime(activeHatching.endTime - now)}
                  </div>
                  <div className="text-[10px] text-white/60 uppercase font-bold">
                    {ELEMENT_DISPLAY_NAMES[activeHatching.slime.element]} Slime
                  </div>
                </div>
              )}
            </div>

                      </div>
        ) : (
          /* Empty nest state */
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-lg text-white/60 font-bold uppercase">
              No Egg in Nest
            </div>
            <div className="text-sm text-white/40 mt-2">
              Breed slimes to place an egg here
            </div>
          </div>
        )}
      </div>
    
    {/* Discovery Popup */}
    {discoveredSlime && (
      <DiscoveryPopup 
        slime={discoveredSlime} 
        reason="Hatched from an Ancient Egg" 
        onClose={finalizeHatch} 
      />
    )}
  </div>
  );
}
