import React, { useState } from 'react';
import { HabitatGift, SlimeElement } from '@/types/slime';
import { CROPS } from '@/utils/farmCore';

/**
 * Sanctuary art lives in public/sanctuary/. Every piece is optional: if a file is missing the caller's
 * fallback is shown, so art can be dropped in one piece at a time (see SANCTUARY_ART_PROMPTS.md).
 */
export const SANCT = `${import.meta.env.BASE_URL}sanctuary/`;
export const BASE = import.meta.env.BASE_URL;

/** An image that quietly shows `fallback` when the file is not there yet. The global pixelated rule is overridden. */
export const ArtImg: React.FC<{ file: string; fallback?: React.ReactNode; className?: string; style?: React.CSSProperties; alt?: string }> = ({ file, fallback = null, className, style, alt = '' }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <img src={`${SANCT}${file}`} alt={alt} draggable={false} className={className} style={{ imageRendering: 'auto', ...style }} onError={() => setFailed(true)} />;
};

/** The element's painted emblem, or its emoji until the art exists. */
export const Emblem: React.FC<{ element: SlimeElement; size: number; style?: React.CSSProperties }> = ({ element, size, style }) => (
  <ArtImg file={`emblem_${element}.png`} style={{ width: size, height: size, display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }} fallback={<span style={{ fontSize: size * 0.85, lineHeight: 1 }}>{ELEMENT_GLYPH[element]}</span>} />
);

export const Heart: React.FC<{ size: number; kind?: 'full' | 'half' | 'empty' }> = ({ size, kind = 'full' }) => (
  <ArtImg file={`icon_heart_${kind}.png`} style={{ width: size, height: size, display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} fallback={<span style={{ fontSize: size * 0.85, lineHeight: 1 }}>💖</span>} />
);

export const DECOR_EMOJI: Record<string, string> = {
  flowers: '🌸', ball: '🎾', lantern: '🏮', swing: '🪁', fountain: '⛲', stump: '🪵', hammock: '🛏️', mushroom: '🍄',
};

export const ELEMENT_GLYPH: Record<SlimeElement, string> = {
  fire: '🔥', water: '💧', plant: '🍃', earth: '⛰️', wind: '🌀', ice: '❄️', electric: '⚡', metal: '⚙️', light: '☀️', shadow: '🌙',
};

export function giftLabel(g: HabitatGift): string {
  if (g.kind === 'goo') return `+${g.amount} goo`;
  if (g.kind === 'jackpot') return `JACKPOT +${g.amount} goo`;
  const crop = CROPS[g.crop ?? 'basic'];
  return g.kind === 'food' ? `+${g.amount} ${crop.name}` : `+${g.amount} ${crop.name} seeds`;
}

export const formatMinutes = (m: number | null) => {
  if (m === null) return 'Nobody home yet';
  if (m < 1) return 'Any moment';
  if (m < 60) return `about ${m} min`;
  const h = Math.floor(m / 60);
  return `about ${h}h ${m % 60}m`;
};
