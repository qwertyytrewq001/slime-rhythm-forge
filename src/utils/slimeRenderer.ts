import { Slime } from '@/types/slime';
import { COLOR_PALETTE } from '@/data/traitData';

const INTERNAL_SIZE = 64;

export function drawSlime(
  ctx: CanvasRenderingContext2D,
  slime: Slime,
  canvasSize: number,
  frame: number = 0,
  animated: boolean = true
): void {
  const s = INTERNAL_SIZE;
  ctx.canvas.width = s;
  ctx.canvas.height = s;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, s, s);

  const t = slime.traits;
  const c1 = COLOR_PALETTE[t.color1] || '#7FFF7F';
  const c2 = COLOR_PALETTE[t.color2] || '#7FBFFF';

  const bounce = animated ? Math.sin(frame * 0.06) * 2 : 0;
  const squash = animated ? 1 + Math.sin(frame * 0.06) * 0.04 : 1;

  ctx.save();
  ctx.translate(s / 2, s / 2 + bounce);
  ctx.scale(squash * t.size * 0.45, (1 / squash) * t.size * 0.45);

  // Glow effect
  if (t.glow > 0) {
    const glowAlpha = t.glow * 0.15;
    const glowColor = t.glow === 5 ? `hsla(${(frame * 3) % 360}, 80%, 60%, ${glowAlpha})` : hexToRgba(c1, glowAlpha);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = t.glow * 4;
  }

  // Draw body shape
  drawBody(ctx, t.shape, c1, c2);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Pattern overlay
  if (t.pattern > 0) drawPattern(ctx, t.pattern, c2, frame);

  // Spikes
  if (t.spikes > 0) drawSpikes(ctx, t.spikes, c2);

  // Eyes
  drawEyes(ctx, t.eyes, frame);

  // Mouth
  drawMouth(ctx, t.mouth);

  // Accessory
  if (t.accessory > 0) drawAccessory(ctx, t.accessory, c2);

  // Aura particles
  if (t.aura > 0 && animated) drawAura(ctx, t.aura, frame);

  ctx.restore();
}

function drawBody(ctx: CanvasRenderingContext2D, shape: number, c1: string, c2: string) {
  const grad = ctx.createRadialGradient(0, -5, 2, 0, 5, 50);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;

  ctx.beginPath();
  switch (shape) {
    case 0: // Blob
      ctx.ellipse(0, 0, 45, 40, 0, 0, Math.PI * 2);
      break;
    case 1: // Orb
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      break;
    case 2: // Spikeball
      drawStarShape(ctx, 0, 0, 30, 45, 8);
      break;
    case 3: // Cube
      ctx.roundRect(-35, -35, 70, 70, 8);
      break;
    case 4: // Star
      drawStarShape(ctx, 0, 0, 20, 42, 5);
      break;
    case 5: // Diamond
      ctx.moveTo(0, -45); ctx.lineTo(35, 0); ctx.lineTo(0, 45); ctx.lineTo(-35, 0);
      break;
    case 6: // Crescent
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(15, -10, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      return;
    case 7: // Hex
      drawRegularPolygon(ctx, 0, 0, 40, 6);
      break;
    case 8: // Teardrop
      ctx.moveTo(0, -40);
      ctx.bezierCurveTo(25, -20, 35, 15, 0, 42);
      ctx.bezierCurveTo(-35, 15, -25, -20, 0, -40);
      break;
    case 9: // Mushroom
      ctx.ellipse(0, -10, 40, 25, 0, Math.PI, 0);
      ctx.rect(-15, -10, 30, 35);
      break;
    case 10: // Bell
      ctx.moveTo(-30, 30); ctx.quadraticCurveTo(-35, -30, 0, -40);
      ctx.quadraticCurveTo(35, -30, 30, 30); ctx.lineTo(-30, 30);
      break;
    case 11: // Cloud
      ctx.arc(-15, 0, 25, 0, Math.PI * 2); ctx.arc(15, 0, 25, 0, Math.PI * 2);
      ctx.arc(0, -15, 22, 0, Math.PI * 2);
      break;
    case 12: // Heart
      ctx.moveTo(0, 35);
      ctx.bezierCurveTo(-45, 10, -40, -30, 0, -15);
      ctx.bezierCurveTo(40, -30, 45, 10, 0, 35);
      break;
    case 13: // Ghost
      ctx.ellipse(0, -10, 30, 30, 0, Math.PI, 0);
      ctx.lineTo(30, 25);
      for (let i = 0; i < 5; i++) {
        const x = 30 - i * 15;
        ctx.quadraticCurveTo(x - 7, i % 2 ? 35 : 20, x - 15, 25);
      }
      break;
    case 14: // Crystal
      ctx.moveTo(0, -45); ctx.lineTo(20, -15); ctx.lineTo(25, 20);
      ctx.lineTo(10, 40); ctx.lineTo(-10, 40); ctx.lineTo(-25, 20);
      ctx.lineTo(-20, -15);
      break;
    default:
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
  }
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(-12, -15, 8, 5, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(ctx: CanvasRenderingContext2D, type: number, frame: number) {
  ctx.fillStyle = '#222';
  const eyeY = -8;
  const eyeSpacing = 12;

  switch (type) {
    case 0: // Dot
      ctx.fillRect(-eyeSpacing - 2, eyeY - 2, 4, 4);
      ctx.fillRect(eyeSpacing - 2, eyeY - 2, 4, 4);
      break;
    case 1: // Circle
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      break;
    case 2: // Star eyes
      drawStarShape(ctx, -eyeSpacing, eyeY, 2, 5, 5); ctx.fill();
      drawStarShape(ctx, eyeSpacing, eyeY, 2, 5, 5); ctx.fill();
      break;
    case 3: // Heart
      drawMiniHeart(ctx, -eyeSpacing, eyeY, 4);
      drawMiniHeart(ctx, eyeSpacing, eyeY, 4);
      break;
    case 4: // X
      ctx.lineWidth = 2; ctx.strokeStyle = '#222';
      drawX(ctx, -eyeSpacing, eyeY, 4); drawX(ctx, eyeSpacing, eyeY, 4);
      break;
    case 9: // Sleepy
      ctx.lineWidth = 2; ctx.strokeStyle = '#222';
      ctx.beginPath(); ctx.moveTo(-eyeSpacing - 4, eyeY); ctx.lineTo(-eyeSpacing + 4, eyeY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(eyeSpacing - 4, eyeY); ctx.lineTo(eyeSpacing + 4, eyeY); ctx.stroke();
      break;
    default: // Default circle with white
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(-eyeSpacing + 1, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing + 1, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
  }
}

function drawMouth(ctx: CanvasRenderingContext2D, type: number) {
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = '#333';
  const y = 6;

  switch (type) {
    case 0: // Smile
      ctx.beginPath(); ctx.arc(0, y, 6, 0.1, Math.PI - 0.1); ctx.stroke();
      break;
    case 1: // Frown
      ctx.beginPath(); ctx.arc(0, y + 6, 6, Math.PI + 0.2, -0.2); ctx.stroke();
      break;
    case 2: // Open
      ctx.fillStyle = '#555';
      ctx.beginPath(); ctx.ellipse(0, y + 2, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 3: // Fang
      ctx.beginPath(); ctx.arc(0, y, 6, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(-3, y + 2); ctx.lineTo(-1, y + 7); ctx.lineTo(1, y + 2); ctx.fill();
      break;
    case 4: // :3
      ctx.beginPath(); ctx.arc(-4, y + 2, 3, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.beginPath(); ctx.arc(4, y + 2, 3, 0.1, Math.PI - 0.1); ctx.stroke();
      break;
    default:
      ctx.beginPath(); ctx.moveTo(-5, y + 2); ctx.lineTo(5, y + 2); ctx.stroke();
  }
}

function drawSpikes(ctx: CanvasRenderingContext2D, type: number, color: string) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  const count = Math.min(type + 2, 8);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * 42;
    const y = Math.sin(angle) * 38;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -10 - type); ctx.lineTo(-4, 2); ctx.lineTo(4, 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawPattern(ctx: CanvasRenderingContext2D, type: number, color: string, frame: number) {
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = color;
  switch (type) {
    case 1: // Dots
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(Math.cos(i * 1.1) * 18, Math.sin(i * 1.3) * 15, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 2: // Stripes
      ctx.lineWidth = 3; ctx.strokeStyle = color;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(-30, i * 12); ctx.lineTo(30, i * 12); ctx.stroke();
      }
      break;
    default:
      // Subtle dots for other patterns
      for (let i = 0; i < type; i++) {
        ctx.beginPath();
        ctx.arc(Math.cos(i * 2.1 + type) * 20, Math.sin(i * 1.7 + type) * 18, 2, 0, Math.PI * 2);
        ctx.fill();
      }
  }
  ctx.globalAlpha = 1;
}

function drawAccessory(ctx: CanvasRenderingContext2D, type: number, color: string) {
  ctx.fillStyle = color;
  switch (type) {
    case 1: // Hat
      ctx.fillStyle = '#333';
      ctx.fillRect(-12, -48, 24, 6);
      ctx.fillRect(-8, -60, 16, 14);
      break;
    case 2: // Crown
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-12, -38); ctx.lineTo(-12, -50); ctx.lineTo(-6, -44);
      ctx.lineTo(0, -54); ctx.lineTo(6, -44); ctx.lineTo(12, -50);
      ctx.lineTo(12, -38);
      ctx.fill();
      break;
    case 3: // Bow
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath(); ctx.ellipse(-20, -30, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-12, -30, 8, 5, 0.3, 0, Math.PI * 2); ctx.fill();
      break;
    case 4: // Glasses
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.rect(-18, -14, 12, 10); ctx.stroke();
      ctx.beginPath(); ctx.rect(6, -14, 12, 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-6, -9); ctx.lineTo(6, -9); ctx.stroke();
      break;
    case 7: // Halo
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, -48, 15, 5, 0, 0, Math.PI * 2); ctx.stroke();
      break;
    default: break;
  }
}

function drawAura(ctx: CanvasRenderingContext2D, type: number, frame: number) {
  const particleCount = type * 3;
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + frame * 0.02;
    const dist = 48 + Math.sin(frame * 0.05 + i) * 8;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.08 + i) * 0.3;
    switch (type) {
      case 1: ctx.fillStyle = '#FFE4B5'; break; // Sparkle
      case 2: ctx.fillStyle = '#FF6347'; break;  // Flame
      case 3: ctx.fillStyle = '#87CEEB'; break;  // Frost
      case 4: // Quantum - color shifts
        ctx.fillStyle = `hsl(${(frame * 5 + i * 40) % 360}, 70%, 60%)`;
        break;
    }
    ctx.beginPath();
    ctx.arc(x, y, 2 + Math.sin(frame * 0.1 + i) * 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Helper functions
function drawStarShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, inner: number, outer: number, points: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawRegularPolygon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawMiniHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + size / 2);
  ctx.bezierCurveTo(cx - size, cy - size / 2, cx - size / 2, cy - size, cx, cy - size / 3);
  ctx.bezierCurveTo(cx + size / 2, cy - size, cx + size, cy - size / 2, cx, cy + size / 2);
  ctx.fill();
}

function drawX(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath(); ctx.moveTo(cx - size, cy - size); ctx.lineTo(cx + size, cy + size); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + size, cy - size); ctx.lineTo(cx - size, cy + size); ctx.stroke();
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
