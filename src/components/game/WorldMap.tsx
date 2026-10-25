import React, { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { ChevronLeft, ChevronRight, Lock, Skull, X } from 'lucide-react';
import { triggerDialogue } from '@/utils/dialogueTriggers';
import { isBossLevel, MAP_SCREENS } from '@/utils/battleEngine';

interface WorldMapProps {
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

/**
 * Node positions per screen, as pixel coordinates on the source art, converted to percentages
 * of the picture. Maps 1-3 were cropped to 1288x716 (parchment frame removed), 4-5 are 1376x768.
 * Each screen lists its 10 levels in order along the painted path.
 */
type Pt = [number, number];
const px = (w: number, h: number, pts: Pt[]) => pts.map(([x, y]) => ({ x: (x / w) * 100, y: (y / h) * 100 }));

const SCREEN_NODES = [
  // 1: Verdant Lowlands - dock, river crossing, village
  px(1288, 716, [[231, 600], [336, 565], [446, 535], [536, 500], [521, 405], [621, 352], [716, 309], [826, 274], [946, 234], [906, 134]]),
  // 2: Whispering Wood & Golden Plains
  px(1288, 716, [[106, 669], [256, 629], [396, 584], [546, 564], [696, 534], [836, 489], [941, 429], [956, 359], [836, 306], [976, 242]]),
  // 3: Ironcliff Mines & Murkmire Swamp
  px(1288, 716, [[186, 664], [306, 614], [396, 534], [386, 414], [496, 384], [636, 399], [786, 394], [916, 349], [976, 264], [1086, 164]]),
  // 4: Frostpeak Skyway
  px(1376, 768, [[230, 700], [230, 610], [290, 520], [380, 450], [480, 400], [600, 365], [740, 345], [860, 310], [930, 245], [1050, 190]]),
  // 5: The Forgotten Castle
  px(1376, 768, [[140, 730], [230, 665], [330, 610], [440, 580], [560, 540], [680, 505], [790, 445], [860, 390], [960, 330], [1010, 255]]),
];

const MAP_IMAGES = [1, 2, 3, 4, 5].map(n => `${import.meta.env.BASE_URL}maps/map${n}.jpg`);

export const WorldMap: React.FC<WorldMapProps> = ({ onSelectLevel, onClose }) => {
  const { state } = useGameState();
  const unlockedLevel = state.currentLevel || 1;
  const levelsPerScreen = 10;
  const lastScreen = MAP_SCREENS.length - 1;

  const screenOf = (level: number) => Math.min(lastScreen, Math.max(0, Math.floor((level - 1) / levelsPerScreen)));
  const [screen, setScreen] = useState(() => screenOf(unlockedLevel));
  const furthestScreen = screenOf(unlockedLevel);

  // Preload every screen so flipping between regions never flashes black
  useEffect(() => {
    MAP_IMAGES.forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  // Arrow keys flip between screens
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setScreen(s => Math.max(0, s - 1));
      if (e.key === 'ArrowRight') setScreen(s => Math.min(furthestScreen, s + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [furthestScreen]);

  const info = MAP_SCREENS[screen];
  const nodes = SCREEN_NODES[screen];
  const firstLevel = screen * levelsPerScreen + 1;

  const canGoNext = screen < lastScreen;
  const nextLocked = screen + 1 > furthestScreen;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in select-none pointer-events-auto overflow-hidden">
      {/* Blurred copy fills the letterbox bars so any window shape looks intentional */}
      <div
        key={`bg-${screen}`}
        className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
        style={{ backgroundImage: `url("${MAP_IMAGES[screen]}")` }}
      />

      {/* 16:9 stage: art and nodes share one box so nodes always sit on the painted path */}
      <div
        key={`stage-${screen}`}
        className="relative animate-fade-in shadow-2xl"
        style={{ width: 'min(100vw, calc(100vh * 16 / 9))', height: 'min(100vh, calc(100vw * 9 / 16))' }}
      >
        <img src={MAP_IMAGES[screen]} alt={info.name} draggable={false} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'auto' }} />
        {/* gentle vignette so nodes and title read on any art */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)' }} />

        {nodes.map((pos, i) => {
          const levelNum = firstLevel + i;
          const isUnlocked = levelNum <= unlockedLevel;
          const isCurrent = levelNum === unlockedLevel;
          const isBoss = isBossLevel(levelNum);
          const cleared = levelNum < unlockedLevel;

          return (
            <button
              key={levelNum}
              disabled={!isUnlocked}
              onClick={() => {
                if (!isUnlocked) return;
                if (!state.completedTutorialChapters.includes('battle')) triggerDialogue('battle-start');
                onSelectLevel(levelNum);
              }}
              aria-label={`Level ${levelNum}${isBoss ? ' boss' : ''}${isUnlocked ? '' : ' locked'}`}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-transform duration-200
                ${isUnlocked ? 'cursor-pointer hover:scale-125' : 'cursor-not-allowed'}
                ${isCurrent ? 'scale-125' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: isBoss ? '4.2%' : '3.4%', aspectRatio: '1' }}
            >
              {isCurrent && <span className="absolute inset-[-40%] rounded-full bg-white/50 animate-ping" />}
              <span
                className={`relative w-full h-full rounded-full flex items-center justify-center border-[3px] shadow-[0_3px_10px_rgba(0,0,0,0.6)]
                  ${!isUnlocked
                    ? 'bg-slate-800/80 border-slate-500/70 text-slate-400'
                    : isBoss
                      ? 'bg-gradient-to-b from-red-500 to-red-800 border-amber-300 text-white'
                      : cleared
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-700 border-white/90 text-white'
                        : 'bg-gradient-to-b from-[#FF7EB6] to-[#FF1493] border-white text-white'}`}
              >
                {!isUnlocked ? (
                  <Lock className="w-1/2 h-1/2" />
                ) : isBoss ? (
                  <Skull className="w-3/5 h-3/5" />
                ) : (
                  <span className="font-black leading-none drop-shadow" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 'clamp(8px, 1.2vw, 16px)' }}>
                    {levelNum}
                  </span>
                )}
              </span>
              {isBoss && isUnlocked && (
                <span className="absolute -bottom-[60%] text-[clamp(7px,0.8vw,11px)] font-black text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] uppercase tracking-wider">
                  {levelNum}
                </span>
              )}
            </button>
          );
        })}

        {/* Region banner */}
        <div className="absolute top-[3%] left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-black/55 backdrop-blur-sm border border-white/25 text-center pointer-events-none">
          <p className="text-white font-black tracking-wide text-[clamp(11px,1.5vw,20px)]">{info.name}</p>
          <p className="text-white/70 font-bold text-[clamp(8px,0.9vw,12px)] uppercase tracking-widest">
            Levels {firstLevel}–{firstLevel + levelsPerScreen - 1} · Screen {screen + 1}/{MAP_SCREENS.length}
          </p>
        </div>
      </div>

      {/* Screen arrows */}
      {screen > 0 && (
        <button
          onClick={() => setScreen(screen - 1)}
          aria-label="Previous region"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-black/55 border border-white/30 text-white hover:bg-black/75 hover:scale-110 transition-all"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {canGoNext && (
        <button
          onClick={() => !nextLocked && setScreen(screen + 1)}
          disabled={nextLocked}
          aria-label={nextLocked ? 'Next region locked' : 'Next region'}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full border text-white transition-all
            ${nextLocked ? 'bg-black/40 border-white/15 text-white/40 cursor-not-allowed' : 'bg-black/55 border-white/30 hover:bg-black/75 hover:scale-110'}`}
        >
          {nextLocked ? <Lock className="w-6 h-6" /> : <ChevronRight className="w-8 h-8" />}
        </button>
      )}

      <button
        onClick={onClose}
        aria-label="Close map"
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-black/50 rounded-full border border-white/25 text-white/70 hover:text-white hover:bg-black/70 transition-all"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};
