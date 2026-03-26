import { useGameState } from '@/hooks/useGameState';
import { useState } from 'react';
import { audioEngine } from '@/utils/audioEngine';
import { Volume2, VolumeX, Trophy, ChevronLeft, Castle, Sword, Home, Ghost } from 'lucide-react';
import { FairySparkle } from './FairySparkle';
import { Achievements } from './Achievements';
import { Sanctuaries } from './Sanctuaries';

// Custom slime world icons
const CauldronIcon = () => (
  <div className="w-5 h-5 relative">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full"></div>
    <div className="absolute inset-1 bg-purple-700 rounded-full flex items-center justify-center">
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
    </div>
    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-purple-300 rounded-full animate-bounce"></div>
  </div>
);

const CrystalCaveIcon = () => (
  <div className="w-5 h-5 relative">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rotate-45 transform"></div>
    <div className="absolute inset-1 bg-cyan-500 rotate-45 transform flex items-center justify-center">
      <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
    </div>
  </div>
);

const TreasureMapIcon = () => (
  <div className="w-5 h-5 relative">
    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-700 rounded border border-red-800"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
    <div className="absolute top-1 right-1 w-1 h-1 bg-red-400 rounded-full"></div>
  </div>
);

// Slime drip effect component
const SlimeDrip = ({ delay, color }: { delay: number; color: string }) => (
  <div 
    className="absolute bottom-0 w-2 h-4 opacity-60 animate-bounce"
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: '3s',
      left: `${Math.random() * 100}%`
    }}
  >
    <div 
      className="w-full h-full rounded-b-full"
      style={{ backgroundColor: color }}
    ></div>
    <div 
      className="absolute bottom-0 w-1 h-2 rounded-b-full opacity-40"
      style={{ backgroundColor: color }}
    ></div>
  </div>
);

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

  // Grand game HUD styling with themed colors
  const getNavStyle = (viewType: 'altar' | 'sanctuaries' | 'battleMap', isActive: boolean) => {
    const baseStyle = "text-[16px] font-black uppercase tracking-[0.2em] transition-all hover:scale-110 p-3 m-0 outline-none rounded-lg border-2 flex items-center gap-2";
    
    if (isActive) {
      switch (viewType) {
        case 'altar':
          return `${baseStyle} text-yellow-300 border-yellow-400 bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 shadow-lg shadow-yellow-500/50`;
        case 'sanctuaries':
          return `${baseStyle} text-cyan-300 border-cyan-400 bg-gradient-to-r from-cyan-600/20 to-blue-700/20 shadow-lg shadow-cyan-500/50`;
        case 'battleMap':
          return `${baseStyle} text-red-300 border-red-400 bg-gradient-to-r from-red-600/20 to-orange-700/20 shadow-lg shadow-red-500/50`;
        default:
          return baseStyle;
      }
    } else {
      switch (viewType) {
        case 'altar':
          return `${baseStyle} text-yellow-500 border-yellow-600/50 hover:border-yellow-400 hover:bg-yellow-600/10`;
        case 'sanctuaries':
          return `${baseStyle} text-cyan-500 border-cyan-600/50 hover:border-cyan-400 hover:bg-cyan-600/10`;
        case 'battleMap':
          return `${baseStyle} text-red-500 border-red-600/50 hover:border-red-400 hover:bg-red-600/10`;
        default:
          return baseStyle;
      }
    }
  };
  const manualReset = {
    background: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    filter: 'none'
  };

  return (
    <>
      <div className="flex items-center justify-between px-12 py-8 bg-transparent relative z-[60] pointer-events-none">
        
        <div className="flex items-center gap-8 pointer-events-auto">
          <h1 className="text-[20px] text-[#FF7EB6] tracking-tight font-black uppercase italic relative" style={{ fontFamily: "'Press Start 2P', cursive", ...manualReset }}>
            {/* Glow behind logo */}
            <div className="absolute inset-0 blur-xl opacity-50 scale-110">
              SLIME FORGE
            </div>
            {/* Main logo text */}
            <span className="relative z-10">SLIME FORGE</span>
          </h1>
          
          {/* Styled Level Badge */}
          <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 px-4 py-2 rounded-full border-2 border-yellow-300 shadow-lg shadow-yellow-500/50">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-50"></div>
            <div className="relative flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                {/* Mini gold slime avatar */}
                <div className="w-4 h-4 bg-yellow-500 rounded-full border border-yellow-600"></div>
              </div>
              <span className="text-[12px] text-yellow-900 font-black uppercase tracking-widest">Lv.{playerLevel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 pointer-events-auto">
          {/* Navigation Buttons */}
          <button
            onClick={onBackToAltar}
            className={getNavStyle('altar', currentView === 'breeding')}
            style={manualReset}
          >
            <CauldronIcon />
            Altar
          </button>
          
          <button
            onClick={onOpenSanctuaries}
            className={`${getNavStyle('sanctuaries', currentView === 'sanctuaries')} relative group`}
            style={manualReset}
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {[...Array(6)].map((_, i) => <FairySparkle key={i} index={i} />)}
            </div>
            <CrystalCaveIcon />
            Sanctuaries
          </button>
          
          <button
            onClick={onOpenBattle}
            className={getNavStyle('battleMap', currentView === 'battleMap')}
            style={manualReset}
          >
            <TreasureMapIcon />
            Battle Map
          </button>
        </div>
      </div>

      {/* Slime Drip Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none overflow-hidden">
        <SlimeDrip delay={0} color="#FF7EB6" />
        <SlimeDrip delay={0.5} color="#FF7EB6" />
        <SlimeDrip delay={1} color="#FF7EB6" />
        <SlimeDrip delay={1.5} color="#FF7EB6" />
        <SlimeDrip delay={2} color="#FF7EB6" />
        <SlimeDrip delay={2.5} color="#FF7EB6" />
        <SlimeDrip delay={3} color="#FF7EB6" />
      </div>

      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}
    </>
  );
}
