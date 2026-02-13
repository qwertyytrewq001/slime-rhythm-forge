import { useState, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { breedSlimes } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { BreedHistory } from './BreedHistory';
import { Sparkles } from 'lucide-react';

export function BreedingPod() {
  const { state, dispatch } = useGameState();
  const [breeding, setBreeding] = useState(false);
  const [newSlime, setNewSlime] = useState<string | null>(null);

  const slot1Slime = state.slimes.find(s => s.id === state.breedSlot1);
  const slot2Slime = state.slimes.find(s => s.id === state.breedSlot2);

  const handleDrop = useCallback((slot: 1 | 2) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('slimeId');
    if (id) {
      // Don't allow same slime in both slots
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

      if (state.mutationJuiceActive) dispatch({ type: 'DEACTIVATE_MUTATION_JUICE' });

      // Check achievements
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

      setNewSlime(child.id);
      setBreeding(false);
      setTimeout(() => setNewSlime(null), 2000);
    }, 800);
  }, [slot1Slime, slot2Slime, breeding, state, dispatch]);

  const handleSlotClick = (slot: 1 | 2) => {
    if (state.selectedSlimeId) {
      const otherId = slot === 1 ? state.breedSlot2 : state.breedSlot1;
      if (state.selectedSlimeId !== otherId) {
        dispatch({ type: 'SET_BREED_SLOT', slot, id: state.selectedSlimeId });
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4" style={{ fontFamily: "'VT323', monospace" }}>
      <h2 className="text-sm text-primary mb-1" style={{ fontFamily: "'Press Start 2P', cursive" }}>
        Breeding Pod
      </h2>

      {state.mutationJuiceActive && (
        <div className="text-xs text-accent-foreground bg-accent/20 px-2 py-1 rounded border border-accent animate-pulse">
          🧪 Mutation Juice Active!
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Slot 1 */}
        <div
          className={`w-28 h-28 border-4 rounded-lg flex items-center justify-center transition-all ${
            slot1Slime ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/40 bg-muted/20'
          } ${breeding ? 'animate-pulse' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop(1)}
          onClick={() => handleSlotClick(1)}
        >
          {slot1Slime ? (
            <SlimeCanvas slime={slot1Slime} size={96} animated />
          ) : (
            <span className="text-xs text-muted-foreground text-center px-2">
              Drag or click slime here
            </span>
          )}
        </div>

        <span className="text-2xl text-primary">×</span>

        {/* Slot 2 */}
        <div
          className={`w-28 h-28 border-4 rounded-lg flex items-center justify-center transition-all ${
            slot2Slime ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/40 bg-muted/20'
          } ${breeding ? 'animate-pulse' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop(2)}
          onClick={() => handleSlotClick(2)}
        >
          {slot2Slime ? (
            <SlimeCanvas slime={slot2Slime} size={96} animated />
          ) : (
            <span className="text-xs text-muted-foreground text-center px-2">
              Drag or click slime here
            </span>
          )}
        </div>
      </div>

      {/* Breed Button */}
      <button
        onClick={handleBreed}
        disabled={!slot1Slime || !slot2Slime || breeding}
        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg border-4 border-primary/60 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all text-sm"
        style={{ fontFamily: "'Press Start 2P', cursive" }}
      >
        <Sparkles className="w-4 h-4" />
        {breeding ? 'Merging...' : 'BREED!'}
      </button>

      {/* New slime flash */}
      {newSlime && (() => {
        const child = state.slimes.find(s => s.id === newSlime);
        return child ? (
          <div className="text-center animate-fade-in">
            <SlimeCanvas slime={child} size={80} animated />
            <p className="text-sm text-primary font-bold mt-1">{child.name}</p>
            <p className="text-xs text-accent-foreground">{'★'.repeat(child.rarityStars)} born!</p>
          </div>
        ) : null;
      })()}

      {/* Breed History */}
      <BreedHistory />
    </div>
  );
}
