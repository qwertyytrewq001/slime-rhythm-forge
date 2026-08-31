import type React from 'react';
import { useEffect, useState } from 'react';
import { GameProvider, useGameState, getStage } from '@/hooks/useGameState';
import { TopBar } from '@/components/game/TopBar';
import { SlimeGallery } from '@/components/game/SlimeGallery';
import { BreedingPod } from '@/components/game/BreedingPod';
import { BreedingDen } from '@/components/game/BreedingDen';
import { StatsPanel } from '@/components/game/StatsPanel';
import { HabitatViewer } from '@/components/game/HabitatViewer';
import { Shop } from '@/components/game/Shop';
import { BazaarModal } from '@/components/game/BazaarModal';
import { Hatchery } from '@/components/game/Hatchery';
import { HatcheryScreen } from '@/components/game/HatcheryScreen';
import { IslandGrid } from '@/components/game/IslandGrid';
import { CodexGallery } from '@/components/game/CodexGallery';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { audioEngine } from '@/utils/audioEngine';
import { preloadEssentialSprites } from '@/utils/spriteLoader';
import { ShoppingBag, Images, Info, Trophy, Volume2, VolumeX, Sword, BookOpen } from 'lucide-react';
import { Achievements } from '@/components/game/Achievements';
import { EvolutionPopup } from '@/components/game/EvolutionPopup';
import { LevelUpPopup } from '@/components/game/LevelUpPopup';
import { PlayerLevelUpPopup } from '@/components/game/PlayerLevelUpPopup';
import { WorldMap } from '@/components/game/WorldMap';
import { BattlePreview } from '@/components/game/BattlePreview';
import { BattleArena } from '@/components/game/BattleArena';
import { BattleSlime } from '@/types/slime';
import { LoreTutorial } from '@/components/game/LoreTutorial';
import { LevelDialogue } from '@/components/game/LevelDialogue';
import { Sanctuaries } from '@/components/game/Sanctuaries';
import { FarmScreen } from '@/components/game/FarmScreen';
import { triggerDialogue } from '@/utils/dialogueTriggers';

function GameLayout() {
  const { state, dispatch } = useGameState();
  const [currentView, setCurrentView] = useState<'breeding' | 'breedingDen' | 'sanctuaries' | 'battleMap' | 'habitats' | 'hatchery' | 'farm'>('breeding');
  const [selectedHabitatId, setSelectedHabitatId] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Preload sprites on app startup
  useEffect(() => {
    preloadEssentialSprites().then(() => {
      console.log('✅ Essential sprites preloaded successfully!');
      
      // Quick test of sprite mapping
      import('@/utils/spriteTest').then(({ testSpriteMapping }) => {
        testSpriteMapping();
      }).catch(err => {
        console.warn('Sprite test failed:', err);
      });
      
      // Comprehensive slime system verification
      import('@/utils/slimeVerification').then(({ verifyAllSlimeSystems }) => {
        verifyAllSlimeSystems();
      }).catch(err => {
        console.warn('Slime verification failed:', err);
      });
    }).catch(err => {
      console.warn('Failed to preload sprites:', err);
    });
  }, []);
  
  // Synchronously check if we should show the tutorial to prevent flickering
  const [showTutorial, setShowTutorial] = useState(() => {
    const hasLaunchedBefore = localStorage.getItem('glim_first_launch_completed');
    return !hasLaunchedBefore;
  });

  const [showLevelDialogue, setShowLevelDialogue] = useState(false);
  const [dialogueLevel, setDialogueLevel] = useState(1);
  
  // Battle Flow State
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showBattlePreview, setShowBattlePreview] = useState(false);
  const [battleTeam, setBattleTeam] = useState<{ player: BattleSlime[], opponent: BattleSlime[] } | null>(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [breedingGalleryOpen, setBreedingGalleryOpen] = useState(false);
  const [gallerySlot, setGallerySlot] = useState<1 | 2 | null>(null);
  const [codexGalleryOpen, setCodexGalleryOpen] = useState(false);
  const [bazaarModalOpen, setBazaarModalOpen] = useState(false);

  const [ageMessage, setAgeMessage] = useState<string | null>(null);

  // Check for first launch and trigger tutorial
  useEffect(() => {
    const hasLaunchedBefore = localStorage.getItem('glim_first_launch_completed');
    if (!hasLaunchedBefore) {
      localStorage.setItem('glim_first_launch_completed', 'true');
      console.log('🚀 Triggering first launch tutorial');
      triggerDialogue('firstLaunch');
    }
  }, []);

  const openGalleryForSlot = (slot?: 1 | 2) => {
    if (slot) setGallerySlot(slot);
    else setGallerySlot(null);
    setBreedingGalleryOpen(true);
    console.log(`🖼️ Opening breeding gallery for slot ${slot}`);
  };

  const handleGallerySelect = (id: string) => {
    if (gallerySlot) {
      const otherSlot = gallerySlot === 1 ? 2 : 1;
      const otherSlotId = otherSlot === 1 ? state.breedSlot1 : state.breedSlot2;
      
      if (otherSlotId === id) {
        console.log(`❌ Slime ${id} is already assigned to pedestal ${otherSlot}`);
        return; 
      }
      
      // Check slime age for breeding
      const selectedSlime = state.slimes.find(s => s.id === id);
      if (selectedSlime) {
        const stage = getStage(selectedSlime.level);
        if (stage !== 'adult') {
          setAgeMessage(`Level up your slime to adult before breeding! ${selectedSlime.name} is currently a ${stage} (level ${selectedSlime.level}).`);
          setTimeout(() => setAgeMessage(null), 3000);
          return;
        }
      }
      
      dispatch({ type: 'SET_BREED_SLOT', slot: gallerySlot, id });
    }
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

  // Close habitat viewer when navigating away from sanctuaries
  useEffect(() => {
    if (currentView !== 'sanctuaries') {
      setSelectedHabitatId(null);
    }
  }, [currentView]);

  // Auto-navigate to sanctuaries when habitat placement is pending
  useEffect(() => {
    if (state.pendingHabitatPlacement && currentView !== 'sanctuaries') {
      setCurrentView('sanctuaries');
    }
  }, [state.pendingHabitatPlacement, currentView]);

  const handleBattleComplete = (result: { winner: 'player' | 'opponent'; level: number }) => {
    setBattleTeam(null);
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
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.tutorialCompleted, state.slimes.length]);

  const toolbarCircle = "relative bg-black/40 h-14 w-14 flex items-center justify-center transition-all hover:scale-110 border border-[#FF7EB6]/40 rounded-full hover:border-[#FF7EB6] shadow-2xl group pointer-events-auto";
  const toolbarIcon = "w-8 h-8 text-[#FF7EB6] stroke-[2.5px]";
  const toolbarLabel = "absolute bottom-[130%] left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FFB3D1] rounded border border-[#FF7EB6]/40 text-[10px] uppercase font-white tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_15px_rgba(0,0,0,0.5)]";

  return (
    <div className="flex flex-col h-screen overflow-hidden relative bg-black">
      {/* Background Layer - Conditional: Video for Altar, Image for Sanctuaries */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        {currentView === 'sanctuaries' ? (
          <div 
            className="w-full h-full bg-cover bg-center animate-fade-in"
            style={{ backgroundImage: `url("${import.meta.env.BASE_URL}second_screen_background.png")` }}
          />
        ) : (
          <video
            className="w-full h-full object-cover brightness-110"
            autoPlay
            muted
            loop
            playsInline
            key="altar-video"
          >
            <source src={`${import.meta.env.BASE_URL}homescreen_loop.mp4`} type="video/mp4" />
          </video>
        )}
      </div>

      {/* 1. BATTLE MAP LAYER (Highest Priority when active) */}
      {currentView === 'battleMap' && (
        <div className="fixed inset-0 z-[100] pointer-events-auto">
          <WorldMap 
            onSelectLevel={handleSelectLevel}
            onClose={() => setCurrentView('breeding')}
          />
        </div>
      )}

      {/* 1.5. BREEDING DEN LAYER (Separate from main interface) */}
      {currentView === 'breedingDen' && (
        <div className="fixed inset-0 z-[95] pointer-events-auto">
          <BreedingDen 
            onRequestGallery={openGalleryForSlot} 
            onBackToAltar={() => setCurrentView('breeding')} 
            onNavigateToHatchery={() => setCurrentView('hatchery')}
          />
        </div>
      )}

      {/* 1.6. HATCHERY LAYER */}
      {currentView === 'hatchery' && (
        <div className="fixed inset-0 z-[95] pointer-events-auto">
          <HatcheryScreen onClose={() => setCurrentView('breeding')} />
        </div>
      )}

      {/* 1.7. FARM LAYER */}
      {currentView === 'farm' && (
        <div className="fixed inset-0 z-[95] pointer-events-auto">
          <FarmScreen onClose={() => setCurrentView('breeding')} />
        </div>
      )}

      {/* 2. MAIN GAME INTERFACE */}
      <div className={`relative z-10 flex flex-col h-full ${currentView === 'battleMap' || currentView === 'breedingDen' || currentView === 'hatchery' || currentView === 'farm' ? 'hidden' : ''}`}>
        
        {/* TopBar (Navigation) */}
        <div className={`pointer-events-auto relative z-[60] ${currentView === 'hatchery' ? 'hidden' : ''}`}>
          <TopBar 
            currentView={currentView}
            onBackToAltar={() => setCurrentView('breeding')} 
            onOpenSanctuaries={() => setCurrentView('sanctuaries')}
            onOpenBattle={() => setCurrentView('battleMap')}
            onOpenBreedingDen={() => setCurrentView('breedingDen')}
            onOpenFarm={() => setCurrentView('farm')}
          />
        </div>

        {/* Central Content */}
        <div className={`flex-1 overflow-hidden flex flex-col items-center justify-center ${currentView === 'sanctuaries' ? 'pointer-events-auto' : 'pointer-events-none'} relative`}>
          {currentView === 'breeding' && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-16 animate-scale-in pointer-events-auto">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#FF7EB6]/5 rounded-full blur-[100px] pointer-events-none" />
              <BreedingPod onRequestGallery={openGalleryForSlot} onNavigateToBreedingDen={() => setCurrentView('breedingDen')} />
              <Hatchery onNavigateToHatchery={() => setCurrentView('hatchery')} />
            </div>
          )}
          {currentView === 'sanctuaries' && (
            <div className="w-full h-full flex flex-col items-center justify-start pt-12 p-8 relative animate-scale-in pointer-events-auto overflow-y-auto">
              <div className="w-full max-w-6xl">
                <IslandGrid onHabitatClick={setSelectedHabitatId} />
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM TOOLBAR */}
        <div className="fixed bottom-6 left-6 z-[150] flex items-center gap-4 pointer-events-auto">
          <div className="relative group">
            <button onClick={handleMute} className={toolbarCircle}>
              {state.muted ? <VolumeX className={`${toolbarIcon} opacity-40`} /> : <Volume2 className={toolbarIcon} />}
              <span className={toolbarLabel}>{state.muted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>

          {currentView !== 'breeding' && (
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
          )}

          <Sheet open={breedingGalleryOpen} onOpenChange={setBreedingGalleryOpen}>
            <SheetContent side="left" className="bg-rose-glass p-0 border-r-4 border-[#FF7EB6]/50 flex flex-col w-[350px] sm:w-[450px] shadow-2xl pointer-events-auto light-theme z-[120]">
              <div className="flex-1 overflow-hidden">
                <SlimeGallery onSelect={handleGallerySelect} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="relative group">
            <button 
              onClick={() => setBazaarModalOpen(true)}
              className={toolbarCircle}
            >
              <ShoppingBag className={toolbarIcon} />
              <span className={toolbarLabel}>Bazaar</span>
            </button>
          </div>

          <button onClick={() => setCodexGalleryOpen(true)} className={toolbarCircle}>
              <BookOpen className={toolbarIcon} />
              <span className={toolbarLabel}>Codex</span>
            </button>
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

      {/* Codex Gallery Modal */}
      {codexGalleryOpen && (
        <div className="fixed inset-0 z-[250] pointer-events-auto">
          <CodexGallery onClose={() => setCodexGalleryOpen(false)} />
        </div>
      )}

      {/* Bazaar Modal */}
      {bazaarModalOpen && (
        <BazaarModal onClose={() => setBazaarModalOpen(false)} />
      )}

      {/* Age restriction message */}
      {ageMessage && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[200]">
          <div className="bg-red-500/90 text-white px-6 py-3 rounded-xl border-2 border-red-300 shadow-lg backdrop-blur-sm">
            <p className="font-bold text-center">{ageMessage}</p>
          </div>
        </div>
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
      <LevelUpPopup />
      <PlayerLevelUpPopup />
      
      {/* Tutorial Overlay - Stays at highest Z-index */}
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
