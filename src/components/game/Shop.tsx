import { useGameState } from '@/hooks/useGameState';
import { createElementSlime } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { SlimeTraits, SlimeElement, Slime } from '@/types/slime';
import { getUnlockedElements, ELEMENT_DISPLAY_NAMES, HABITAT_COSTS, HABITAT_THEMES, getPlayerLevel, ELEMENT_COLORS } from '@/data/traitData';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Sparkles, Home, Egg } from 'lucide-react';
import { drawEnhancedEgg } from '@/utils/eggRenderer';
import { useToast } from '@/hooks/use-toast';

// Canvas component for drawing a proper pixel-art egg
function EggCanvas({ element }: { element: SlimeElement }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Create a stable mock slime for the shop preview so the egg looks unique but consistent
  const mockSlime = useMemo<Slime>(() => ({
    id: element + '_preview',
    name: 'Preview',
    element: element,
    elements: [element],
    rarityScore: 10,
    rarityStars: 1,
    rarityTier: 'Common',
    createdAt: 0,
    traits: {
      shape: element.length,
      color1: element.charCodeAt(0),
      color2: element.charCodeAt(1),
      eyes: 1,
      mouth: 1,
      spikes: element.length > 5 ? 6 : 2,
      pattern: element.charCodeAt(2) || 0,
      glow: 1,
      size: 1,
      aura: 0,
      rhythm: 1,
      accessory: 0,
      model: 0
    }
  }), [element]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawEnhancedEgg(ctx, {
      size: 80,
      slime: mockSlime
    });
  }, [mockSlime]);

  return <canvas ref={canvasRef} width={80} height={80} className="w-20 h-20 pixel-art drop-shadow-md hover:scale-110 transition-transform cursor-pointer" />;
}

const ITEM_SHOP = [
  { id: 'mutation_juice', name: 'Mutation Juice', desc: 'Next breed: 50% mutation rate', cost: 30, icon: '🧪' },
  { id: 'wild_food', name: 'Wild Food', desc: 'Boost a random trait on selected slime', cost: 20, icon: '🥩' },
  { id: 'element_treat', name: 'Element Treat', desc: 'Feed selected slime (+happiness)', cost: 15, icon: '🍬' },
];

const STARTER_EGG_COST = 40;

export function Shop() {
  const { state, dispatch, playerLevel } = useGameState();
  const { toast } = useToast();
  const unlockedElements = getUnlockedElements(playerLevel);

  const handleBuyEgg = (element: SlimeElement) => {
    if (state.goo < STARTER_EGG_COST) return;
    if (state.activeHatching) {
      toast({
        title: "Hatchery Occupied",
        description: "An egg is already being incubated!",
        variant: "destructive"
      });
      return;
    }
    dispatch({ type: 'SPEND_GOO', amount: STARTER_EGG_COST });
    audioEngine.playSfx('purchase');
    const newSlime = createElementSlime(element);
    dispatch({ type: 'START_HATCHING', slime: newSlime, duration: 10000 });
    toast({
      title: "Egg Purchased!",
      description: `${ELEMENT_DISPLAY_NAMES[element]} Egg is now on the Hatchery Bench.`,
    });
  };

  const handleBuyItem = (itemId: string, cost: number) => {
    if (state.goo < cost) return;
    dispatch({ type: 'SPEND_GOO', amount: cost });
    audioEngine.playSfx('purchase');
    switch (itemId) {
      case 'mutation_juice': dispatch({ type: 'ACTIVATE_MUTATION_JUICE' }); break;
      case 'wild_food':
        if (state.selectedSlimeId) {
          const traitKeys: (keyof SlimeTraits)[] = ['shape', 'color1', 'color2', 'eyes', 'mouth', 'spikes', 'pattern', 'glow', 'aura', 'rhythm', 'accessory'];
          const randomTrait = traitKeys[Math.floor(Math.random() * traitKeys.length)];
          dispatch({ type: 'BOOST_TRAIT', slimeId: state.selectedSlimeId, trait: randomTrait });
        }
        break;
      case 'element_treat':
        if (state.selectedSlimeId) dispatch({ type: 'FEED_SLIME', slimeId: state.selectedSlimeId });
        break;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a140a]/95 text-primary-foreground border-l-4 border-primary/20" 
         style={{ fontFamily: "'VT323', monospace", backgroundImage: 'radial-gradient(circle at center, rgba(74, 93, 69, 0.15) 0%, transparent 80%)' }}>
      
      <div className="p-6 border-b-2 border-primary/10 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/40 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-black text-primary uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Mystic Bazaar
            </h2>
            <p className="text-sm text-primary/60 italic mt-1 font-bold">
              Treasures from the slime world...
            </p>
          </div>
          <div className="ml-auto bg-black/40 px-4 py-2 rounded-xl border-2 border-primary/30">
            <span className="text-xl font-bold text-primary tracking-tight">{Math.floor(state.goo)}g</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="eggs" className="flex-1 flex flex-col min-h-0 mt-4">
        <div className="px-6">
          <TabsList className="grid grid-cols-3 w-full bg-black/40 border-2 border-primary/10 h-12 p-1 rounded-xl">
            <TabsTrigger value="eggs" className="text-xs uppercase font-black data-[state=active]:bg-primary/20 data-[state=active]:text-white">
              Eggs
            </TabsTrigger>
            <TabsTrigger value="items" className="text-xs uppercase font-black data-[state=active]:bg-primary/20">
              Tools
            </TabsTrigger>
            <TabsTrigger value="habitats" className="text-xs uppercase font-black data-[state=active]:bg-primary/20">
              Sanctums
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden mt-4">
          <TabsContent value="eggs" className="h-full m-0 outline-none">
            <ScrollArea className="h-full px-6 pb-6">
              <div className="grid grid-cols-2 gap-5">
                {unlockedElements.map(elem => (
                  <div
                    key={elem}
                    onClick={() => handleBuyEgg(elem)}
                    className={`group relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300
                      ${state.goo >= STARTER_EGG_COST 
                        ? 'bg-white/5 border-primary/20 hover:border-primary hover:bg-white/10 cursor-pointer active:scale-95' 
                        : 'bg-black/40 border-white/5 opacity-40 grayscale'}`}
                  >
                    <EggCanvas element={elem} />
                    <span className="mt-4 text-sm font-black text-white group-hover:text-primary uppercase tracking-widest transition-colors">
                      {ELEMENT_DISPLAY_NAMES[elem]} Slime
                    </span>
                    <div className="mt-2 flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-primary/20">
                      <span className="text-xs font-bold text-primary">{STARTER_EGG_COST}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="items" className="h-full m-0">
            <ScrollArea className="h-full px-6 pb-6">
              <div className="space-y-4">
                {ITEM_SHOP.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleBuyItem(item.id, item.cost)}
                    disabled={state.goo < item.cost}
                    className="w-full flex items-center gap-5 p-5 bg-white/5 rounded-3xl border-2 border-primary/10 hover:border-primary hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-30 text-left"
                  >
                    <div className="text-4xl bg-black/40 w-16 h-16 flex items-center justify-center rounded-2xl border-2 border-primary/10">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-black text-white uppercase">{item.name}</span>
                        <span className="text-sm font-bold text-primary">{item.cost}g</span>
                      </div>
                      <p className="text-[13px] text-white/60 leading-tight font-bold italic">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="habitats" className="h-full m-0">
            <ScrollArea className="h-full px-6 pb-6">
              <div className="grid grid-cols-1 gap-4">
                {unlockedElements.map(elem => {
                  const cost = HABITAT_COSTS[elem];
                  const theme = HABITAT_THEMES[elem];
                  return (
                    <button
                      key={elem}
                      onClick={() => {
                        if (state.goo >= cost && state.habitats.length < 16) {
                          dispatch({ type: 'SPEND_GOO', amount: cost });
                          dispatch({ type: 'BUY_HABITAT', element: elem });
                          audioEngine.playSfx('purchase');
                        }
                      }}
                      disabled={state.goo < cost || state.habitats.length >= 16}
                      className="group flex items-center gap-5 p-4 bg-white/5 rounded-3xl border-2 border-primary/10 hover:border-primary transition-all active:scale-[0.98] disabled:opacity-30 text-left"
                    >
                      <div className="w-14 h-14 rounded-2xl border-2 shadow-inner flex-shrink-0" 
                           style={{ backgroundColor: theme.bg, borderColor: theme.accent }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-white uppercase truncate">
                            {ELEMENT_DISPLAY_NAMES[elem]} Sanctum
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {cost}g
                          </span>
                        </div>
                        <p className="text-xs text-white/50 truncate italic font-bold mt-1">{theme.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
