import type React from 'react';
import { useEffect, useState } from 'react';
import { GameProvider, useGameState } from '@/hooks/useGameState';
import { TopBar } from '@/components/game/TopBar';
import { SlimeGallery } from '@/components/game/SlimeGallery';
import { BreedingPod } from '@/components/game/BreedingPod';
import { StatsPanel } from '@/components/game/StatsPanel';
import { HabitatViewer } from '@/components/game/HabitatViewer';
import { Shop } from '@/components/game/Shop';
import { Hatchery } from '@/components/game/Hatchery';
import { ForestBackground } from '@/components/game/ForestBackground';
import { IslandGrid } from '@/components/game/IslandGrid';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { audioEngine } from '@/utils/audioEngine';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Images, Info, ChevronLeft, Trophy, Volume2, VolumeX } from 'lucide-react';
import { Achievements } from '@/components/game/Achievements';

function GameLayout() {
  const { state, dispatch } = useGameState();
  const [currentView, setCurrentView] = useState<'breeding' | 'habitats'>('breeding');
  const [selectedHabitatId, setSelectedHabitatId] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);

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

  const handleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    audioEngine.toggleMute();
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

  const toolbarCircle = "relative bg-black/30 backdrop-blur-md h-14 w-14 flex items-center justify-center transition-all hover:scale-110 border border-[#FF7EB6]/20 rounded-full hover:border-[#FF7EB6]/50 shadow-lg group pointer-events-auto";
  const toolbarIcon = "w-8 h-8 text-[#FF7EB6] stroke-[2.5px]";
  const toolbarLabel = "absolute bottom-[130%] left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-[#FF7EB6]/40 text-[10px] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.5)]";

  return (
    <div className="flex flex-col h-screen overflow-hidden relative bg-black">
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Background Layer inside z-10 but behind other content */}
        <div className="absolute inset-0 z-0">
          {currentView === 'breeding' ? (
            <ForestBackground 
              fixed={false} 
              onPortalClick={() => setCurrentView('habitats')} 
            />
          ) : (
            <div 
              className="absolute inset-0 bg-black animate-scale-in"
              style={{
                backgroundImage: "url('./second_screen_background.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}
        </div>

        <div className="pointer-events-auto relative z-20">
          <TopBar 
            currentView={currentView}
            onBackToAltar={currentView === 'habitats' ? () => setCurrentView('breeding') : undefined} 
            onOpenHabitats={currentView === 'breeding' ? () => setCurrentView('habitats') : undefined}
          />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center pointer-events-none">
          {currentView === 'breeding' ? (
            <div className="w-full flex flex-col items-center justify-center gap-16 animate-scale-in pointer-events-auto">
              <BreedingPod onRequestGallery={openGalleryForSlot} />
              <Hatchery />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-start pt-12 p-8 relative animate-scale-in pointer-events-auto overflow-y-auto">
              <div className="w-full max-w-6xl">
                <IslandGrid onHabitatClick={setSelectedHabitatId} />
              </div>
            </div>
          )}
        </div>

        {/* UNIFIED TOOLBAR - Bottom Right */}
        <div className="absolute bottom-8 right-8 flex items-center gap-4 pointer-events-auto z-50">
          {/* Achievements */}
          <div className="relative group">
            <button onClick={() => setShowAchievements(true)} className={toolbarCircle}>
              <Trophy className={toolbarIcon} />
              <span className={toolbarLabel}>Trophies</span>
            </button>
          </div>

          {/* Gallery */}
          <Sheet open={galleryOpen} onOpenChange={setGalleryOpen}>
            <SheetTrigger asChild>
              <div className="relative group">
                <button className={toolbarCircle}>
                  <Images className={toolbarIcon} />
                  <span className={toolbarLabel}>Gallery</span>
                </button>
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="bg-rose-glass p-0 border-r-4 border-[#FF7EB6]/50 flex flex-col w-[350px] sm:w-[450px] shadow-2xl pointer-events-auto light-theme">
              <div className="flex-1 overflow-hidden">
                <SlimeGallery onSelect={handleGallerySelect} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Mute */}
          <div className="relative group">
            <button onClick={handleMute} className={toolbarCircle}>
              {state.muted ? <VolumeX className={`${toolbarIcon} opacity-40`} /> : <Volume2 className={toolbarIcon} />}
              <span className={toolbarLabel}>{state.muted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>

          {/* Bazaar (Market) */}
          <Sheet>
            <SheetTrigger asChild>
              <div className="relative group">
                <button className={toolbarCircle}>
                  <ShoppingBag className={toolbarIcon} />
                  <span className={toolbarLabel}>Bazaar</span>
                </button>
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="bg-rose-glass p-0 border-l-4 border-[#FF7EB6]/50 flex flex-col w-[350px] sm:w-[450px] shadow-2xl pointer-events-auto light-theme">
              <Shop />
            </SheetContent>
          </Sheet>

          {/* Codex (Stats) */}
          <Sheet>
            <SheetTrigger asChild>
              <div className="relative group">
                <button className={toolbarCircle}>
                  <Info className={toolbarIcon} />
                  <span className={toolbarLabel}>Codex</span>
                </button>
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="bg-rose-glass p-0 border-l-4 border-[#FF7EB6]/50 flex flex-col w-[350px] sm:w-[450px] shadow-2xl pointer-events-auto light-theme">
              <StatsPanel onRequestGallery={() => openGalleryForSlot()} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Habitat Viewer Modal */}
        <div className="pointer-events-auto">
          {selectedHabitatId && (
            <HabitatViewer habitatId={selectedHabitatId} onClose={() => setSelectedHabitatId(null)} />
          )}
        </div>
      </div>

      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}
    </div>
  );
}

const Index = () => (
  <GameProvider>
    <GameLayout />
  </GameProvider>
);

export default Index;
