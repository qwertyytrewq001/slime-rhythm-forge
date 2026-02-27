import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameProvider, useGameState } from '@/hooks/useGameState';
import { SlimeGallery } from '@/components/game/SlimeGallery';
import { BreedingPod } from '@/components/game/BreedingPod';

// verify gallery-selection flow operated earlier

describe('slot picker flow', () => {
  it('opens gallery when slot clicked regardless of selection', async () => {
    const onRequestGallery = vi.fn();
    const { getAllByText } = render(
      <GameProvider>
        <BreedingPod onRequestGallery={onRequestGallery} />
      </GameProvider>
    );

    const slots = getAllByText('Drop slime here');
    fireEvent.click(slots[0]);
    expect(onRequestGallery).toHaveBeenCalledWith(1);

    // simulate existing selection then click again
    const { dispatch } = require('@/hooks/useGameState').useGameState();
    const dummy: any = { id: 'z', name: 'z', traits: {}, elements: ['nature'], element: 'nature', rarityScore: 0, rarityStars: 1, rarityTier: 'Common', createdAt: Date.now() };
    dispatch({ type: 'ADD_SLIME', slime: dummy });
    dispatch({ type: 'SELECT_SLIME', id: dummy.id });

    fireEvent.click(slots[1]);
    expect(onRequestGallery).toHaveBeenCalledWith(2);

    // selecting from gallery still works
    const handleSelect = vi.fn();
    const { getByText: getByText2 } = render(
      <GameProvider>
        <SlimeGallery onSelect={handleSelect} />
      </GameProvider>
    );

    const goo = await waitFor(() => getByText2('Goo Slime'));
    fireEvent.click(goo);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });
});
