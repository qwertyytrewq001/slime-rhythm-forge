import { useGameState } from '@/hooks/useGameState';
import { useState } from 'react';
import { audioEngine } from '@/utils/audioEngine';
import { Volume2, VolumeX, Trophy, ChevronLeft, Castle, Sword, Home, Ghost } from 'lucide-react';
import { FairySparkle } from './FairySparkle';
import { Achievements } from './Achievements';
import { Sanctuaries } from './Sanctuaries';

interface TopBarProps {
  onBackToAltar?: () => void;
  onOpenSanctuaries?: () => void;
  onOpenBattle?: () => void;
  currentView?: 'breeding' | 'sanctuaries' | 'battleMap';
}

export function TopBar({ onBackToAltar, onOpenSanctuaries, onOpenBattle, currentView }: TopBarProps) {
  const { state, dispatch, playerLevel } = useGameState();
  const [showAchievements, setShowAchievements] = useState(false);

  const handleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    audioEngine.toggleMute();
  };

  // Cleaner navigation button style
  const navButtonStyle = "relative px-6 py-3 text-[14px] font-bold uppercase tracking-wider transition-all duration-200 border-2 rounded-lg backdrop-blur-sm";
  const activeNavStyle = "bg-white/20 border-white text-white shadow-lg shadow-white/20";
  const inactiveNavStyle = "bg-black/40 border-[#FF7EB6]/50 text-[#FF7EB6] hover:bg-black/60 hover:border-[#FF7EB6] hover:scale-105";

  return (
    <>
      <div className="flex items-center justify-between px-8 py-4 bg-transparent relative z-50 pointer-events-none">
        
        {/* Left Section - Game Title and Level */}
        <div className="flex items-center gap-8 pointer-events-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-[20px] text-white tracking-tight font-black" style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '2px 2px 0px rgba(0,0,0,0.8), 0 0 16px rgba(255,126,182,0.6)' }}>
              Slime Forge
            </h1>
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-[14px] text-white font-bold uppercase tracking-wider" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.8)' }}>Lv.{playerLevel}</span>
            </div>
          </div>
        </div>

        {/* Right Section - Navigation Buttons */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={onBackToAltar}
            className={`px-6 py-3 text-[14px] font-bold uppercase tracking-wider transition-all duration-200 ${currentView === 'breeding' ? 'text-white' : 'text-[#FF7EB6]'} hover:scale-105`}
            style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '2px 2px 0px rgba(0,0,0,0.8), 0 0 8px rgba(255,126,182,0.3)' }}
          >
            Altar
          </button>
          
          <button
            onClick={onOpenSanctuaries}
            className={`px-6 py-3 text-[14px] font-bold uppercase tracking-wider transition-all duration-200 ${currentView === 'sanctuaries' ? 'text-white' : 'text-[#FF7EB6]'} hover:scale-105 relative group`}
            style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '2px 2px 0px rgba(0,0,0,0.8), 0 0 8px rgba(255,126,182,0.3)' }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {[...Array(4)].map((_, i) => <FairySparkle key={i} index={i} />)}
            </div>
            Sanctuaries
          </button>
          
          <button
            onClick={onOpenBattle}
            className={`px-6 py-3 text-[14px] font-bold uppercase tracking-wider transition-all duration-200 ${currentView === 'battleMap' ? 'text-white' : 'text-[#FF7EB6]'} hover:scale-105`}
            style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '2px 2px 0px rgba(0,0,0,0.8), 0 0 8px rgba(255,126,182,0.3)' }}
          >
            Battle Map
          </button>
        </div>
      </div>

      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}
    </>
  );
}
