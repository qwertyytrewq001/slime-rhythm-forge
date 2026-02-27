import { useGameState } from '@/hooks/useGameState';
import { Volume2, VolumeX, Trophy } from 'lucide-react';
import { useState } from 'react';
import { audioEngine } from '@/utils/audioEngine';
import { Achievements } from './Achievements';

export function TopBar() {
  const { state, dispatch, playerLevel } = useGameState();
  const [showAchievements, setShowAchievements] = useState(false);

  const handleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    audioEngine.toggleMute();
  };

  return (
    <>
      <div className="flex items-center justify-between px-8 py-6 bg-transparent relative z-50 pointer-events-none"
        style={{ fontFamily: "'Press Start 2P', cursive" }}>

        <div className="flex items-center gap-6 pointer-events-auto">
          <h1 className="text-[12px] md:text-base text-[#FF7EB6] tracking-tighter font-black">
            RareSlime Forge
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-[11px] text-[#FF7EB6] font-black">Lv.{playerLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 pointer-events-auto">
          <button
            onClick={() => setShowAchievements(true)}
            className="p-2.5 hover:scale-125 transition-all relative"
            title="Achievements"
          >
            <Trophy className="w-7 h-7 text-[#FF7EB6] stroke-[3px]" />
          </button>

          <button
            onClick={handleMute}
            className="p-2.5 hover:scale-125 transition-all"
            title={state.muted ? 'Unmute' : 'Mute'}
          >
            {state.muted
              ? <VolumeX className="w-7 h-7 text-[#FF7EB6]/40 stroke-[3px]" />
              : <Volume2 className="w-7 h-7 text-[#FF7EB6] stroke-[3px]" />
            }
          </button>
        </div>
      </div>

      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}
    </>
  );
}
