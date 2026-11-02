import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Slime } from '@/types/slime';
import { audioEngine } from '@/utils/audioEngine';
import { getStage } from '@/utils/slimeRenderer';

/** The eight lit alcoves painted into the Den background (measured from the image), as percentages of the PICTURE: centre x, bottom y, width, height. They are mapped onto the screen with the same cover-fit the painting uses. */
const IMG_W = 1376, IMG_H = 768;
const ALCOVES = [
  { x: 8.25, b: 50.4, w: 8.3, h: 28.5 }, { x: 8.5, b: 79.7, w: 7.0, h: 26.2 }, { x: 18.05, b: 49.6, w: 6.5, h: 23.4 }, { x: 18.45, b: 72.7, w: 5.9, h: 21.5 },
  { x: 82.25, b: 72.7, w: 6.3, h: 22.3 }, { x: 82.65, b: 49.6, w: 6.5, h: 23.0 }, { x: 92.35, b: 50.0, w: 8.5, h: 27.7 }, { x: 92.2, b: 81.3, w: 7.0, h: 26.6 },
];

type Mode = 'peek' | 'wave' | 'pop' | 'shy';
interface Peeker { slime: Slime; mode: Mode; phase: 'in' | 'show' | 'out'; key: number; giggle?: boolean }

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Slimes you have discovered live in the Den's alcoves. Every few seconds one climbs up in an alcove, does
 * something cheeky (peeks, waves, pops, hides its face), ducks away, and often reappears from another alcove.
 * Tap one while it is out and it giggles and hides.
 */
export function DenPeekers() {
  const { state } = useGameState();
  const [out, setOut] = useState<Record<number, Peeker>>({});
  const [view, setView] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const root = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  const outRef = useRef(out);
  outRef.current = out;
  const keyN = useRef(0);

  // one of each discovered species, so the alcoves show variety
  const cast = useMemo(() => {
    const seen = new Set<string>();
    return state.slimes.filter(s => { const k = s.codexId ?? s.name; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 12);
  }, [state.slimes]);

  useEffect(() => {
    // measure the box the painting actually fills (not the window), so alcoves always line up with the picture
    const el = root.current;
    if (!el) return;
    const on = () => { const r = el.getBoundingClientRect(); if (r.width && r.height) setView({ w: r.width, h: r.height }); };
    on();
    const ro = new ResizeObserver(on);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => { if (alive.current) fn(); }, ms);
    timers.current.push(t);
  };

  const set = (i: number, p: Peeker | null) => setOut(o => { const n = { ...o }; if (p) n[i] = p; else delete n[i]; return n; });

  const perform = (i: number, slime: Slime, chain: number) => {
    const mode = pick<Mode>(['peek', 'peek', 'wave', 'pop', 'shy']);
    const key = ++keyN.current;
    set(i, { slime, mode, phase: 'in', key });
    later(() => set(i, { slime, mode, phase: 'show', key }), 60);
    const stay = mode === 'peek' ? rand(2.2, 3.6) : rand(2.6, 4);
    later(() => set(i, { slime, mode, phase: 'out', key }), 60 + stay * 1000);
    later(() => {
      set(i, null);
      // often sneak out of a different alcove straight away
      if (chain < 2 && Math.random() < 0.55) {
        const free = ALCOVES.map((_, k) => k).filter(k => k !== i && !outRef.current[k]);
        if (free.length) later(() => perform(pick(free), slime, chain + 1), rand(350, 900));
      }
    }, 60 + stay * 1000 + 600);
  };

  useEffect(() => {
    alive.current = true;
    if (!cast.length) return;
    // preview switch for checking every alcove at once: add ?den=all to the address
    if (new URLSearchParams(window.location.search).get('den') === 'all') {
      const all: Record<number, Peeker> = {};
      ALCOVES.forEach((_, k) => { all[k] = { slime: cast[k % cast.length], mode: (['peek', 'wave', 'pop', 'shy'] as Mode[])[k % 4], phase: 'show', key: ++keyN.current }; });
      setOut(all);
      return;
    }
    const loop = () => {
      const free = ALCOVES.map((_, k) => k).filter(k => !outRef.current[k]);
      if (free.length && Object.keys(outRef.current).length < 2) perform(pick(free), pick(cast), 0);
      later(loop, rand(2200, 5200));
    };
    later(loop, 1600);
    return () => { alive.current = false; timers.current.forEach(clearTimeout); timers.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cast]);

  const tap = (i: number) => {
    const p = outRef.current[i];
    if (!p || p.giggle) return;
    audioEngine.playSfx('tap');
    set(i, { ...p, giggle: true, phase: 'show' });
    later(() => set(i, { ...p, giggle: true, phase: 'out' }), 900);
    later(() => set(i, null), 1500);
  };

  return (
    <div ref={root} className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
      <style>{`
        @keyframes peekWiggle { 0%,100% { transform: rotate(-4deg) } 50% { transform: rotate(4deg) } }
        @keyframes peekWave { 0%,100% { transform: translateX(0) rotate(0) } 25% { transform: translateX(-5%) rotate(-7deg) } 75% { transform: translateX(5%) rotate(7deg) } }
        @keyframes peekPop { 0%,100% { transform: translateY(0) scale(1,1) } 40% { transform: translateY(-14%) scale(0.95,1.08) } 70% { transform: translateY(0) scale(1.07,0.93) } }
        @keyframes peekShy { 0%,100% { transform: rotate(-9deg) translateX(-4%) } 50% { transform: rotate(-3deg) translateX(-8%) } }
        @keyframes peekGiggle { 0%,100% { transform: scale(1) } 25% { transform: scale(1.12,0.9) rotate(-6deg) } 75% { transform: scale(0.92,1.1) rotate(6deg) } }
        @keyframes peekBub { 0% { opacity: 0; transform: translateY(6px) scale(0.6) } 100% { opacity: 1; transform: none } }
      `}</style>
      {ALCOVES.map((a, i) => {
        const p = out[i];
        // where the painting really is on screen (it is scaled to cover the window and centred)
        const k = Math.max(view.w / IMG_W, view.h / IMG_H);
        const ox = (view.w - IMG_W * k) / 2, oy = (view.h - IMG_H * k) / 2;
        const aw = (a.w / 100) * IMG_W * k, ah = (a.h / 100) * IMG_H * k;
        const left = ox + (a.x / 100) * IMG_W * k - aw / 2, top = oy + (a.b / 100) * IMG_H * k - ah;
        // the slime art only fills about half of its square canvas, so the canvas is larger than the opening and the arch clips it
        const size = Math.round(Math.min(aw * 1.45, ah * 0.8));
        const lift = !p ? 120 : p.phase === 'in' || p.phase === 'out' ? 120 : p.mode === 'peek' || p.mode === 'shy' ? 14 : 2;
        const anim = !p ? undefined : p.giggle ? 'peekGiggle 0.35s ease-in-out infinite'
          : p.phase !== 'show' ? undefined
          : p.mode === 'peek' ? 'peekWiggle 1.1s ease-in-out infinite' : p.mode === 'wave' ? 'peekWave 0.9s ease-in-out infinite' : p.mode === 'pop' ? 'peekPop 0.8s ease-in-out infinite' : 'peekShy 1.2s ease-in-out infinite';
        return (
          <div key={i} className="absolute pointer-events-none" style={{ left, top, width: aw, height: ah, clipPath: `inset(0 4% 0 4% round ${Math.round(aw / 2)}px ${Math.round(aw / 2)}px 0 0)`, zIndex: 3 }}>
            {p && (
              <button
                key={p.key}
                onClick={() => tap(i)}
                aria-label={`${p.slime.name} peeking`}
                className="absolute outline-none pointer-events-auto"
                style={{ left: '50%', bottom: 0, width: size, height: size, marginLeft: -size / 2, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', transform: `translateY(${lift}%)`, transition: 'transform 0.55s cubic-bezier(.3,1.5,.5,1)' }}
              >
                <div className="flex items-end justify-center" style={{ width: '100%', height: '100%', animation: anim, transformOrigin: '50% 100%' }}>
                  {/* SlimeCanvas draws at size x multiplier x growth stage; ask for exactly the width we want, centred, with the art sitting on the floor */}
                  <div style={{ marginBottom: -size * 0.2 }}>
                    <SlimeCanvas slime={p.slime} size={size / (getStage(p.slime.level || 1) === 'baby' ? 0.6 : getStage(p.slime.level || 1) === 'teen' ? 0.85 : 1)} sizeMultiplier={1} animated animationStyle="playful" />
                  </div>
                </div>
              </button>
            )}
          </div>
        );
      })}
      {/* speech bubbles and sparkle puffs live outside the clipped alcoves so they are never cut off */}
      {ALCOVES.map((a, i) => {
        const p = out[i];
        if (!p) return null;
        const k = Math.max(view.w / IMG_W, view.h / IMG_H);
        const ox = (view.w - IMG_W * k) / 2, oy = (view.h - IMG_H * k) / 2;
        const cx = ox + (a.x / 100) * IMG_W * k, top = oy + ((a.b - a.h) / 100) * IMG_H * k;
        const label = p.giggle ? 'hehe!' : p.mode === 'wave' && p.phase === 'show' ? 'hi!' : null;
        return (
          <React.Fragment key={`fx${i}-${p.key}`}>
            {p.phase === 'in' && <img src={`${import.meta.env.BASE_URL}altar/particle_light.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: cx - 18, top: top + 6, width: 36, imageRendering: 'auto', animation: 'peekBub 0.5s ease-out', zIndex: 4 }} />}
            {label && <span className="absolute font-bold pointer-events-none" style={{ left: Math.min(cx + 6, view.w - 44), top: top - 10, fontSize: 15, color: '#fff', WebkitTextStroke: '3.5px #3a2150', paintOrder: 'stroke fill', animation: 'peekBub 0.25s ease-out', zIndex: 4, fontFamily: "'Fredoka', sans-serif" }}>{label}</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
