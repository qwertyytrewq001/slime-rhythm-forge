import { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { formatTime } from './BreedingPod';
import { SlimeElement, Slime } from '@/types/slime';
import { ELEMENT_COLORS, ELEMENT_DISPLAY_NAMES } from '@/data/traitData';
import { Sparkles, Zap, Wand2 } from 'lucide-react';
import { audioEngine } from '@/utils/audioEngine';
import { DiscoveryPopup } from './DiscoveryPopup';

// Fairy Sparkle Mote for the bench
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

// Canvas component for drawing the egg on the bench
function HatchingEgg({ element, shaking }: { element: SlimeElement; shaking?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 80, 80);
    ctx.imageSmoothingEnabled = false;

    const colors = ELEMENT_COLORS[element] || ELEMENT_COLORS['nature'];
    const baseColor = colors[0];
    const accentColor = colors[1] || colors[0];

    ctx.save();
    ctx.translate(40, 40);
    
    // Draw Proper Egg Shape
    const drawEggPath = (c: CanvasRenderingContext2D, width: number, height: number) => {
      c.beginPath();
      c.moveTo(0, height/2);
      c.bezierCurveTo(width/2, height/2, width/2, -height/4, 0, -height/2);
      c.bezierCurveTo(-width/2, -height/4, -width/2, height/2, 0, height/2);
      c.closePath();
    };

    // Glow
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 15;

    // Body
    const grad = ctx.createRadialGradient(-5, -8, 2, 0, 0, 35);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.4, baseColor);
    grad.addColorStop(1, accentColor);
    ctx.fillStyle = grad;
    drawEggPath(ctx, 36, 46);
    ctx.fill();

    // Pattern
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    for(let i=0; i<5; i++) {
        const x = Math.sin(i*2) * 8;
        const y = Math.cos(i*3) * 12;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI*2);
        ctx.stroke();
    }

    ctx.restore();
  }, [element]);

  return (
    <canvas 
      ref={canvasRef} 
      width={80} 
      height={80} 
      className={`w-20 h-20 pixel-art ${shaking ? 'animate-wiggle' : 'animate-bounce'}`} 
      style={{ animationDuration: shaking ? '0.2s' : '3s' }} 
    />
  );
}

export function Hatchery() {
  const { state, dispatch } = useGameState();
  const [now, setNow] = useState(Date.now());
  const [isHovered, setIsHovered] = useState(false);
  const [isHatching, setIsHatching] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
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

  const handleHatch = () => {
    if (!isFinished || !activeHatching || isHatching) return;
    
    setIsHatching(true);
    audioEngine.playSfx('achievement');

    setTimeout(() => {
      const slime = activeHatching.slime;
      dispatch({ type: 'ADD_SLIME', slime });
      dispatch({ type: 'SELECT_SLIME', id: slime.id });
      dispatch({ type: 'SET_BEST_RARITY', score: slime.rarityScore });
      dispatch({ type: 'ADD_GOO', amount: 500 });
      setShowDiscovery(true);
      dispatch({ type: 'FINISH_HATCHING' });
      setIsHatching(false);
    }, 1500);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed top-[78%] left-[68%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 group/hatchery"
    >
      {showDiscovery && activeHatching?.slime && (
        <DiscoveryPopup 
          slime={activeHatching.slime} 
          reason={`Born from the Mystic Bench after a specialized incubation ritual.`}
          onClose={() => setShowDiscovery(false)}
        />
      )}

      {/* Visual Marker for the Bench Area - PERMANENTLY VISIBLE */}
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

      {/* BENCH INTERACTION AREA */}
      <div className="relative w-56 h-56 flex items-center justify-center cursor-pointer group pointer-events-auto">
        
        {/* PERMANENT Fairy Dust Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(20)].map((_, i) => <FairySparkle key={i} index={i} />)}
          
          {/* The Specific 'Here the egg goes' Glow - MORE INTENSE */}
          {!activeHatching && (
            <div className={`absolute left-[65%] top-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF7EB6]/50 blur-2xl animate-soft-pulse shadow-[0_0_40px_#FF7EB6] border-2 border-[#FF7EB6]/30 transition-all duration-500 ${isHovered ? 'w-24 h-28 opacity-100' : 'w-16 h-20 opacity-70'}`} />
          )}
        </div>

        {/* Bench Shadow/Glow */}
        <div className={`absolute bottom-8 w-32 h-8 rounded-[100%] blur-2xl transition-all duration-1000 ${activeHatching ? 'bg-[#FF7EB6]/30 opacity-100 shadow-[0_0_25px_#FF7EB6]' : 'bg-primary/10 opacity-40'}`} />

        {!activeHatching ? (
          <div className="flex flex-col items-center gap-2 translate-y-6">
            <div className={`transition-all duration-500 text-center ${isHovered ? 'opacity-100 scale-110' : 'opacity-40'}`}>
              {/* Star icon and text REMOVED as requested */}
              <div className="w-1 h-1" /> 
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center">
            
            {/* THE PLAYER'S EGG */}
            <div className="relative z-10 translate-x-12 translate-y-4" onClick={isFinished ? handleHatch : undefined}>
              <HatchingEgg element={activeHatching.slime.element} shaking={isHatching} />
              
              {/* Cracking FX */}
              {isFinished && !isHatching && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-20 h-20 text-[#FF7EB6] animate-ping opacity-70" />
                </div>
              )}

              {/* Interaction Prompt */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48">
                {isFinished ? (
                  <div className={`flex flex-col items-center ${isHatching ? 'animate-pulse' : 'animate-bounce'}`}>
                    <div className="text-[12px] text-[#FF7EB6] animate-inscription-glow font-black uppercase whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider">
                      {isHatching ? 'LIFE AWAKENS...' : 'READY TO HATCH!'}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-[14px] text-[#FF7EB6] font-black tracking-[0.2em] animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {formatTime(activeHatching.endTime - now)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Label for the Player's Egg */}
            {!isFinished && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap translate-x-12">
                <p className="text-[11px] text-[#FF7EB6] animate-inscription-glow font-black uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {ELEMENT_DISPLAY_NAMES[activeHatching.slime.element]} Spirit
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
