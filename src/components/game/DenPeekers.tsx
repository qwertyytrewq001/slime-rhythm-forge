import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Slime } from '@/types/slime';
import { audioEngine } from '@/utils/audioEngine';

/** The eight lit alcoves painted into the Den background (measured from the image), as percentages of the screen: centre x, bottom y, width, height. */
const ALCOVES = [
  { x: 7.9, b: 50, w: 7, h: 27.6 }, { x: 8.1, b: 79.2, w: 5.8, h: 18.8 }, { x: 17.85, b: 49, w: 5.5, h: 17.2 }, { x: 18.05, b: 72.4, w: 4.7, h: 16.7 },
  { x: 93, b: 49.5, w: 7, h: 20.3 }, { x: 92.7, b: 80.2, w: 5.8, h: 20.3 }, { x: 82.8, b: 49, w: 5.2, h: 16.7 }, { x: 82.5, b: 72.9, w: 5.2, h: 17.2 },
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
  const [vw, setVw] = useState(() => window.innerWidth);
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
    const on = () => setVw(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
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
    <>
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
        const size = Math.max(54, Math.round(vw * (a.w / 100) * 2.0));
        const lift = !p ? 108 : p.phase === 'in' || p.phase === 'out' ? 108 : p.mode === 'peek' || p.mode === 'shy' ? 40 : 6;
        const anim = !p ? undefined : p.giggle ? 'peekGiggle 0.35s ease-in-out infinite'
          : p.phase !== 'show' ? undefined
          : p.mode === 'peek' ? 'peekWiggle 1.1s ease-in-out infinite' : p.mode === 'wave' ? 'peekWave 0.9s ease-in-out infinite' : p.mode === 'pop' ? 'peekPop 0.8s ease-in-out infinite' : 'peekShy 1.2s ease-in-out infinite';
        return (
          <div key={i} className="absolute" style={{ left: `${a.x}%`, top: `${a.b - a.h}%`, width: `${a.w}%`, height: `${a.h}%`, transform: 'translateX(-50%)', overflow: 'hidden', borderRadius: '45% 45% 6% 6% / 26% 26% 4% 4%', zIndex: 3 }}>
            {p && (
              <button
                key={p.key}
                onClick={() => tap(i)}
                aria-label={`${p.slime.name} peeking`}
                className="absolute outline-none"
                style={{ left: '50%', bottom: 0, width: size, height: size, marginLeft: -size / 2, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', transform: `translateY(${lift}%)`, transition: 'transform 0.55s cubic-bezier(.3,1.5,.5,1)' }}
              >
                <div style={{ width: '100%', height: '100%', animation: anim, transformOrigin: '50% 100%' }}>
                  <SlimeCanvas slime={p.slime} size={size} animated animationStyle="playful" />
                </div>
                {p.phase === 'show' && (p.mode === 'wave' || p.giggle) && (
                  <span className="absolute font-bold" style={{ right: '4%', top: '2%', fontSize: Math.max(11, size * 0.2), color: '#fff', WebkitTextStroke: '3px #3a2150', paintOrder: 'stroke fill', animation: 'peekBub 0.25s ease-out' }}>{p.giggle ? 'hehe!' : 'hi!'}</span>
                )}
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
