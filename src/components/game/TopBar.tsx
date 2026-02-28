import { useGameState } from '@/hooks/useGameState';
import { useState } from 'react';
import { audioEngine } from '@/utils/audioEngine';
import { Volume2, VolumeX, Trophy, ChevronLeft, Castle } from 'lucide-react';
import { FairySparkle } from './FairySparkle';

interface TopBarProps {
  onBackToAltar?: () => void;
  onOpenHabitats?: () => void;
  currentView?: 'breeding' | 'habitats';
}

export function TopBar({ onBackToAltar, onOpenHabitats, currentView }: TopBarProps) {
  const { state, dispatch, playerLevel } = useGameState();
  const [showAchievements, setShowAchievements] = useState(false);

  const handleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    audioEngine.toggleMute();
  };

  const navStyle = "text-[14px] text-[#FF7EB6] font-black uppercase tracking-[0.2em]";
  const iconStyle = "w-6 h-6 text-[#FF7EB6] stroke-[3px] transition-all hover:scale-125";

  return (
    <>
      <div className="flex items-center justify-between px-8 py-8 bg-transparent relative z-50 pointer-events-none"
        style={{ fontFamily: "'Press Start 2P', cursive" }}>

        <div className="flex items-center gap-8 pointer-events-auto">
          <h1 className="text-[18px] text-[#FF7EB6] tracking-tighter font-black">
            RareSlime Forge
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#FF7EB6] font-black">Lv.{playerLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-8 pointer-events-auto">
          {/* Navigation Buttons (Text Only) */}
          {currentView === 'habitats' ? (
             <button
              onClick={onBackToAltar}
              className={`px-4 py-2 bg-transparent transition-all hover:scale-110 group ${navStyle}`}
            >
              Altar
            </button>
          ) : (
             <div className="relative group">
               <button
                onClick={onOpenHabitats}
                className={`relative px-4 py-2 bg-transparent transition-all hover:scale-110 overflow-visible ${navStyle}`}
              >
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(10)].map((_, i) => <FairySparkle key={i} index={i} />)}
                </div>
                Sanctuaries
              </button>
             </div>
          )}
        </div>
      </div>

      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}
    </>
  );
}
