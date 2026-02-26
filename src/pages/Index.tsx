import { useEffect } from 'react';
import { GameProvider, useGameState } from '@/hooks/useGameState';
import { TopBar } from '@/components/game/TopBar';
import { SlimeGallery } from '@/components/game/SlimeGallery';
import { BreedingPod } from '@/components/game/BreedingPod';
import { StatsPanel } from '@/components/game/StatsPanel';
import { ForestBackground } from '@/components/game/ForestBackground';
import { IslandGrid } from '@/components/game/IslandGrid';
import { audioEngine } from '@/utils/audioEngine';

function GameLayout() {
  const { state } = useGameState();

  useEffect(() => {
    const startAudio = () => {
      audioEngine.resume();
      audioEngine.startLofi(2);
      document.removeEventListener('click', startAudio);
    };
    document.addEventListener('click', startAudio);
    return () => {
      document.removeEventListener('click', startAudio);
      audioEngine.stopLofi();
    };
  }, []);

  const selectedSlime = state.slimes.find(s => s.id === state.selectedSlimeId);
  const elementTint = selectedSlime?.element;

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <ForestBackground elementTint={elementTint} />

      <div className="relative z-10 flex flex-col h-full">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Gallery */}
          <div className="w-52 md:w-60 flex-shrink-0 overflow-hidden">
            <SlimeGallery />
          </div>

          {/* Center: Breeding Den + Island */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center gap-4 py-2">
            <BreedingPod />
            {state.habitats.length > 0 && <IslandGrid />}
          </div>

          {/* Right: Stats + Shop */}
          <div className="w-52 md:w-64 flex-shrink-0 overflow-hidden">
            <StatsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

const Index = () => (
  <GameProvider>
    <GameLayout />
  </GameProvider>
);

export default Index;
