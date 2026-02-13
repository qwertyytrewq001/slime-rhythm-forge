import { Slime, SlimeElement } from '@/types/slime';
import { COLOR_PALETTE, ELEMENT_COLORS } from '@/data/traitData';

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
  const model = t.model || 0;
  const c1 = COLOR_PALETTE[t.color1] || '#7FFF7F';
  const c2 = COLOR_PALETTE[t.color2] || '#7FBFFF';
  const element = slime.element || 'bio';

  // Model-specific idle animation
  let bounce = 0, squashX = 1, squashY = 1;
  if (animated) {
    switch (model) {
      case 0: // Blob: bouncy hops
        bounce = Math.abs(Math.sin(frame * 0.08)) * 3;
        squashX = 1 + Math.sin(frame * 0.08) * 0.06;
        squashY = 1 - Math.sin(frame * 0.08) * 0.06;
        break;
      case 1: // Spiky: sharp wobble/pace
        bounce = Math.sin(frame * 0.1) * 1.5;
        squashX = 1 + Math.sin(frame * 0.15) * 0.03;
        squashY = 1;
        break;
      case 2: // Jelly: ripple/wave
        bounce = Math.sin(frame * 0.04) * 2;
        squashX = 1 + Math.sin(frame * 0.05) * 0.08;
        squashY = 1 + Math.cos(frame * 0.05) * 0.08;
        break;
    }
  }

  // Rarity visual effects
  const stars = slime.rarityStars;

  ctx.save();
  ctx.translate(s / 2, s / 2 + bounce);

  // 5★ Mythic: pulsing size + rainbow cycle
  let sizeMultiplier = t.size * 0.42;
  if (stars >= 5 && animated) {
    sizeMultiplier *= 1 + Math.sin(frame * 0.03) * 0.05;
  }
  ctx.scale(squashX * sizeMultiplier, squashY * sizeMultiplier);

  // Rarity glow layers
  if (stars >= 3 && animated) {
    // Outline glow
    const glowHue = stars >= 5 ? (frame * 3) % 360 : stars >= 4 ? 45 : 160;
    const glowAlpha = 0.3 + Math.sin(frame * 0.05) * 0.1;
    ctx.shadowColor = `hsla(${glowHue}, 80%, 60%, ${glowAlpha})`;
    ctx.shadowBlur = stars * 3;
  }

  // Glow effect from trait
  if (t.glow > 0) {
    const glowAlpha = t.glow * 0.12;
    const glowColor = t.glow === 5 ? `hsla(${(frame * 3) % 360}, 80%, 60%, ${glowAlpha})` : hexToRgba(c1, glowAlpha);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = t.glow * 5;
  }

  // Draw body shape
  drawBody(ctx, t.shape, c1, c2, model, frame, animated);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Noise texture overlay for depth
  if (animated) drawNoiseTexture(ctx, frame);

  // Vein/gradient overlay
  drawVeinOverlay(ctx, c1, c2, t.shape, frame, animated);

  // Pattern overlay
  if (t.pattern > 0) drawPattern(ctx, t.pattern, c2, frame);

  // Spikes (model-adapted)
  if (t.spikes > 0) drawSpikes(ctx, t.spikes, c2, model);

  // Shine edge highlight
  drawShineEdge(ctx, stars);

  // Eyes with personality
  drawEyes(ctx, t.eyes, frame, model, animated);

  // Mouth with personality
  drawMouth(ctx, t.mouth, model, frame, animated);

  // Accessory
  if (t.accessory > 0) drawAccessory(ctx, t.accessory, c2);

  // Element particles
  if (animated) drawElementParticles(ctx, element, frame, stars);

  // Aura particles
  if (t.aura > 0 && animated) drawAura(ctx, t.aura, frame, stars);

  // 5★ metallic shader
  if (stars >= 5 && animated) {
    drawMetallicShader(ctx, frame);
  }

  // 4★+ confetti on selection
  if (stars >= 4 && animated && frame % 60 < 30) {
    drawConfetti(ctx, frame, stars);
  }

  ctx.restore();
}

function drawBody(ctx: CanvasRenderingContext2D, shape: number, c1: string, c2: string, model: number, frame: number, animated: boolean) {
  const grad = ctx.createRadialGradient(0, -5, 2, 0, 5, 50);
  grad.addColorStop(0, c1);
  grad.addColorStop(0.6, c2);
  grad.addColorStop(1, darkenColor(c2, 0.7));
  ctx.fillStyle = grad;

  ctx.beginPath();

  // Model adjusts shape rendering
  if (model === 2 && animated) {
    // Jelly: wobbly version of shape
    ctx.save();
    const wobble = Math.sin(frame * 0.07) * 0.03;
    ctx.transform(1 + wobble, wobble * 0.5, -wobble * 0.5, 1 - wobble, 0, 0);
  }

  switch (shape) {
    case 0: ctx.ellipse(0, 0, 45, 40, 0, 0, Math.PI * 2); break;
    case 1: ctx.arc(0, 0, 42, 0, Math.PI * 2); break;
    case 2: drawStarShape(ctx, 0, 0, 30, 45, 8); break;
    case 3: ctx.roundRect(-35, -35, 70, 70, 8); break;
    case 4: drawStarShape(ctx, 0, 0, 20, 42, 5); break;
    case 5:
      ctx.moveTo(0, -45); ctx.lineTo(35, 0); ctx.lineTo(0, 45); ctx.lineTo(-35, 0);
      break;
    case 6:
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(15, -10, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      if (model === 2 && animated) ctx.restore();
      return;
    case 7: drawRegularPolygon(ctx, 0, 0, 40, 6); break;
    case 8:
      ctx.moveTo(0, -40);
      ctx.bezierCurveTo(25, -20, 35, 15, 0, 42);
      ctx.bezierCurveTo(-35, 15, -25, -20, 0, -40);
      break;
    case 9:
      ctx.ellipse(0, -10, 40, 25, 0, Math.PI, 0);
      ctx.rect(-15, -10, 30, 35);
      break;
    case 10:
      ctx.moveTo(-30, 30); ctx.quadraticCurveTo(-35, -30, 0, -40);
      ctx.quadraticCurveTo(35, -30, 30, 30); ctx.lineTo(-30, 30);
      break;
    case 11:
      ctx.arc(-15, 0, 25, 0, Math.PI * 2); ctx.arc(15, 0, 25, 0, Math.PI * 2);
      ctx.arc(0, -15, 22, 0, Math.PI * 2);
      break;
    case 12:
      ctx.moveTo(0, 35);
      ctx.bezierCurveTo(-45, 10, -40, -30, 0, -15);
      ctx.bezierCurveTo(40, -30, 45, 10, 0, 35);
      break;
    case 13:
      ctx.ellipse(0, -10, 30, 30, 0, Math.PI, 0);
      ctx.lineTo(30, 25);
      for (let i = 0; i < 5; i++) {
        const x = 30 - i * 15;
        ctx.quadraticCurveTo(x - 7, i % 2 ? 35 : 20, x - 15, 25);
      }
      break;
    case 14:
      ctx.moveTo(0, -45); ctx.lineTo(20, -15); ctx.lineTo(25, 20);
      ctx.lineTo(10, 40); ctx.lineTo(-10, 40); ctx.lineTo(-25, 20);
      ctx.lineTo(-20, -15);
      break;
    default: ctx.arc(0, 0, 40, 0, Math.PI * 2);
  }
  ctx.fill();

  if (model === 2 && animated) ctx.restore();

  // Body highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-12, -15, 9, 6, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Secondary highlight for depth
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(8, -20, 4, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawNoiseTexture(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 20; i++) {
    const x = Math.sin(i * 7.3 + frame * 0.01) * 30;
    const y = Math.cos(i * 5.1 + frame * 0.01) * 25;
    ctx.fillStyle = i % 2 === 0 ? '#fff' : '#000';
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawVeinOverlay(ctx: CanvasRenderingContext2D, c1: string, c2: string, shape: number, frame: number, animated: boolean) {
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = c2;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + (animated ? frame * 0.005 : 0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      Math.cos(angle) * 20, Math.sin(angle) * 15,
      Math.cos(angle + 0.5) * 35, Math.sin(angle + 0.5) * 30
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawShineEdge(ctx: CanvasRenderingContext2D, stars: number) {
  if (stars < 2) return;
  ctx.globalAlpha = 0.2 + stars * 0.05;
  ctx.strokeStyle = stars >= 5 ? '#FFD700' : stars >= 4 ? '#C0C0C0' : '#fff';
  ctx.lineWidth = stars >= 4 ? 2 : 1;
  ctx.beginPath();
  ctx.arc(0, 0, 38, -Math.PI * 0.7, -Math.PI * 0.2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawEyes(ctx: CanvasRenderingContext2D, type: number, frame: number, model: number, animated: boolean) {
  ctx.fillStyle = '#222';
  const eyeY = -8;
  const eyeSpacing = 12;

  // Blink cycle
  const blinkCycle = animated ? Math.floor(frame / 120) % 8 : -1;
  const isBlinking = blinkCycle === 0 && animated;

  if (isBlinking) {
    // Closed eyes = horizontal lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#222';
    ctx.beginPath(); ctx.moveTo(-eyeSpacing - 4, eyeY); ctx.lineTo(-eyeSpacing + 4, eyeY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(eyeSpacing - 4, eyeY); ctx.lineTo(eyeSpacing + 4, eyeY); ctx.stroke();
    return;
  }

  // Model personality: Spiky eyes are slightly angled/angry
  if (model === 1) {
    ctx.save();
    ctx.translate(-eyeSpacing, eyeY);
    ctx.rotate(-0.15);
    ctx.translate(eyeSpacing, -eyeY);
  }

  switch (type) {
    case 0:
      ctx.fillRect(-eyeSpacing - 2, eyeY - 2, 4, 4);
      ctx.fillRect(eyeSpacing - 2, eyeY - 2, 4, 4);
      break;
    case 1:
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      break;
    case 2:
      drawStarShape(ctx, -eyeSpacing, eyeY, 2, 5, 5); ctx.fill();
      drawStarShape(ctx, eyeSpacing, eyeY, 2, 5, 5); ctx.fill();
      break;
    case 3: {
      // Heart eyes - flutter for blob model
      const heartScale = model === 0 && animated ? 1 + Math.sin(frame * 0.15) * 0.2 : 1;
      ctx.save();
      ctx.scale(heartScale, heartScale);
      drawMiniHeart(ctx, -eyeSpacing, eyeY, 4);
      drawMiniHeart(ctx, eyeSpacing, eyeY, 4);
      ctx.restore();
      break;
    }
    case 4:
      ctx.lineWidth = 2; ctx.strokeStyle = '#222';
      drawX(ctx, -eyeSpacing, eyeY, 4); drawX(ctx, eyeSpacing, eyeY, 4);
      break;
    case 6: // Galaxy eyes - spinning particles
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 5, 0, Math.PI * 2); ctx.fill();
      if (animated) {
        const starAngle = frame * 0.1;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.arc(-eyeSpacing + Math.cos(starAngle) * 2, eyeY + Math.sin(starAngle) * 2, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(eyeSpacing + Math.cos(starAngle + 1) * 2, eyeY + Math.sin(starAngle + 1) * 2, 1, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 9: // Sleepy
      ctx.lineWidth = 2; ctx.strokeStyle = '#222';
      ctx.beginPath(); ctx.moveTo(-eyeSpacing - 4, eyeY); ctx.lineTo(-eyeSpacing + 4, eyeY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(eyeSpacing - 4, eyeY); ctx.lineTo(eyeSpacing + 4, eyeY); ctx.stroke();
      // Zzz for jelly
      if (model === 2 && animated) {
        ctx.fillStyle = '#aaa';
        ctx.font = '6px monospace';
        const zzOff = Math.sin(frame * 0.03) * 3;
        ctx.fillText('z', 20, eyeY - 8 + zzOff);
      }
      break;
    case 10: // Angry - model 1 enhances
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c00';
      ctx.beginPath(); ctx.arc(-eyeSpacing + 1, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing + 1, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
      // Angry brow
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-eyeSpacing - 5, eyeY - 6); ctx.lineTo(-eyeSpacing + 3, eyeY - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(eyeSpacing + 5, eyeY - 6); ctx.lineTo(eyeSpacing - 3, eyeY - 4); ctx.stroke();
      break;
    default:
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 5, 0, Math.PI * 2); ctx.fill();
      // Pupil with subtle look direction
      const lookX = animated ? Math.sin(frame * 0.02) * 1.5 : 0;
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(-eyeSpacing + lookX, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing + lookX, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  if (model === 1) ctx.restore();
}

function drawMouth(ctx: CanvasRenderingContext2D, type: number, model: number, frame: number, animated: boolean) {
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = '#333';
  const y = 6;

  // Model personality: Blob=happy, Spiky=toothy, Jelly=wobbly
  switch (type) {
    case 0: { // Smile
      const smileWidth = model === 0 ? 8 : 6;
      ctx.beginPath(); ctx.arc(0, y, smileWidth, 0.1, Math.PI - 0.1); ctx.stroke();
      // Blob: occasional giggle (wider)
      if (model === 0 && animated && frame % 180 < 10) {
        ctx.fillStyle = '#555';
        ctx.beginPath(); ctx.ellipse(0, y + 2, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 1:
      ctx.beginPath(); ctx.arc(0, y + 6, 6, Math.PI + 0.2, -0.2); ctx.stroke();
      break;
    case 2: { // Open - Blob burps particles
      ctx.fillStyle = '#555';
      const openSize = model === 0 && animated && frame % 200 < 15 ? 6 : 4;
      ctx.beginPath(); ctx.ellipse(0, y + 2, 5, openSize, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 3: { // Fang - Spiky gets longer fangs
      ctx.beginPath(); ctx.arc(0, y, 6, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.fillStyle = '#fff';
      const fangLen = model === 1 ? 9 : 7;
      ctx.beginPath(); ctx.moveTo(-3, y + 2); ctx.lineTo(-1, y + fangLen); ctx.lineTo(1, y + 2); ctx.fill();
      if (model === 1) {
        ctx.beginPath(); ctx.moveTo(1, y + 2); ctx.lineTo(3, y + fangLen); ctx.lineTo(5, y + 2); ctx.fill();
      }
      break;
    }
    case 4: // :3
      ctx.beginPath(); ctx.arc(-4, y + 2, 3, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.beginPath(); ctx.arc(4, y + 2, 3, 0.1, Math.PI - 0.1); ctx.stroke();
      break;
    default:
      ctx.beginPath(); ctx.moveTo(-5, y + 2); ctx.lineTo(5, y + 2); ctx.stroke();
  }
}

function drawSpikes(ctx: CanvasRenderingContext2D, type: number, color: string, model: number) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  const count = Math.min(type + 2, 8);
  // Spiky model: longer, sharper spikes
  const spikeMultiplier = model === 1 ? 1.5 : model === 2 ? 0.7 : 1;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * 42;
    const y = Math.sin(angle) * 38;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    const len = (10 + type) * spikeMultiplier;
    const width = model === 1 ? 3 : 4;
    ctx.beginPath();
    ctx.moveTo(0, -len); ctx.lineTo(-width, 2); ctx.lineTo(width, 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawPattern(ctx: CanvasRenderingContext2D, type: number, color: string, frame: number) {
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = color;
  switch (type) {
    case 1:
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(Math.cos(i * 1.1) * 18, Math.sin(i * 1.3) * 15, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 2:
      ctx.lineWidth = 3; ctx.strokeStyle = color;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(-30, i * 12); ctx.lineTo(30, i * 12); ctx.stroke();
      }
      break;
    case 9: // Galaxy pattern
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + frame * 0.01;
        const dist = 10 + i * 3;
        ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#fff';
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    default:
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
    case 1:
      ctx.fillStyle = '#333';
      ctx.fillRect(-12, -48, 24, 6);
      ctx.fillRect(-8, -60, 16, 14);
      break;
    case 2:
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-12, -38); ctx.lineTo(-12, -50); ctx.lineTo(-6, -44);
      ctx.lineTo(0, -54); ctx.lineTo(6, -44); ctx.lineTo(12, -50);
      ctx.lineTo(12, -38);
      ctx.fill();
      // Gems on crown
      ctx.fillStyle = '#FF4500';
      ctx.beginPath(); ctx.arc(0, -48, 2, 0, Math.PI * 2); ctx.fill();
      break;
    case 3:
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath(); ctx.ellipse(-20, -30, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-12, -30, 8, 5, 0.3, 0, Math.PI * 2); ctx.fill();
      break;
    case 4:
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.rect(-18, -14, 12, 10); ctx.stroke();
      ctx.beginPath(); ctx.rect(6, -14, 12, 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-6, -9); ctx.lineTo(6, -9); ctx.stroke();
      break;
    case 5: // Wings
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.ellipse(-40, -5, 12, 20, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(40, -5, 12, 20, 0.3, 0, Math.PI * 2); ctx.fill();
      break;
    case 7:
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, -48, 15, 5, 0, 0, Math.PI * 2); ctx.stroke();
      // Glow
      ctx.fillStyle = 'rgba(255,215,0,0.15)';
      ctx.beginPath(); ctx.ellipse(0, -48, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
      break;
    default: break;
  }
}

function drawElementParticles(ctx: CanvasRenderingContext2D, element: SlimeElement, frame: number, stars: number) {
  const colors = ELEMENT_COLORS[element];
  const count = Math.min(2 + stars, 10);

  ctx.globalAlpha = 0.5;
  for (let i = 0; i < count; i++) {
    const seed = i * 137.508;
    const angle = seed + frame * 0.02;
    const dist = 45 + Math.sin(frame * 0.04 + i * 2) * 10;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    ctx.fillStyle = colors[i % colors.length];

    switch (element) {
      case 'earth': // Moss dots
        ctx.beginPath();
        ctx.fillRect(x - 1, y - 1, 3, 3);
        break;
      case 'fire': // Embers rising
        const fireY = y - (frame * 0.5 + i * 10) % 20;
        ctx.globalAlpha = 0.6 - ((frame * 0.5 + i * 10) % 20) / 40;
        ctx.beginPath(); ctx.arc(x, fireY, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.5;
        break;
      case 'ice': // Crystalline shards
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(frame * 0.01 + i);
        ctx.fillRect(-1, -3, 2, 6);
        ctx.restore();
        break;
      case 'cosmic': // Stars twinkling
        const twinkle = Math.sin(frame * 0.1 + i * 3) > 0.5;
        if (twinkle) {
          drawStarShape(ctx, x, y, 1, 3, 4);
          ctx.fill();
        }
        break;
      case 'bio': // Pollen floating
        ctx.beginPath();
        ctx.arc(x + Math.sin(frame * 0.02 + i) * 5, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }
  ctx.globalAlpha = 1;
}

function drawAura(ctx: CanvasRenderingContext2D, type: number, frame: number, stars: number) {
  const particleCount = type * 3 + (stars >= 5 ? 10 : 0);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + frame * 0.02;
    const dist = 48 + Math.sin(frame * 0.05 + i) * 8;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.08 + i) * 0.3;
    switch (type) {
      case 1: ctx.fillStyle = '#FFE4B5'; break;
      case 2: ctx.fillStyle = '#FF6347'; break;
      case 3: ctx.fillStyle = '#87CEEB'; break;
      case 4:
        ctx.fillStyle = `hsl(${(frame * 5 + i * 40) % 360}, 70%, 60%)`;
        break;
    }
    ctx.beginPath();
    ctx.arc(x, y, 2 + Math.sin(frame * 0.1 + i) * 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawMetallicShader(ctx: CanvasRenderingContext2D, frame: number) {
  // Sweeping highlight
  const sweep = (frame * 2) % 200 - 50;
  const grad = ctx.createLinearGradient(sweep - 20, -40, sweep + 20, 40);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.5, 'rgba(255,215,0,0.25)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();
}

function drawConfetti(ctx: CanvasRenderingContext2D, frame: number, stars: number) {
  const confettiColors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'];
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < stars; i++) {
    const x = Math.sin(frame * 0.03 + i * 2.5) * 55;
    const y = Math.cos(frame * 0.04 + i * 1.8) * 50;
    ctx.fillStyle = confettiColors[i % confettiColors.length];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(frame * 0.05 + i);
    ctx.fillRect(-2, -1, 4, 2);
    ctx.restore();
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

function darkenColor(hex: string, factor: number): string {
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${r},${g},${b})`;
}
