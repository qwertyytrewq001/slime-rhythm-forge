import React, { useEffect, useMemo, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { ChevronLeft, ChevronRight, Lock, Skull, Star, X } from 'lucide-react';
import { triggerDialogue } from '@/utils/dialogueTriggers';
import { getEnemyCount, getEnemyLevel, isBossLevel, MAP_SCREENS } from '@/utils/battleEngine';
import { getSpriteIdForSlime } from '@/utils/spriteLoader';

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

const PARCHMENT = '#f6e8c3';
const INK = '#4a2f17';
const GOLD = '#f2b632';

/** Smooth Catmull-Rom curve segment between pts[i] and pts[i+1], as an SVG path. */
function segmentPath(pts: { x: number; y: number }[], i: number): string {
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
  const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
  const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
  return `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
}

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

  // The player's own slime stands on the current level
  const marker = useMemo(() => {
    const chosen = state.slimes.find(s => s.id === state.selectedSlimeId) ?? state.slimes[0];
    return chosen ? `${import.meta.env.BASE_URL}${getSpriteIdForSlime(chosen)}.png` : null;
  }, [state.slimes, state.selectedSlimeId]);

  const info = MAP_SCREENS[screen];
  const nodes = SCREEN_NODES[screen];
  const firstLevel = screen * levelsPerScreen + 1;
  const clearedHere = Math.max(0, Math.min(levelsPerScreen, unlockedLevel - firstLevel));
  const screenDone = unlockedLevel >= firstLevel + levelsPerScreen;

  const canGoNext = screen < lastScreen;
  const nextLocked = screen + 1 > furthestScreen;
  const prevName = screen > 0 ? MAP_SCREENS[screen - 1].name : '';
  const nextName = canGoNext ? MAP_SCREENS[screen + 1].name : '';

  const arrowBtn = 'absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group/arrow';
  const arrowCircle = 'w-[max(40px,calc(var(--sw)*0.04))] h-[max(40px,calc(var(--sw)*0.04))] rounded-full flex items-center justify-center border-[3px] shadow-[0_4px_14px_rgba(0,0,0,0.55)] transition-transform';

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in select-none pointer-events-auto overflow-hidden" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}>
      <style>{`
        @keyframes mapBob { 0%,100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, -14%) } }
        @keyframes mapRing { 0% { transform: scale(.85); opacity: .9 } 100% { transform: scale(1.7); opacity: 0 } }
      `}</style>

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
        style={{
          ['--sw' as string]: 'min(100vw, calc(100vh * 16 / 9))',
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
        }}
      >
        <img src={MAP_IMAGES[screen]} alt={info.name} draggable={false} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'auto' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.4) 100%)' }} />

        {/* Travel trail: faint dashes ahead, gold dashes where you've been */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {nodes.slice(0, -1).map((_, i) => {
            const reached = firstLevel + i + 1 <= unlockedLevel;
            return (
              <path
                key={i}
                d={segmentPath(nodes, i)}
                fill="none"
                vectorEffect="non-scaling-stroke"
                stroke={reached ? GOLD : 'rgba(255,255,255,0.55)'}
                strokeWidth={reached ? 4 : 3}
                strokeLinecap="round"
                strokeDasharray="1 9"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
              />
            );
          })}
        </svg>

        {nodes.map((pos, i) => {
          const levelNum = firstLevel + i;
          const isUnlocked = levelNum <= unlockedLevel;
          const isCurrent = levelNum === unlockedLevel;
          const isBoss = isBossLevel(levelNum);
          const cleared = levelNum < unlockedLevel;
          const size = isBoss ? 0.046 : isUnlocked ? 0.036 : 0.026;
          const tipBelow = pos.y < 22;

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
              className={`group absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 focus:outline-none
                ${isUnlocked ? 'cursor-pointer hover:scale-125 hover:z-20 focus-visible:scale-125' : 'cursor-not-allowed'}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `max(${isUnlocked ? 32 : 22}px, calc(var(--sw) * ${size}))`,
                aspectRatio: '1',
                zIndex: isCurrent ? 15 : 10,
              }}
            >
              {isCurrent && (
                <>
                  <span className="absolute inset-0 rounded-full pointer-events-none" style={{ border: `3px solid ${GOLD}`, animation: 'mapRing 1.8s ease-out infinite' }} />
                  {marker && (
                    <img
                      src={marker}
                      alt=""
                      draggable={false}
                      className="absolute left-1/2 bottom-[55%] w-[270%] max-w-none pointer-events-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]"
                      style={{ imageRendering: 'auto', animation: 'mapBob 1.4s ease-in-out infinite' }}
                    />
                  )}
                </>
              )}

              {/* Medallion */}
              <span
                className="relative w-full h-full rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.65)]"
                style={{
                  border: `${isUnlocked ? 3 : 2}px solid ${!isUnlocked ? 'rgba(255,255,255,0.35)' : isBoss ? GOLD : INK}`,
                  background: !isUnlocked
                    ? 'rgba(25,22,35,0.62)'
                    : isBoss
                      ? 'radial-gradient(circle at 35% 30%, #ff6a5a, #9c1c1c 75%)'
                      : isCurrent
                        ? `radial-gradient(circle at 35% 30%, #fff3c0, ${GOLD} 80%)`
                        : `radial-gradient(circle at 35% 30%, #fffaf0, ${PARCHMENT} 85%)`,
                  color: isBoss ? '#fff' : INK,
                }}
              >
                {!isUnlocked ? (
                  <Lock className="w-1/2 h-1/2 text-white/70" />
                ) : isBoss ? (
                  <Skull className="w-3/5 h-3/5 drop-shadow" />
                ) : (
                  <span className="font-bold leading-none" style={{ fontSize: 'max(13px, calc(var(--sw) * 0.0165))' }}>{levelNum}</span>
                )}
                {cleared && !isBoss && (
                  <Star className="absolute -top-[22%] -right-[22%] w-[48%] h-[48%] drop-shadow" style={{ color: GOLD, fill: GOLD }} />
                )}
                {cleared && isBoss && (
                  <Star className="absolute -top-[18%] -right-[18%] w-[42%] h-[42%] drop-shadow" style={{ color: GOLD, fill: GOLD }} />
                )}
              </span>

              {isBoss && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 -bottom-[52%] px-1.5 rounded text-[max(8px,calc(var(--sw)*0.0085))] font-bold uppercase tracking-wider text-amber-100 bg-black/65 whitespace-nowrap pointer-events-none"
                >
                  Boss {levelNum}
                </span>
              )}

              {/* Hover card */}
              <span
                className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${tipBelow ? 'top-[125%]' : 'bottom-[125%]'} opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150
                  px-3 py-1.5 rounded-lg whitespace-nowrap text-left shadow-xl`}
                style={{ background: PARCHMENT, color: INK, border: `2px solid ${INK}` }}
              >
                <span className="block font-bold text-[max(11px,calc(var(--sw)*0.0115))] leading-tight">
                  {isBoss ? `Boss · Level ${levelNum}` : `Level ${levelNum}`}
                </span>
                <span className="block font-semibold text-[max(9px,calc(var(--sw)*0.0095))] opacity-80 leading-tight">
                  {isUnlocked ? `${getEnemyCount(levelNum)} foe${getEnemyCount(levelNum) > 1 ? 's' : ''} · enemy Lv ${getEnemyLevel(levelNum)}${cleared ? ' · cleared' : ''}` : 'Clear the level before it'}
                </span>
              </span>
            </button>
          );
        })}

        {/* Region banner */}
        <div className="absolute top-[2.5%] left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          <div
            className="relative px-[max(20px,calc(var(--sw)*0.03))] py-[max(6px,calc(var(--sw)*0.006))] rounded-lg text-center shadow-[0_6px_16px_rgba(0,0,0,0.55)]"
            style={{ background: `linear-gradient(${PARCHMENT}, #e8d5a3)`, border: `3px solid ${INK}`, color: INK }}
          >
            <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45" style={{ background: GOLD, border: `2px solid ${INK}` }} />
            <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45" style={{ background: GOLD, border: `2px solid ${INK}` }} />
            <p className="font-bold leading-tight text-[max(14px,calc(var(--sw)*0.0185))]">{info.name}</p>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <p className="font-semibold uppercase tracking-widest opacity-70 text-[max(8px,calc(var(--sw)*0.0085))]">Levels {firstLevel}–{firstLevel + levelsPerScreen - 1}</p>
              <span className="flex items-center gap-1 text-[max(9px,calc(var(--sw)*0.009))] font-bold">
                <Star className="w-3 h-3" style={{ color: GOLD, fill: GOLD }} />
                {screenDone ? levelsPerScreen : clearedHere}/{levelsPerScreen}
              </span>
            </div>
          </div>
        </div>

        {/* Region arrows, inside the art, with the neighbouring region's name */}
        {screen > 0 && (
          <button onClick={() => setScreen(screen - 1)} aria-label="Previous region" className={`${arrowBtn} left-[1.2%]`}>
            <span className={`${arrowCircle} group-hover/arrow:scale-110`} style={{ background: PARCHMENT, borderColor: INK, color: INK }}>
              <ChevronLeft className="w-3/5 h-3/5" strokeWidth={3} />
            </span>
            <span className="px-2 py-0.5 rounded bg-black/65 text-white font-semibold text-[max(8px,calc(var(--sw)*0.0085))] max-w-[12vw] text-center leading-tight">{prevName}</span>
          </button>
        )}
        {canGoNext && (
          <button
            onClick={() => !nextLocked && setScreen(screen + 1)}
            disabled={nextLocked}
            aria-label={nextLocked ? 'Next region locked' : 'Next region'}
            className={`${arrowBtn} right-[1.2%] ${nextLocked ? 'cursor-not-allowed' : ''}`}
          >
            <span
              className={`${arrowCircle} ${nextLocked ? '' : 'group-hover/arrow:scale-110'}`}
              style={nextLocked ? { background: 'rgba(25,22,35,0.75)', borderColor: 'rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.7)' } : { background: PARCHMENT, borderColor: INK, color: INK }}
            >
              {nextLocked ? <Lock className="w-1/2 h-1/2" /> : <ChevronRight className="w-3/5 h-3/5" strokeWidth={3} />}
            </span>
            <span className="px-2 py-0.5 rounded bg-black/65 text-white font-semibold text-[max(8px,calc(var(--sw)*0.0085))] max-w-[12vw] text-center leading-tight">
              {nextLocked ? '???' : nextName}
            </span>
          </button>
        )}

        {/* Region pager */}
        <div className="absolute bottom-[2.5%] left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-sm">
          {MAP_SCREENS.map((s, i) => {
            const reachable = i <= furthestScreen;
            return (
              <button
                key={s.name}
                onClick={() => reachable && setScreen(i)}
                disabled={!reachable}
                aria-label={reachable ? s.name : 'Locked region'}
                title={reachable ? s.name : 'Locked'}
                className={`h-2.5 rounded-full transition-all ${i === screen ? 'w-7' : 'w-2.5'} ${reachable ? 'cursor-pointer hover:scale-125' : 'cursor-not-allowed opacity-40'}`}
                style={{ background: i === screen ? GOLD : reachable ? PARCHMENT : 'rgba(255,255,255,0.5)' }}
              />
            );
          })}
        </div>

        <button
          onClick={onClose}
          aria-label="Close map"
          className="absolute top-[2.5%] right-[1.5%] w-[max(38px,calc(var(--sw)*0.032))] h-[max(38px,calc(var(--sw)*0.032))] flex items-center justify-center rounded-full border-[3px] shadow-[0_4px_14px_rgba(0,0,0,0.55)] hover:scale-110 transition-transform"
          style={{ background: PARCHMENT, borderColor: INK, color: INK }}
        >
          <X className="w-3/5 h-3/5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
