import { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SLIME_FOODS, SlimeFoodType } from '@/types/slime';
import { foodSpriteUrl } from '@/data/foodSprites';
import { audioEngine } from '@/utils/audioEngine';

const FOODS: SlimeFoodType[] = ['basic', 'elemental', 'royal'];
const DRAG_THRESHOLD = 6;

export function FoodBagIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="59" rx="20" ry="3.5" fill="rgba(0,0,0,0.3)" />
      <path d="M20 21c-6 8-12 17-10 28 1 6 7 9 22 9s21-3 22-9c2-11-4-20-10-28z" fill="#d9a066" stroke="#5a3a1e" strokeWidth="3" strokeLinejoin="round" />
      <path d="M17 38c2 8 8 15 15 15" fill="none" stroke="#b0773f" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 21c2-5 5-8 8-9h8c3 1 6 4 8 9z" fill="#e8b97c" stroke="#5a3a1e" strokeWidth="3" strokeLinejoin="round" />
      <path d="M18.5 24.5c9 3 18 3 27 0" fill="none" stroke="#ff7eb6" strokeWidth="5" strokeLinecap="round" />
      <path d="M18.5 24.5c9 3 18 3 27 0" fill="none" stroke="#5a3a1e" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      <path d="M32 26l-7 8 7-2 7 2z" fill="#ff1493" stroke="#5a3a1e" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="27" r="2.6" fill="#ff7eb6" stroke="#5a3a1e" strokeWidth="1.6" />
      <ellipse cx="25" cy="42" rx="3" ry="5" fill="#f4d3a4" opacity="0.7" />
    </svg>
  );
}

interface FeedTrayProps {
  /** The slime under a viewport point, or null. Used while dragging and to aim the drop. */
  slimeAt: (x: number, y: number) => string | null;
  selectedSlimeId: string | null;
  onDragHover: (slimeId: string | null) => void;
  onDragActive: (active: boolean) => void;
  /** origin is where the food was released, or the tray item's centre for a tap. */
  onFeed: (food: SlimeFoodType, slimeId: string, origin: { x: number; y: number }) => void;
  onNeedSelect: () => void;
}

interface Drag {
  food: SlimeFoodType;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
  pointerId: number;
}

export function FeedTray({ slimeAt, selectedSlimeId, onDragHover, onDragActive, onFeed, onNeedSelect }: FeedTrayProps) {
  const { state } = useGameState();
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const hoverRef = useRef<string | null>(null);
  const [shaking, setShaking] = useState<SlimeFoodType | null>(null);

  const setDragBoth = (d: Drag | null) => {
    dragRef.current = d;
    setDrag(d);
  };

  useEffect(() => {
    if (!drag) return;

    const move = (e: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur || e.pointerId !== cur.pointerId) return;
      const moved = cur.moved || Math.hypot(e.clientX - cur.startX, e.clientY - cur.startY) > DRAG_THRESHOLD;
      setDragBoth({ ...cur, x: e.clientX, y: e.clientY, moved });
      if (moved) {
        const over = slimeAt(e.clientX, e.clientY);
        if (over !== hoverRef.current) {
          hoverRef.current = over;
          onDragHover(over);
        }
      }
    };

    const up = (e: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur || e.pointerId !== cur.pointerId) return;
      setDragBoth(null);
      onDragActive(false);
      const over = hoverRef.current;
      hoverRef.current = null;
      onDragHover(null);

      if (cur.moved) {
        if (over) onFeed(cur.food, over, { x: e.clientX, y: e.clientY });
      } else if (selectedSlimeId) {
        // plain tap: feed the selected slime
        onFeed(cur.food, selectedSlimeId, { x: cur.startX, y: cur.startY });
      } else {
        onNeedSelect();
        setShaking(cur.food);
        setTimeout(() => setShaking(null), 450);
      }
    };

    const cancel = () => {
      setDragBoth(null);
      onDragActive(false);
      hoverRef.current = null;
      onDragHover(null);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!drag, selectedSlimeId, slimeAt]);

  const startDrag = (e: React.PointerEvent, food: SlimeFoodType) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    audioEngine.playSfx('tap');
    onDragActive(true);
    setDragBoth({ food, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false, pointerId: e.pointerId });
  };

  const showHint = state.stats.feeds === 0 && !selectedSlimeId && !drag;

  return (
    <>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 select-none" style={{ touchAction: 'none' }}>
        {showHint && (
          <p className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold animate-pulse">Drag food onto a slime</p>
        )}
        <div className="flex items-end gap-3 sm:gap-4 rounded-3xl border-2 border-white/25 bg-black/55 backdrop-blur-md px-4 pt-3 pb-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <FoodBagIcon className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 drop-shadow-lg ${selectedSlimeId && !drag ? 'animate-bounce' : ''}`} />

          {FOODS.map(food => {
            const info = SLIME_FOODS[food];
            const owned = state.inventory[food] || 0;
            const affordable = owned > 0 || state.goo >= info.cost;
            const beingDragged = drag?.food === food && drag.moved;

            return (
              <div key={food} className="flex flex-col items-center gap-1">
                <button
                  onPointerDown={e => startDrag(e, food)}
                  aria-label={`${info.name}, ${owned > 0 ? `${owned} owned` : `${info.cost} Goo`}`}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center transition-all
                    ${affordable ? 'bg-white/15 border-white/40 hover:bg-white/25 hover:-translate-y-1 cursor-grab active:cursor-grabbing' : 'bg-white/5 border-white/15 opacity-50'}
                    ${beingDragged ? 'opacity-40' : ''}`}
                  style={{ touchAction: 'none', animation: shaking === food ? 'feedShake .4s' : undefined }}
                >
                  <img src={foodSpriteUrl(food)} alt="" draggable={false} className="w-10 h-10 sm:w-11 sm:h-11 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
                  {owned > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-[#FF1493] text-white text-xs font-black flex items-center justify-center border-2 border-white shadow">
                      {owned}
                    </span>
                  )}
                </button>
                <span className={`text-[11px] font-black leading-none ${owned > 0 ? 'text-emerald-300' : affordable ? 'text-white/80' : 'text-red-300'}`}>
                  {owned > 0 ? `+${info.xpValue} XP` : `${info.cost} 💧`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Food following the pointer */}
      {drag?.moved && (
        <img
          src={foodSpriteUrl(drag.food)}
          alt=""
          draggable={false}
          className="fixed z-[10060] w-16 h-16 pointer-events-none drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]"
          style={{ left: drag.x, top: drag.y, transform: 'translate(-50%, -60%) rotate(-8deg) scale(1.1)', imageRendering: 'pixelated' }}
        />
      )}

      <style>{`@keyframes feedShake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(4px) } }`}</style>
    </>
  );
}
