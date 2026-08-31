import React, { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { CROP_CONFIG, CROP_INFO, FARM_PLOT_UNLOCK_COSTS, SlimeFoodType } from '@/types/slime';
import { formatTime } from '@/utils/timeUtils';
import { Lock, X, Sprout } from 'lucide-react';

const CROP_ACCENT: Record<SlimeFoodType, { border: string; glow: string; chip: string }> = {
  basic: { border: 'border-green-400', glow: 'shadow-green-300/40', chip: 'bg-green-100 text-green-700' },
  elemental: { border: 'border-blue-400', glow: 'shadow-blue-300/40', chip: 'bg-blue-100 text-blue-700' },
  royal: { border: 'border-purple-400', glow: 'shadow-purple-300/40', chip: 'bg-purple-100 text-purple-700' },
};

interface FarmScreenProps {
  onClose: () => void;
}

const CROP_TYPES: SlimeFoodType[] = ['basic', 'elemental', 'royal'];

const CROP_IMAGE: Record<SlimeFoodType, string> = {
  basic: 'crop_basic.png',
  elemental: 'crop_elemental.png',
  royal: 'crop_royal.png',
};

const SEED_IMAGE: Record<SlimeFoodType, string> = {
  basic: 'seed_basic.png',
  elemental: 'seed_elemental.png',
  royal: 'seed_royal.png',
};

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
                    style={{ imageRendering: 'auto' }}
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
            className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPickerPlotId(null)}
          >
            <div
              className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-3xl border-4 border-[#FF7EB6] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>Seed Vault</h2>
                      <p className="text-sm opacity-90">Buy seeds, then plant them in this plot</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPickerPlotId(null)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[65vh]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {CROP_TYPES.map(cropType => {
                    const crop = CROP_INFO[cropType];
                    const config = CROP_CONFIG[cropType];
                    const accent = CROP_ACCENT[cropType];
                    const ownedSeeds = state.seeds[cropType] || 0;
                    const canAffordSeed = state.goo >= config.seedCost;
                    return (
                      <div
                        key={cropType}
                        className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 bg-white shadow-lg ${accent.border} ${accent.glow}`}
                      >
                        <div className={`w-20 h-20 rounded-2xl border-2 ${accent.border} bg-gradient-to-br from-white to-pink-50 flex items-center justify-center mb-3 shadow-inner overflow-hidden`}>
                          <img
                            src={`${import.meta.env.BASE_URL}${CROP_IMAGE[cropType]}`}
                            alt={crop.name}
                            className="w-16 h-16 object-contain drop-shadow-sm"
                            style={{ imageRendering: 'auto' }}
                          />
                        </div>
                        <p className="text-sm font-black text-gray-800 uppercase">{crop.name}</p>
                        <p className="text-xs text-gray-500 mt-1 mb-2 leading-snug">{crop.description}</p>
                        <p className="text-[11px] text-gray-500 mb-3">Grows in {formatTime(config.growTimeMs)}</p>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full mb-3 ${accent.chip}`}>
                          Seeds owned: {ownedSeeds}
                        </span>
                        <div className="flex flex-col gap-2 w-full mt-auto">
                          <button
                            disabled={ownedSeeds < 1}
                            onClick={() => {
                              dispatch({ type: 'PLANT_CROP', plotId: pickerPlotId, cropType });
                              setPickerPlotId(null);
                            }}
                            className={`w-full py-2 rounded-full text-sm font-bold transition-all ${
                              ownedSeeds >= 1
                                ? 'bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] text-white hover:scale-105 shadow-lg'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Plant
                          </button>
                          <button
                            disabled={!canAffordSeed}
                            onClick={() => dispatch({ type: 'BUY_SEED', seedType: cropType })}
                            className={`w-full py-1.5 pl-1.5 pr-3 rounded-full text-sm font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                              canAffordSeed
                                ? 'bg-white text-gray-700 border-gray-300 hover:border-[#FF7EB6] hover:text-[#FF1493] hover:scale-105 shadow'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            }`}
                          >
                            <img
                              src={`${import.meta.env.BASE_URL}${SEED_IMAGE[cropType]}`}
                              alt="Seed"
                              className="w-7 h-7 object-contain"
                              style={{ imageRendering: 'auto' }}
                            />
                            {config.seedCost} 💧
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] p-4 text-white flex items-center justify-between">
                <p className="text-sm font-bold">Available Goo: {state.goo.toFixed(1)} 💧</p>
                <button
                  onClick={() => setPickerPlotId(null)}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
