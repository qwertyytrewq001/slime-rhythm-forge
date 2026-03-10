import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Sparkles, Trophy, ArrowUpCircle, Star } from 'lucide-react';
import { audioEngine } from '@/utils/audioEngine';
import { FairySparkle } from './FairySparkle';

export function LevelUpPopup() {
  const { state, dispatch } = useGameState();
  const [isVisible, setIsVisible] = useState(false);
  const [localLevelUp, setLocalLevelUp] = useState<typeof state.lastLevelUp>(null);

  useEffect(() => {
    if (state.lastLevelUp && !isVisible) {
      setLocalLevelUp(state.lastLevelUp);
      setIsVisible(true);
      audioEngine.playSfx('achievement');
      
      // Auto-hide after 3 seconds if not clicked
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.lastLevelUp]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation
    setTimeout(() => {
      dispatch({ type: 'CLEAR_LEVEL_UP' });
      setLocalLevelUp(null);
    }, 500);
  };

  if (!localLevelUp && !isVisible) return null;

  const slime = state.slimes.find(s => s.id === localLevelUp?.slimeId);
  if (!slime && isVisible) return null;

  return (
    <div 
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-90'
      }`}
    >
      <div className="relative pointer-events-auto cursor-pointer" onClick={handleClose}>
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF7EB6]/40 via-[#40E0D0]/40 to-[#FF7EB6]/40 blur-2xl animate-pulse rounded-full" />
        
        {/* Main Banner */}
        <div className="relative bg-white/90 backdrop-blur-xl border-4 border-[#FF7EB6] px-8 py-4 rounded-3xl shadow-[0_0_30px_rgba(255,126,182,0.3)] flex items-center gap-6 overflow-hidden">
          {/* Sparkles Decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <Star 
                key={i} 
                className={`absolute w-4 h-4 text-[#FFD700] fill-current animate-ping opacity-20`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>

          {/* Slime Portrait */}
          <div className="relative w-16 h-16 bg-white rounded-2xl border-2 border-[#FF7EB6]/20 flex items-center justify-center shrink-0">
            {slime && <SlimeCanvas slime={slime} size={60} animated />}
          </div>

          {/* Text Content */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#FF7EB6] uppercase tracking-[0.2em] animate-pulse">
                Resonance Boosted!
              </span>
              <Trophy className="w-3 h-3 text-[#FFD700] fill-current" />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {localLevelUp?.slimeName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-400">Level {localLevelUp?.oldLevel}</span>
              <ArrowUpCircle className="w-4 h-4 text-[#40E0D0] animate-bounce" />
              <span className="text-lg font-black text-[#40E0D0]">Level {localLevelUp?.newLevel}</span>
            </div>
          </div>

          {/* Floating Particles Around */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <FairySparkle key={i} index={i} color={i % 2 === 0 ? "#FF7EB6" : "#40E0D0"} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
