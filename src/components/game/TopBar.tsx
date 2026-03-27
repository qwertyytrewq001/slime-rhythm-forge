import React, { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { FairySparkle } from './FairySparkle';
import { Achievements } from './Achievements';

interface TopBarProps {
  onBackToAltar?: () => void;
  onOpenHabitats?: () => void;
  onOpenBattle?: () => void;
  onOpenSanctuaries?: () => void;
  currentView?: 'breeding' | 'habitats' | 'battleMap' | 'sanctuaries';
}

export function TopBar({ onBackToAltar, onOpenSanctuaries, onOpenBattle, currentView }: TopBarProps) {
  const { playerLevel } = useGameState();
  const [showAchievements, setShowAchievements] = useState(false);

  // Simple clean styling with hover effects and explicit font control
  const navStyle = "text-[14px] font-black uppercase tracking-[0.2em] transition-all duration-200 hover:text-white hover:scale-105 p-0 m-0 outline-none bg-transparent border-none flex items-start gap-1.5";
  
  // Explicit font control to prevent conflicts
  const textStyle: React.CSSProperties = {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '14px',
    fontWeight: 'black' as const,
    textTransform: 'uppercase' as const
  };
  
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
      <div className="flex justify-between px-4 pt-[5px] pb-[135px] bg-transparent relative z-[60] pointer-events-none">
        
        {/* Far top left navigation */}
        <div className="flex items-start gap-1 pointer-events-auto">
          {currentView === 'breeding' && (
            <button
              onClick={onOpenSanctuaries}
              className={`${navStyle} ${getGlowStyle('sanctuaries')} relative group`}
              style={{ display: 'flex', alignItems: 'center', gap: '1px' }}
            >
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {[...Array(6)].map((_, i) => <FairySparkle key={i} index={i} />)}
              </div>
              <img 
                src={`${import.meta.env.BASE_URL}habitats_icon.png`} 
                alt="Sanctuaries" 
                style={{ width: 'auto', height: '64px', objectFit: 'contain' }}
              />
              <span className="text-game-ui" style={{ 
                fontFamily: "'Fredoka', 'Comic Sans MS', cursive, sans-serif",
                fontSize: '16px',
                color: '#c4ffb2'
              }}>SANCTUARIES</span>
            </button>
          )}
          
          {currentView === 'sanctuaries' && (
            <button
              onClick={onBackToAltar}
              className={`${navStyle} ${getGlowStyle('altar')}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1px' }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}altar_icon.png`} 
                alt="Altar" 
                style={{ width: 'auto', height: '64px', objectFit: 'contain' }}
              />
              <span className="text-game-ui" style={{ 
                fontFamily: "'Fredoka', 'Comic Sans MS', cursive, sans-serif",
                fontSize: '16px',
                color: '#b2ebff'
              }}>ALTAR</span>
            </button>
          )}
          
          {currentView === 'battleMap' && (
            <button
              onClick={onBackToAltar}
              className={`${navStyle} ${getGlowStyle('altar')}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1px' }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}altar_icon.png`} 
                alt="Altar" 
                style={{ width: 'auto', height: '64px', objectFit: 'contain' }}
              />
              <span className="text-game-ui" style={{ 
                fontFamily: "'Fredoka', 'Comic Sans MS', cursive, sans-serif",
                fontSize: '16px',
                color: '#b2ebff'
              }}>ALTAR</span>
            </button>
          )}
        </div>

        {/* Far top right navigation */}
        <div className="flex items-start gap-1 pointer-events-auto">
          {currentView === 'breeding' && (
            <button
              onClick={onOpenBattle}
              className={`${navStyle} ${getGlowStyle('battleMap')}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1px' }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}battlemap_icon (1).png`} 
                alt="Battle Map" 
                style={{ width: 'auto', height: '64px', objectFit: 'contain' }}
              />
              <span className="text-game-ui" style={{ 
                fontFamily: "'Fredoka', 'Comic Sans MS', cursive, sans-serif",
                fontSize: '16px',
                color: '#ffe066'
              }}>BATTLE MAP</span>
            </button>
          )}
          
          {currentView === 'sanctuaries' && (
            <button
              onClick={onOpenBattle}
              className={`${navStyle} ${getGlowStyle('battleMap')}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1px' }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}battlemap_icon (1).png`} 
                alt="Battle Map" 
                style={{ width: 'auto', height: '64px', objectFit: 'contain' }}
              />
              <span className="text-game-ui" style={{ 
                fontFamily: "'Fredoka', 'Comic Sans MS', cursive, sans-serif",
                fontSize: '16px',
                color: '#ffe066'
              }}>BATTLE MAP</span>
            </button>
          )}
          
          {currentView === 'battleMap' && (
            <button
              onClick={onOpenSanctuaries}
              className={`${navStyle} ${getGlowStyle('sanctuaries')} relative group`}
              style={{ display: 'flex', alignItems: 'center', gap: '1px' }}
            >
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {[...Array(6)].map((_, i) => <FairySparkle key={i} index={i} />)}
              </div>
              <img 
                src={`${import.meta.env.BASE_URL}habitats_icon.png`} 
                alt="Sanctuaries" 
                style={{ width: 'auto', height: '64px', objectFit: 'contain' }}
              />
              <span className="text-game-ui" style={{ 
                fontFamily: "'Fredoka', 'Comic Sans MS', cursive, sans-serif",
                fontSize: '16px',
                color: '#c4ffb2'
              }}>SANCTUARIES</span>
            </button>
          )}
        </div>
      </div>

      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}
    </>
  );
}
