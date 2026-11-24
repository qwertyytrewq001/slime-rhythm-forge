import React, { useEffect, useState } from 'react';
import type { Slime } from '@/types/slime';
import { getSpriteIdForSlime } from '@/utils/spriteLoader';

const BASE = import.meta.env.BASE_URL;

/**
 * A unique egg for every species.
 * Drop a hand-painted egg at public/eggs/<speciesId>.png and PaintedEgg uses it automatically.
 * Until then each species gets its own look: the element egg, tinted with the colours of the slime inside
 * and marked with one of eight patterns, fixed by the species so it never changes.
 */

type EggColors = { a: string; b: string };
const colorCache = new Map<string, Promise<EggColors | null>>();

function readColors(url: string): Promise<EggColors | null> {
  let p = colorCache.get(url);
  if (p) return p;
  p = new Promise<EggColors | null>(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 24;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, 24, 24);
        const d = ctx.getImageData(0, 0, 24, 24).data;
        const buckets = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
        let tr = 0, tg = 0, tb = 0, tn = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 200) continue;
          const r = d[i], g = d[i + 1], b = d[i + 2];
          tr += r; tg += g; tb += b; tn++;
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          const sat = mx ? (mx - mn) / mx : 0;
          if (sat < 0.25 || mx < 60) continue;
          let h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
          if (h < 0) h += 6;
          const k = Math.min(11, Math.floor(h * 2));
          const w = sat * (0.5 + mx / 510);
          buckets[k].w += w; buckets[k].r += r * w; buckets[k].g += g * w; buckets[k].b += b * w;
        }
        const order = buckets.map((x, i) => ({ ...x, i })).filter(x => x.w > 0).sort((x, y) => y.w - x.w);
        const rgb = (x: { w: number; r: number; g: number; b: number }) => [Math.round(x.r / x.w), Math.round(x.g / x.w), Math.round(x.b / x.w)];
        if (!order.length) {
          if (!tn) return resolve(null);
          const m = [Math.round(tr / tn), Math.round(tg / tn), Math.round(tb / tn)];
          return resolve({ a: `rgb(${m})`, b: `rgb(${m.map(v => (v > 140 ? v - 90 : v + 90))})` });
        }
        const first = rgb(order[0]);
        const far = order.find(x => { const dist = Math.abs(x.i - order[0].i); return Math.min(dist, 12 - dist) >= 2; });
        const second = far ? rgb(far) : first.map(v => Math.min(255, v + 80));
        resolve({ a: `rgb(${first})`, b: `rgb(${second})` });
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
  colorCache.set(url, p);
  return p;
}

const hashOf = (key: string) => { let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0; return h; };
export const EGG_PATTERNS = 8;
export const eggPatternFor = (slime: Slime) => hashOf(slime.codexId ?? slime.name) % EGG_PATTERNS;

function pattern(kind: number, seed: number, color: string) {
  const rnd = (n: number) => { seed = (seed * 1664525 + 1013904223) >>> 0; return (seed >>> 8) % n; };
  const els: React.ReactElement[] = [];
  if (kind === 0) for (let i = 0; i < 9; i++) els.push(<circle key={i} cx={22 + rnd(56)} cy={20 + rnd(64)} r={4 + rnd(5)} fill={color} />);
  if (kind === 1) for (let i = -2; i < 7; i++) els.push(<path key={i} d={`M${i * 18} 100 L${i * 18 + 40} 0`} stroke={color} strokeWidth="7" />);
  if (kind === 2) for (let i = 0; i < 4; i++) els.push(<rect key={i} x="0" y={18 + i * 20} width="100" height="8" fill={color} />);
  if (kind === 3) for (let i = 0; i < 4; i++) els.push(<polyline key={i} points={Array.from({ length: 9 }, (_, j) => `${j * 13},${24 + i * 18 + (j % 2 ? 8 : 0)}`).join(' ')} fill="none" stroke={color} strokeWidth="5" />);
  if (kind === 4) for (let i = 0; i < 6; i++) {
    const x = 24 + rnd(52), y = 22 + rnd(60), r = 6 + rnd(4);
    els.push(<polygon key={i} fill={color} points={`${x},${y - r} ${x + r * 0.3},${y - r * 0.3} ${x + r},${y} ${x + r * 0.3},${y + r * 0.3} ${x},${y + r} ${x - r * 0.3},${y + r * 0.3} ${x - r},${y} ${x - r * 0.3},${y - r * 0.3}`} />);
  }
  if (kind === 5) for (let r = 0; r < 5; r++) for (let q = 0; q < 6; q++) els.push(<path key={r * 6 + q} d={`M${q * 18 + (r % 2) * 9 - 8} ${r * 17 + 22} a9 9 0 0 1 18 0`} fill="none" stroke={color} strokeWidth="3.5" />);
  if (kind === 6) els.push(<path key="s" d="M50 50 m0 -3 a6 6 0 1 1 -6 6 a14 14 0 1 1 14 -14 a24 24 0 1 1 -24 24 a34 34 0 1 1 34 -34" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />);
  if (kind === 7) for (let i = 0; i < 26; i++) els.push(<circle key={i} cx={14 + rnd(72)} cy={12 + rnd(78)} r={1.8 + rnd(2)} fill={color} />);
  return els;
}

export function EggMarks({ slime, element }: { slime: Slime; element: string }) {
  const [colors, setColors] = useState<EggColors | null>(null);
  useEffect(() => {
    let live = true;
    try {
      readColors(`${BASE}${getSpriteIdForSlime(slime)}.png`).then(c => { if (live) setColors(c); });
    } catch { /* no sprite: plain egg */ }
    return () => { live = false; };
  }, [slime]);
  if (!colors) return null;
  const mask = `url(${BASE}ui/eggc_${element}.png)`;
  const m: React.CSSProperties = {
    WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: 'contain', maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center',
  };
  const key = slime.codexId ?? slime.name;
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{ ...m, background: colors.a, mixBlendMode: 'color', opacity: 0.7 }} />
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ ...m, opacity: 0.7, mixBlendMode: 'normal' }}>
        {pattern(eggPatternFor(slime), hashOf(key), colors.b)}
      </svg>
    </>
  );
}
