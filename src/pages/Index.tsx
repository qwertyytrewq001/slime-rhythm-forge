import type React from 'react';
import { useEffect, useState } from 'react';
import { GameProvider, useGameState } from '@/hooks/useGameState';
import { TopBar } from '@/components/game/TopBar';
import { SlimeGallery } from '@/components/game/SlimeGallery';
import { BreedingPod } from '@/components/game/BreedingPod';
import { StatsPanel } from '@/components/game/StatsPanel';
import { Shop } from '@/components/game/Shop';
import { Hatchery } from '@/components/game/Hatchery';
import { ForestBackground } from '@/components/game/ForestBackground';
import { IslandGrid } from '@/components/game/IslandGrid';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { audioEngine } from '@/utils/audioEngine';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Images, Info } from 'lucide-react';

function GameLayout() {
  const { state, dispatch } = useGameState();
  const [scrollOffset, setScrollOffset] = useState(0);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [gallerySlot, setGallerySlot] = useState<1 | 2 | null>(null);

  const openGalleryForSlot = (slot?: 1 | 2) => {
    if (slot) setGallerySlot(slot);
    else setGallerySlot(null);
    setGalleryOpen(true);
  };

  const handleGallerySelect = (id: string) => {
    if (gallerySlot) {
      dispatch({ type: 'SET_BREED_SLOT', slot: gallerySlot, id });
    }
    dispatch({ type: 'SELECT_SLIME', id });
    setGalleryOpen(false);
    setGallerySlot(null);
  };

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
          <Sheet
            open={galleryOpen}
            onOpenChange={open => {
              setGalleryOpen(open);
              if (!open) setGallerySlot(null);
            }}
          >
            <SheetTrigger asChild>
              <div className="group relative mt-4 w-16 h-16">
                <div className="absolute inset-0 bg-[#FF7EB6]/40 rounded-full blur-xl group-hover:bg-[#FF7EB6]/60 transition-all animate-pulse" />
                <Button
                  variant="secondary"
                  size="icon"
                  className="pointer-events-auto relative bg-[#140a0a] hover:bg-[#2a1a1a] backdrop-blur-xl border-2 border-[#FF7EB6] shadow-[0_0_20px_rgba(255,126,182,0.4)] h-16 w-16 rounded-full transition-all hover:scale-110 active:scale-90"
                >
                  <Images className="w-10 h-10 text-[#FF7EB6] stroke-[3px] drop-shadow-[0_0_10px_#FF7EB6]" />
                </Button>
                <span className="absolute left-[110%] top-1/2 -translate-y-1/2 px-3 py-1 bg-obsidian-glass rounded border border-[#FF7EB6]/40 text-[11px] text-[#FF7EB6] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  Gallery
                </span>
              </div>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-obsidian-glass p-0 border-r-4 border-primary/50 flex flex-col w-[350px] sm:w-[450px] shadow-2xl"
            >
              <div className="flex-1 overflow-hidden">
                <SlimeGallery onSelect={gallerySlot ? handleGallerySelect : undefined} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Right side controls: Market & Stats */}
          <div className="flex flex-col gap-8 pointer-events-auto items-end mt-4">
            {/* Market Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <div className="group relative w-16 h-16">
                  <div className="absolute inset-0 bg-[#FF7EB6]/40 rounded-full blur-xl group-hover:bg-[#FF7EB6]/60 transition-all animate-pulse" />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="relative bg-[#0a140a] hover:bg-[#1a2a1a] backdrop-blur-xl border-2 border-[#FF7EB6] shadow-[0_0_20px_rgba(255,126,182,0.4)] h-16 w-16 rounded-full transition-all hover:scale-110 active:scale-90"
                  >
                    <ShoppingBag className="w-10 h-10 text-[#FF7EB6] stroke-[3px] drop-shadow-[0_0_10px_#FF7EB6]" />
                  </Button>
                  <span className="absolute right-[110%] top-1/2 -translate-y-1/2 px-3 py-1 bg-obsidian-glass rounded border border-[#FF7EB6]/40 text-[11px] text-[#FF7EB6] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    Bazaar
                  </span>
                </div>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-obsidian-glass p-0 border-l-4 border-primary/50 flex flex-col w-[350px] sm:w-[450px] shadow-2xl"
              >
                <Shop />
              </SheetContent>
            </Sheet>

            {/* Stats Toggle (Codex) */}
            <Sheet>
              <SheetTrigger asChild>
                <div className="group relative w-16 h-16">
                  <div className="absolute inset-0 bg-[#FF7EB6]/30 rounded-full blur-xl group-hover:bg-[#FF7EB6]/50 transition-all animate-pulse" />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="relative bg-[#140a0a] hover:bg-[#2a1a1a] backdrop-blur-xl border-2 border-[#FF7EB6] shadow-[0_0_20px_rgba(255,126,182,0.4)] h-16 w-16 rounded-full transition-all hover:scale-110 active:scale-95"
                  >
                    <Info className="w-10 h-10 text-[#FF7EB6] stroke-[3px] drop-shadow-[0_0_10px_#FF7EB6]" />
                  </Button>
                  <span className="absolute right-[110%] top-1/2 -translate-y-1/2 px-3 py-1 bg-obsidian-glass rounded border border-[#FF7EB6] text-[11px] text-[#FF7EB6] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    Codex
                  </span>
                </div>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-obsidian-glass p-0 border-l-4 border-[#FF7EB6]/50 flex flex-col w-[350px] sm:w-[450px] shadow-2xl"
              >
                <StatsPanel onRequestGallery={() => openGalleryForSlot()} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col items-center">
          {/* Center Content Scrollable Area */}
          <div
            className="flex-1 w-full overflow-y-auto flex flex-col items-center gap-12 py-4 px-2 sm:px-4 scroll-smooth"
            onScroll={handleScroll}
          >
            <BreedingPod onRequestGallery={openGalleryForSlot} />
            <Hatchery />
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
