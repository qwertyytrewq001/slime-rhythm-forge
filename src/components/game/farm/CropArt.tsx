import React from 'react';
import { SlimeFoodType } from '@/types/slime';

/**
 * Crop growth art. Each crop has its own look at four stages:
 * 0 seedling, 1 sprout, 2 growing, 3 ripe.
 *
 * These are drawn as layered SVG so the farm looks right today. If painted art is dropped into
 * public/farm/crop_<type>_<stage>.png (see FARM_ART_PROMPTS.md), set FARM_ART_READY to true and it is used instead.
 */
export const FARM_ART_READY = true;
export type Stage = 0 | 1 | 2 | 3;

const LINE = '#3a2150';
const SW = 2.2;

const PALETTE: Record<SlimeFoodType, { leaf: string; leafDark: string; accent: string; accentDark: string; glow: string }> = {
  basic: { leaf: '#58cf72', leafDark: '#2f9a4a', accent: '#5b86ff', accentDark: '#2f4fd1', glow: '#8fb1ff' },
  elemental: { leaf: '#86dcc4', leafDark: '#3aa58c', accent: '#f4ecff', accentDark: '#b99cff', glow: '#d9c6ff' },
  royal: { leaf: '#a6d65a', leafDark: '#5f9a2a', accent: '#ffe066', accentDark: '#f0a020', glow: '#ffe9a0' },
};

const Leaf: React.FC<{ x: number; y: number; rot: number; s?: number; fill: string; dark: string }> = ({ x, y, rot, s = 1, fill, dark }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0 0 C 6 -10, 22 -11, 30 0 C 22 11, 6 10, 0 0 Z" fill={fill} stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M3 0 C 12 -1, 20 -1, 27 0" stroke={dark} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    <path d="M6 -4 C 12 -7, 18 -7, 22 -4" stroke="rgba(255,255,255,0.55)" strokeWidth={1.4} fill="none" strokeLinecap="round" />
  </g>
);

const Berry: React.FC<{ x: number; y: number; r: number; c: string; d: string }> = ({ x, y, r, c, d }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={c} stroke={LINE} strokeWidth={SW} />
    <circle cx={x} cy={y + r * 0.25} r={r * 0.62} fill={d} opacity={0.35} />
    <circle cx={x - r * 0.35} cy={y - r * 0.38} r={r * 0.28} fill="#fff" opacity={0.85} />
  </g>
);

const StarShape: React.FC<{ x: number; y: number; r: number; fill: string; dark: string }> = ({ x, y, r, fill, dark }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.48;
    return `${(x + Math.cos(a) * rad).toFixed(1)},${(y + Math.sin(a) * rad).toFixed(1)}`;
  }).join(' ');
  return (
    <g>
      <polygon points={pts} fill={fill} stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
      <polygon points={pts} fill={dark} opacity={0.25} transform={`translate(0 ${r * 0.08})`} />
      <circle cx={x - r * 0.2} cy={y - r * 0.28} r={r * 0.16} fill="#fff" opacity={0.9} />
    </g>
  );
};

const Petal: React.FC<{ x: number; y: number; rot: number; fill: string; dark: string }> = ({ x, y, rot, fill, dark }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M0 0 C -9 -8, -8 -22, 0 -26 C 8 -22, 9 -8, 0 0 Z" fill={fill} stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M0 -3 C -3 -9, -3 -17, 0 -21" stroke={dark} strokeWidth={1.6} fill="none" strokeLinecap="round" />
  </g>
);

export const CropPlant: React.FC<{ crop: SlimeFoodType; stage: Stage; className?: string; style?: React.CSSProperties }> = ({ crop, stage, className, style }) => {
  const p = PALETTE[crop];
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ overflow: 'visible', ...style }} aria-hidden="true">
      {stage === 3 && <circle cx="50" cy="52" r="40" fill={p.glow} opacity="0.35" />}

      {/* stage 0: just planted */}
      {stage === 0 && (
        <g>
          <ellipse cx="50" cy="90" rx="16" ry="6" fill="#8a5a34" stroke={LINE} strokeWidth={SW} />
          <path d="M50 88 C 50 80, 50 76, 50 72" stroke={LINE} strokeWidth={4.4} strokeLinecap="round" fill="none" />
          <path d="M50 88 C 50 80, 50 76, 50 72" stroke={p.leafDark} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Leaf x={50} y={74} rot={-150} s={0.5} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={74} rot={-30} s={0.5} fill={p.leaf} dark={p.leafDark} />
        </g>
      )}

      {/* stage 1: sprout */}
      {stage === 1 && (
        <g>
          <path d="M50 92 C 50 76, 50 62, 50 48" stroke={LINE} strokeWidth={5} strokeLinecap="round" fill="none" />
          <path d="M50 92 C 50 76, 50 62, 50 48" stroke={p.leafDark} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <Leaf x={50} y={74} rot={-155} s={0.78} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={64} rot={-25} s={0.82} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={52} rot={-120} s={0.7} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={50} rot={-60} s={0.7} fill={p.leaf} dark={p.leafDark} />
        </g>
      )}

      {/* stage 2: growing, with the first hint of what it will be */}
      {stage === 2 && (
        <g>
          <path d="M50 94 C 50 74, 50 52, 50 30" stroke={LINE} strokeWidth={6} strokeLinecap="round" fill="none" />
          <path d="M50 94 C 50 74, 50 52, 50 30" stroke={p.leafDark} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Leaf x={50} y={80} rot={-160} s={0.95} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={72} rot={-20} s={1} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={58} rot={-150} s={0.85} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={52} rot={-30} s={0.85} fill={p.leaf} dark={p.leafDark} />
          {crop === 'basic' && (
            <g>
              <Berry x={36} y={52} r={5} c="#cfe0ff" d={p.accentDark} />
              <Berry x={65} y={46} r={5.5} c="#cfe0ff" d={p.accentDark} />
              <Berry x={52} y={34} r={5} c="#cfe0ff" d={p.accentDark} />
            </g>
          )}
          {crop === 'elemental' && (
            <g>
              <path d="M50 30 C 42 22, 44 8, 50 4 C 56 8, 58 22, 50 30 Z" fill="#c9b5ff" stroke={LINE} strokeWidth={SW} strokeLinejoin="round" />
              <path d="M50 28 C 47 20, 48 12, 50 8" stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.8} strokeLinecap="round" />
            </g>
          )}
          {crop === 'royal' && (
            <g>
              <StarShape x={34} y={50} r={7} fill="#c8e88a" dark={p.leafDark} />
              <StarShape x={66} y={42} r={8} fill="#c8e88a" dark={p.leafDark} />
            </g>
          )}
        </g>
      )}

      {/* stage 3: ripe */}
      {stage === 3 && (
        <g>
          <path d="M50 94 C 50 74, 50 52, 50 34" stroke={LINE} strokeWidth={6} strokeLinecap="round" fill="none" />
          <path d="M50 94 C 50 74, 50 52, 50 34" stroke={p.leafDark} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Leaf x={50} y={82} rot={-165} s={1} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={74} rot={-15} s={1.05} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={62} rot={-155} s={0.9} fill={p.leaf} dark={p.leafDark} />
          <Leaf x={50} y={56} rot={-25} s={0.9} fill={p.leaf} dark={p.leafDark} />
          {crop === 'basic' && (
            <g>
              <Berry x={30} y={58} r={9} c={p.accent} d={p.accentDark} />
              <Berry x={70} y={56} r={9.5} c={p.accent} d={p.accentDark} />
              <Berry x={42} y={40} r={9.5} c={p.accent} d={p.accentDark} />
              <Berry x={60} y={36} r={10} c={p.accent} d={p.accentDark} />
              <Berry x={50} y={22} r={9} c={p.accent} d={p.accentDark} />
            </g>
          )}
          {crop === 'elemental' && (
            <g>
              {[-72, -36, 0, 36, 72].map(a => (
                <Petal key={a} x={50} y={30} rot={a} fill={p.accent} dark={p.accentDark} />
              ))}
              <circle cx="50" cy="30" r="8" fill="#ffd84d" stroke={LINE} strokeWidth={SW} />
              <circle cx="47" cy="27" r="2.4" fill="#fff" opacity="0.9" />
            </g>
          )}
          {crop === 'royal' && (
            <g>
              <StarShape x={30} y={56} r={11} fill={p.accent} dark={p.accentDark} />
              <StarShape x={70} y={52} r={12} fill={p.accent} dark={p.accentDark} />
              <StarShape x={50} y={26} r={14} fill={p.accent} dark={p.accentDark} />
            </g>
          )}
        </g>
      )}
    </svg>
  );
};

export const stageOf = (progress: number): Stage => (progress >= 1 ? 3 : progress >= 0.5 ? 2 : progress >= 0.15 ? 1 : 0);

/** Painted art if it exists, otherwise the drawn plant. */
export const CropArt: React.FC<{ crop: SlimeFoodType; stage: Stage; className?: string; style?: React.CSSProperties }> = ({ crop, stage, className, style }) => {
  if (FARM_ART_READY) {
    return <img src={`${import.meta.env.BASE_URL}farm/crop_${crop}_${stage}.png`} alt="" draggable={false} className={className} style={{ imageRendering: 'auto', ...style }} />;
  }
  return <CropPlant crop={crop} stage={stage} className={className} style={style} />;
};
