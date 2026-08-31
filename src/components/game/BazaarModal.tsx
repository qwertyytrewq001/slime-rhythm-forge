import React, { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { createElementSlime } from '@/utils/slimeGenerator';
import { audioEngine } from '@/utils/audioEngine';
import { SlimeTraits, SlimeElement, Slime } from '@/types/slime';
import { getUnlockedElements, ELEMENT_DISPLAY_NAMES, HABITAT_COSTS, HABITAT_THEMES, getPlayerLevel, ELEMENT_COLORS, ALL_ELEMENTS } from '@/data/traitData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Sparkles, Home, Egg, X, Trophy, Star, Zap, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ELEMENT_EGG_IMAGE: Record<SlimeElement, string> = {
  fire: 'egg_fire.png',
  water: 'egg_water.png',
  plant: 'egg_plant.png',
  earth: 'egg_earth.png',
  wind: 'egg_wind.png',
  ice: 'egg_ice.png',
  electric: 'egg_electric.png',
  metal: 'egg_metal.png',
  light: 'egg_light.png',
  shadow: 'egg_shadow.png',
};

const ITEM_SHOP = [
  { id: 'mutation_juice', name: 'Mutation Juice', desc: 'Next breed: 50% mutation rate', cost: 30, icon: '🧪', category: 'breeding', rarity: 'rare' },
  { id: 'wild_food', name: 'Wild Food', desc: 'Boost a random trait on selected slime', cost: 20, icon: '🥩', category: 'boosts', rarity: 'common' },
  { id: 'element_treat', name: 'Element Treat', desc: 'Feed selected slime (+happiness)', cost: 15, icon: '🍬', category: 'boosts', rarity: 'common' },
  { id: 'energy_crystal', name: 'Energy Crystal', desc: 'Instantly complete hatching', cost: 50, icon: '💎', category: 'time', rarity: 'epic' },
  { id: 'lucky_charm', name: 'Lucky Charm', desc: 'Higher chance of rare offspring', cost: 40, icon: '🍀', category: 'breeding', rarity: 'rare' },
];

const STARTER_EGG_COST = 50;
const SHOP_EGG_ELEMENTS: SlimeElement[] = ALL_ELEMENTS;
const SHOP_HABITAT_ELEMENTS: SlimeElement[] = ALL_ELEMENTS;

interface BazaarModalProps {
  onClose: () => void;
}

import { triggerDialogue } from '@/utils/dialogueTriggers';

const hasSeenEvent = (eventName: string): boolean => {
  return localStorage.getItem(`glim_event_${eventName}`) === 'true';
};

export function BazaarModal({ onClose }: BazaarModalProps) {
  const { state, dispatch, playerLevel } = useGameState();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<'eggs' | 'habitats'>('eggs');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Pagination settings
  const EGGS_PER_PAGE = 4;
  const HABITATS_PER_PAGE = 3;

  const unlockedElements = getUnlockedElements(playerLevel);

  const getRequiredLevel = (element: SlimeElement): number => {
    return 1;
  };

  const handleBuyEgg = (element: SlimeElement) => {
    const reqLevel = getRequiredLevel(element);
    if (playerLevel < reqLevel) {
      toast({
        title: "Level Too Low",
        description: `Your spirit resonance must reach Level ${reqLevel} to summon this egg!`,
        variant: "destructive"
      });
      return;
    }
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
    
    if (!state.completedTutorialChapters.includes('breeding') && !hasSeenEvent('firstBazaarOpen')) {
      triggerDialogue('shop-purchase');
    }

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

    if (!state.completedTutorialChapters.includes('breeding') && !hasSeenEvent('firstBazaarOpen')) {
      triggerDialogue('shop-purchase');
    }

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
        if (state.selectedSlimeId) dispatch({ type: 'FEED_SLIME_XP', slimeId: state.selectedSlimeId, foodType: 'elemental' });
        break;
      case 'energy_crystal':
        if (state.activeHatching) {
          dispatch({ type: 'FINISH_HATCHING' });
          toast({
            title: "Egg Ready!",
            description: "Your egg has instantly hatched!",
          });
        }
        break;
      case 'lucky_charm':
        dispatch({ type: 'ACTIVATE_MUTATION_JUICE' });
        break;
    }
  };

  const handleBuyHabitat = (elem: SlimeElement, cost: number) => {
    if (state.goo >= cost) {
      dispatch({ type: 'SPEND_GOO', amount: cost });
      audioEngine.playSfx('purchase');
      
      // Start habitat placement flow - go to sanctuaries with pending habitat
      dispatch({ type: 'START_HABITAT_PLACEMENT', element: elem });
      
      // Close bazaar and go to sanctuaries
      onClose();
      
      if (!state.completedTutorialChapters.includes('habitats')) {
        triggerDialogue('habitat-purchase');
      }
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-200';
      case 'rare': return 'shadow-blue-200';
      case 'epic': return 'shadow-purple-200';
      case 'legendary': return 'shadow-yellow-200';
      default: return 'shadow-gray-200';
    }
  };

  // Pagination functions
  const getCurrentPageItems = () => {
    switch (selectedCategory) {
      case 'eggs':
        const eggsStart = currentPage * EGGS_PER_PAGE;
        return SHOP_EGG_ELEMENTS.slice(eggsStart, eggsStart + EGGS_PER_PAGE);
      case 'habitats':
        const habitatsStart = currentPage * HABITATS_PER_PAGE;
        return SHOP_HABITAT_ELEMENTS.slice(habitatsStart, habitatsStart + HABITATS_PER_PAGE);
      default:
        return [];
    }
  };

  const getTotalPages = () => {
    switch (selectedCategory) {
      case 'eggs':
        return Math.ceil(SHOP_EGG_ELEMENTS.length / EGGS_PER_PAGE);
      case 'habitats':
        return Math.ceil(SHOP_HABITAT_ELEMENTS.length / HABITATS_PER_PAGE);
      default:
        return 1;
    }
  };

  const handleNextPage = () => {
    if (currentPage < getTotalPages() - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset page when category changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory]);

  return (
    <div className="fixed inset-0 z-[250] p-0">
      {/* Main Content - Transparent Background */}
      <div className="relative w-full h-full bg-white/20 backdrop-blur-sm rounded-3xl border-4 border-[#FF7EB6]/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-pink-200 to-pink-300 p-6 text-pink-800 border-b-4 border-pink-300/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center border-2 border-pink-300">
                <ShoppingBag className="w-10 h-10 text-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                  MYSTIC BAZAAR
                </h1>
                <p className="text-lg opacity-90 font-bold text-pink-700">Treasures from slime world...</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/60 px-6 py-3 rounded-2xl border-2 border-pink-300">
                <span className="text-2xl font-bold text-pink-700">{Math.floor(state.goo)}g</span>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white/60 hover:bg-white/80 rounded-2xl transition-colors border-2 border-pink-300"
              >
                <X className="w-6 h-6 text-pink-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col max-h-[calc(100vh-200px)]">
          {/* Items Display - Horizontal Layout */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <div className="w-full max-w-6xl">
              <div className="flex items-center justify-center gap-8">
                {/* Previous Arrow */}
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`p-4 rounded-full transition-all ${
                    currentPage === 0 
                      ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                      : 'bg-pink-200 hover:bg-pink-300 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-6 h-6 text-pink-700" />
                </button>

                {/* Items Container */}
                <div className="flex gap-8 flex-1 justify-center items-stretch">
                  {selectedCategory === 'eggs' && (
                    getCurrentPageItems().map(elem => {
                      return (
                        <div
                          key={elem}
                          onClick={() => handleBuyEgg(elem)}
                          className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 w-48 h-80 ${
                            state.goo >= STARTER_EGG_COST 
                              ? 'hover:scale-105' 
                              : 'opacity-40 grayscale'
                          }`}
                        >
                          {/* Egg Display - Fixed Alignment */}
                          <div className="h-32 flex items-center justify-center mb-4">
                            <div
                              className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner overflow-hidden"
                              style={{
                                background: `radial-gradient(circle, ${ELEMENT_COLORS[elem]?.[2] || '#FF7EB6'}55, ${ELEMENT_COLORS[elem]?.[0] || '#FF7EB6'}22)`,
                              }}
                            >
                              <img
                                src={`${import.meta.env.BASE_URL}${ELEMENT_EGG_IMAGE[elem]}`}
                                alt={`${ELEMENT_DISPLAY_NAMES[elem]} Egg`}
                                className="w-20 h-20 object-contain drop-shadow-lg hover:scale-110 transition-transform cursor-pointer"
                                style={{ imageRendering: 'auto' }}
                              />
                            </div>
                          </div>
                          
                          {/* Description Underneath */}
                          <div className="text-center flex-1 flex flex-col justify-end">
                            <h3 className="text-lg font-black text-slate-700 uppercase tracking-widest mb-2 transition-colors" 
                                style={{
                                  '--hover-color': ELEMENT_COLORS[elem]?.[0] || '#FF7EB6'
                                } as React.CSSProperties}>
                              <span className="group-hover:[color:var(--hover-color)]">
                                {ELEMENT_DISPLAY_NAMES[elem]} Egg
                              </span>
                            </h3>
                            <p className="text-xs text-pink-600 mb-3 max-w-xs">
                              A mysterious {ELEMENT_DISPLAY_NAMES[elem].toLowerCase()} egg waiting to be hatched.
                            </p>
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (state.goo >= STARTER_EGG_COST) {
                                  handleBuyEgg(elem);
                                }
                              }}
                              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-full border-2 cursor-pointer transition-all transform active:scale-95 mt-4 ${
                                state.goo >= STARTER_EGG_COST 
                                  ? 'bg-gradient-to-r from-pink-300 to-pink-400 text-white border-pink-400 hover:from-pink-400 hover:to-pink-500 shadow-lg' 
                                  : 'bg-pink-100 text-pink-700 border-pink-300 cursor-not-allowed'
                              }`}
                            >
                              <span className="text-sm font-bold">{STARTER_EGG_COST}g</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {selectedCategory === 'habitats' && (
                    getCurrentPageItems().map(elem => {
                      const cost = HABITAT_COSTS[elem];
                      const theme = HABITAT_THEMES[elem];
                      return (
                        <div
                          key={elem}
                          onClick={() => state.goo >= cost && handleBuyHabitat(elem, cost)}
                          className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 w-48 h-80 ${
                            state.goo >= cost 
                              ? 'hover:scale-105' 
                              : 'opacity-40 grayscale'
                          }`}
                        >
                          {/* Habitat Preview - Original Sanctuaries Style */}
                          <div className="w-40 h-40 rounded-[2.5rem] border-[6px] p-2 flex items-center justify-center relative overflow-hidden cursor-pointer transition-all hover:scale-110 group shadow-[0_20px_50px_rgba(0,0,0,0.8)] mb-2"
                               style={{
                                 borderColor: theme.accent + '99',
                                 backgroundColor: theme.bgImage ? 'transparent' : theme.bg + 'CC',
                                 backgroundImage: theme.bgImage ? `url("${theme.bgImage}")` : 'none',
                                 backgroundSize: 'cover',
                                 backgroundPosition: 'center',
                                 boxShadow: `0 15px 40px rgba(0,0,0,0.7), inset 0 0 30px ${theme.accent}30`,
                                 transform: 'perspective(1000px) rotateX(5deg) rotateY(-5deg)'
                               }}
                          >
                            {/* Inner glow effect from sanctuaries */}
                            <div
                              className="absolute inset-0 opacity-30 rounded-lg"
                              style={{ background: `radial-gradient(circle, ${theme.accent}60, transparent)` }}
                            />
                          </div>
                          
                          {/* Description Underneath - No Card Background */}
                          <div className="text-center flex-1 flex flex-col justify-end">
                            <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest mb-3 transition-colors" 
                                style={{
                                  '--hover-color': ELEMENT_COLORS[elem]?.[0] || '#FF7EB6'
                                } as React.CSSProperties}>
                              <span className="group-hover:[color:var(--hover-color)]">
                                {ELEMENT_DISPLAY_NAMES[elem]} Sanctum
                              </span>
                            </h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-sm leading-relaxed font-bold italic">
                              {theme.desc}
                            </p>
                            
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (state.goo >= cost) {
                                  handleBuyHabitat(elem, cost);
                                }
                              }}
                              className={`flex items-center justify-center gap-1 px-4 py-2 rounded-full border-2 cursor-pointer transition-all transform active:scale-95 mt-4 ${
                                state.goo >= cost 
                                  ? 'bg-[#FF7EB6] text-white border-[#FF7EB6] hover:bg-[#FF1493] hover:border-[#FF1493] shadow-lg' 
                                  : 'bg-white/60 text-[#FF7EB6] border-[#FF7EB6]/30 cursor-not-allowed'
                              }`}
                            >
                              <span className="text-sm font-bold">{cost}g</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Next Arrow */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= getTotalPages() - 1}
                  className={`p-4 rounded-full transition-all ${
                    currentPage >= getTotalPages() - 1 
                      ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                      : 'bg-pink-200 hover:bg-pink-300 cursor-pointer'
                  }`}
                >
                  <ChevronRight className="w-6 h-6 text-pink-700" />
                </button>
              </div>

              {/* Page Indicator */}
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: getTotalPages() }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentPage 
                        ? 'bg-[#FF7EB6] scale-125' 
                        : 'bg-pink-300 hover:bg-pink-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation - Bottom */}
        <div className="bg-white/90 p-6 border-t-2 border-[#FF7EB6]/20">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setSelectedCategory('eggs')}
              className={`px-8 py-4 rounded-2xl font-bold transition-all ${
                selectedCategory === 'eggs' 
                  ? 'bg-gradient-to-r from-pink-300 to-pink-400 text-white shadow-lg scale-105' 
                  : 'bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700'
              }`}
            >
              <Egg className="w-6 h-6 inline mr-2" />
              EGGS
            </button>
            <button
              onClick={() => setSelectedCategory('habitats')}
              className={`px-8 py-4 rounded-2xl font-bold transition-all ${
                selectedCategory === 'habitats' 
                  ? 'bg-gradient-to-r from-pink-300 to-pink-400 text-white shadow-lg scale-105' 
                  : 'bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700'
              }`}
            >
              <Home className="w-6 h-6 inline mr-2" />
              SANCTUMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
