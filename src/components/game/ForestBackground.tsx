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

    const tintHue = elementTint ? (ELEMENT_HUE[elementTint as keyof typeof ELEMENT_HUE] ?? 140) : 140;

    // Seed fireflies and mushroom positions once
    const fireflies: { seed: number; speed: number; brightness: number }[] = [];
    for (let i = 0; i < 25; i++) {
      fireflies.push({ seed: i * 73.7, speed: 0.002 + Math.random() * 0.003, brightness: Math.random() });
    }
    const mushrooms: { x: number; h: number; hue: number; glow: number }[] = [];
    for (let i = 0; i < 8; i++) {
      mushrooms.push({
        x: (i + 0.3) / 8,
        h: 12 + Math.random() * 10,
        hue: tintHue + Math.random() * 60 - 30,
        glow: 0.3 + Math.random() * 0.4,
      });
    }

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const f = frameRef.current;

      // Day/night cycle (soft transition every ~4 min)
      const dayPhase = Math.sin(f * 0.0003) * 0.5 + 0.5; // 0=night, 1=day
      const skyLight = 20 + dayPhase * 12;
      const skySat = 28 + dayPhase * 8;

      // Sky gradient with element tint
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, `hsl(${tintHue}, ${skySat}%, ${skyLight - 2}%)`);
      sky.addColorStop(0.4, `hsl(${tintHue + 15}, ${skySat + 5}%, ${skyLight + 8}%)`);
      sky.addColorStop(0.7, `hsl(${tintHue + 10}, ${skySat}%, ${skyLight + 3}%)`);
      sky.addColorStop(1, `hsl(${tintHue + 5}, ${skySat - 5}%, ${skyLight - 5}%)`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Moon/stars at night
      if (dayPhase < 0.4) {
        const nightAlpha = (0.4 - dayPhase) * 2.5;
        // Moon
        ctx.globalAlpha = nightAlpha * 0.6;
        ctx.fillStyle = '#FFFFF0';
        ctx.shadowColor = '#FFFFF0';
        ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(w * 0.8, h * 0.12, 18, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

        // Stars
        ctx.globalAlpha = nightAlpha * 0.5;
        for (let i = 0; i < 30; i++) {
          const sx = (Math.sin(i * 43.7) * 0.5 + 0.5) * w;
          const sy = (Math.cos(i * 67.3) * 0.5 + 0.5) * h * 0.4;
          const twinkle = Math.sin(f * 0.03 + i * 5) * 0.5 + 0.5;
          if (twinkle > 0.3) {
            ctx.fillStyle = elementTint === 'cosmic' ? '#DDA0DD' : '#FFFFF0';
            ctx.beginPath(); ctx.arc(sx, sy, 0.5 + twinkle, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }

      // Distant trees (parallax layer 1 - slowest)
      drawTreeLayer(ctx, w, h, f * 0.001, `hsla(${tintHue + 10}, 20%, 14%, 0.7)`, 10, 0.5);

      // Mid trees closer
      drawTreeLayer(ctx, w, h, f * 0.002, `hsla(${tintHue + 5}, 25%, 18%, 0.5)`, 6, 0.6);

      // Glowing mushrooms
      drawMushrooms(ctx, w, h, f, mushrooms, dayPhase);

      // Moss and flowers layer
      drawMossLayer(ctx, w, h, f * 0.004, `hsla(${tintHue}, 35%, 22%, 0.5)`, 0.72);

      // Foreground vines with leaves
      drawVines(ctx, w, h, f);

      // Fireflies (more at night)
      const fireflyCount = dayPhase < 0.4 ? fireflies.length : Math.floor(fireflies.length * 0.4);
      drawFireflies(ctx, w, h, f, fireflies.slice(0, fireflyCount));

      // Subtle fog layer
      drawFog(ctx, w, h, f, tintHue);

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

function drawTreeLayer(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number, color: string, count: number, yPos: number) {
  ctx.fillStyle = color;
  const treeWidth = w / count;
  for (let i = 0; i < count + 2; i++) {
    const x = ((i * treeWidth + offset * 50) % (w + treeWidth * 2)) - treeWidth;
    const sway = Math.sin(offset * 8 + i * 1.3) * 4;
    const treeH = h * 0.3 + Math.sin(i * 2.7) * h * 0.1;
    const baseY = h * yPos;

    // Multi-layered tree (3 triangle layers)
    for (let layer = 0; layer < 3; layer++) {
      const layerY = baseY - treeH + layer * treeH * 0.25;
      const layerW = treeWidth * (0.35 - layer * 0.05);
      ctx.beginPath();
      ctx.moveTo(x + sway * (1 - layer * 0.2), layerY);
      ctx.lineTo(x - layerW, layerY + treeH * 0.4);
      ctx.lineTo(x + layerW, layerY + treeH * 0.4);
      ctx.closePath();
      ctx.fill();
    }

    // Trunk
    ctx.fillRect(x - 3, baseY, 6, 25);
  }
}

function drawMushrooms(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number, mushrooms: any[], dayPhase: number) {
  const glowIntensity = 0.3 + (1 - dayPhase) * 0.5; // Brighter at night

  mushrooms.forEach((m, i) => {
    const mx = m.x * w;
    const baseY = h * 0.68 + Math.sin(i * 3.7) * h * 0.04;
    const pulse = Math.sin(frame * 0.03 + i * 2) * 0.15;

    // Glow halo
    ctx.globalAlpha = (m.glow + pulse) * glowIntensity;
    ctx.fillStyle = `hsla(${m.hue}, 60%, 55%, 0.3)`;
    ctx.shadowColor = `hsla(${m.hue}, 60%, 55%, 0.5)`;
    ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(mx, baseY - m.h * 0.6, m.h * 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

    // Stem
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = `hsla(${m.hue}, 15%, 70%, 0.5)`;
    ctx.fillRect(mx - 2, baseY - m.h * 0.3, 4, m.h * 0.4);

    // Cap
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = `hsla(${m.hue}, 55%, 50%, 0.6)`;
    ctx.beginPath();
    ctx.ellipse(mx, baseY - m.h * 0.5, m.h * 0.55, m.h * 0.35, 0, Math.PI, 0);
    ctx.fill();

    // Cap dots
    ctx.fillStyle = `hsla(${m.hue + 30}, 40%, 80%, 0.5)`;
    ctx.beginPath(); ctx.arc(mx - 3, baseY - m.h * 0.6, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 2, baseY - m.h * 0.55, 1, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawMossLayer(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number, color: string, yPos: number) {
  ctx.fillStyle = color;
  const baseY = h * yPos;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= w; x += 15) {
    const y = baseY + Math.sin(x * 0.02 + offset) * 10 + Math.sin(x * 0.05) * 5;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Flowers with variety
  const flowerColors = ['#FF69B4', '#FFD700', '#87CEEB', '#DDA0DD', '#98FB98', '#FFA07A'];
  for (let i = 0; i < 15; i++) {
    const fx = (i * 97 + offset * 15) % w;
    const fy = baseY + Math.sin(fx * 0.03) * 7 - 4;
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    ctx.globalAlpha = 0.5;
    // Petal flower
    if (i % 3 === 0) {
      for (let p = 0; p < 4; p++) {
        const pa = (p / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(pa) * 2, fy + Math.sin(pa) * 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FFD700';
      ctx.beginPath(); ctx.arc(fx, fy, 1, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawVines(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) {
  ctx.strokeStyle = 'hsla(120, 30%, 22%, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const startX = (i * w / 6) + 40;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    const vineLen = h * (0.15 + Math.sin(i * 1.7) * 0.08);
    for (let y = 0; y < vineLen; y += 8) {
      const sway = Math.sin(y * 0.04 + frame * 0.008 + i * 2) * 10;
      ctx.lineTo(startX + sway, y);
    }
    ctx.stroke();

    // Multiple leaves along vine
    for (let l = 0; l < 3; l++) {
      const leafY = vineLen * (0.3 + l * 0.25);
      const leafSway = Math.sin(leafY * 0.04 + frame * 0.008 + i * 2) * 10;
      ctx.fillStyle = `hsla(${110 + l * 15}, 40%, ${25 + l * 5}%, 0.35)`;
      ctx.beginPath();
      ctx.ellipse(
        startX + leafSway + (l % 2 ? 5 : -5),
        leafY,
        5, 3,
        Math.sin(frame * 0.015 + i + l) * 0.3 + (l % 2 ? 0.5 : -0.5),
        0, Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function drawFireflies(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number, fireflies: any[]) {
  fireflies.forEach((ff) => {
    const x = (Math.sin(ff.seed + frame * ff.speed) * 0.5 + 0.5) * w;
    const y = (Math.cos(ff.seed * 1.3 + frame * ff.speed * 0.8) * 0.5 + 0.5) * h;
    const brightness = Math.sin(frame * 0.04 + ff.seed) * 0.5 + 0.5;

    if (brightness > 0.25) {
      ctx.globalAlpha = brightness * 0.7;
      ctx.fillStyle = '#FFFFAA';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 8 + brightness * 6;
      ctx.beginPath();
      ctx.arc(x, y, 1 + brightness * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

function drawFog(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number, tintHue: number) {
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 3; i++) {
    const fogX = (Math.sin(frame * 0.001 + i * 3) * 0.5 + 0.5) * w;
    const fogY = h * (0.5 + i * 0.12);
    const grad = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, w * 0.25);
    grad.addColorStop(0, `hsla(${tintHue}, 20%, 60%, 0.15)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalAlpha = 1;
}
