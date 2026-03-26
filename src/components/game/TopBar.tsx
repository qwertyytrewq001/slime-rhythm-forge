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

  // Aggressively clean style to ensure no "boxes" appear
  const navStyle = "text-[12px] text-[#FF7EB6] font-black uppercase tracking-[0.2em] transition-all hover:scale-110 bg-transparent border-none shadow-none backdrop-blur-none p-0 m-0 outline-none";

  return (
    <>
      <div className="flex items-center justify-between px-10 py-6 bg-transparent relative z-50 pointer-events-none">
        
        <div className="flex items-center gap-6 pointer-events-auto">
          <h1 className="text-[14px] text-[#FF7EB6] tracking-tight font-black uppercase italic" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            Slime Forge
          </h1>
          <div className="flex items-center gap-2 bg-transparent px-3 py-1.5 border-none shadow-none backdrop-blur-none">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] text-[#FF7EB6] font-black uppercase tracking-widest">Lv.{playerLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-8 pointer-events-auto">
          {/* Navigation Buttons */}
          <button
            onClick={onBackToAltar}
            className={`${navStyle} ${currentView === 'breeding' ? 'text-white' : ''}`}
          >
            Altar
          </button>
          
          <button
            onClick={onOpenSanctuaries}
            className={`${navStyle} ${currentView === 'sanctuaries' ? 'text-white border-b-2 border-white pb-1' : ''} relative group`}
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {[...Array(6)].map((_, i) => <FairySparkle key={i} index={i} />)}
            </div>
            Sanctuaries
          </button>
          
          <button
            onClick={onOpenBattle}
            className={`${navStyle} ${currentView === 'battleMap' ? 'text-white border-b-2 border-white pb-1' : ''}`}
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
