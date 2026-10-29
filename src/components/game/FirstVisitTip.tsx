import React, { useEffect, useState } from 'react';

const U = `${import.meta.env.BASE_URL}ui/`;
const A = `${import.meta.env.BASE_URL}altar/`;

export type TipKey = 'farm' | 'sanctuaries' | 'den' | 'visitor';

const TIPS: Record<TipKey, { face: string; title: string; lines: string[] }> = {
  farm: {
    face: 'explain',
    title: 'The Farm',
    lines: [
      'Tap an empty plot to plant. Crops keep growing while you are away, so plant before you go.',
      'Harvest to earn Farm XP. New levels unlock more land (the glowing plots) and better luck: extra crops, faster growth, and rare golden harvests worth triple.',
      'The food goes in your bag. Feed it to slimes to level them up!',
    ],
  },
  sanctuaries: {
    face: 'kind',
    title: 'Sanctuary Isles',
    lines: [
      'Slimes of the matching element are happiest here. Visit one, pet it, feed it. Joy fills up on its own too.',
      'A full Joy meter leaves a gift bubble. Tap it to collect goo, food and seeds. Gifts stop piling up when the island is full, so check back!',
      'Each sanctuary also helps your farm or your goo. Upgrade it in Manage to unlock more room.',
    ],
  },
  den: {
    face: 'smug',
    title: 'The Breeding Den',
    lines: [
      'Pick two Adults (level 10 or more). Hover a second slime and watch the first one react. Some are shy. Some are very cool.',
      'The question-mark egg shows which slimes this pair could make. Then begin the ritual and wait for the egg.',
    ],
  },
  visitor: {
    face: 'excited',
    title: 'A visitor!',
    lines: [
      'That is Wicks the Wanderer, a travelling merchant. He asks for a little farm food and pays well in goo.',
      'Hand it over and every sanctuary gets a Joy boost. He only stays a short while, so be quick!',
    ],
  },
};

const seen = (k: string) => { try { return localStorage.getItem(`rs_tip_${k}`) === '1'; } catch { return true; } };
const mark = (k: string) => { try { localStorage.setItem(`rs_tip_${k}`, '1'); } catch { /* private mode */ } };

/** Shows a one-time Glim tip for a screen or event. Pass the key when it just happened; it shows once ever. */
export function FirstVisitTip({ when, ready = true }: { when: TipKey | null; ready?: boolean }) {
  const [tip, setTip] = useState<TipKey | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!when || !ready || seen(when)) return;
    const t = setTimeout(() => { setTip(when); setStep(0); }, 900);
    return () => clearTimeout(t);
  }, [when, ready]);

  if (!tip) return null;
  const data = TIPS[tip];
  const last = step >= data.lines.length - 1;
  const next = () => {
    if (!last) { setStep(step + 1); return; }
    mark(tip);
    setTip(null);
  };
  const skip = () => { mark(tip); setTip(null); };

  return (
    <div className="fixed inset-0 z-[9500] flex items-end justify-center pointer-events-none" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}>
      <style>{`@keyframes tipUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }`}</style>
      <div className="relative pointer-events-auto flex items-end" style={{ width: 'min(94vw, 760px)', marginBottom: 84, animation: 'tipUp 0.3s ease-out' }}>
        <img src={`${A}glim_${data.face}.png`} alt="" draggable={false} style={{ height: 'clamp(120px, 20vh, 190px)', width: 'auto', marginRight: -26, zIndex: 2, imageRendering: 'auto', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.4))' }} />
        <div className="relative flex-1" style={{ minHeight: 150 }}>
          <img src={`${U}dlg_box.png`} alt="" draggable={false} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'auto', objectFit: 'fill' }} />
          <div className="relative flex flex-col" style={{ padding: '22px 30px 16px 40px', color: '#4a2f17', minHeight: 150 }}>
            <div className="font-bold" style={{ fontSize: 'clamp(15px, 2vw, 21px)', letterSpacing: '0.04em' }}>{data.title}</div>
            <div className="font-semibold flex-1" style={{ fontSize: 'clamp(13px, 1.6vw, 17px)', lineHeight: 1.3, marginTop: 4 }}>{data.lines[step]}</div>
            <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
              <span className="text-xs font-bold opacity-60">{step + 1} / {data.lines.length}</span>
              <div className="flex items-center gap-2">
                <button onClick={skip} aria-label="Skip tip" className="hover:scale-110 active:scale-95 transition-transform"><img src={`${U}dlg_skip.png`} alt="" draggable={false} style={{ width: 38, imageRendering: 'auto' }} /></button>
                <button onClick={next} aria-label={last ? 'Got it' : 'Next'} className="hover:scale-110 active:scale-95 transition-transform"><img src={`${U}dlg_next.png`} alt="" draggable={false} style={{ width: 44, imageRendering: 'auto' }} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
