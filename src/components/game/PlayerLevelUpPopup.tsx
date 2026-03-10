import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Trophy, Star, Sparkles, ChevronRight, Lock, Unlock, LayoutGrid, Egg } from 'lucide-react';
import { audioEngine } from '@/utils/audioEngine';
import { FairySparkle } from './FairySparkle';
import { ELEMENT_TIERS, ELEMENT_DISPLAY_NAMES } from '@/data/traitData';

export function PlayerLevelUpPopup() {
  const { state, dispatch } = useGameState();
  const [isVisible, setIsVisible] = useState(false);
  const [localLevelUp, setLocalLevelUp] = useState<typeof state.lastPlayerLevelUp>(null);

  useEffect(() => {
    if (state.lastPlayerLevelUp && !isVisible) {
      setLocalLevelUp(state.lastPlayerLevelUp);
      setIsVisible(true);
      audioEngine.playSfx('achievement');
      
      // Keep it open until they click "Continue Journey"
    }
  }, [state.lastPlayerLevelUp]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      dispatch({ type: 'CLEAR_PLAYER_LEVEL_UP' });
      setLocalLevelUp(null);
    }, 500);
  };

  if (!localLevelUp && !isVisible) return null;

  const level = localLevelUp?.level || 0;
  
  // Determine what was unlocked
  const unlockedElements = level === 6 ? ELEMENT_TIERS[2] : level === 11 ? ELEMENT_TIERS[3] : [];
  const hasUnlocks = unlockedElements.length > 0;

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-700 ${
      isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#F8F5F2]/80 backdrop-blur-md" onClick={handleClose} />

      {/* Main Content Card */}
      <div className={`relative max-w-lg w-full mx-4 transition-all duration-700 transform ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'
      }`}>
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-[#FF7EB6]/30 to-transparent blur-3xl animate-pulse" />
        
        <div className="relative bg-white border-[6px] border-[#4A5D45] rounded-[40px] shadow-[0_20px_50px_rgba(74,93,69,0.2)] overflow-hidden">
          {/* Header Section */}
          <div className="bg-[#4A5D45] px-8 py-10 text-center relative overflow-hidden">
            {/* Animated Sparkles in Header */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <Sparkles 
                  key={i} 
                  className="absolute animate-pulse text-white"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-6 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Trophy className="w-10 h-10 text-[#FFD700] fill-current" />
              </div>
              <h2 className="text-white text-3xl font-black uppercase tracking-widest leading-none mb-2">
                Resonance Increased!
              </h2>
              <p className="text-[#F8F5F2]/80 text-sm font-bold uppercase tracking-[0.3em]">
                Your spirit has deepened
              </p>
            </div>
          </div>

          {/* Body Section */}
          <div className="px-10 py-10 flex flex-col items-center text-center">
            {/* Level Display */}
            <div className="flex items-center gap-6 mb-10">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Old</span>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                  <span className="text-xl font-black text-slate-400">{level - 1}</span>
                </div>
              </div>

              <ChevronRight className="w-8 h-8 text-[#4A5D45] animate-pulse" />

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-[#FF7EB6] uppercase tracking-widest mb-1 animate-bounce">New</span>
                <div className="w-20 h-20 rounded-3xl bg-[#FF7EB6] flex items-center justify-center border-4 border-[#FF7EB6] shadow-[0_10px_20px_rgba(255,126,182,0.3)] scale-110">
                  <span className="text-3xl font-black text-white leading-none">{level}</span>
                </div>
              </div>
            </div>

            {/* Unlocks Section */}
            {hasUnlocks ? (
              <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <div className="flex items-center gap-3 justify-center">
                  <Unlock className="w-5 h-5 text-[#4A5D45]" />
                  <h4 className="text-sm font-black text-[#4A5D45] uppercase tracking-widest">New Unlocks Discovered!</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8F5F2] p-4 rounded-3xl border-2 border-[#4A5D45]/10 flex flex-col items-center">
                    <Egg className="w-6 h-6 text-[#FF7EB6] mb-2" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Eggs</span>
                    <div className="flex flex-wrap justify-center gap-1">
                      {unlockedElements.slice(0, 3).map(e => (
                        <span key={e} className="text-[9px] font-black text-[#4A5D45] bg-white px-2 py-0.5 rounded-full border border-[#4A5D45]/20">
                          {ELEMENT_DISPLAY_NAMES[e]}
                        </span>
                      ))}
                      {unlockedElements.length > 3 && <span className="text-[9px] font-black text-slate-400">+{unlockedElements.length - 3}</span>}
                    </div>
                  </div>

                  <div className="bg-[#F8F5F2] p-4 rounded-3xl border-2 border-[#4A5D45]/10 flex flex-col items-center">
                    <LayoutGrid className="w-6 h-6 text-[#40E0D0] mb-2" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Habitats</span>
                    <div className="flex flex-wrap justify-center gap-1">
                      {unlockedElements.slice(0, 3).map(e => (
                        <span key={e} className="text-[9px] font-black text-[#4A5D45] bg-white px-2 py-0.5 rounded-full border border-[#4A5D45]/20">
                          {ELEMENT_DISPLAY_NAMES[e]}
                        </span>
                      ))}
                      {unlockedElements.length > 3 && <span className="text-[9px] font-black text-slate-400">+{unlockedElements.length - 3}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#F8F5F2] p-6 rounded-[30px] border-2 border-[#4A5D45]/10 max-w-sm">
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "Your resonance strengthens with every discovery. Continue your rituals to unlock deeper mysteries of the forge."
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleClose}
              className="mt-10 w-full bg-[#4A5D45] text-white py-6 rounded-[25px] font-black uppercase tracking-[0.25em] shadow-[0_10px_25px_rgba(74,93,69,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_15px_30px_rgba(74,93,69,0.4)]"
            >
              Continue Journey
            </button>
          </div>

          {/* Sparkles Background Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-50">
            {[...Array(15)].map((_, i) => (
              <FairySparkle key={i} index={i} color={i % 2 === 0 ? "#FF7EB6" : "#4A5D45"} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
