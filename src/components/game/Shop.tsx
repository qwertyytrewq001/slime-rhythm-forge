import { useGameState } from '@/hooks/useGameState';
import { createRandomSlime } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { SlimeTraits } from '@/types/slime';

const SHOP_ITEMS = [
  { id: 'mutation_juice', name: '🧪 Mutation Juice', desc: 'Next breed: 50% mutation rate', cost: 30 },
  { id: 'wild_food', name: '🍖 Wild Food', desc: 'Boost a random trait on selected slime', cost: 20 },
  { id: 'starter_egg', name: '🥚 Starter Egg', desc: 'Get a random new basic slime', cost: 50 },
];

export function Shop() {
  const { state, dispatch } = useGameState();

  const handleBuy = (itemId: string, cost: number) => {
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
      case 'starter_egg': {
        const newSlime = createRandomSlime(true);
        dispatch({ type: 'ADD_SLIME', slime: newSlime });
        dispatch({ type: 'SELECT_SLIME', id: newSlime.id });
        break;
      }
    }
  };

  return (
    <div className="space-y-1.5" style={{ fontFamily: "'VT323', monospace" }}>
      <h3 className="text-xs text-center text-primary" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '8px' }}>
        Shop
      </h3>
      {SHOP_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => handleBuy(item.id, item.cost)}
          disabled={state.goo < item.cost || (item.id === 'wild_food' && !state.selectedSlimeId)}
          className="w-full text-left p-2 bg-muted/30 rounded border border-border/50 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <div className="flex justify-between text-xs">
            <span className="text-foreground">{item.name}</span>
            <span className="text-accent-foreground">💧{item.cost}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
        </button>
      ))}
    </div>
  );
}
