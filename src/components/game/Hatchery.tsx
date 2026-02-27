import { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { formatTime } from './BreedingPod';
import { SlimeElement, Slime } from '@/types/slime';
import { ELEMENT_COLORS, ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Sparkles, Zap, Wand2, MousePointer2, Trophy, X, ShoppingCart } from 'lucide-react';
import { audioEngine } from '@/utils/audioEngine';
import { drawEnhancedEgg } from '@/utils/eggRenderer';
import { SlimeCanvas } from './SlimeCanvas';
import { generateSlimeLore } from '@/utils/loreGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DiscoveryPopup } from './DiscoveryPopup';

const FairySparkle = ({ index }: { index: number }) => {
  const style = {
    '--tx': `${(Math.sin(index) * 40)}px`,
    '--ty': `${-20 - (Math.cos(index) * 30)}px`,
    left: `${40 + (Math.sin(index * 1.5) * 30)}%`,
    top: `${50 + (Math.cos(index * 1.2) * 20)}%`,
    animationDelay: `${index * 0.3}s`,
    backgroundColor: index % 2 === 0 ? '#FFD700' : '#FFFACD',
  } as React.CSSProperties;
  
  return (
    <div 
      className="absolute w-1 h-1 rounded-full blur-[1px] animate-fairy-sparkle pointer-events-none z-0"
      style={style}
    />
  );
};

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
    audioEngine.playSfx('achievement');
    setTimeout(() => {
      setDiscoveredSlime(activeHatching.slime);
      setIsHatching(false);
    }, 800);
  };

  const finalizeHatch = () => {
    if (!discoveredSlime) return;
    dispatch({ type: 'ADD_SLIME', slime: discoveredSlime });
    dispatch({ type: 'SELECT_SLIME', id: discoveredSlime.id });
    dispatch({ type: 'SET_BEST_RARITY', score: discoveredSlime.rarityScore });
    dispatch({ type: 'ADD_GOO', amount: 500 });
    dispatch({ type: 'FINISH_HATCHING' });
    setDiscoveredSlime(null);
    setCrackProgress(0);
  };

  const isRecentlyTapped = Date.now() - lastTapTime < 100;

  return (
    <div ref={containerRef} className="fixed top-[78%] left-[68%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 group/hatchery">
      {discoveredSlime && <DiscoveryPopup slime={discoveredSlime} reason="Hatched from an Ancient Egg" onClose={finalizeHatch} />}

      <div className="absolute inset-0 -top-24 flex flex-col items-center justify-center pointer-events-none z-10 translate-x-8">
        <div className={`transition-all duration-700 flex flex-col items-center opacity-100 ${isHovered ? 'scale-125' : 'scale-110'}`}>
           <div 
             className="flex flex-col items-center pointer-events-auto cursor-default"
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
           >
             <h3 className={`text-[12px] text-[#FF7EB6] uppercase tracking-[0.3em] font-black transition-all duration-300 ${isHovered ? 'animate-intense-inscription-glow' : 'animate-soft-inscription-glow'}`} style={{ fontFamily: "'Press Start 2P', cursive" }}>
               Ancient Hatchery
             </h3>
           </div>
        </div>
      </div>

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
