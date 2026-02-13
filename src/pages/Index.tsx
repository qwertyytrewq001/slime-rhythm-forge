import { useEffect } from 'react';
import { GameProvider } from '@/hooks/useGameState';
import { TopBar } from '@/components/game/TopBar';
import { SlimeGallery } from '@/components/game/SlimeGallery';
import { BreedingPod } from '@/components/game/BreedingPod';
import { StatsPanel } from '@/components/game/StatsPanel';
import { audioEngine } from '@/utils/audioEngine';

function GameLayout() {
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

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Gallery */}
        <div className="w-56 md:w-64 flex-shrink-0 overflow-hidden">
          <SlimeGallery />
        </div>

        {/* Center: Breeding Pod */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center bg-background">
          <BreedingPod />
        </div>

        {/* Right: Stats */}
        <div className="w-56 md:w-72 flex-shrink-0 overflow-hidden">
          <StatsPanel />
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
