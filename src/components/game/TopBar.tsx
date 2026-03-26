import { useGameState } from '@/hooks/useGameState';
import { useState } from 'react';
import { audioEngine } from '@/utils/audioEngine';
import { Volume2, VolumeX, Trophy, ChevronLeft, Castle, Sword, Home, Ghost } from 'lucide-react';
import { FairySparkle } from './FairySparkle';
import { Achievements } from './Achievements';

interface TopBarProps {
  onBackToAltar?: () => void;
  onOpenHabitats?: () => void;
  onOpenBattle?: () => void;
  currentView?: 'breeding' | 'habitats' | 'battleMap';
}

export function TopBar({ onBackToAltar, onOpenHabitats, onOpenBattle, currentView }: TopBarProps) {
  const { state, dispatch, playerLevel } = useGameState();
  const [showAchievements, setShowAchievements] = useState(false);

  const handleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    audioEngine.toggleMute();
  };

  const navStyle = "text-[12px] text-[#FF7EB6] font-black uppercase tracking-[0.2em] px-4 py-2 bg-transparent transition-all hover:scale-110";

  return (
    <>
      <div className="flex items-center justify-between px-10 py-6 bg-black/20 backdrop-blur-md border-b border-white/5 relative z-50 pointer-events-none shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        
        <div className="flex items-center gap-6 pointer-events-auto">
          <h1 className="text-[14px] text-[#FF7EB6] tracking-tight font-black uppercase italic" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            Slime Forge
          </h1>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#FF7EB6]/30 shadow-lg">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] text-[#FF7EB6] font-black uppercase tracking-widest">Lv.{playerLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Navigation Buttons */}
          <button
            onClick={onBackToAltar}
            className={`${navStyle} ${currentView === 'breeding' ? 'text-white' : ''}`}
          >
            Altar
          </button>
          
          <button
            onClick={onOpenHabitats}
            className={`${navStyle} ${currentView === 'habitats' ? 'text-white border-b-2 border-white' : ''} relative group`}
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {[...Array(6)].map((_, i) => <FairySparkle key={i} index={i} />)}
            </div>
            Sanctuaries
          </button>

          <button
            onClick={onOpenBattle}
            className={`${navStyle} ${currentView === 'battleMap' ? 'text-white border-b-2 border-white' : ''}`}
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
