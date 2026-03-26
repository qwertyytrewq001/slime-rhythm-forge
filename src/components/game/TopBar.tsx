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

  // Simple clean styling with hover effects
  const navStyle = "text-[14px] text-[#FF7EB6] font-black uppercase tracking-[0.2em] transition-all duration-200 hover:text-white hover:scale-105 p-0 m-0 outline-none bg-transparent border-none";
  const getGlowStyle = (viewType: 'altar' | 'sanctuaries' | 'battleMap') => {
    switch (viewType) {
      case 'altar':
        return 'hover:text-white hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.8)]';
      case 'sanctuaries':
        return 'hover:text-white hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]';
      case 'battleMap':
        return 'hover:text-white hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-12 py-[70px] bg-transparent relative z-[60] pointer-events-none">
        
        <div className="flex items-center gap-8 pointer-events-auto">
          <h1 className="text-[24px] text-[#FF7EB6] tracking-tight font-black uppercase italic" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            SLIME FORGE
          </h1>
          
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#FF7EB6] font-black uppercase tracking-widest">Lv.{playerLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-12 pointer-events-auto">
          {/* Navigation Buttons */}
          <button
            onClick={onBackToAltar}
            className={`${navStyle} ${getGlowStyle('altar')} ${currentView === 'breeding' ? 'text-white' : ''}`}
          >
            <span className="text-[14px] mr-1.5">🔮</span>
            Altar
          </button>
          
          <button
            onClick={onOpenSanctuaries}
            className={`${navStyle} ${getGlowStyle('sanctuaries')} ${currentView === 'sanctuaries' ? 'text-white' : ''} relative group`}
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {[...Array(6)].map((_, i) => <FairySparkle key={i} index={i} />)}
            </div>
            <span className="text-[14px] mr-1.5">💎</span>
            Sanctuaries
          </button>
          
          <button
            onClick={onOpenBattle}
            className={`${navStyle} ${getGlowStyle('battleMap')} ${currentView === 'battleMap' ? 'text-white' : ''}`}
          >
            <span className="text-[14px] mr-1.5">⚔️</span>
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
