import { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SLIME_FOODS, SlimeFoodType } from '@/types/slime';
import { foodSpriteUrl } from '@/data/foodSprites';
import { audioEngine } from '@/utils/audioEngine';

const FOODS: SlimeFoodType[] = ['basic', 'elemental', 'royal'];
const DRAG_THRESHOLD = 6;

// Measured on public/ui_tray.png (1290x540): the four round slots, as fractions of the frame
const FRAME_ASPECT = 1290 / 540;
const SLOT_X = [0.1919, 0.3961, 0.6023, 0.8078];
const SLOT_Y = 0.5019;
const SLOT_SIZE = 0.163; // diameter as a fraction of the frame width
const LABEL_Y = 0.805;

const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`;
const crisp = { imageRendering: 'auto' as const };

interface FeedTrayProps {
  /** The slime under a viewport point, or null. Used while dragging and to aim the drop. */
  slimeAt: (x: number, y: number) => string | null;
  selectedSlimeId: string | null;
  onDragHover: (slimeId: string | null) => void;
  onDragActive: (active: boolean) => void;
  /** Where the dragged food is (viewport px), or null when the drag ends. Slimes run toward it. */
  onDragMove?: (point: { x: number; y: number } | null) => void;
  /** Shown when the bag is empty. */
  onOpenFarm?: () => void;
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

export function FeedTray({ slimeAt, selectedSlimeId, onDragHover, onDragActive, onDragMove, onOpenFarm, onFeed, onNeedSelect }: FeedTrayProps) {
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
        onDragMove?.({ x: e.clientX, y: e.clientY });
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
      onDragMove?.(null);
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
      onDragMove?.(null);
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
    if ((state.inventory[food] || 0) < 1) {
      setShaking(food);
      setTimeout(() => setShaking(null), 450);
      return;
    }
    audioEngine.playSfx('tap');
    onDragActive(true);
    setDragBoth({ food, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false, pointerId: e.pointerId });
  };

  const bagEmpty = FOODS.every(f => (state.inventory[f] || 0) < 1);
  const showHint = !bagEmpty && state.stats.feeds === 0 && !selectedSlimeId && !drag;
  const slotStyle = (i: number): React.CSSProperties => ({
    left: `${SLOT_X[i] * 100}%`,
    top: `${SLOT_Y * 100}%`,
    width: `${SLOT_SIZE * 100}%`,
    aspectRatio: '1',
    transform: 'translate(-50%, -50%)',
  });
  const labelStyle = (i: number): React.CSSProperties => ({
    left: `${SLOT_X[i] * 100}%`,
    top: `${LABEL_Y * 100}%`,
    transform: 'translate(-50%, -50%)',
  });

  return (
    <>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 select-none" style={{ touchAction: 'none' }}>
        {showHint && (
          <p className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold animate-pulse">Drag food onto a slime</p>
        )}
        {bagEmpty && !drag && (
          <div className="flex items-center gap-2 rounded-full bg-black/65 backdrop-blur-md border border-white/20 pl-3 pr-1 py-1">
            <span className="text-white text-xs font-bold">Bag empty. Grow food on the Farm</span>
            {onOpenFarm && (
              <button onClick={onOpenFarm} className="rounded-full bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] px-3 py-1 text-xs font-black text-white hover:scale-105 transition-transform">
                Go to Farm
              </button>
            )}
          </div>
        )}

        <div
          className="relative drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]"
          style={{ width: 'min(92vw, 430px)', aspectRatio: String(FRAME_ASPECT) }}
        >
          <img src={asset('ui_tray.png')} alt="" draggable={false} className="absolute inset-0 w-full h-full pointer-events-none" style={crisp} />

          {/* Slot 1: the bag itself */}
          <div className="absolute flex items-center justify-center pointer-events-none" style={slotStyle(0)}>
            <img
              src={asset('food_bag.png')}
              alt=""
              draggable={false}
              className={`w-[88%] h-[88%] object-contain drop-shadow-lg ${selectedSlimeId && !drag ? 'animate-bounce' : ''}`}
              style={crisp}
            />
          </div>
          <span className="absolute text-[10px] sm:text-[11px] font-black text-[#5a3a1e] leading-none whitespace-nowrap pointer-events-none" style={labelStyle(0)}>
            Food Bag
          </span>

          {/* Slots 2-4: the foods */}
          {FOODS.map((food, idx) => {
            const i = idx + 1;
            const info = SLIME_FOODS[food];
            const owned = state.inventory[food] || 0;
            const affordable = owned > 0;
            const beingDragged = drag?.food === food && drag.moved;

            return (
              <div key={food}>
                <button
                  onPointerDown={e => startDrag(e, food)}
                  aria-label={`${info.name}, ${owned} in bag`}
                  className={`absolute rounded-full flex items-center justify-center transition-transform
                    ${affordable ? 'hover:scale-110 cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}`}
                  style={{ ...slotStyle(i), touchAction: 'none', animation: shaking === food ? 'feedShake .4s' : undefined }}
                >
                  <img
                    src={foodSpriteUrl(food)}
                    alt=""
                    draggable={false}
                    className={`w-[82%] h-[82%] object-contain pointer-events-none drop-shadow-md transition-opacity ${affordable ? '' : 'opacity-40 grayscale'} ${beingDragged ? 'opacity-30' : ''}`}
                    style={crisp}
                  />
                  {owned > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-[#FF1493] text-white text-xs font-black flex items-center justify-center border-2 border-white shadow">
                      {owned}
                    </span>
                  )}
                </button>
                <span
                  className={`absolute text-[10px] sm:text-[11px] font-black leading-none whitespace-nowrap pointer-events-none ${owned > 0 ? 'text-emerald-700' : 'text-[#5a3a1e]/50'}`}
                  style={labelStyle(i)}
                >
                  {owned > 0 ? `+${info.xpValue} XP` : 'Empty'}
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
          className="fixed z-[10060] w-20 h-20 pointer-events-none drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]"
          style={{ left: drag.x, top: drag.y, transform: 'translate(-50%, -60%) rotate(-8deg) scale(1.1)', ...crisp }}
        />
      )}

      <style>{`@keyframes feedShake { 0%,100% { transform: translate(-50%,-50%) } 20% { transform: translate(calc(-50% - 6px),-50%) } 40% { transform: translate(calc(-50% + 6px),-50%) } 60% { transform: translate(calc(-50% - 4px),-50%) } 80% { transform: translate(calc(-50% + 4px),-50%) } }`}</style>
    </>
  );
}
