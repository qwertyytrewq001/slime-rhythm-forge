import React, { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SLIME_FOODS, SlimeFoodType } from '@/types/slime';
import { Backpack, X, ShoppingCart, Sparkles } from 'lucide-react';

interface FoodBagProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DraggedFood {
  foodId: SlimeFoodType;
  fromBag: boolean;
}

export function FoodBag({ isOpen, onClose }: FoodBagProps) {
  const { state, dispatch } = useGameState();
  const [draggedFood, setDraggedFood] = useState<DraggedFood | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop'>('inventory');

  const handleDragStart = (e: React.DragEvent, foodId: SlimeFoodType) => {
    const owned = state.inventory[foodId] || 0;
    if (owned > 0) {
      setDraggedFood({ foodId, fromBag: true });
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ foodId, fromBag: true }));
      
      // Remove one item from inventory when dragging starts
      dispatch({ type: 'REMOVE_FROM_INVENTORY', foodType: foodId, quantity: 1 });
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (draggedFood && e.dataTransfer.dropEffect === 'none') {
      // Drag was cancelled, return food to inventory
      dispatch({ type: 'ADD_TO_INVENTORY', foodType: draggedFood.foodId, quantity: 1 });
    }
    setDraggedFood(null);
  };

  const handleBuyFood = (foodId: SlimeFoodType) => {
    const food = SLIME_FOODS[foodId];
    if (state.goo >= food.cost) {
      dispatch({ type: 'SPEND_GOO', amount: food.cost });
      dispatch({ type: 'ADD_TO_INVENTORY', foodType: foodId, quantity: 1 });
    }
  };

  const getFoodRarityColor = (foodId: SlimeFoodType) => {
    switch (foodId) {
      case 'basic': return 'border-green-400 bg-green-50';
      case 'elemental': return 'border-blue-400 bg-blue-50';
      case 'royal': return 'border-purple-400 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getFoodGlowEffect = (foodId: SlimeFoodType) => {
    switch (foodId) {
      case 'basic': return 'shadow-green-200';
      case 'elemental': return 'shadow-blue-200';
      case 'royal': return 'shadow-purple-200';
      default: return 'shadow-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-3xl border-4 border-[#FF7EB6] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Backpack className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>Food Bag</h2>
                <p className="text-sm opacity-90">Manage your slime food inventory</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2 px-4 rounded-md font-bold transition-all ${
                activeTab === 'inventory' ? 'bg-white text-[#FF1493]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Backpack className="w-4 h-4 inline mr-2" />
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex-1 py-2 px-4 rounded-md font-bold transition-all ${
                activeTab === 'shop' ? 'bg-white text-[#FF1493]' : 'text-white/70 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Shop
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'inventory' ? (
            <div>
              <div className="mb-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Sparkles className="w-5 h-5" />
                  <p className="text-sm font-bold">Drag food to habitat floor to feed your slimes!</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(SLIME_FOODS) as SlimeFoodType[]).map(foodId => {
                  const food = SLIME_FOODS[foodId];
                  const owned = state.inventory[foodId] || 0;
                  
                  return (
                    <div
                      key={foodId}
                      draggable={owned > 0}
                      onDragStart={(e) => handleDragStart(e, foodId)}
                      onDragEnd={(e) => handleDragEnd(e)}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-move ${
                        owned > 0 
                          ? `${getFoodRarityColor(foodId)} hover:scale-105 hover:shadow-lg ${getFoodGlowEffect(foodId)}`
                          : 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <span className="text-4xl filter drop-shadow-sm">{food.icon}</span>
                          {owned > 0 && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] text-white text-sm w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                              {owned}
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-gray-800 uppercase" style={{ fontFamily: "'VT323', monospace" }}>{food.name}</p>
                          <p className="text-xs text-gray-600">+{food.xpValue} XP</p>
                        </div>
                        {owned === 0 && (
                          <div className="text-xs text-gray-500 text-center">None owned</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-800">
                    <ShoppingCart className="w-5 h-5" />
                    <p className="text-sm font-bold">Buy food to stock up your inventory!</p>
                  </div>
                  <div className="text-lg font-black text-green-800">{state.goo.toFixed(1)} 💧</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(SLIME_FOODS) as SlimeFoodType[]).map(foodId => {
                  const food = SLIME_FOODS[foodId];
                  const canAfford = state.goo >= food.cost;
                  
                  return (
                    <div
                      key={foodId}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        canAfford 
                          ? `${getFoodRarityColor(foodId)} hover:scale-102 hover:shadow-lg ${getFoodGlowEffect(foodId)}`
                          : 'bg-gray-100 border-gray-300 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl filter drop-shadow-sm">{food.icon}</span>
                          <div>
                            <p className="text-sm font-black text-gray-800 uppercase" style={{ fontFamily: "'VT323', monospace" }}>{food.name}</p>
                            <p className="text-xs text-gray-600">+{food.xpValue} XP</p>
                            <p className="text-xs text-gray-500 mt-1">{food.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBuyFood(foodId)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            canAfford 
                              ? 'bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] text-white hover:scale-105 shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {food.cost} 💧
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-bold">Total Items: {Object.values(state.inventory).reduce((sum, count) => sum + count, 0)}</p>
              <p className="text-xs opacity-80">Available Goo: {state.goo.toFixed(1)} 💧</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
