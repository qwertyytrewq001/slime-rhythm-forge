import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Sparkles, Trophy, ArrowUpCircle, X, Star } from 'lucide-react';
import { audioEngine } from '@/utils/audioEngine';
import { FairySparkle } from './FairySparkle';

export function EvolutionPopup() {
  const { state, dispatch } = useGameState();
  const [isVisible, setIsVisible] = useState(false);
  const [localEvolution, setLocalEvolution] = useState<typeof state.lastEvolution>(null);

  useEffect(() => {
    if (state.lastEvolution && !isVisible) {
      setLocalEvolution(state.lastEvolution);
      setIsVisible(true);
      audioEngine.playSfx('achievement');
      
      // Auto-hide after 4 seconds if not clicked
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.lastEvolution]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation
    setTimeout(() => {
      dispatch({ type: 'CLEAR_EVOLUTION' });
      setLocalEvolution(null);
    }, 500);
  };

  if (!localEvolution && !isVisible) return null;

  const slime = state.slimes.find(s => s.id === localEvolution?.slimeId);
  if (!slime && isVisible) return null;

  const stageColors = {
    baby: 'from-pink-400 to-pink-600',
    teen: 'from-purple-400 to-purple-600', 
    adult: 'from-blue-400 to-blue-600'
  };

  const currentColor = stageColors[localEvolution?.stage as keyof typeof stageColors] || 'from-pink-400 to-pink-600';

  return (
    <div 
      className={`fixed top-32 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-90'
      }`}
    >
      <div className="relative pointer-events-auto cursor-pointer" onClick={handleClose}>
        {/* Background Glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentColor}/40 blur-2xl animate-pulse rounded-full`} />
        
        {/* Main Banner */}
        <div className="relative bg-white/90 backdrop-blur-xl border-4 border-[#FF7EB6] px-8 py-6 rounded-3xl shadow-[0_0_40px_rgba(255,126,182,0.4)] flex items-center gap-6 overflow-hidden">
          {/* Close Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
          >
            <X className="w-3 h-3 text-gray-600" />
          </button>

          {/* Sparkles Decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <Star 
                key={i} 
                className={`absolute w-4 h-4 text-[#FFD700] fill-current animate-ping opacity-20`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>

          {/* Slime Portrait */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-[#FF7EB6]/20 flex items-center justify-center shrink-0 shadow-inner">
            {slime && <SlimeCanvas slime={slime} size={80} animated />}
            {/* Evolution Badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-[#FF7EB6] to-pink-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <ArrowUpCircle className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#FF7EB6] animate-bounce" />
              <span className="text-[10px] font-black text-[#FF7EB6] uppercase tracking-[0.2em] animate-pulse">
                EVOLUTION COMPLETE!
              </span>
              <Trophy className="w-4 h-4 text-[#FFD700] fill-current" />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {slime?.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold text-slate-400">Stage {localEvolution?.stage}</span>
              <ArrowUpCircle className="w-4 h-4 text-[#40E0D0] animate-bounce" />
              <span className="text-lg font-black bg-gradient-to-r from-[#FF7EB6] to-purple-600 bg-clip-text text-transparent">
                {localEvolution?.stage === 'teen' ? 'Teen' : localEvolution?.stage === 'adult' ? 'Adult' : 'Baby'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Your spirit has evolved!
            </p>
          </div>

          {/* Floating Particles Around */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <FairySparkle key={i} index={i} color={i % 2 === 0 ? "#FF7EB6" : "#40E0D0"} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
