import { useRef, useEffect } from 'react';
import { ELEMENT_HUE } from '@/data/traitData';

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

    const tintHue = elementTint ? (ELEMENT_HUE[elementTint as keyof typeof ELEMENT_HUE] ?? 200) : 200;

    // Seed clouds
    const clouds: { x: number; y: number; w: number; speed: number }[] = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random(),
        y: 0.05 + Math.random() * 0.15,
        w: 60 + Math.random() * 80,
        speed: 0.0001 + Math.random() * 0.0002,
      });
    }

    // Seed fireflies
    const fireflies: { seed: number; speed: number; brightness: number }[] = [];
    for (let i = 0; i < 15; i++) {
      fireflies.push({ seed: i * 73.7, speed: 0.002 + Math.random() * 0.003, brightness: Math.random() });
    }

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const f = frameRef.current;

      // ===== BRIGHT BLUE SKY =====
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
      sky.addColorStop(0, `hsl(${205 + Math.sin(f * 0.0005) * 5}, 70%, 72%)`);
      sky.addColorStop(0.5, `hsl(200, 65%, 78%)`);
      sky.addColorStop(1, `hsl(195, 55%, 85%)`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Sun
      const sunX = w * 0.82;
      const sunY = h * 0.08;
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#FFF8DC';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 40;
      ctx.beginPath(); ctx.arc(sunX, sunY, 30, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1;

      // Clouds
      clouds.forEach(c => {
        const cx = ((c.x + f * c.speed) % 1.3 - 0.15) * w;
        const cy = c.y * h;
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(cx, cy, c.w, c.w * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - c.w * 0.3, cy + 5, c.w * 0.6, c.w * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + c.w * 0.35, cy + 3, c.w * 0.5, c.w * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // ===== OCEAN HORIZON =====
      const oceanY = h * 0.45;
      const ocean = ctx.createLinearGradient(0, oceanY, 0, h * 0.65);
      ocean.addColorStop(0, `hsl(${200 + tintHue * 0.05}, 60%, 55%)`);
      ocean.addColorStop(0.5, `hsl(${205}, 55%, 50%)`);
      ocean.addColorStop(1, `hsl(${210}, 50%, 45%)`);
      ctx.fillStyle = ocean;
      ctx.beginPath();
      ctx.moveTo(0, oceanY);
      for (let x = 0; x <= w; x += 8) {
        const waveY = oceanY + Math.sin(x * 0.008 + f * 0.015) * 4 + Math.sin(x * 0.02 + f * 0.008) * 2;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(w, h * 0.65);
      ctx.lineTo(0, h * 0.65);
      ctx.closePath();
      ctx.fill();

      // Wave highlights
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const wy = oceanY + 8 + i * 8;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = wy + Math.sin(x * 0.01 + f * 0.012 + i * 2) * 3;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ===== DISTANT ISLAND (parallax layer 1) =====
      drawDistantIsland(ctx, w, h, f, tintHue);

      // ===== MAIN ISLAND CLIFFS (parallax layer 2) =====
      drawMainCliffs(ctx, w, h, f, tintHue);

      // ===== FOREGROUND GRASS (parallax layer 3) =====
      drawForegroundGrass(ctx, w, h, f, tintHue);

      // Trees & rocks on cliffs
      drawTrees(ctx, w, h, f);
      drawRocks(ctx, w, h);
      drawMushrooms(ctx, w, h, f);

      // Fireflies
      drawFireflies(ctx, w, h, f, fireflies);

      // Element tint overlay (very subtle)
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = `hsl(${tintHue}, 50%, 50%)`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      frameRef.current++;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [elementTint]);

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

function drawDistantIsland(ctx: CanvasRenderingContext2D, w: number, h: number, f: number, tintHue: number) {
  const baseY = h * 0.42;
  ctx.fillStyle = `hsl(${tintHue + 10}, 25%, 45%)`;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(w * 0.6, baseY);
  ctx.quadraticCurveTo(w * 0.7, baseY - 40, w * 0.8, baseY);
  ctx.quadraticCurveTo(w * 0.85, baseY - 20, w * 0.95, baseY + 5);
  ctx.lineTo(w * 0.95, baseY + 15);
  ctx.lineTo(w * 0.6, baseY + 15);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawMainCliffs(ctx: CanvasRenderingContext2D, w: number, h: number, f: number, tintHue: number) {
  const baseY = h * 0.58;

  // Main cliff body
  const cliffGrad = ctx.createLinearGradient(0, baseY - 30, 0, h);
  cliffGrad.addColorStop(0, `hsl(${100 + tintHue * 0.1}, 40%, 42%)`);
  cliffGrad.addColorStop(0.3, `hsl(${95}, 35%, 35%)`);
  cliffGrad.addColorStop(0.7, `hsl(${30}, 30%, 30%)`);
  cliffGrad.addColorStop(1, `hsl(${25}, 25%, 22%)`);
  ctx.fillStyle = cliffGrad;

  ctx.beginPath();
  ctx.moveTo(0, baseY + 20);
  for (let x = 0; x <= w; x += 20) {
    const cliff = Math.sin(x * 0.003) * 25 + Math.sin(x * 0.008 + 1) * 12;
    ctx.lineTo(x, baseY + cliff);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Cliff face highlights
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = `hsl(${40}, 40%, 65%)`;
  for (let i = 0; i < 8; i++) {
    const rx = (i * w / 8) + Math.sin(i * 3.7) * 30;
    const ry = baseY + 20 + Math.sin(rx * 0.005) * 15;
    ctx.beginPath();
    ctx.ellipse(rx, ry + 15, 25, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawForegroundGrass(ctx: CanvasRenderingContext2D, w: number, h: number, f: number, tintHue: number) {
  const baseY = h * 0.82;
  const grassGrad = ctx.createLinearGradient(0, baseY, 0, h);
  grassGrad.addColorStop(0, `hsl(${110 + tintHue * 0.05}, 50%, 38%)`);
  grassGrad.addColorStop(1, `hsl(${105}, 40%, 28%)`);
  ctx.fillStyle = grassGrad;

  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= w; x += 10) {
    const y = baseY + Math.sin(x * 0.015 + f * 0.003) * 6 + Math.sin(x * 0.04) * 3;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Grass blades
  ctx.strokeStyle = `hsl(${115}, 45%, 45%)`;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 30; i++) {
    const gx = (i / 30) * w + Math.sin(i * 7.3) * 15;
    const gy = baseY + Math.sin(gx * 0.015) * 5;
    const sway = Math.sin(f * 0.008 + i * 2.1) * 4;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx + sway, gy - 12, gx + sway * 1.2, gy - 18);
    ctx.stroke();
  }

  // Small flowers
  const flowerColors = ['#FF69B4', '#FFD700', '#FF6347', '#87CEEB', '#DDA0DD'];
  for (let i = 0; i < 12; i++) {
    const fx = (i * 97 + 40) % w;
    const fy = baseY + Math.sin(fx * 0.02) * 4 - 3;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTrees(ctx: CanvasRenderingContext2D, w: number, h: number, f: number) {
  const treePositions = [0.05, 0.15, 0.35, 0.55, 0.75, 0.92];
  const baseY = h * 0.58;

  treePositions.forEach((pos, i) => {
    const tx = pos * w;
    const ty = baseY + Math.sin(tx * 0.005) * 20 - 5;
    const treeH = 35 + Math.sin(i * 3.1) * 15;
    const sway = Math.sin(f * 0.005 + i * 2) * 2;

    // Trunk
    ctx.fillStyle = `hsl(25, 30%, ${25 + i * 2}%)`;
    ctx.fillRect(tx - 3 + sway * 0.3, ty - treeH * 0.3, 6, treeH * 0.5);

    // Canopy layers
    for (let l = 0; l < 3; l++) {
      const layerY = ty - treeH + l * treeH * 0.2;
      const layerW = 18 - l * 3;
      ctx.fillStyle = `hsl(${110 + l * 8}, ${40 + l * 5}%, ${30 + l * 5}%)`;
      ctx.beginPath();
      ctx.moveTo(tx + sway, layerY);
      ctx.lineTo(tx - layerW + sway, layerY + treeH * 0.35);
      ctx.lineTo(tx + layerW + sway, layerY + treeH * 0.35);
      ctx.closePath();
      ctx.fill();
    }
  });
}

function drawRocks(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rockPositions = [0.1, 0.3, 0.5, 0.7, 0.88];
  const baseY = h * 0.62;

  rockPositions.forEach((pos, i) => {
    const rx = pos * w;
    const ry = baseY + Math.sin(rx * 0.006) * 15 + 10;
    const rw = 10 + Math.sin(i * 5.3) * 6;
    const rh = 6 + Math.sin(i * 3.7) * 4;

    ctx.fillStyle = `hsl(30, 15%, ${35 + i * 3}%)`;
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(rx - rw * 0.2, ry - rh * 0.3, rw * 0.4, rh * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawMushrooms(ctx: CanvasRenderingContext2D, w: number, h: number, f: number) {
  const positions = [0.18, 0.42, 0.68, 0.85];
  const baseY = h * 0.78;

  positions.forEach((pos, i) => {
    const mx = pos * w;
    const my = baseY + Math.sin(mx * 0.01) * 5;
    const mh = 10 + Math.sin(i * 4.3) * 4;
    const pulse = Math.sin(f * 0.03 + i * 2) * 0.1;

    // Glow
    ctx.globalAlpha = 0.15 + pulse;
    const hue = [340, 160, 50, 280][i % 4];
    ctx.fillStyle = `hsl(${hue}, 60%, 60%)`;
    ctx.shadowColor = `hsl(${hue}, 60%, 60%)`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(mx, my - mh * 0.5, mh * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

    // Stem
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = `hsl(${hue}, 15%, 75%)`;
    ctx.fillRect(mx - 1.5, my - mh * 0.2, 3, mh * 0.35);

    // Cap
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = `hsl(${hue}, 50%, 50%)`;
    ctx.beginPath();
    ctx.ellipse(mx, my - mh * 0.4, mh * 0.45, mh * 0.3, 0, Math.PI, 0);
    ctx.fill();

    ctx.globalAlpha = 1;
  });
}

function drawFireflies(ctx: CanvasRenderingContext2D, w: number, h: number, f: number, fireflies: any[]) {
  fireflies.forEach(ff => {
    const x = (Math.sin(ff.seed + f * ff.speed) * 0.5 + 0.5) * w;
    const y = (Math.cos(ff.seed * 1.3 + f * ff.speed * 0.8) * 0.3 + 0.5) * h;
    const brightness = Math.sin(f * 0.04 + ff.seed) * 0.5 + 0.5;

    if (brightness > 0.3) {
      ctx.globalAlpha = brightness * 0.6;
      ctx.fillStyle = '#FFFFAA';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 6 + brightness * 4;
      ctx.beginPath();
      ctx.arc(x, y, 1 + brightness, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}
