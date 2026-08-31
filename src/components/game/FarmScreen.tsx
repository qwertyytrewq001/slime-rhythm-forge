import React, { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { CROP_CONFIG, CROP_INFO, FARM_PLOT_UNLOCK_COSTS, SlimeFoodType } from '@/types/slime';
import { formatTime } from '@/utils/timeUtils';
import { Lock, X } from 'lucide-react';

interface FarmScreenProps {
  onClose: () => void;
}

const CROP_TYPES: SlimeFoodType[] = ['basic', 'elemental', 'royal'];

function plotArt(cropType: SlimeFoodType | null, progress: number): string {
  if (!cropType) return `${import.meta.env.BASE_URL}plot_empty.png`;
  if (progress >= 1) return `${import.meta.env.BASE_URL}plot_ripe.png`;
  if (progress >= 0.5) return `${import.meta.env.BASE_URL}plot_growing.png`;
  return `${import.meta.env.BASE_URL}plot_seed.png`;
}

export function FarmScreen({ onClose }: FarmScreenProps) {
  const { state, dispatch } = useGameState();
  const [now, setNow] = useState(Date.now());
  const [pickerPlotId, setPickerPlotId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-6xl max-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${import.meta.env.BASE_URL}farm_background.jpg")` }}
        />
        <div className="absolute inset-0 bg-black/20" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-50 border-2 border-red-400/50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="absolute top-6 left-6 flex items-center gap-3 z-40">
          <h2
            className="text-xl text-[#FF7EB6] font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            Farm
          </h2>
          <span className="text-white/80 text-sm font-bold">{state.goo.toFixed(1)} 💧</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="grid grid-cols-3 gap-10 pointer-events-auto p-8 pt-24">
            {state.farmPlots.map(plot => {
              if (!plot.unlocked) {
                const cost = FARM_PLOT_UNLOCK_COSTS[plot.id] ?? 0;
                const canAfford = state.goo >= cost;
                return (
                  <button
                    key={plot.id}
                    disabled={!canAfford}
                    onClick={() => dispatch({ type: 'UNLOCK_FARM_PLOT', plotId: plot.id })}
                    className={`w-36 h-36 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                      canAfford
                        ? 'border-[#FF7EB6]/60 bg-black/30 hover:bg-black/50 hover:scale-105 cursor-pointer'
                        : 'border-white/20 bg-black/40 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="w-8 h-8 text-white/60" />
                    <span className="text-xs text-white/70 font-bold">{cost} 💧</span>
                  </button>
                );
              }

              const progress = plot.readyAt && plot.plantedAt
                ? Math.min(1, (now - plot.plantedAt) / (plot.readyAt - plot.plantedAt))
                : 0;
              const isReady = plot.cropType && plot.readyAt && now >= plot.readyAt;

              return (
                <button
                  key={plot.id}
                  onClick={() => {
                    if (!plot.cropType) {
                      setPickerPlotId(plot.id);
                    } else if (isReady) {
                      dispatch({ type: 'HARVEST_CROP', plotId: plot.id });
                    }
                  }}
                  className="w-36 h-36 flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105"
                >
                  <img
                    src={plotArt(plot.cropType, progress)}
                    alt={plot.cropType ?? 'Empty plot'}
                    className={`w-32 h-32 object-contain drop-shadow-lg ${isReady ? 'animate-bounce' : ''}`}
                  />
                  {plot.cropType && !isReady && plot.readyAt && (
                    <span className="text-[10px] text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {formatTime(plot.readyAt - now)}
                    </span>
                  )}
                  {isReady && (
                    <span className="text-[10px] text-[#FF7EB6] font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase animate-pulse">
                      Harvest!
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {pickerPlotId !== null && (
          <div
            className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center"
            onClick={() => setPickerPlotId(null)}
          >
            <div
              className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-3xl border-4 border-[#FF7EB6] shadow-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-[#FF1493] mb-4 uppercase text-center" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                Plant a Crop
              </h3>
              <div className="flex flex-col gap-3">
                {CROP_TYPES.map(cropType => {
                  const crop = CROP_INFO[cropType];
                  const config = CROP_CONFIG[cropType];
                  const ownedSeeds = state.seeds[cropType] || 0;
                  const canAffordSeed = state.goo >= config.seedCost;
                  return (
                    <div
                      key={cropType}
                      className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{crop.icon}</span>
                        <div className="text-left">
                          <p className="text-sm font-black text-gray-800">{crop.name}</p>
                          <p className="text-xs text-gray-500">{crop.description}</p>
                          <p className="text-xs text-gray-500">Grows in {formatTime(config.growTimeMs)} · Seeds owned: {ownedSeeds}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-stretch">
                        <button
                          disabled={ownedSeeds < 1}
                          onClick={() => {
                            dispatch({ type: 'PLANT_CROP', plotId: pickerPlotId, cropType });
                            setPickerPlotId(null);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            ownedSeeds >= 1
                              ? 'bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] text-white hover:scale-105 shadow'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Plant
                        </button>
                        <button
                          disabled={!canAffordSeed}
                          onClick={() => dispatch({ type: 'BUY_SEED', seedType: cropType })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            canAffordSeed
                              ? 'bg-green-500 text-white hover:scale-105 shadow'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Buy Seed {config.seedCost} 💧
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setPickerPlotId(null)}
                className="mt-4 w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
