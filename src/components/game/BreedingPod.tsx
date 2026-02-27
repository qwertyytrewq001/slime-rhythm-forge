import { useState, useCallback, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { breedSlimes } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { BreedHistory } from './BreedHistory';
import { DiscoveryPopup } from './DiscoveryPopup';
import { HatchPopup } from './HatchPopup';
import { ELEMENT_DISPLAY_NAMES, MODEL_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';
import { Slime } from '@/types/slime';
import { Sparkles } from 'lucide-react';
import { generateBreedPreviews } from '@/utils/breedPreviewGenerator';

interface BreedingPodProps {
  onRequestGallery?: (slot: 1 | 2) => void;
}

export function BreedingPod({ onRequestGallery }: BreedingPodProps = {}) {
  const { state, dispatch } = useGameState();
  const [breeding, setBreeding] = useState(false);
  const [hatchPopupSlime, setHatchPopupSlime] = useState<Slime | null>(null);
  const [discovery, setDiscovery] = useState<{ slime: Slime; reason: string } | null>(null);
  const [mergeParticles, setMergeParticles] = useState(false);

  const slot1Slime = state.slimes.find(s => s.id === state.breedSlot1);
  const slot2Slime = state.slimes.find(s => s.id === state.breedSlot2);

  const possibleOffspring = useMemo(() => {
    if (!slot1Slime || !slot2Slime) return [];
    return generateBreedPreviews(slot1Slime, slot2Slime, 6);
  }, [slot1Slime, slot2Slime]);

  const getElementNames = (s: Slime) => {
    const elems = s.elements || [s.element];
    return elems.map((e: string) => ELEMENT_DISPLAY_NAMES[e as keyof typeof ELEMENT_DISPLAY_NAMES] || e).join(', ');
  };

  const handleDrop = useCallback((slot: 1 | 2) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('slimeId');
    if (id) {
      if (slot === 1 && id === state.breedSlot2) return;
      if (slot === 2 && id === state.breedSlot1) return;
      dispatch({ type: 'SET_BREED_SLOT', slot, id });
    }
  }, [state.breedSlot1, state.breedSlot2, dispatch]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleBreed = useCallback(() => {
    if (!slot1Slime || !slot2Slime || breeding) return;

    setBreeding(true);
    setMergeParticles(true);
    audioEngine.playSfx('breed');

    setTimeout(() => {
      const child = breedSlimes(slot1Slime, slot2Slime, state.mutationJuiceActive);
      dispatch({ type: 'ADD_SLIME', slime: child });
      dispatch({ type: 'ADD_BREED_HISTORY', result: {
        parent1Id: slot1Slime.id,
        parent2Id: slot2Slime.id,
        childId: child.id,
        timestamp: Date.now(),
      }});
      dispatch({ type: 'INCREMENT_BREEDS' });
      dispatch({ type: 'CLEAR_BREED_SLOTS' });
      dispatch({ type: 'SELECT_SLIME', id: child.id });
      dispatch({ type: 'SET_BEST_RARITY', score: child.rarityScore });

      if (state.mutationJuiceActive) dispatch({ type: 'DEACTIVATE_MUTATION_JUICE' });

      let discoveryTriggered = false;

      if (child.rarityScore > state.bestRarity && !discoveryTriggered) {
        setDiscovery({ slime: child, reason: `New Species Unlocked: ${child.name}!` });
        dispatch({ type: 'ADD_GOO', amount: 500 });
        audioEngine.playSfx('achievement');
        discoveryTriggered = true;
      }

      if (!state.discoveredModels.includes(child.traits.model)) {
        dispatch({ type: 'ADD_DISCOVERED_MODEL', model: child.traits.model });
        if (!discoveryTriggered) {
          setDiscovery({ slime: child, reason: `New Species Unlocked: ${child.name}!` });
          dispatch({ type: 'ADD_GOO', amount: 500 });
          audioEngine.playSfx('achievement');
          discoveryTriggered = true;
        }
      }

      if (!state.discoveredElements.includes(child.element)) {
        dispatch({ type: 'ADD_DISCOVERED_ELEMENT', element: child.element });
        if (!discoveryTriggered) {
          setDiscovery({ slime: child, reason: `New Species Unlocked: ${child.name}!` });
          dispatch({ type: 'ADD_GOO', amount: 500 });
          audioEngine.playSfx('achievement');
          discoveryTriggered = true;
        }
      }

      if (state.totalBreeds === 0 && !state.achievements.find(a => a.id === 'first_fusion')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: 'first_fusion' });
        dispatch({ type: 'ADD_GOO', amount: 50 });
        audioEngine.playSfx('achievement');
      }
      if (child.rarityStars >= 3 && !state.achievements.find(a => a.id === 'rare_find')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: 'rare_find' });
        dispatch({ type: 'ACTIVATE_MUTATION_JUICE' });
        audioEngine.playSfx('achievement');
      }
      if (child.rarityStars >= 5 && !state.achievements.find(a => a.id === 'mythic_hunter')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: 'mythic_hunter' });
        dispatch({ type: 'ADD_GOO', amount: 500 });
        audioEngine.playSfx('achievement');
      }
      if (state.slimes.length + 1 >= 20 && !state.achievements.find(a => a.id === 'slime_hoarder')?.unlocked) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: 'slime_hoarder' });
        dispatch({ type: 'ADD_GOO', amount: 200 });
        audioEngine.playSfx('achievement');
      }

      setHatchPopupSlime(child);
      setBreeding(false);
      setMergeParticles(false);
    }, 1000);
  }, [slot1Slime, slot2Slime, breeding, state, dispatch]);

  const handleSlotClick = (slot: 1 | 2) => {
    // always open gallery picker; do NOT auto-fill based on current selection.
    if (onRequestGallery) {
      onRequestGallery(slot);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 relative" style={{ fontFamily: "'VT323', monospace" }}>
      <h2 className="text-xs text-primary mb-1" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '9px' }}>
        Breeding Den
      </h2>

      {state.mutationJuiceActive && (
        <div className="text-[9px] text-accent-foreground bg-accent/20 px-2 py-0.5 rounded border border-accent/40 animate-pulse">
          Mutation Juice Active
        </div>
      )}

      {/* Den visual container */}
      <div className="relative">
        {/* Glow aura behind den */}
        <div className="absolute inset-0 -m-6 rounded-full blur-lg animate-pulse" style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.15), transparent)',
        }} />

        {/* Magical pond wrapper */}
        <div className="relative w-[18rem] h-[9rem] rounded-3xl bg-gradient-to-br from-blue-400/30 via-blue-500/40 to-blue-600/50 shadow-inner overflow-hidden">
          {/* subtle water overlay for shimmer */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-300/50 to-transparent animate-pulse wave-bg" />
<img src="/ChatGPT Image Feb 26, 2026, 05_39_13 PM.png" alt="breeding den" className="absolute inset-0 w-full h-full object-contain pointer-events-none bg-transparent" />
          <div className="flex items-center gap-4 relative z-10">
            {/* Slot 1 */}
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all relative overflow-hidden ${
                slot1Slime ? 'border-2 border-primary/50 bg-primary/5' : 'border-2 border-dashed border-blue-300/60 bg-blue-200/20'
              } ${breeding ? 'animate-pulse' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop(1)}
              onClick={() => handleSlotClick(1)}
            >
              {slot1Slime ? (
                <SlimeCanvas slime={slot1Slime} size={80} animated />
              ) : (
                <span className="text-[9px] text-muted-foreground text-center px-2">
                  Drop slime here
                </span>
              )}
            </div>

            {/* Merge indicator */}
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-5 h-5 text-primary" />
              {mergeParticles && (
                <div className="w-6 h-6 rounded-full bg-accent/30 animate-ping" />
              )}
            </div>

            {/* Slot 2 */}
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all relative overflow-hidden ${
                slot2Slime ? 'border-2 border-primary/50 bg-primary/5' : 'border-2 border-dashed border-blue-300/60 bg-blue-200/20'
              } ${breeding ? 'animate-pulse' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop(2)}
              onClick={() => handleSlotClick(2)}
            >
              {slot2Slime ? (
                <SlimeCanvas slime={slot2Slime} size={80} animated />
              ) : (
                <span className="text-[9px] text-muted-foreground text-center px-2">
                  Drop slime here
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Breed Button */}
      <button
        onClick={handleBreed}
        disabled={!slot1Slime || !slot2Slime || breeding}
        className="flex items-center gap-2 px-5 py-1.5 bg-primary text-primary-foreground rounded-lg border-2 border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 hover:scale-105 transition-all text-xs"
        style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '9px' }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {breeding ? 'Merging...' : 'BREED'}
      </button>

      {/* Possible Offspring Preview */}
      {possibleOffspring.length > 0 && !hatchPopupSlime && !breeding && (
        <div className="w-full mt-2">
          <h3 className="text-muted-foreground mb-1.5 text-center" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px' }}>
            Possible Offspring
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {possibleOffspring.map((preview, i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 p-1.5 rounded-lg bg-muted/20 border border-border/30">
                <SlimeCanvas slime={preview} size={44} animated />
                <span className="text-[7px] font-bold mt-0.5" style={{ color: RARITY_TIER_COLORS[preview.rarityTier] }}>
                  {preview.rarityTier}
                </span>
                <span className="text-[6px] text-muted-foreground text-center leading-tight max-w-[52px] truncate">
                  {getElementNames(preview)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New slime hatch popup */}
      {hatchPopupSlime && (
        <HatchPopup
          slime={hatchPopupSlime}
          onClose={() => setHatchPopupSlime(null)}
        />
      )}

      {/* Breed History */}
      <BreedHistory />

      {/* Discovery Popup */}
      {discovery && (
        <DiscoveryPopup
          slime={discovery.slime}
          reason={discovery.reason}
          onClose={() => setDiscovery(null)}
        />
      )}
    </div>
  );
}
