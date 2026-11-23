import { useEffect, useRef, useState } from 'react';
import type { Slime } from '@/types/slime';
import { drawEnhancedEgg } from '@/utils/eggRenderer';

const BASE = import.meta.env.BASE_URL;

/** The ten elements we have painted eggs for. */
const EGG_ELEMENTS = ['fire', 'water', 'plant', 'earth', 'wind', 'ice', 'electric', 'metal', 'light', 'shadow'];

/** Core single-element slimes use their element's egg. Species without their own egg art get one of the ten, always the same one for the same species. */
export function eggElementFor(slime: Slime): string {
  if (slime.elements?.length === 1) return slime.elements[0];
  const key = slime.codexId ?? slime.name;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return EGG_ELEMENTS[h % EGG_ELEMENTS.length];
}

interface PaintedEggProps {
  slime: Slime;
  crackProgress: number;
  shaking?: boolean;
  /** Size classes for the egg box (width and height), for example "w-[5.4rem] h-[5.4rem]". */
  boxClass: string;
  /** Canvas size used only if the painted egg picture is missing. */
  fallbackSize?: number;
}

/**
 * The egg you see incubating: the same painted egg you bought in the Bazaar (so a Light egg looks like a Light egg),
 * with a crack overlay while it breaks. If there is no picture for the element it falls back to the old drawn egg.
 */
export function PaintedEgg({ slime, crackProgress, shaking, boxClass, fallbackSize = 120 }: PaintedEggProps) {
  const element = eggElementFor(slime);
  const [missing, setMissing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motion = `transition-transform duration-75 ${shaking ? 'scale-110' : 'scale-100 hover:scale-105'}`;

  useEffect(() => {
    if (!missing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawEnhancedEgg(ctx, { size: fallbackSize, slime, crackProgress, isShaking: shaking });
  }, [missing, slime, crackProgress, shaking, fallbackSize]);

  if (missing) {
    return <canvas ref={canvasRef} width={fallbackSize} height={fallbackSize} className={`${boxClass} pixel-art ${motion}`} />;
  }

  return (
    <div className={`relative ${boxClass} ${motion}`}>
      <img
        src={`${BASE}ui/eggc_${element}.png`}
        alt=""
        draggable={false}
        onError={() => setMissing(true)}
        className="absolute inset-0 w-full h-full object-contain"
        style={{ imageRendering: 'auto', filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.35))' }}
      />
      {crackProgress > 0 && (
        <img
          src={`${BASE}altar/hatch_cracks_${Math.min(3, Math.max(1, Math.ceil(crackProgress * 3)))}.png`}
          alt=""
          draggable={false}
          className="absolute pointer-events-none"
          style={{ left: '50%', top: '50%', width: '72%', transform: 'translate(-50%,-50%)', imageRendering: 'auto' }}
        />
      )}
    </div>
  );
}
