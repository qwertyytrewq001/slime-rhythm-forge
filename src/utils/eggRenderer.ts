import { Slime, SlimeElement } from '@/types/slime';
import { ELEMENT_COLORS, COLOR_PALETTE } from '@/data/traitData';

interface EggRenderOptions {
  size: number;
  slime: Slime; // Pass the whole slime to use its DNA
  crackProgress?: number;
  isShaking?: boolean;
}

/**
 * Procedurally draws a unique egg based on the Slime's specific DNA (Traits).
 */
export function drawEnhancedEgg(ctx: CanvasRenderingContext2D, options: EggRenderOptions) {
  const { size, slime, crackProgress = 0, isShaking = false } = options;
  if (!slime) return; // Safety check
  const { traits, element, id } = slime;
  
  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = false;

  // 1. UNIQUE COLOR PALETTE (From Slime DNA)
  // Use the slime's actual traits to pick colors, not just the element.
  const baseColor = COLOR_PALETTE[traits.color1 % COLOR_PALETTE.length];
  const accentColor = COLOR_PALETTE[traits.color2 % COLOR_PALETTE.length];
  const elementColors = ELEMENT_COLORS[element] || ELEMENT_COLORS['nature'];
  
  const centerX = size / 2;
  const centerY = size / 2 + (size * 0.05);
  const width = size * 0.68;
  const height = size * 0.88;

  // Use Slime ID as the master seed for the random engine
  const getRand = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  };

  const seed = id; // Use unique Slime ID

  ctx.save();
  if (isShaking) {
    ctx.translate((getRand(seed + Date.now()) - 0.5) * 5, 0);
  }

  const drawEggPath = (c: CanvasRenderingContext2D, w: number, h: number) => {
    c.beginPath();
    const tr = w * (0.3 + getRand(seed + 'tr') * 0.1); // Varied top width
    const br = w * 0.5;
    c.arc(centerX, centerY + h*0.12, br, 0, Math.PI, false);
    c.bezierCurveTo(centerX - br, centerY - h*0.2, centerX - tr, centerY - h*0.5, centerX, centerY - h*0.5);
    c.bezierCurveTo(centerX + tr, centerY - h*0.5, centerX + br, centerY - h*0.2, centerX + br, centerY + h*0.12);
    c.closePath();
  };

  // 2. OUTER GLOW (Based on Slime's primary color)
  ctx.shadowColor = baseColor;
  ctx.shadowBlur = size * 0.2;
  ctx.fillStyle = darkenColor(baseColor, 0.4);
  drawEggPath(ctx, width + 4, height + 4);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 3. VOLUMETRIC BODY
  const bodyGrad = ctx.createRadialGradient(centerX - width*0.2, centerY - height*0.2, 5, centerX, centerY, width*0.8);
  bodyGrad.addColorStop(0, lightenColor(baseColor, 1.8));
  bodyGrad.addColorStop(0.3, baseColor);
  bodyGrad.addColorStop(0.7, accentColor);
  bodyGrad.addColorStop(1, darkenColor(accentColor, 0.3));
  ctx.fillStyle = bodyGrad;
  drawEggPath(ctx, width, height);
  ctx.fill();

  // 4. 3D SILHOUETTE BREAKERS (Unique per Slime ID)
  ctx.save();
  ctx.fillStyle = darkenColor(baseColor, 0.5);
  const breakerCount = 3 + Math.floor(getRand(seed + 'brk') * 5);
  for(let i=0; i<breakerCount; i++) {
    const angle = getRand(seed + 'ang' + i) * Math.PI * 2;
    const tx = centerX + Math.cos(angle) * (width/2);
    const ty = centerY + Math.sin(angle) * (height/2.5);
    const bSize = 4 + getRand(seed + 'bs' + i) * 10;
    
    ctx.beginPath();
    // Varies between spikes, bumps, and shards
    if (traits.spikes > 5) {
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(angle)*bSize, ty + Math.sin(angle)*bSize);
      ctx.lineTo(tx + Math.cos(angle+0.4)*bSize*0.5, ty + Math.sin(angle+0.4)*bSize*0.5);
    } else {
      ctx.arc(tx, ty, bSize/2, 0, Math.PI*2);
    }
    ctx.fill();
  }
  ctx.restore();

  // 5. LAYERED DNA PATTERNS
  ctx.save();
  drawEggPath(ctx, width, height);
  ctx.clip();

  // Layer 1: Scales (Vary density and shape by traits)
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = darkenColor(accentColor, 0.4);
  ctx.lineWidth = 1.5;
  const sStep = size * (0.1 + getRand(seed + 'step') * 0.1);
  for(let y = centerY - height/2; y < centerY + height/2; y += sStep * 0.6) {
    const off = (Math.floor(y / (sStep * 0.6)) % 2) * (sStep/2);
    for(let x = centerX - width/2 - sStep; x < centerX + width/2 + sStep; x += sStep) {
      ctx.beginPath();
      if (traits.pattern % 2 === 0) ctx.arc(x + off, y, sStep/2, 0, Math.PI, false);
      else { ctx.moveTo(x+off-sStep/3, y); ctx.lineTo(x+off, y+sStep/3); ctx.lineTo(x+off+sStep/3, y); }
      ctx.stroke();
    }
  }

  // Layer 2: Master Pattern (Derived from Slime Pattern Trait)
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2 + (traits.pattern % 3);
  ctx.strokeStyle = '#fff';
  const patternType = traits.pattern % 5;
  
  for(let i=0; i<8; i++) {
    const px = centerX + (getRand(seed+'px'+i)-0.5)*width;
    const py = centerY + (getRand(seed+'py'+i)-0.5)*height;
    ctx.beginPath();
    if(patternType === 0) { // Swirls
      ctx.arc(px, py, 10, 0, Math.PI);
    } else if(patternType === 1) { // Jagged lines
      ctx.moveTo(px, py); ctx.lineTo(px+15, py+10); ctx.lineTo(px, py+20);
    } else if(patternType === 2) { // Spots
      ctx.arc(px, py, 5, 0, Math.PI*2); ctx.stroke();
    } else if(patternType === 3) { // Stars
      for(let j=0; j<5; j++) {
        const a = (j * 0.8) * Math.PI;
        ctx.lineTo(px + Math.cos(a)*10, py + Math.sin(a)*10);
      }
    } else { // Circles
      ctx.arc(px, py, 8, 0, Math.PI*2);
    }
    ctx.stroke();
  }

  // Layer 3: Elemental Infusion
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = elementColors[0];
  for(let i=0; i<10; i++) {
    const ex = centerX + (getRand(seed+'ex'+i)-0.5)*width;
    const ey = centerY + (getRand(seed+'ey'+i)-0.5)*height;
    ctx.beginPath();
    ctx.arc(ex, ey, 4, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore();

  // 6. SPECULAR SHINE
  const shine = ctx.createLinearGradient(centerX - width*0.3, centerY - height*0.3, centerX, centerY);
  shine.addColorStop(0, 'rgba(255,255,255,0.8)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.ellipse(centerX - width*0.2, centerY - height*0.25, width*0.2, height*0.25, -0.5, 0, Math.PI*2);
  ctx.fill();

  // 7. CRACKS
  if (crackProgress > 0) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const cCount = Math.floor(crackProgress * 20);
    for(let i=0; i<cCount; i++) {
      let cx = centerX + (getRand(seed+'cx'+i)-0.5)*width*0.7;
      let cy = centerY + (getRand(seed+'cy'+i)-0.5)*height*0.7;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      for(let j=0; j<4; j++) { cx += (getRand(seed+i+j+'x')-0.5)*20; cy += (getRand(seed+i+j+'y')-0.5)*20; ctx.lineTo(cx, cy); }
      ctx.stroke();
    }
  }
  ctx.restore();
}

function darkenColor(h: string, f: number) {
  const r = Math.floor(parseInt(h.slice(1, 3), 16) * f);
  const g = Math.floor(parseInt(h.slice(3, 5), 16) * f);
  const b = Math.floor(parseInt(h.slice(5, 7), 16) * f);
  return `rgb(${r},${g},${b})`;
}
function lightenColor(h: string, f: number) {
  const r = Math.min(255, Math.floor(parseInt(h.slice(1, 3), 16) * f));
  const g = Math.min(255, Math.floor(parseInt(h.slice(3, 5), 16) * f));
  const b = Math.min(255, Math.floor(parseInt(h.slice(5, 7), 16) * f));
  return `rgb(${r},${g},${b})`;
}
