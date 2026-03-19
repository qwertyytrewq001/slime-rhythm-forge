import React from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Lock, Play } from 'lucide-react';

interface WorldMapProps {
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

/**
 * Coordinate Map for Battle Levels
 * Percentage-based (0-100) to match the background image 'battle map.png'
 */
const LEVEL_NODES: Record<number, { x: number; y: number }> = {
  // Region 1: Starting Dock & Lowlands (Bottom Left)
  1: { x: 12, y: 88 }, 2: { x: 18, y: 84 }, 3: { x: 24, y: 82 }, 4: { x: 30, y: 85 }, 5: { x: 36, y: 80 },
  // Region 2: The Winding River
  6: { x: 34, y: 72 }, 7: { x: 28, y: 68 }, 8: { x: 22, y: 65 }, 9: { x: 16, y: 60 }, 10: { x: 12, y: 52 },
  // Region 3: Forest Ascent
  11: { x: 18, y: 46 }, 12: { x: 25, y: 42 }, 13: { x: 32, y: 45 }, 14: { x: 40, y: 48 }, 15: { x: 48, y: 44 },
  // Region 4: Central Plains
  16: { x: 55, y: 50 }, 17: { x: 62, y: 54 }, 18: { x: 70, y: 56 }, 19: { x: 78, y: 52 }, 20: { x: 84, y: 46 },
  // Region 5: Rocky Highlands
  21: { x: 80, y: 38 }, 22: { x: 72, y: 34 }, 23: { x: 65, y: 30 }, 24: { x: 58, y: 28 }, 25: { x: 50, y: 32 },
  // Region 6: Swampy Hollow
  26: { x: 42, y: 36 }, 27: { x: 35, y: 32 }, 28: { x: 28, y: 28 }, 29: { x: 22, y: 22 }, 30: { x: 15, y: 18 },
  // Region 7: Peak Approaches
  31: { x: 22, y: 12 }, 32: { x: 30, y: 10 }, 33: { x: 38, y: 12 }, 34: { x: 45, y: 15 }, 35: { x: 52, y: 18 },
  // Region 8: Skyward Path
  36: { x: 60, y: 22 }, 37: { x: 68, y: 20 }, 38: { x: 75, y: 18 }, 39: { x: 82, y: 15 }, 40: { x: 90, y: 12 },
  // Region 9: Ancient Spire (Top Middle)
  41: { x: 85, y: 6 }, 42: { x: 78, y: 4 }, 43: { x: 70, y: 6 }, 44: { x: 62, y: 8 }, 45: { x: 54, y: 6 },
  // Region 10: The Castle / Final Spire
  46: { x: 48, y: 4 }, 47: { x: 52, y: 8 }, 48: { x: 50, y: 12 }, 49: { x: 54, y: 14 }, 50: { x: 50, y: 2 },
};

export const WorldMap: React.FC<WorldMapProps> = ({ onSelectLevel, onClose }) => {
  const { state } = useGameState();
  const unlockedLevel = state.currentLevel || 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in select-none pointer-events-auto">
      {/* The Map Background - Pure Art */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/battle map.png")' }}
      />
      
      {/* Hitbox Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {Object.entries(LEVEL_NODES).map(([lvl, pos]) => {
          const levelNum = parseInt(lvl);
          const isUnlocked = levelNum <= unlockedLevel;
          const isCurrent = levelNum === unlockedLevel;

          return (
            <div
              key={levelNum}
              className="absolute group pointer-events-auto"
              style={{ 
                left: `${pos.x}%`, 
                top: `${pos.y}%`, 
                width: '80px', 
                height: '80px', 
                transform: 'translate(-50%, -50%)' 
              }}
            >
              {/* The "Invisible" Hitbox Button */}
              <button
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(levelNum);
                  }
                }}
                className={`
                  w-full h-full rounded-full flex flex-col items-center justify-center
                  transition-all duration-300 relative
                  ${isUnlocked ? 'cursor-pointer hover:bg-white/10' : 'cursor-not-allowed'}
                `}
              >
                {/* Minimal Indicators sitting directly on top of the stones */}
                <div className={`
                  transition-all duration-300 flex flex-col items-center
                  ${isCurrent ? 'scale-150' : 'group-hover:scale-110'}
                `}>
                  {isUnlocked ? (
                    <>
                      {isCurrent ? (
                        <div className="animate-bounce flex flex-col items-center">
                          <Play className="w-8 h-8 text-white fill-white drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />
                          <span className="text-[8px] font-black text-white mt-1 drop-shadow-md">NOW</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-white/40 rounded-full blur-[1px] mb-1 group-hover:bg-white/80 transition-colors" />
                          <span 
                            className="text-[10px] font-black text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase"
                            style={{ fontFamily: "'Press Start 2P', cursive" }}
                          >
                            {levelNum}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="opacity-40">
                      <Lock className="w-5 h-5 text-white/50 drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Secret Hitbox Glow (Only visible on hover if unlocked) */}
                {isUnlocked && (
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Subtle Close Button (Top Right) */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full border border-white/20 text-white/60 hover:text-white hover:bg-black/60 transition-all pointer-events-auto"
      >
        <span className="text-xl font-bold">×</span>
      </button>
    </div>
  );
};
