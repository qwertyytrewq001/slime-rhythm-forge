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
  const element = slime.element || 'nature';
  const stars = slime.rarityStars ?? 1;

  // Model-specific idle animation — MORE EXAGGERATED
  let bounce = 0, squashX = 1, squashY = 1, sway = 0, tilt = 0;
  if (animated) {
    const phase = frame * 0.06;
    switch (model) {
      case 0: { // Blob: deep squash/stretch bounce + happy wiggle
        const hopCycle = Math.sin(phase * 1.3);
        bounce = Math.abs(hopCycle) * 6.5;
        squashX = 1 + hopCycle * 0.18;
        squashY = 1 - hopCycle * 0.18;
        if (frame % 240 < 30) {
          sway = Math.sin(frame * 0.4) * 4;
          tilt = Math.sin(frame * 0.4) * 0.12;
        }
        break;
      }
      case 1: { // Spiky: sharper side-to-side rock + spike rattle
        const rockPhase = Math.sin(phase * 0.8);
        sway = rockPhase * 5.5;
        tilt = rockPhase * 0.09;
        squashX = 1 + Math.abs(Math.sin(phase * 1.5)) * 0.06;
        squashY = 1;
        if (t.eyes === 10) {
          sway *= 1.6;
          tilt *= 2.2;
        }
        break;
      }
      case 2: { // Jelly: more fluid liquid wave ripple
        const wave = Math.sin(phase * 0.6);
        bounce = wave * 3.5;
        squashX = 1 + Math.sin(phase * 0.7) * 0.15;
        squashY = 1 + Math.cos(phase * 0.7) * 0.15;
        sway = Math.sin(phase * 0.3) * 3;
        if (t.rhythm >= 4) {
          sway += Math.sin(frame * 0.12) * 4;
          tilt = Math.sin(frame * 0.12) * 0.07;
        }
        break;
      }
    }
  }

  // Mythic dynamic size scaling (1.2-1.5x)
  let sizeMultiplier = t.size * 0.42;
  if (stars >= 5) {
    sizeMultiplier *= animated ? 1.3 + Math.sin(frame * 0.025) * 0.1 : 1.3;
  } else if (stars >= 4) {
    sizeMultiplier *= 1.1;
  }

  ctx.save();
  ctx.translate(s / 2 + sway, s / 2 + bounce);
  if (tilt) ctx.rotate(tilt);
  ctx.scale(squashX * sizeMultiplier, squashY * sizeMultiplier);

  // ★ ENHANCED rarity aura glow — deeper bloom for high rarity
  if (stars >= 2 && animated) {
    const glowHue = stars >= 6 ? (frame * 4) % 360 : stars >= 5 ? (frame * 3) % 360 : stars >= 4 ? 45 : 160;
    const glowAlpha = stars >= 5 ? 0.4 + Math.sin(frame * 0.04) * 0.18 : 0.2 + Math.sin(frame * 0.04) * 0.1;
    const glowSize = stars >= 5 ? stars * 6 : stars * 4;
    ctx.shadowColor = `hsla(${glowHue}, 90%, 60%, ${glowAlpha})`;
    ctx.shadowBlur = glowSize;
  }

  // Trait glow
  if (t.glow > 0) {
    const ga = t.glow * 0.14;
    const gc = t.glow === 5 ? `hsla(${(frame * 3) % 360}, 80%, 60%, ${ga})` : hexToRgba(c1, ga);
    ctx.shadowColor = gc;
    ctx.shadowBlur = t.glow * 7;
  }

  // === DRAW BODY with enhanced gradients ===
  drawBody(ctx, t.shape, c1, c2, model, frame, animated, stars);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Dithered noise texture for gooey feel
  drawDitherTexture(ctx, c1, c2, frame, animated);

  // Gradient veins
  drawVeinOverlay(ctx, c1, c2, t.shape, frame, animated);

  // Core shadow (bottom-right) — DEEPER
  drawCoreShadow(ctx, t.shape, stars);

  // ★ RIM LIGHTING — dynamic, follows animation
  drawRimLight(ctx, c1, stars, frame, animated, model, sway);

  // Top-left shine highlight
  drawTopShine(ctx, stars);

  // Pattern
  if (t.pattern > 0) drawPattern(ctx, t.pattern, c2, frame);

  // Spikes (model-adapted with rattle)
  if (t.spikes > 0) drawSpikes(ctx, t.spikes, c2, model, frame, animated);

  // Shine edge (rarity)
  drawShineEdge(ctx, stars, frame, animated);

  // Eyes with bigger expressive pixels + blink cycles
  drawEyes(ctx, t.eyes, frame, model, animated, stars);

  // Mouth with personality
  drawMouth(ctx, t.mouth, model, frame, animated);

  // Accessory
  if (t.accessory > 0) drawAccessory(ctx, t.accessory, c2);

  // Element particles (MORE density/variety)
  if (animated) drawElementParticles(ctx, element, frame, stars, model);

  // Aura particles
  if (t.aura > 0 && animated) drawAura(ctx, t.aura, frame, stars, element);

  // Trait-specific flair
  if (animated) drawTraitFlair(ctx, t, frame, element);

  // 5★+ metallic shader + aura trail — ENHANCED
  if (stars >= 5 && animated) {
    drawMetallicShader(ctx, frame, stars);
    drawAuraTrail(ctx, frame, stars);
  }

  // 4★+ confetti
  if (stars >= 4 && animated && frame % 80 < 40) {
    drawConfetti(ctx, frame, stars);
  }

  // ★ Quantum phase cycling (aura 4 / void element)
  if (animated && (t.aura === 4 || element === 'void')) {
    drawQuantumPhase(ctx, frame, stars);
  }

  ctx.restore();
}

// ★ NEW: Dynamic rim lighting
function drawRimLight(ctx: CanvasRenderingContext2D, c1: string, stars: number, frame: number, animated: boolean, model: number, sway: number) {
  if (stars < 1) return;
  const intensity = Math.min(0.5, 0.12 + stars * 0.06);
  const rimShift = animated ? Math.sin(frame * 0.02) * 8 + sway * 0.5 : 0;

  // Top-right rim
  const rimGrad = ctx.createLinearGradient(rimShift + 10, -42, rimShift + 40, -10);
  rimGrad.addColorStop(0, `rgba(255,255,255,${intensity})`);
  rimGrad.addColorStop(0.5, `rgba(255,255,255,${intensity * 0.4})`);
  rimGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.ellipse(12 + rimShift * 0.3, -22, 18, 28, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Bottom-left counter rim (subtle)
  if (stars >= 3) {
    const counterAlpha = intensity * 0.3;
    const cGrad = ctx.createLinearGradient(-35, 15, -10, 35);
    cGrad.addColorStop(0, hexToRgba(lightenColor(c1, 1.5), counterAlpha));
    cGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.ellipse(-18, 18, 14, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spiky model: spike-tip highlights
  if (model === 1 && stars >= 2 && animated) {
    ctx.globalAlpha = 0.2 + Math.sin(frame * 0.06) * 0.1;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 40, Math.sin(a) * 36, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// ★ NEW: Quantum phase cycling effect
function drawQuantumPhase(ctx: CanvasRenderingContext2D, frame: number, stars: number) {
  const phaseIntensity = stars >= 5 ? 0.18 : 0.1;
  const cycleSpeed = stars >= 5 ? 0.08 : 0.05;

  // Phase shift overlay
  const phaseOffset = Math.sin(frame * cycleSpeed) * 6;
  ctx.globalAlpha = phaseIntensity;

  // Glitch band 1
  ctx.fillStyle = `hsla(${(frame * 5) % 360}, 80%, 60%, 0.4)`;
  ctx.fillRect(-30, phaseOffset - 1, 60, 2);

  // Glitch band 2
  if (frame % 20 < 4) {
    ctx.fillStyle = `hsla(${(frame * 8 + 120) % 360}, 70%, 50%, 0.3)`;
    const y2 = Math.sin(frame * 0.13) * 25;
    ctx.fillRect(-25, y2 - 0.5, 50, 1);
  }

  // Phase ghost
  if (frame % 60 < 8) {
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(phaseOffset * 0.5, -phaseOffset * 0.3, 36, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function drawBody(ctx: CanvasRenderingContext2D, shape: number, c1: string, c2: string, model: number, frame: number, animated: boolean, stars: number) {
  // Multi-stop gradient for gooey depth — RICHER contrast
  const grad = ctx.createRadialGradient(-8, -10, 2, 4, 8, 55);
  const c1Light = lightenColor(c1, 1.4);
  const c2Dark = darkenColor(c2, 0.45);
  grad.addColorStop(0, c1Light);
  grad.addColorStop(0.2, c1);
  grad.addColorStop(0.5, c2);
  grad.addColorStop(0.75, c2Dark);
  grad.addColorStop(1, darkenColor(c2, 0.25));
  ctx.fillStyle = grad;

  ctx.beginPath();

  if (model === 2 && animated) {
    ctx.save();
    const wobble = Math.sin(frame * 0.05) * 0.06;
    ctx.transform(1 + wobble, wobble * 0.5, -wobble * 0.5, 1 - wobble, 0, 0);
  }

  switch (shape) {
    case 0: ctx.ellipse(0, 0, 45, 40, 0, 0, Math.PI * 2); break;
    case 1: ctx.arc(0, 0, 42, 0, Math.PI * 2); break;
    case 2: drawStarShape(ctx, 0, 0, 30, 45, 8); break;
    case 3: ctx.roundRect(-35, -35, 70, 70, 10); break;
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

  // Main specular highlight (top-left, larger + brighter)
  const shineGrad = ctx.createRadialGradient(-14, -16, 1, -10, -12, 20);
  shineGrad.addColorStop(0, 'rgba(255,255,255,0.65)');
  shineGrad.addColorStop(0.35, 'rgba(255,255,255,0.3)');
  shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shineGrad;
  ctx.beginPath();
  ctx.ellipse(-12, -15, 15, 11, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Secondary small highlight
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-6, -22, 5, 3, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Tiny sparkle dot
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(-16, -18, 2, 0, Math.PI * 2);
  ctx.fill();

  // ★ NEW: Inner subsurface scattering glow for gooey/metallic feel
  if (stars >= 3) {
    const sssGrad = ctx.createRadialGradient(0, 5, 3, 0, 0, 35);
    sssGrad.addColorStop(0, hexToRgba(c1, 0.12));
    sssGrad.addColorStop(0.5, hexToRgba(lightenColor(c1, 1.3), 0.06));
    sssGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sssGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDitherTexture(ctx: CanvasRenderingContext2D, c1: string, c2: string, frame: number, animated: boolean) {
  ctx.globalAlpha = 0.07;
  const offset = animated ? frame * 0.005 : 0;
  for (let i = 0; i < 40; i++) {
    const x = Math.sin(i * 7.3 + offset) * 28;
    const y = Math.cos(i * 5.1 + offset) * 24;
    const isLight = (Math.floor(x + 50) + Math.floor(y + 50)) % 2 === 0;
    ctx.fillStyle = isLight ? '#fff' : darkenColor(c2, 0.6);
    ctx.fillRect(x - 0.5, y - 0.5, 1.5, 1.5);
  }
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = darkenColor(c1, 0.7);
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 6; i++) {
    const startAngle = i * 1.3 + offset * 0.3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(startAngle) * 5, Math.sin(startAngle) * 5);
    ctx.quadraticCurveTo(
      Math.cos(startAngle + 0.8) * 18,
      Math.sin(startAngle + 0.8) * 16,
      Math.cos(startAngle + 1.6) * 28,
      Math.sin(startAngle + 1.6) * 24
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawCoreShadow(ctx: CanvasRenderingContext2D, _shape: number, stars: number) {
  // Bottom-right core shadow — DEEPER contrast
  const shadowIntensity = 0.22 + Math.min(stars * 0.03, 0.12);
  const shadowGrad = ctx.createRadialGradient(10, 14, 2, 8, 10, 40);
  shadowGrad.addColorStop(0, `rgba(0,0,0,${shadowIntensity})`);
  shadowGrad.addColorStop(0.5, `rgba(0,0,0,${shadowIntensity * 0.5})`);
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(8, 12, 32, 27, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Ground shadow
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 38, 26, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawTopShine(ctx: CanvasRenderingContext2D, stars: number) {
  if (stars >= 2) {
    const rimGrad = ctx.createLinearGradient(-30, -35, 30, -20);
    rimGrad.addColorStop(0, `rgba(255,255,255,${0.18 + stars * 0.06})`);
    rimGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(0, -28, 30, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVeinOverlay(ctx: CanvasRenderingContext2D, c1: string, c2: string, shape: number, frame: number, animated: boolean) {
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = darkenColor(c2, 0.6);
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + (animated ? frame * 0.004 : 0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      Math.cos(angle) * 12, Math.sin(angle) * 10,
      Math.cos(angle + 0.7) * 25, Math.sin(angle + 0.7) * 22,
      Math.cos(angle + 1.2) * 35, Math.sin(angle + 1.2) * 30
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawShineEdge(ctx: CanvasRenderingContext2D, stars: number, frame: number, animated: boolean) {
  if (stars < 2) return;
  const pulseAlpha = animated ? 0.25 + stars * 0.06 + Math.sin(frame * 0.03) * 0.06 : 0.25 + stars * 0.06;
  ctx.globalAlpha = pulseAlpha;
  ctx.strokeStyle = stars >= 6 ? `hsl(${(frame * 2) % 360}, 80%, 70%)` : stars >= 5 ? '#FFD700' : stars >= 4 ? '#E0E0E0' : '#fff';
  ctx.lineWidth = stars >= 5 ? 3 : stars >= 4 ? 2.5 : 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 38, -Math.PI * 0.75, -Math.PI * 0.15);
  ctx.stroke();
  // Double rim for 5★+
  if (stars >= 5) {
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = stars >= 6 ? `hsl(${(frame * 2 + 60) % 360}, 70%, 80%)` : '#FFF8DC';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 36, -Math.PI * 0.6, -Math.PI * 0.25);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawEyes(ctx: CanvasRenderingContext2D, type: number, frame: number, model: number, animated: boolean, stars: number) {
  const eyeY = -7;
  const eyeSpacing = 13;

  const blinkPhase = animated ? Math.floor(frame / 90) % 12 : -1;
  const isBlinking = (blinkPhase === 0 || blinkPhase === 1) && animated;

  if (isBlinking) {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-eyeSpacing, eyeY, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(eyeSpacing, eyeY, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
    return;
  }

  if (model === 1) {
    ctx.save();
    ctx.translate(-eyeSpacing, eyeY);
    ctx.rotate(-0.18);
    ctx.translate(eyeSpacing, -eyeY);
  }

  switch (type) {
    case 0:
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-eyeSpacing - 3, eyeY - 3, 6, 6);
      ctx.fillRect(eyeSpacing - 3, eyeY - 3, 6, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-eyeSpacing - 1, eyeY - 2, 2, 2);
      ctx.fillRect(eyeSpacing - 1, eyeY - 2, 2, 2);
      break;
    case 1: {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      const lookX = animated ? Math.sin(frame * 0.018) * 2 : 0;
      const lookY = animated ? Math.cos(frame * 0.025) * 1 : 0;
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(-eyeSpacing + lookX, eyeY + lookY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing + lookX, eyeY + lookY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing - 1.5, eyeY - 2, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing - 1.5, eyeY - 2, 1.5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 2:
      ctx.fillStyle = stars >= 4 ? '#FFD700' : '#1a1a1a';
      drawStarShape(ctx, -eyeSpacing, eyeY, 2, 6, 5); ctx.fill();
      drawStarShape(ctx, eyeSpacing, eyeY, 2, 6, 5); ctx.fill();
      break;
    case 3: {
      ctx.fillStyle = '#FF4466';
      const heartScale = model === 0 && animated ? 1 + Math.sin(frame * 0.15) * 0.25 : 1;
      ctx.save();
      ctx.scale(heartScale, heartScale);
      drawMiniHeart(ctx, -eyeSpacing, eyeY, 5);
      drawMiniHeart(ctx, eyeSpacing, eyeY, 5);
      ctx.restore();
      break;
    }
    case 4:
      ctx.lineWidth = 2.5; ctx.strokeStyle = '#1a1a1a'; ctx.lineCap = 'round';
      drawX(ctx, -eyeSpacing, eyeY, 4); drawX(ctx, eyeSpacing, eyeY, 4);
      break;
    case 5: {
      ctx.fillStyle = '#FF0000';
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      if (animated && frame % 120 < 15) {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-eyeSpacing - 1, eyeY, 2, 50);
        ctx.fillRect(eyeSpacing - 1, eyeY, 2, 50);
        ctx.globalAlpha = 1;
      }
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      break;
    }
    case 6: {
      ctx.fillStyle = '#0a0020';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      if (animated) {
        for (let i = 0; i < 4; i++) {
          const sa = frame * 0.08 + i * 1.5;
          const sd = 2.5 + i * 0.5;
          ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#87CEEB';
          ctx.beginPath(); ctx.arc(-eyeSpacing + Math.cos(sa) * sd, eyeY + Math.sin(sa) * sd, 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(eyeSpacing + Math.cos(sa + 1) * sd, eyeY + Math.sin(sa + 1) * sd, 0.8, 0, Math.PI * 2); ctx.fill();
        }
      }
      break;
    }
    case 7:
      ctx.fillStyle = '#FFD700';
      drawStarShape(ctx, -eyeSpacing, eyeY, 1, 5, 4); ctx.fill();
      drawStarShape(ctx, eyeSpacing, eyeY, 1, 5, 4); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 1.5, 0, Math.PI * 2); ctx.fill();
      break;
    case 8:
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY + 1, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY + 1, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing - 2, eyeY - 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing - 2, eyeY - 2, 2, 0, Math.PI * 2); ctx.fill();
      break;
    case 9: {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(-eyeSpacing, eyeY, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(eyeSpacing, eyeY, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY + 1, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY + 1, 2, 0, Math.PI * 2); ctx.fill();
      if (model === 2 && animated) {
        ctx.fillStyle = '#8888cc';
        ctx.font = '7px monospace';
        const zzOff = Math.sin(frame * 0.03) * 4;
        ctx.fillText('z', 20, eyeY - 10 + zzOff);
        ctx.font = '5px monospace';
        ctx.fillText('z', 24, eyeY - 16 + zzOff * 0.7);
      }
      break;
    }
    case 10: {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = model === 1 ? '#ff2200' : '#cc0000';
      if (model === 1 && animated) {
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 4;
      }
      ctx.beginPath(); ctx.arc(-eyeSpacing + 1, eyeY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing + 1, eyeY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-eyeSpacing - 6, eyeY - 7); ctx.lineTo(-eyeSpacing + 3, eyeY - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(eyeSpacing + 6, eyeY - 7); ctx.lineTo(eyeSpacing - 3, eyeY - 4); ctx.stroke();
      break;
    }
    default: {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing, eyeY, 6, 0, Math.PI * 2); ctx.fill();
      const lkX = animated ? Math.sin(frame * 0.018) * 2 : 0;
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(-eyeSpacing + lkX, eyeY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing + lkX, eyeY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeSpacing - 1.5, eyeY - 2, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeSpacing - 1.5, eyeY - 2, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  if (model === 1) ctx.restore();
}

function drawMouth(ctx: CanvasRenderingContext2D, type: number, model: number, frame: number, animated: boolean) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const y = 7;

  switch (type) {
    case 0: {
      const smileWidth = model === 0 ? 10 : 7;
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, y, smileWidth, 0.15, Math.PI - 0.15); ctx.stroke();
      if (model === 0 && animated && frame % 150 < 12) {
        ctx.fillStyle = '#4a2a2a';
        ctx.beginPath(); ctx.ellipse(0, y + 3, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FF8888';
        ctx.beginPath(); ctx.ellipse(2, y + 5, 3, 2, 0.2, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 1:
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, y + 8, 7, Math.PI + 0.2, -0.2); ctx.stroke();
      break;
    case 2: {
      ctx.fillStyle = '#3a1a1a';
      const openH = model === 0 && animated && frame % 180 < 18 ? 7 : 5;
      ctx.beginPath(); ctx.ellipse(0, y + 3, 6, openH, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6a2a2a';
      ctx.beginPath(); ctx.ellipse(0, y + 2, 4, openH - 2, 0, 0, Math.PI * 2); ctx.fill();
      if (model === 0 && animated && frame % 180 < 18) {
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#aaffaa';
          const bx = Math.sin(frame * 0.3 + i * 2) * 8;
          const by = y - 5 - (frame % 18) * 0.8 - i * 4;
          ctx.beginPath(); ctx.arc(bx, by, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      break;
    }
    case 3: {
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, y, 7, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.fillStyle = '#fff';
      const fangLen = model === 1 ? 10 : 7;
      ctx.beginPath(); ctx.moveTo(-4, y + 2); ctx.lineTo(-2, y + fangLen); ctx.lineTo(0, y + 2); ctx.fill();
      if (model === 1) {
        ctx.beginPath(); ctx.moveTo(2, y + 2); ctx.lineTo(4, y + fangLen); ctx.lineTo(6, y + 2); ctx.fill();
      }
      if (model === 2 && animated) {
        ctx.fillStyle = 'rgba(150,200,255,0.4)';
        const drip = (frame * 0.3) % 15;
        ctx.beginPath(); ctx.ellipse(-2, y + fangLen + drip, 1, 2 + drip * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 4:
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(-5, y + 3, 4, 0.15, Math.PI - 0.15); ctx.stroke();
      ctx.beginPath(); ctx.arc(5, y + 3, 4, 0.15, Math.PI - 0.15); ctx.stroke();
      if (model === 0) {
        ctx.lineWidth = 1; ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.moveTo(-18, y); ctx.lineTo(-8, y + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(18, y); ctx.lineTo(8, y + 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      break;
    case 5:
      ctx.fillStyle = '#3a1a1a';
      ctx.beginPath(); ctx.roundRect(-8, y, 16, 8, 3); ctx.fill();
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(-7 + i * 4, y, 3, 3);
      }
      break;
    default:
      ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-6, y + 3); ctx.lineTo(6, y + 3); ctx.stroke();
  }
}

function drawSpikes(ctx: CanvasRenderingContext2D, type: number, color: string, model: number, frame: number, animated: boolean) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.75;
  const count = Math.min(type + 2, 8);
  const spikeMultiplier = model === 1 ? 1.6 : model === 2 ? 0.6 : 1;
  const rattle = model === 1 && animated ? Math.sin(frame * 0.25) * 3 : 0;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * 42;
    const y = Math.sin(angle) * 38;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2 + (rattle * 0.025 * (i % 2 === 0 ? 1 : -1)));
    const len = (10 + type) * spikeMultiplier;
    const width = model === 1 ? 3 : 4;
    const sGrad = ctx.createLinearGradient(0, -len, 0, 2);
    sGrad.addColorStop(0, lightenColor(color, 1.4));
    sGrad.addColorStop(1, color);
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.moveTo(0, -len); ctx.lineTo(-width, 2); ctx.lineTo(width, 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawPattern(ctx: CanvasRenderingContext2D, type: number, color: string, frame: number) {
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  switch (type) {
    case 1:
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(Math.cos(i * 1.1) * 20, Math.sin(i * 1.3) * 16, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 2:
      ctx.lineWidth = 2.5; ctx.strokeStyle = color;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(-30, i * 11); ctx.lineTo(30, i * 11); ctx.stroke();
      }
      break;
    case 9:
      ctx.globalAlpha = 0.18;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + frame * 0.008;
        const dist = 8 + i * 2.5;
        ctx.fillStyle = i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#87CEEB' : '#DDA0DD';
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    default:
      for (let i = 0; i < type + 1; i++) {
        ctx.beginPath();
        ctx.arc(Math.cos(i * 2.1 + type) * 22, Math.sin(i * 1.7 + type) * 18, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
  }
  ctx.globalAlpha = 1;
}

function drawAccessory(ctx: CanvasRenderingContext2D, type: number, color: string) {
  switch (type) {
    case 1:
      ctx.fillStyle = '#222';
      ctx.fillRect(-13, -50, 26, 7);
      ctx.fillRect(-9, -65, 18, 17);
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(-9, -54, 18, 3);
      break;
    case 2:
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-13, -38); ctx.lineTo(-13, -52); ctx.lineTo(-7, -45);
      ctx.lineTo(0, -56); ctx.lineTo(7, -45); ctx.lineTo(13, -52);
      ctx.lineTo(13, -38);
      ctx.fill();
      ctx.fillStyle = '#FF4500';
      ctx.beginPath(); ctx.arc(0, -48, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4169E1';
      ctx.beginPath(); ctx.arc(-7, -44, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(7, -44, 1.5, 0, Math.PI * 2); ctx.fill();
      break;
    case 3:
      ctx.fillStyle = '#FF69B4';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath(); ctx.ellipse(-18 + Math.cos(a) * 5, -32 + Math.sin(a) * 5, 4, 3, a, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#FFD700';
      ctx.beginPath(); ctx.arc(-18, -32, 3, 0, Math.PI * 2); ctx.fill();
      break;
    case 4:
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(-20, -14, 14, 12, 3); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(6, -14, 14, 12, 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(6, -8); ctx.stroke();
      break;
    case 5:
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.ellipse(-42, -5, 14, 22, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(42, -5, 14, 22, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.ellipse(-38, -8, 8, 14, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(38, -8, 8, 14, 0.2, 0, Math.PI * 2); ctx.fill();
      break;
    case 6:
      ctx.fillStyle = '#CC3333';
      ctx.beginPath();
      ctx.moveTo(-25, 15); ctx.quadraticCurveTo(-15, 22, 0, 18);
      ctx.quadraticCurveTo(15, 22, 25, 15);
      ctx.lineTo(25, 22); ctx.quadraticCurveTo(15, 28, 0, 24);
      ctx.quadraticCurveTo(-15, 28, -25, 22);
      ctx.fill();
      ctx.fillRect(20, 18, 6, 15);
      break;
    case 7:
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(0, -48, 16, 6, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath(); ctx.ellipse(0, -48, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    default: break;
  }
}

function drawElementParticles(ctx: CanvasRenderingContext2D, element: SlimeElement, frame: number, stars: number, model: number) {
  const colors = ELEMENT_COLORS[element] || ELEMENT_COLORS['nature'];
  if (!colors || colors.length === 0) return;
  // ★ HIGHER particle density
  const count = Math.min(5 + stars * 3, 20);

  for (let i = 0; i < count; i++) {
    const seed = i * 137.508;
    const angle = seed + frame * 0.018;
    const dist = 46 + Math.sin(frame * 0.035 + i * 2) * 14;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    ctx.fillStyle = colors[i % colors.length];

    switch (element) {
      case 'earth': {
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        if (i % 3 === 0) {
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = '#4a7a3a';
          ctx.beginPath(); ctx.ellipse(x + 3, y, 3, 1.5, seed, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'fire': {
        const fireY = y - (frame * 0.7 + i * 12) % 28;
        const life = 1 - ((frame * 0.7 + i * 12) % 28) / 28;
        ctx.globalAlpha = life * 0.75;
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.arc(x, fireY, 2 + life * 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
        // Enhanced flame flicker on spiky
        if (model === 1 && i < 4) {
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = '#FF6600';
          const fh = 10 + Math.sin(frame * 0.25 + i) * 5;
          ctx.beginPath();
          ctx.moveTo(x - 2.5, fireY); ctx.quadraticCurveTo(x + Math.sin(frame * 0.35) * 3, fireY - fh, x + 2.5, fireY);
          ctx.fill();
        }
        break;
      }
      case 'ice': {
        ctx.globalAlpha = 0.6;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(frame * 0.01 + i);
        ctx.beginPath();
        ctx.moveTo(0, -5); ctx.lineTo(2, 0); ctx.lineTo(0, 5); ctx.lineTo(-2, 0);
        ctx.fill();
        if (i % 2 === 0) {
          ctx.fillStyle = '#fff';
          ctx.globalAlpha = 0.5 + Math.sin(frame * 0.1 + i) * 0.3;
          ctx.beginPath(); ctx.arc(0, -2, 1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        break;
      }
      case 'cosmic': {
        const twinkle = Math.sin(frame * 0.08 + i * 3);
        ctx.globalAlpha = 0.45 + twinkle * 0.45;
        if (twinkle > 0) {
          drawStarShape(ctx, x, y, 0.5, 3.5 + twinkle * 2.5, 4);
          ctx.fill();
        }
        if (i % 3 === 0) {
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = '#9966FF';
          ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'nature': {
        ctx.globalAlpha = 0.5;
        const drift = Math.sin(frame * 0.015 + i) * 7;
        ctx.beginPath();
        ctx.arc(x + drift, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        if (i % 3 === 0) {
          ctx.globalAlpha = 0.18;
          ctx.beginPath();
          ctx.moveTo(x + drift, y);
          ctx.lineTo(x + drift - 3, y + 8);
          ctx.strokeStyle = colors[0];
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        break;
      }
      case 'water': {
        ctx.globalAlpha = 0.45;
        const bubY = y - (frame * 0.45 + i * 15) % 35;
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.arc(x, bubY, 2.5 + Math.sin(i) * 1.5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.25;
        ctx.beginPath(); ctx.arc(x - 0.5, bubY - 1, 0.8, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'plant': {
        ctx.globalAlpha = 0.5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(frame * 0.012 + i * 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath(); ctx.ellipse(0, 0, 3.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        break;
      }
      case 'wind': {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 1;
        ctx.beginPath();
        const wa = frame * 0.04 + i;
        ctx.arc(x, y, 5, wa, wa + Math.PI);
        ctx.stroke();
        break;
      }
      case 'electric': {
        ctx.globalAlpha = Math.random() > 0.25 ? 0.7 : 0;
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const mid1x = x + (Math.random() - 0.5) * 6;
        const mid1y = y + (Math.random() - 0.5) * 6;
        ctx.lineTo(mid1x, mid1y);
        ctx.lineTo(mid1x + (Math.random() - 0.5) * 5, mid1y + (Math.random() - 0.5) * 5);
        ctx.stroke();
        break;
      }
      case 'metal': {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
        // Metallic glint flash
        if (i % 4 === 0 && frame % 40 < 5) {
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'light': {
        ctx.globalAlpha = 0.35 + Math.sin(frame * 0.07 + i) * 0.25;
        ctx.fillStyle = colors[i % colors.length];
        drawStarShape(ctx, x, y, 0.5, 3, 4);
        ctx.fill();
        // Ray lines
        if (i % 3 === 0) {
          ctx.globalAlpha = 0.12;
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x, y); ctx.stroke();
        }
        break;
      }
      case 'shadow': {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
        // Wispy tendrils
        if (i % 3 === 0) {
          ctx.globalAlpha = 0.12;
          ctx.strokeStyle = '#2F2F4F';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + Math.sin(frame * 0.03 + i) * 8, y + 5, x + Math.sin(frame * 0.02 + i) * 12, y + 15);
          ctx.stroke();
        }
        break;
      }
      case 'void': {
        // ★ Enhanced glitch fragments
        if (frame % 8 < 4) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillRect(x - 3, y - 0.5, 6, 1);
          // Chromatic aberration
          if (i % 2 === 0) {
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(x - 3 + 1, y - 0.5 - 1, 6, 1);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(x - 3 - 1, y - 0.5 + 1, 6, 1);
          }
        }
        break;
      }
      case 'toxic': {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = colors[i % colors.length];
        const dripY = y + (frame * 0.35 + i * 10) % 22;
        ctx.beginPath(); ctx.arc(x, dripY, 2, 0, Math.PI * 2); ctx.fill();
        // Toxic fumes
        if (i % 3 === 0) {
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = '#7FFF00';
          ctx.beginPath(); ctx.arc(x, dripY - 5, 5, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'crystal': {
        ctx.globalAlpha = 0.55;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(frame * 0.018 + i);
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(0, -4); ctx.lineTo(2.5, 0); ctx.lineTo(0, 4); ctx.lineTo(-2.5, 0);
        ctx.fill();
        // Prismatic refraction
        if (i % 2 === 0) {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = `hsl(${(frame * 3 + i * 50) % 360}, 70%, 70%)`;
          ctx.beginPath(); ctx.arc(0, -2, 1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        break;
      }
      case 'lava': {
        const lavaY = y - (frame * 0.55 + i * 10) % 22;
        const lavaLife = 1 - ((frame * 0.55 + i * 10) % 22) / 22;
        ctx.globalAlpha = lavaLife * 0.7;
        ctx.fillStyle = colors[i % colors.length];
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.arc(x, lavaY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
        break;
      }
      case 'arcane': {
        ctx.globalAlpha = 0.4 + Math.sin(frame * 0.05 + i * 2) * 0.25;
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 1.5); ctx.stroke();
        // Rune symbol
        if (i % 4 === 0) {
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = '#BA55D3';
          ctx.font = '5px monospace';
          ctx.fillText('✧', x - 2, y + 2);
        }
        break;
      }
      case 'divine': {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = colors[i % colors.length];
        drawStarShape(ctx, x, y, 1.2, 3.5, 6);
        ctx.fill();
        // Holy glow
        if (i % 3 === 0) {
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = '#FFD700';
          ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      default: {
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        break;
      }
    }
  }
  ctx.globalAlpha = 1;
}

function drawAura(ctx: CanvasRenderingContext2D, type: number, frame: number, stars: number, element: SlimeElement) {
  const particleCount = type * 4 + (stars >= 5 ? 16 : 0);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + frame * 0.015;
    const dist = 50 + Math.sin(frame * 0.04 + i) * 12;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    ctx.globalAlpha = 0.38 + Math.sin(frame * 0.07 + i) * 0.28;
    switch (type) {
      case 1: ctx.fillStyle = '#FFE4B5'; break;
      case 2: ctx.fillStyle = '#FF6347'; break;
      case 3: ctx.fillStyle = '#87CEEB'; break;
      case 4:
        ctx.fillStyle = `hsl(${(frame * 5 + i * 35) % 360}, 75%, 65%)`;
        break;
    }
    ctx.beginPath();
    ctx.arc(x, y, 3 + Math.sin(frame * 0.08 + i) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTraitFlair(ctx: CanvasRenderingContext2D, t: any, frame: number, element: SlimeElement) {
  // High rhythm = dance shimmer
  if (t.rhythm >= 4) {
    ctx.globalAlpha = 0.1;
    const shimmer = Math.sin(frame * 0.15) * 22;
    const grad = ctx.createLinearGradient(shimmer - 15, -30, shimmer + 15, 30);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Void aura = glitch flicker — MORE NOTICEABLE
  if (t.aura === 4) {
    if (frame % 25 < 3) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(-35, -2 + Math.random() * 20, 70, 2.5);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(-32, 5 + Math.random() * 15, 64, 1.5);
      ctx.globalAlpha = 1;
    }
  }

  // Jelly model: bubble pops + drips — more fluid
  if (t.model === 2) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = COLOR_PALETTE[t.color1] || '#7FBFFF';
    const dripPhase = (frame * 0.45) % 30;
    if (dripPhase < 22) {
      ctx.beginPath();
      ctx.ellipse(5, 32 + dripPhase, 2.5, 3.5 + dripPhase * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // More bubbles rising
    for (let i = 0; i < 4; i++) {
      const bubbleY = 30 - ((frame * 0.35 + i * 25) % 55);
      const bubbleX = -10 + i * 7 + Math.sin(frame * 0.06 + i) * 4;
      const life = 1 - ((frame * 0.35 + i * 25) % 55) / 55;
      ctx.globalAlpha = life * 0.4;
      ctx.strokeStyle = 'rgba(200,230,255,0.7)';
      ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.arc(bubbleX, bubbleY, 2.5 + life * 2.5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = life * 0.25;
      ctx.beginPath(); ctx.arc(bubbleX - 0.5, bubbleY - 1, 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Blob: happy particle burst
  if (t.model === 0 && frame % 180 < 4) {
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 15 + Math.random() * 12;
      ctx.fillStyle = element === 'cosmic' ? '#FFD700' : '#98FB98';
      ctx.beginPath(); ctx.arc(Math.cos(a) * d, 8 + Math.sin(a) * d * 0.5, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawMetallicShader(ctx: CanvasRenderingContext2D, frame: number, stars: number) {
  const sweep = (frame * 1.8) % 200 - 50;
  const intensity = stars >= 6 ? 0.35 : 0.25;
  const grad = ctx.createLinearGradient(sweep - 28, -40, sweep + 28, 40);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.25, `rgba(255,248,220,${intensity * 0.4})`);
  grad.addColorStop(0.5, `rgba(255,215,0,${intensity})`);
  grad.addColorStop(0.75, `rgba(255,248,220,${intensity * 0.4})`);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.fill();
}

function drawAuraTrail(ctx: CanvasRenderingContext2D, frame: number, stars: number) {
  const trailCount = stars >= 6 ? 5 : 3;
  for (let i = 1; i <= trailCount; i++) {
    ctx.globalAlpha = 0.08 / i;
    ctx.fillStyle = `hsl(${(frame * 3 + i * 40) % 360}, 75%, 60%)`;
    ctx.beginPath();
    const off = Math.sin(frame * 0.03 + i) * 5;
    ctx.arc(off * i, i * 2, 38 + i * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawConfetti(ctx: CanvasRenderingContext2D, frame: number, stars: number) {
  const confettiColors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#FF6347'];
  ctx.globalAlpha = 0.6;
  const count = stars + 3;
  for (let i = 0; i < count; i++) {
    const x = Math.sin(frame * 0.025 + i * 2.3) * 60;
    const y = Math.cos(frame * 0.035 + i * 1.7) * 55;
    ctx.fillStyle = confettiColors[i % confettiColors.length];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(frame * 0.04 + i);
    ctx.fillRect(-3, -1, 6, 2);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ======= Helpers =======

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

function lightenColor(hex: string, factor: number): string {
  const r = Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) * factor));
  const g = Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) * factor));
  const b = Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) * factor));
  return `rgb(${r},${g},${b})`;
}
