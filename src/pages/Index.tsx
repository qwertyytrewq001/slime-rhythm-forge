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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { audioEngine } from '@/utils/audioEngine';
import { ShoppingBag, Images, Info, Trophy, Volume2, VolumeX, Sword } from 'lucide-react';
import { Achievements } from '@/components/game/Achievements';
import { EvolutionPopup } from '@/components/game/EvolutionPopup';
import { WorldMap } from '@/components/game/WorldMap';
import { BattlePreview } from '@/components/game/BattlePreview';
import { BattleArena } from '@/components/game/BattleArena';
import { BattleSlime } from '@/types/slime';
import { LoreTutorial } from '@/components/game/LoreTutorial';
import { LevelDialogue } from '@/components/game/LevelDialogue';
import { triggerDialogue } from '@/utils/dialogueTriggers';

function GameLayout() {
  const { state, dispatch } = useGameState();
  const [currentView, setCurrentView] = useState<'breeding' | 'habitats' | 'battleMap'>('breeding');
  const [selectedHabitatId, setSelectedHabitatId] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check for first launch and trigger tutorial
  useEffect(() => {
    const hasLaunchedBefore = localStorage.getItem('glim_first_launch_completed');
    console.log('🔍 First launch check:', hasLaunchedBefore);
    
    // Temporarily force tutorial to open for testing
    if (!hasLaunchedBefore || true) { // Added || true for testing
      // Mark as launched
      localStorage.setItem('glim_first_launch_completed', 'true');
      // Trigger first launch tutorial and open it
      console.log('🚀 Triggering first launch tutorial');
      triggerDialogue('firstLaunch');
      setShowTutorial(true);
    }
  }, []);
  const [showLevelDialogue, setShowLevelDialogue] = useState(false);
  const [dialogueLevel, setDialogueLevel] = useState(1);
  
  // Battle Flow State
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showBattlePreview, setShowBattlePreview] = useState(false);
  const [battleTeam, setBattleTeam] = useState<{ player: BattleSlime[], opponent: BattleSlime[] } | null>(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [breedingGalleryOpen, setBreedingGalleryOpen] = useState(false);
  const [gallerySlot, setGallerySlot] = useState<1 | 2 | null>(null);

  const openGalleryForSlot = (slot?: 1 | 2) => {
    if (slot) setGallerySlot(slot);
    else setGallerySlot(null);
    setBreedingGalleryOpen(true);
    console.log(`🖼️ Opening breeding gallery for slot ${slot}`);
  };

  const handleGallerySelect = (id: string) => {
    if (gallerySlot) {
      dispatch({ type: 'SET_BREED_SLOT', slot: gallerySlot, id });
    }
    // Don't change global selection when selecting for breeding
    // dispatch({ type: 'SELECT_SLIME', id });
    // Only close gallery and clear slot if both slots are filled
    if (state.breedSlot1 && state.breedSlot2) {
      setBreedingGalleryOpen(false);
      setGallerySlot(null);
    }
  };

  const handleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    audioEngine.toggleMute();
  };

  const handleSelectLevel = (level: number) => {
    setSelectedLevel(level);
    setShowBattlePreview(true);
  };

  const handleStartBattle = (player: BattleSlime[], opponent: BattleSlime[]) => {
    setBattleTeam({ player, opponent });
    setShowBattlePreview(false);
  };

  const handleBattleComplete = (result: { winner: 'player' | 'opponent'; level: number }) => {
    setBattleTeam(null);
    
    // Show level dialogue for specific levels after player wins
    if (result.winner === 'player') {
      const dialogueLevels = [1, 5, 10, 14, 15, 16];
      if (dialogueLevels.includes(result.level)) {
        setDialogueLevel(result.level);
        setShowLevelDialogue(true);
      }
    }
  };

  useEffect(() => {
    const startAudio = () => {
      audioEngine.resume();
      audioEngine.startLofi(2);
      document.removeEventListener('click', startAudio);
    };
    document.addEventListener('click', startAudio);
    
    // Handle custom event to open breeding gallery
    const handleOpenBreedingGallery = (event: any) => {
      console.log('🖼️ Received openBreedingGallery event:', event.detail);
      openGalleryForSlot(event.detail?.slot || 1);
    };
    window.addEventListener('openBreedingGallery', handleOpenBreedingGallery);
    
    return () => {
      document.removeEventListener('click', startAudio);
      window.removeEventListener('openBreedingGallery', handleOpenBreedingGallery);
      audioEngine.stopLofi();
    };
  }, []);

  // Show tutorial for first-time players
  useEffect(() => {
    if (!state.tutorialCompleted && state.slimes.length > 0) {
      // Small delay to let the game load first
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.tutorialCompleted, state.slimes.length]);

  const toolbarCircle = "relative bg-black/30 backdrop-blur-md h-14 w-14 flex items-center justify-center transition-all hover:scale-110 border border-[#FF7EB6]/20 rounded-full hover:border-[#FF7EB6]/50 shadow-lg group pointer-events-auto";
  const toolbarIcon = "w-8 h-8 text-[#FF7EB6] stroke-[2.5px]";
  const toolbarLabel = "absolute bottom-[130%] left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-[#FF7EB6]/40 text-[10px] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.5)]";

  return (
    <div className="flex flex-col h-screen overflow-hidden relative bg-black">
      {/* 1. BATTLE MAP LAYER (Highest Priority when active) */}
      {currentView === 'battleMap' && (
        <div className="fixed inset-0 z-[100] pointer-events-auto">
          <WorldMap 
            onSelectLevel={handleSelectLevel}
            onClose={() => setCurrentView('breeding')}
          />
        </div>
      )}

      {/* 2. MAIN GAME INTERFACE */}
      <div className={`relative z-10 flex flex-col h-full ${currentView === 'battleMap' ? 'hidden' : ''}`}>
        
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
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

        {/* TopBar (Navigation) */}
        <div className="pointer-events-auto relative z-20">
          <TopBar 
            currentView={currentView}
            onBackToAltar={() => setCurrentView('breeding')} 
            onOpenHabitats={() => setCurrentView('habitats')}
            onOpenBattle={() => setCurrentView('battleMap')}
          />
        </div>

        {/* Central Content */}
        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center pointer-events-none">
          {currentView === 'breeding' && (
            <div className="w-full flex flex-col items-center justify-center gap-16 animate-scale-in pointer-events-auto">
              <BreedingPod onRequestGallery={openGalleryForSlot} />
              <Hatchery />
            </div>
          )}
          {currentView === 'habitats' && (
            <div className="w-full h-full flex flex-col items-center justify-start pt-12 p-8 relative animate-scale-in pointer-events-auto overflow-y-auto">
              <div className="w-full max-w-6xl">
                <IslandGrid onHabitatClick={setSelectedHabitatId} />
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM TOOLBAR */}
        <div className="fixed bottom-4 right-4 z-[150] flex items-center gap-2 pointer-events-auto">
          {/* Bottom Toolbar - Moved down to avoid dialogue interference */}
          <div className="relative group">
            <button onClick={handleMute} className={toolbarCircle}>
              {state.muted ? <VolumeX className={`${toolbarIcon} opacity-40`} /> : <Volume2 className={toolbarIcon} />}
              <span className={toolbarLabel}>{state.muted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>

          <Sheet open={galleryOpen} onOpenChange={setGalleryOpen}>
            <SheetTrigger asChild>
              <div className="relative group">
                <button data-testid="gallery-button" className={toolbarCircle}>
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

          {/* Breeding Gallery Sheet */}
          <Sheet open={breedingGalleryOpen} onOpenChange={setBreedingGalleryOpen}>
            <SheetContent side="left" className="bg-rose-glass p-0 border-r-4 border-[#FF7EB6]/50 flex flex-col w-[350px] sm:w-[450px] shadow-2xl pointer-events-auto light-theme z-[120]">
              <div className="flex-1 overflow-hidden">
                <SlimeGallery onSelect={handleGallerySelect} />
              </div>
            </SheetContent>
          </Sheet>

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

      {/* 3. GLOBAL POPUPS */}
      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}

      {showBattlePreview && selectedLevel !== null && (
        <div className="fixed inset-0 z-[200]">
          <BattlePreview 
            level={selectedLevel}
            onStartBattle={handleStartBattle}
            onClose={() => setShowBattlePreview(false)}
          />
        </div>
      )}

      {battleTeam && selectedLevel !== null && (
        <div className="fixed inset-0 z-[300]">
          <BattleArena 
            level={selectedLevel}
            playerTeam={battleTeam.player}
            opponentTeam={battleTeam.opponent}
            onClose={() => setBattleTeam(null)}
            onBattleComplete={handleBattleComplete}
          />
        </div>
      )}

      <EvolutionPopup />
      
      {/* Tutorial Modal */}
      <LoreTutorial 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onOpen={() => setShowTutorial(true)}
      />
      
      {/* Level Dialogue Modal */}
      <LevelDialogue 
        isOpen={showLevelDialogue}
        onClose={() => setShowLevelDialogue(false)}
        level={dialogueLevel}
      />
    </div>
  );
}

const Index = () => (
  <GameProvider>
    <GameLayout />
  </GameProvider>
);

export default Index;
