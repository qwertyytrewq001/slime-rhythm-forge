import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameState } from '@/hooks/useGameState';
import { guideFinished, guideSteps, isBrandNew } from '@/utils/guideSteps';
import { stageSize } from '@/utils/stage';

const KEY = 'rs_guide'; // 'on' while a new player is being shown around, 'done' forever after
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (v: 'on' | 'done') => { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } };

interface Spot { x: number; y: number; w: number; h: number; text: string }

/** The first element for this selector that the player can actually see and tap. */
function findVisible(sel: string): DOMRect | null {
  const { w, h } = stageSize();
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
    if ((el as HTMLButtonElement).disabled) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    if (cx < 0 || cy < 0 || cx > w || cy > h) continue;
    const top = document.elementFromPoint(cx, cy);
    if (top && (el === top || el.contains(top))) return r;
  }
  return null;
}

/**
 * A bouncing arrow that walks a brand-new player from the first egg to the first battle. It stays on the next thing
 * to tap until that is done, steps aside while someone is talking, and never comes back once finished or hidden.
 */
export function NewPlayerGuide({ paused }: { paused: boolean }) {
  const { state } = useGameState();
  const [active, setActive] = useState(() => {
    const saved = read();
    if (saved) return saved === 'on';
    const fresh = isBrandNew(state);
    write(fresh ? 'on' : 'done');
    return fresh;
  });
  const [spot, setSpot] = useState<Spot | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (active && guideFinished(state)) { write('done'); setActive(false); }
  }, [active, state]);

  useEffect(() => {
    if (!active || paused) { setSpot(null); return; }
    const look = () => {
      let next: Spot | null = null;
      if (!document.querySelector('[data-dialogue]')) {
        for (const s of guideSteps(stateRef.current, Date.now())) {
          const r = findVisible(s.sel);
          if (r) { next = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), text: s.text }; break; }
        }
      }
      setSpot(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    look();
    const id = window.setInterval(look, 250);
    return () => window.clearInterval(id);
  }, [active, paused]);

  if (!active || paused || !spot) return null;
  const root = document.getElementById('root') ?? document.body;
  const { w: sw, h: sh } = stageSize();
  const cx = spot.x + spot.w / 2;
  // the arrow comes from above when there is room, otherwise from below, otherwise it sits over the lower half
  const above = spot.y > 74;
  const below = !above && spot.y + spot.h + 74 < sh;
  const arrowTop = above ? spot.y - 40 : below ? spot.y + spot.h + 4 : spot.y + spot.h * 0.55;
  const flip = !above; // pointing up
  const labelW = Math.min(230, sw - 16);
  const labelLeft = Math.max(8, Math.min(sw - labelW - 8, cx - labelW / 2));
  const labelPos = above ? { bottom: sh - arrowTop + 2 } : { top: Math.min(sh - 40, arrowTop + 40) };

  return createPortal(
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9990, fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }} aria-live="polite">
      <style>{`@keyframes npgDown { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } } @keyframes npgUp { 0%,100% { transform: translateY(0) } 50% { transform: translateY(9px) } } @keyframes npgRing { 0%,100% { opacity: 1; transform: scale(1) } 50% { opacity: 0.55; transform: scale(1.06) } }`}</style>
      <div className="absolute rounded-2xl" style={{ left: spot.x - 4, top: spot.y - 4, width: spot.w + 8, height: spot.h + 8, border: '3px solid #ffd23f', boxShadow: '0 0 14px #ffd23f, inset 0 0 10px rgba(255,210,63,0.6)', animation: 'npgRing 1s ease-in-out infinite' }} />
      <div className="absolute" style={{ left: cx - 18, top: arrowTop, width: 36, height: 36, animation: `${flip ? 'npgUp' : 'npgDown'} 0.8s ease-in-out infinite` }}>
        <svg viewBox="0 0 36 36" width="36" height="36" style={{ transform: flip ? 'rotate(180deg)' : undefined, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))' }}>
          <path d="M12 3h12v15h9L18 34 3 18h9z" fill="#ffd23f" stroke="#4a2f17" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="absolute flex justify-center" style={{ left: labelLeft, width: labelW, ...labelPos }}>
        <div data-testid="guide-label" className="flex items-center gap-1.5 rounded-full shadow-xl text-center font-bold leading-tight" style={{ background: '#fff3cf', border: '3px solid #4a2f17', color: '#4a2f17', fontSize: 13, padding: '3px 4px 3px 12px' }}>
          <span>{spot.text}</span>
          <button onClick={() => { write('done'); setActive(false); }} aria-label="Hide the guide" title="Hide the guide" className="pointer-events-auto shrink-0 rounded-full flex items-center justify-center" style={{ width: 22, height: 22, background: '#4a2f17', color: '#fff3cf', fontSize: 13, border: 'none', padding: 0 }}>✕</button>
        </div>
      </div>
    </div>,
    root,
  );
}
