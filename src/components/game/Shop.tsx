import { useGameState } from '@/hooks/useGameState';
import { createRandomSlime, createElementSlime } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { SlimeTraits, SlimeElement } from '@/types/slime';
import { getUnlockedElements, ELEMENT_DISPLAY_NAMES, HABITAT_COSTS, HABITAT_THEMES, getPlayerLevel } from '@/data/traitData';
import { useState } from 'react';

type ShopTab = 'eggs' | 'items' | 'habitats';

const ITEM_SHOP = [
  { id: 'mutation_juice', name: 'Mutation Juice', desc: 'Next breed: 50% mutation rate', cost: 30 },
  { id: 'wild_food', name: 'Wild Food', desc: 'Boost a random trait on selected slime', cost: 20 },
  { id: 'element_treat', name: 'Element Treat', desc: 'Feed selected slime (+happiness)', cost: 15 },
];

const STARTER_EGG_COST = 40;

export function Shop() {
  const { state, dispatch, playerLevel } = useGameState();
  const [tab, setTab] = useState<ShopTab>('eggs');

  const unlockedElements = getUnlockedElements(playerLevel);

  const handleBuyEgg = (element: SlimeElement) => {
    if (state.goo < STARTER_EGG_COST) return;
    dispatch({ type: 'SPEND_GOO', amount: STARTER_EGG_COST });
    audioEngine.playSfx('purchase');
    const newSlime = createElementSlime(element);
    dispatch({ type: 'ADD_SLIME', slime: newSlime });
    dispatch({ type: 'SELECT_SLIME', id: newSlime.id });
  };

  const handleBuyItem = (itemId: string, cost: number) => {
    if (state.goo < cost) return;
    dispatch({ type: 'SPEND_GOO', amount: cost });
    audioEngine.playSfx('purchase');

    switch (itemId) {
      case 'mutation_juice':
        dispatch({ type: 'ACTIVATE_MUTATION_JUICE' });
        break;
      case 'wild_food':
        if (state.selectedSlimeId) {
          const traitKeys: (keyof SlimeTraits)[] = ['shape', 'color1', 'color2', 'eyes', 'mouth', 'spikes', 'pattern', 'glow', 'aura', 'rhythm', 'accessory'];
          const randomTrait = traitKeys[Math.floor(Math.random() * traitKeys.length)];
          dispatch({ type: 'BOOST_TRAIT', slimeId: state.selectedSlimeId, trait: randomTrait });
        }
        break;
      case 'element_treat':
        if (state.selectedSlimeId) {
          dispatch({ type: 'FEED_SLIME', slimeId: state.selectedSlimeId });
        }
        break;
    }
  };

  const handleBuyHabitat = (element: SlimeElement) => {
    const cost = HABITAT_COSTS[element];
    if (state.goo < cost) return;
    if (state.habitats.length >= 16) return; // Grid full
    dispatch({ type: 'SPEND_GOO', amount: cost });
    dispatch({ type: 'BUY_HABITAT', element });
    audioEngine.playSfx('purchase');
  };

  return (
    <div className="space-y-1.5" style={{ fontFamily: "'VT323', monospace" }}>
      <h3 className="text-xs text-center text-primary" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px' }}>
        Shop
      </h3>

      {/* Tabs */}
      <div className="flex gap-1 justify-center">
        {(['eggs', 'items', 'habitats'] as ShopTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${
              tab === t ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-muted/20 border-border/30 text-muted-foreground'
            }`}
            style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '7px' }}
          >
            {t === 'eggs' ? 'Eggs' : t === 'items' ? 'Items' : 'Habitats'}
          </button>
        ))}
      </div>

      {/* Eggs tab */}
      {tab === 'eggs' && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {unlockedElements.map(elem => (
            <button
              key={elem}
              onClick={() => handleBuyEgg(elem)}
              disabled={state.goo < STARTER_EGG_COST}
              className="w-full text-left p-1.5 bg-muted/30 rounded border border-border/50 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex justify-between text-xs">
                <span className="text-foreground">{ELEMENT_DISPLAY_NAMES[elem]} Egg</span>
                <span className="text-accent-foreground">{STARTER_EGG_COST}g</span>
              </div>
              <p className="text-[9px] text-muted-foreground">Hatch a {ELEMENT_DISPLAY_NAMES[elem]} Slime</p>
            </button>
          ))}
          {playerLevel < 11 && (
            <p className="text-[8px] text-muted-foreground text-center italic">
              More eggs unlock at higher levels
            </p>
          )}
        </div>
      )}

      {/* Items tab */}
      {tab === 'items' && (
        <div className="space-y-1">
          {ITEM_SHOP.map(item => (
            <button
              key={item.id}
              onClick={() => handleBuyItem(item.id, item.cost)}
              disabled={state.goo < item.cost || ((item.id === 'wild_food' || item.id === 'element_treat') && !state.selectedSlimeId)}
              className="w-full text-left p-1.5 bg-muted/30 rounded border border-border/50 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex justify-between text-xs">
                <span className="text-foreground">{item.name}</span>
                <span className="text-accent-foreground">{item.cost}g</span>
              </div>
              <p className="text-[9px] text-muted-foreground">{item.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Habitats tab */}
      {tab === 'habitats' && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {state.habitats.length >= 16 && (
            <p className="text-[8px] text-muted-foreground text-center">Island grid full</p>
          )}
          {unlockedElements.map(elem => {
            const cost = HABITAT_COSTS[elem];
            const theme = HABITAT_THEMES[elem];
            const owned = state.habitats.filter(h => h.element === elem).length;
            return (
              <button
                key={elem}
                onClick={() => handleBuyHabitat(elem)}
                disabled={state.goo < cost || state.habitats.length >= 16}
                className="w-full text-left p-1.5 bg-muted/30 rounded border border-border/50 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">{ELEMENT_DISPLAY_NAMES[elem]} Habitat</span>
                  <span className="text-accent-foreground">{cost}g</span>
                </div>
                <p className="text-[9px] text-muted-foreground">{theme.desc}</p>
                {owned > 0 && <span className="text-[8px] text-primary">Owned: {owned}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
