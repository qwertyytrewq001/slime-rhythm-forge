import type React from 'react';
import { useEffect, useState } from 'react';
import { GameProvider, useGameState } from '@/hooks/useGameState';
import { TopBar } from '@/components/game/TopBar';
import { SlimeGallery } from '@/components/game/SlimeGallery';
import { BreedingPod } from '@/components/game/BreedingPod';
import { StatsPanel } from '@/components/game/StatsPanel';
import { ForestBackground } from '@/components/game/ForestBackground';
import { IslandGrid } from '@/components/game/IslandGrid';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { audioEngine } from '@/utils/audioEngine';
import { Button } from '@/components/ui/button';

function GameLayout() {
  const { state } = useGameState();
  const [scrollOffset, setScrollOffset] = useState(0);

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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollOffset(event.currentTarget.scrollTop);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <ForestBackground parallaxOffset={scrollOffset} />

      <div className="relative z-10 flex flex-col h-full">
        <TopBar />

        {/* Floating sidebar toggles */}
        <div className="pointer-events-none absolute inset-y-20 left-0 right-0 flex justify-between px-3 sm:px-6 z-20">
          {/* Gallery toggle (left) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="pointer-events-auto bg-background/70 hover:bg-background/90 backdrop-blur border border-border/60 shadow-md"
              >
                Gallery
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-background/95 backdrop-blur-md p-4 sm:p-6 flex flex-col"
            >
              <SheetHeader>
                <SheetTitle>Gallery</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex-1 overflow-hidden">
                <SlimeGallery />
              </div>
            </SheetContent>
          </Sheet>

          {/* Stats toggle (right) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="pointer-events-auto bg-background/70 hover:bg-background/90 backdrop-blur border border-border/60 shadow-md"
              >
                Stats
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-background/95 backdrop-blur-md p-4 sm:p-6 flex flex-col"
            >
              <SheetHeader>
                <SheetTitle>Stats & Shop</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex-1 overflow-hidden">
                <StatsPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col items-center">
          {/* Center: Breeding Den + Island */}
          <div
            className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-4 py-4 px-2 sm:px-4"
            onScroll={handleScroll}
          >
            <BreedingPod />
            {state.habitats.length > 0 && <IslandGrid />}
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
