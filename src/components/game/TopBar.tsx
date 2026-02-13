import { useGameState } from '@/hooks/useGameState';
import { Volume2, VolumeX, Trophy } from 'lucide-react';
import { useState } from 'react';
import { audioEngine } from '@/utils/audioEngine';
import { Achievements } from './Achievements';

export function TopBar() {
  const { state, dispatch } = useGameState();
  const [showAchievements, setShowAchievements] = useState(false);

  const handleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    audioEngine.toggleMute();
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b-4 border-primary/30"
        style={{ fontFamily: "'Press Start 2P', cursive", imageRendering: 'pixelated' }}>
        <h1 className="text-sm md:text-base text-primary tracking-tight">
          🟢 RareSlime Forge
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-accent/30 px-3 py-1 rounded border-2 border-accent">
            <span className="text-lg">💧</span>
            <span className="text-xs text-accent-foreground font-bold">
              {Math.floor(state.goo).toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => setShowAchievements(true)}
            className="p-2 hover:bg-accent/20 rounded transition-colors relative"
            title="Achievements"
          >
            <Trophy className="w-4 h-4 text-accent-foreground" />
            {state.achievements.some(a => a.unlocked) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>

          <button
            onClick={handleMute}
            className="p-2 hover:bg-accent/20 rounded transition-colors"
            title={state.muted ? 'Unmute' : 'Mute'}
          >
            {state.muted
              ? <VolumeX className="w-4 h-4 text-muted-foreground" />
              : <Volume2 className="w-4 h-4 text-accent-foreground" />
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
