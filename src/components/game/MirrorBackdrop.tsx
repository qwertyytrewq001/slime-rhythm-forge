import React, { useEffect, useRef } from 'react';

/**
 * Our scenes are laid out on a 16:9 stage. On a wider (or taller) window the stage leaves empty bars at
 * the sides. Instead of a blurred smudge, this continues the painting itself: the picture mirrored on
 * every side, so every seam matches and the art reaches the screen edges.
 *
 * It is drawn once into a single canvas three times the stage's size (so there are no separate image
 * layers whose edges could show as a hairline). Render it inside the stage, right AFTER the main image (it
 * covers the main image's rim; the centre tile is the same picture, so they line up).
 */
/** Pixels trimmed from every edge: generated paintings often have a slightly off 1-2px rim that mirroring would double into a line. */
const INSET = 3;

export const MirrorBackdrop: React.FC<{ src: string }> = ({ src }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      const canvas = ref.current;
      if (cancelled || !canvas) return;
      const w = img.naturalWidth, h = img.naturalHeight;
      canvas.width = w * 3;
      canvas.height = h * 3;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      for (let cy = 0; cy < 3; cy++) {
        for (let cx = 0; cx < 3; cx++) {
          ctx.save();
          ctx.translate(cx * w + (cx === 1 ? 0 : cx === 0 ? w : 0), cy * h + (cy === 1 ? 0 : cy === 0 ? h : 0));
          ctx.scale(cx === 1 ? 1 : -1, cy === 1 ? 1 : -1);
          if (cx === 2) ctx.translate(-w, 0);
          if (cy === 2) ctx.translate(0, -h);
          ctx.drawImage(img, INSET, INSET, w - 2 * INSET, h - 2 * INSET, 0, 0, w, h);
          ctx.restore();
        }
      }
    };
    img.src = src;
    return () => { cancelled = true; };
  }, [src]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{ left: '-100%', top: '-100%', width: '300%', height: '300%' }}
    />
  );
};
