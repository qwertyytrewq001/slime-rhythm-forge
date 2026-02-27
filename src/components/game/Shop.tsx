import { useGameState } from '@/hooks/useGameState';
import { createElementSlime } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { SlimeTraits, SlimeElement } from '@/types/slime';
import { getUnlockedElements, ELEMENT_DISPLAY_NAMES, HABITAT_COSTS, HABITAT_THEMES, getPlayerLevel, ELEMENT_COLORS } from '@/data/traitData';
import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Sparkles, Home, Egg } from 'lucide-react';

// Canvas component for drawing a proper pixel-art egg
function EggCanvas({ element }: { element: SlimeElement }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 64, 64);
    ctx.imageSmoothingEnabled = false;

    const colors = ELEMENT_COLORS[element] || ELEMENT_COLORS['nature'];
    const baseColor = colors[0];
    const accentColor = colors[1] || colors[0];

    ctx.save();
    ctx.translate(32, 36); // Move down slightly
    
    // 1. Shadow under egg
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 24, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Proper Egg Shape (Ovoid: narrower at top)
    const drawEggPath = (c: CanvasRenderingContext2D, width: number, height: number) => {
      c.beginPath();
      // Start at bottom center
      c.moveTo(0, height/2);
      // Bottom curve
      c.bezierCurveTo(width/2, height/2, width/2, -height/4, 0, -height/2);
      // Top curve (narrower)
      c.bezierCurveTo(-width/2, -height/4, -width/2, height/2, 0, height/2);
      c.closePath();
    };

    // Darker outline
    ctx.fillStyle = darkenColor(baseColor, 0.5);
    drawEggPath(ctx, 44, 54);
    ctx.fill();

    // Main Body Gradient
    const grad = ctx.createRadialGradient(-5, -8, 2, 0, 0, 30);
    grad.addColorStop(0, lightenColor(baseColor, 1.5));
    grad.addColorStop(0.4, baseColor);
    grad.addColorStop(1, darkenColor(accentColor, 0.7));
    ctx.fillStyle = grad;
    drawEggPath(ctx, 40, 50);
    ctx.fill();

    // 3. Elemental Patterns (Specific to each element)
    ctx.save();
    ctx.clip(); // Keep patterns inside egg
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    switch(element) {
      case 'fire':
      case 'lava':
        // Flame patterns
        ctx.beginPath();
        for(let i=-1; i<=1; i++) {
          ctx.moveTo(i*10, 20);
          ctx.quadraticCurveTo(i*15, 0, i*5, -15);
        }
        ctx.stroke();
        break;
      case 'water':
      case 'ice':
        // Wave/Bubble patterns
        for(let i=0; i<4; i++) {
          ctx.beginPath();
          ctx.arc(Math.sin(i)*10, Math.cos(i)*15, 4, 0, Math.PI*2);
          ctx.stroke();
        }
        break;
      case 'plant':
      case 'nature':
        // Leaf/Vine patterns
        ctx.beginPath();
        ctx.moveTo(0, 25); ctx.lineTo(0, -20);
        ctx.moveTo(0, 5); ctx.lineTo(10, -5);
        ctx.moveTo(0, -5); ctx.lineTo(-10, -15);
        ctx.stroke();
        break;
      default:
        // Generic spots
        for(let i=0; i<6; i++) {
          ctx.beginPath();
          ctx.arc(Math.sin(i*2)*12, Math.cos(i*3)*18, 3, 0, Math.PI*2);
          ctx.stroke();
        }
    }
    ctx.restore();

    // 4. Glossy Shine
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(-8, -15, 5, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, [element]);

  return <canvas ref={canvasRef} width={64} height={64} className="w-16 h-16 pixel-art drop-shadow-md hover:scale-110 transition-transform cursor-pointer" />;
}

// Helper color functions duplicated for Shop.tsx context
function darkenColor(hex: string, factor: number): string {
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${r},${g},${b})`;
}
function lightenColor(hex: string, factor: number): string {
  const r = Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) * factor));
  const g = Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) * factor));
  const b = Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) * factor));
  return `rgb(${r},${g},${b})`;
}

const ITEM_SHOP = [
  { id: 'mutation_juice', name: 'Mutation Juice', desc: 'Next breed: 50% mutation rate', cost: 30, icon: '🧪' },
  { id: 'wild_food', name: 'Wild Food', desc: 'Boost a random trait on selected slime', cost: 20, icon: '🥩' },
  { id: 'element_treat', name: 'Element Treat', desc: 'Feed selected slime (+happiness)', cost: 15, icon: '🍬' },
];

const STARTER_EGG_COST = 40;

export function Shop() {
  const { state, dispatch, playerLevel } = useGameState();
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
    <div className="flex flex-col h-full w-full bg-[#1a2418]/90 text-primary-foreground border-l-4 border-primary/30" 
         style={{ fontFamily: "'VT323', monospace", backgroundImage: 'radial-gradient(circle at center, rgba(74, 93, 69, 0.2) 0%, transparent 70%)' }}>
      
      {/* Merchant Header - Stylized */}
      <div className="p-4 border-b-2 border-primary/20 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary animate-pulse">
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black text-primary uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Mystic Bazaar
            </h2>
            <p className="text-xs text-primary/60 italic mt-1">
              "The spirits guide your choice..."
            </p>
          </div>
          <div className="ml-auto bg-primary/20 px-3 py-1.5 rounded-lg border-2 border-primary/40 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
            <span className="text-base font-bold text-primary">{Math.floor(state.goo)}g</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="eggs" className="flex-1 flex flex-col min-h-0 mt-2">
        <div className="px-4">
          <TabsList className="grid grid-cols-3 w-full bg-black/40 border border-primary/20 h-10">
            <TabsTrigger value="eggs" className="text-[10px] uppercase tracking-tighter data-[state=active]:bg-primary/30 data-[state=active]:text-primary-foreground">
              Ancient Eggs
            </TabsTrigger>
            <TabsTrigger value="items" className="text-[10px] uppercase tracking-tighter data-[state=active]:bg-accent/30">
              Arcane Tools
            </TabsTrigger>
            <TabsTrigger value="habitats" className="text-[10px] uppercase tracking-tighter data-[state=active]:bg-secondary/30">
              Sanctuaries
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden relative mt-2">
          {/* Eggs Grid */}
          <TabsContent value="eggs" className="h-full m-0 outline-none">
            <ScrollArea className="h-full">
              <div className="p-4 grid grid-cols-2 gap-3">
                {unlockedElements.map(elem => (
                  <div
                    key={elem}
                    onClick={() => handleBuyEgg(elem)}
                    className={`group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300
                      ${state.goo >= STARTER_EGG_COST 
                        ? 'bg-primary/5 border-primary/20 hover:border-primary hover:bg-primary/10 cursor-pointer active:scale-95' 
                        : 'bg-black/40 border-white/5 opacity-50 grayscale'}`}
                  >
                    <EggCanvas element={elem} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-3 h-3 text-primary animate-spin-slow" />
                    </div>
                    <span className="mt-2 text-xs font-black text-primary group-hover:scale-110 transition-transform uppercase tracking-wider">
                      {ELEMENT_DISPLAY_NAMES[elem]}
                    </span>
                    <div className="mt-2 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-primary/20">
                      <span className="text-[10px] font-bold text-primary">{STARTER_EGG_COST}g</span>
                    </div>
                  </div>
                ))}
                {playerLevel < 11 && (
                  <div className="col-span-2 py-6 text-center border-t-2 border-dashed border-primary/10 mt-2">
                    <p className="text-[10px] text-primary/40 uppercase tracking-widest font-bold">
                      Spirit Level {playerLevel < 6 ? '6' : '11'} needed for more eggs
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Items & Habitats would be similarly themed... */}
          <TabsContent value="items" className="h-full m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-3">
                {ITEM_SHOP.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleBuyItem(item.id, item.cost)}
                    disabled={state.goo < item.cost}
                    className="w-full flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border-2 border-primary/20 hover:border-accent hover:bg-accent/10 transition-all active:scale-[0.98] disabled:opacity-40 text-left"
                  >
                    <div className="text-3xl bg-black/40 w-12 h-12 flex items-center justify-center rounded-xl border border-primary/20">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-primary-foreground uppercase">{item.name}</span>
                        <span className="text-xs font-bold text-primary">{item.cost}g</span>
                      </div>
                      <p className="text-[10px] text-primary/60 mt-1 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="habitats" className="h-full m-0">
            <ScrollArea className="h-full p-4">
              <div className="grid grid-cols-1 gap-3">
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
                      className="group flex items-center gap-4 p-3 bg-primary/5 rounded-2xl border-2 border-primary/20 hover:border-secondary transition-all active:scale-[0.98] disabled:opacity-40 text-left"
                    >
                      <div className="w-12 h-12 rounded-xl border-2 shadow-inner" 
                           style={{ backgroundColor: theme.bg, borderColor: theme.accent }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-primary-foreground uppercase truncate">
                            {ELEMENT_DISPLAY_NAMES[elem]} Sanctum
                          </span>
                          <span className="text-xs font-bold text-secondary-foreground">
                            {cost}g
                          </span>
                        </div>
                        <p className="text-[10px] text-primary/60 truncate italic">{theme.desc}</p>
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
