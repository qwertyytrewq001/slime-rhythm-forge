import { useGameState } from '@/hooks/useGameState';
import { Volume2, VolumeX, Trophy } from 'lucide-react';
import { useState } from 'react';
import { audioEngine } from '@/utils/audioEngine';
import { Achievements } from './Achievements';
import { getUnlockedElements, ELEMENT_DISPLAY_NAMES, getElementTierForLevel } from '@/data/traitData';
import { Progress } from '@/components/ui/progress';

export function TopBar() {
  const { state, dispatch, playerLevel } = useGameState();
  const [showAchievements, setShowAchievements] = useState(false);
  const [showElements, setShowElements] = useState(false);

  const handleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    audioEngine.toggleMute();
  };

  const unlockedElements = getUnlockedElements(playerLevel);
  const tier = getElementTierForLevel(playerLevel);

  // Progress to next tier
  const nextTierLevel = tier === 1 ? 6 : tier === 2 ? 11 : null;
  const progressPct = nextTierLevel
    ? Math.min(100, ((playerLevel - (tier === 1 ? 1 : tier === 2 ? 6 : 11)) / (nextTierLevel - (tier === 1 ? 1 : 6))) * 100)
    : 100;

  return (
    <>
      <div className="flex items-center justify-between px-3 py-1.5 bg-card/90 backdrop-blur-sm border-b-2 border-primary/20"
        style={{ fontFamily: "'Press Start 2P', cursive" }}>

        <div className="flex items-center gap-3">
          <h1 className="text-[10px] md:text-xs text-primary tracking-tight">
            RareSlime Forge
          </h1>
          <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
            <span className="text-[8px] text-primary">Lv.{playerLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Unlocked Elements indicator */}
          <button
            onClick={() => setShowElements(!showElements)}
            className="text-[7px] text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded bg-muted/20"
          >
            {unlockedElements.length} Elements
          </button>

          <div className="flex items-center gap-1.5 bg-accent/20 px-2 py-0.5 rounded border border-accent/40">
            <span className="text-[9px] text-accent-foreground font-bold" style={{ fontFamily: "'VT323', monospace" }}>
              {Math.floor(state.goo).toLocaleString()} goo
            </span>
          </div>

          <button
            onClick={() => setShowAchievements(true)}
            className="p-1.5 hover:bg-accent/20 rounded transition-colors relative"
            title="Achievements"
          >
            <Trophy className="w-3.5 h-3.5 text-accent-foreground" />
          </button>

          <button
            onClick={handleMute}
            className="p-1.5 hover:bg-accent/20 rounded transition-colors"
            title={state.muted ? 'Unmute' : 'Mute'}
          >
            {state.muted
              ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
              : <Volume2 className="w-3.5 h-3.5 text-accent-foreground" />
            }
          </button>
        </div>
      </div>

      {/* Element unlock progress bar */}
      {nextTierLevel && (
        <div className="px-4 py-0.5 bg-card/60 border-b border-border/20">
          <div className="flex items-center gap-2">
            <span className="text-[7px] text-muted-foreground" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Tier {tier}
            </span>
            <Progress value={progressPct} className="h-1.5 flex-1" />
            <span className="text-[7px] text-muted-foreground" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Tier {tier + 1}
            </span>
          </div>
        </div>
      )}

      {/* Unlocked elements panel */}
      {showElements && (
        <div className="absolute top-12 right-4 z-50 bg-card border-2 border-primary/30 rounded-lg p-3 shadow-xl max-w-xs"
          style={{ fontFamily: "'VT323', monospace" }}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs text-primary" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px' }}>
              Unlocked Elements
            </h3>
            <button onClick={() => setShowElements(false)} className="text-xs text-muted-foreground hover:text-foreground">×</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {unlockedElements.map(elem => (
              <span key={elem} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-foreground">
                {ELEMENT_DISPLAY_NAMES[elem]}
              </span>
            ))}
          </div>
          {playerLevel < 6 && (
            <p className="text-[9px] text-muted-foreground mt-1">Reach Lv.6 to unlock Ice, Wind, Electric</p>
          )}
          {playerLevel >= 6 && playerLevel < 11 && (
            <p className="text-[9px] text-muted-foreground mt-1">Reach Lv.11 to unlock Void, Cosmic, Light, Shadow</p>
          )}
          {playerLevel >= 11 && (
            <p className="text-[9px] text-primary mt-1">All element tiers unlocked! Full hybrid breeding enabled.</p>
          )}
        </div>
      )}

      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}
    </>
  );
}
