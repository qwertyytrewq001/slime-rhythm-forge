import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameProvider } from '@/hooks/useGameState';
import { SlimeGallery } from '@/components/game/SlimeGallery';
import { BreedingPod } from '@/components/game/BreedingPod';
import { createCodexSlime } from '@/utils/slimeGenerator';

describe('slot picker flow', () => {
  it('sends the player to the Breeding Den when a pedestal is clicked', () => {
    const onNavigateToBreedingDen = vi.fn();
    const { container } = render(
      <GameProvider>
        <BreedingPod onNavigateToBreedingDen={onNavigateToBreedingDen} />
      </GameProvider>
    );

    // the two parent pedestals are the clickable slots
    const slots = container.querySelectorAll('.cursor-pointer');
    expect(slots.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(slots[0]);
    fireEvent.click(slots[1]);
    expect(onNavigateToBreedingDen).toHaveBeenCalledTimes(2);
  });

  it('lets the player pick a slime from the gallery', async () => {
    // new games start with no slime, so give this save one
    localStorage.setItem('rareslime-forge-save', JSON.stringify({ slimes: [createCodexSlime('leaf_slime', undefined)], goo: 100 }));
    const handleSelect = vi.fn();
    const { container } = render(
      <GameProvider>
        <SlimeGallery onSelect={handleSelect} />
      </GameProvider>
    );
    await waitFor(() => expect(container.querySelectorAll('.gallery-card').length).toBeGreaterThan(0));
    fireEvent.click(container.querySelector('.gallery-card') as HTMLElement);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });
});
