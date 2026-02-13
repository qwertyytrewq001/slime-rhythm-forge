import { useRef, useEffect } from 'react';

export function ForestBackground({ elementTint }: { elementTint?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const tintHue = elementTint === 'fire' ? 15 : elementTint === 'ice' ? 200 : elementTint === 'cosmic' ? 270 : elementTint === 'earth' ? 100 : 140;

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const f = frameRef.current;

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, `hsl(${tintHue}, 30%, 25%)`);
      sky.addColorStop(0.5, `hsl(${tintHue + 20}, 35%, 35%)`);
      sky.addColorStop(1, `hsl(${tintHue + 10}, 25%, 20%)`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Distant trees (parallax layer 1 - slowest)
      drawTreeLayer(ctx, w, h, f * 0.002, 0.3, `hsla(${tintHue + 10}, 25%, 18%, 0.6)`, 8, 0.55);

      // Mid layer: moss and flowers
      drawMossLayer(ctx, w, h, f * 0.005, `hsla(${tintHue}, 35%, 25%, 0.4)`, 0.7);

      // Foreground vines
      drawVines(ctx, w, h, f);

      // Fireflies
      drawFireflies(ctx, w, h, f);

      frameRef.current++;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [elementTint]);

  // Pause on hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

function drawTreeLayer(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number, alpha: number, color: string, count: number, yPos: number) {
  ctx.fillStyle = color;
  const treeWidth = w / count;
  for (let i = 0; i < count + 2; i++) {
    const x = ((i * treeWidth + offset * 50) % (w + treeWidth * 2)) - treeWidth;
    const sway = Math.sin(offset * 10 + i * 1.3) * 3;
    const treeH = h * 0.35 + Math.sin(i * 2.7) * h * 0.08;
    const baseY = h * yPos;

    // Triangle tree
    ctx.beginPath();
    ctx.moveTo(x + sway, baseY - treeH);
    ctx.lineTo(x - treeWidth * 0.3, baseY + 20);
    ctx.lineTo(x + treeWidth * 0.3, baseY + 20);
    ctx.closePath();
    ctx.fill();

    // Trunk
    ctx.fillRect(x - 3, baseY, 6, 30);
  }
}

function drawMossLayer(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number, color: string, yPos: number) {
  ctx.fillStyle = color;
  const baseY = h * yPos;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= w; x += 20) {
    const y = baseY + Math.sin(x * 0.02 + offset) * 8 + Math.sin(x * 0.05) * 4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Small flowers
  for (let i = 0; i < 12; i++) {
    const fx = (i * 107 + offset * 20) % w;
    const fy = baseY + Math.sin(fx * 0.03) * 6 - 5;
    const flowerColors = ['#FF69B4', '#FFD700', '#87CEEB', '#DDA0DD', '#98FB98'];
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawVines(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) {
  ctx.strokeStyle = 'hsla(120, 30%, 25%, 0.3)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const startX = (i * w / 5) + 30;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    for (let y = 0; y < h * 0.3; y += 10) {
      const sway = Math.sin(y * 0.05 + frame * 0.01 + i * 2) * 8;
      ctx.lineTo(startX + sway, y);
    }
    ctx.stroke();

    // Leaf
    ctx.fillStyle = 'hsla(120, 40%, 30%, 0.3)';
    const leafY = h * 0.15 + Math.sin(frame * 0.02 + i) * 5;
    ctx.beginPath();
    ctx.ellipse(startX + Math.sin(frame * 0.01 + i * 2) * 8, leafY, 4, 8, Math.sin(frame * 0.02) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFireflies(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) {
  for (let i = 0; i < 15; i++) {
    const seed = i * 73.7;
    const x = (Math.sin(seed + frame * 0.003) * 0.5 + 0.5) * w;
    const y = (Math.cos(seed * 1.3 + frame * 0.004) * 0.5 + 0.5) * h;
    const brightness = Math.sin(frame * 0.05 + seed) * 0.5 + 0.5;

    if (brightness > 0.3) {
      ctx.globalAlpha = brightness * 0.6;
      ctx.fillStyle = '#FFFFAA';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}
