import React, { useEffect, useMemo, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { CROPS, isReady } from '@/utils/farmCore';
import { totalGifts } from '@/utils/sanctuaryCore';
import { foodSpriteUrl } from '@/data/foodSprites';

const KEY = 'rs_last_seen';
const BASE = import.meta.env.BASE_URL;

/** When the player was last here, remembered across visits. Call once near the top of the page. */
export function useAwaySince(): number {
  const since = useRef<number | null>(null);
  if (since.current === null) {
    try { since.current = Number(localStorage.getItem(KEY) || 0); } catch { since.current = 0; }
  }
  useEffect(() => {
    const mark = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch { /* private mode */ } };
    mark();
    const t = setInterval(mark, 30_000);
    window.addEventListener('pagehide', mark);
    return () => { clearInterval(t); window.removeEventListener('pagehide', mark); };
  }, []);
  return since.current ?? 0;
}

const away = (ms: number) => {
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m} minutes`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h} hour${h === 1 ? '' : 's'}` : `${Math.floor(h / 24)} day${Math.floor(h / 24) === 1 ? '' : 's'}`;
};

/** A short recap of what happened while the player was away. Shows only if there is something to tell. */
export function WelcomeBack({ awaySince, onClose }: { awaySince: number; onClose: () => void }) {
  const { state } = useGameState();
  const now = Date.now();
  const gone = awaySince ? now - awaySince : 0;

  const rows = useMemo(() => {
    const out: Array<{ key: string; icon: React.ReactNode; text: string }> = [];
    const ripe = state.farmPlots.filter(p => p.unlocked && isReady(p, now));
    if (ripe.length) {
      const crop = ripe[0].cropType ?? 'basic';
      out.push({ key: 'crops', icon: <img src={foodSpriteUrl(crop)} alt="" style={{ width: 38, imageRendering: 'auto' }} />, text: `${ripe.length} crop${ripe.length === 1 ? ' is' : 's are'} ripe on the farm (${CROPS[crop].name}).` });
    }
    const gifts = totalGifts(state.habitats);
    if (gifts) out.push({ key: 'gifts', icon: <img src={`${BASE}sanctuary/icon_gift_bubble.png`} alt="" style={{ width: 40, imageRendering: 'auto' }} />, text: `Your slimes left ${gifts} gift${gifts === 1 ? '' : 's'} in the sanctuaries.` });
    if (state.visitor && !state.visitor.done) out.push({ key: 'visitor', icon: <img src={`${BASE}sanctuary/visitor_idle.png`} alt="" style={{ width: 40, imageRendering: 'auto' }} />, text: `Wicks is visiting! He wants ${state.visitor.qty} ${CROPS[state.visitor.crop].name}.` });
    if (state.activeBreeding && now >= state.activeBreeding.endTime) out.push({ key: 'ritual', icon: <img src={`${BASE}altar/gem_${state.activeBreeding.resultSlime.rarityTier.toLowerCase()}.png`} alt="" style={{ width: 38, imageRendering: 'auto' }} />, text: 'The breeding ritual is finished. An egg is waiting at the altar.' });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const show = state.tutorialCompleted && gone > 10 * 60_000 && rows.length > 0;
  useEffect(() => { if (!show) onClose(); }, [show, onClose]);
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/55" style={{ fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }} onClick={onClose}>
      <style>{`@keyframes wbRise { from { opacity: 0; transform: translateY(14px) scale(0.96) } to { opacity: 1; transform: none } }`}</style>
      <div onClick={e => e.stopPropagation()} className="flex items-center rounded-3xl shadow-2xl" style={{ width: 'min(92vw, 640px)', background: 'linear-gradient(#f6e8c3,#ecd9a8)', border: '4px solid #4a2f17', color: '#4a2f17', padding: 18, gap: 16, animation: 'wbRise 0.3s ease-out' }}>
        <img src={`${BASE}altar/glim_wave.png`} alt="" draggable={false} style={{ height: 150, width: 'auto', imageRendering: 'auto', flexShrink: 0 }} />
        <div className="flex-1">
          <div className="font-bold leading-none" style={{ fontSize: 26 }}>Welcome back!</div>
          <div className="font-semibold opacity-70" style={{ fontSize: 13, marginBottom: 8 }}>You were away for {away(gone)}.</div>
          <div className="flex flex-col" style={{ gap: 6 }}>
            {rows.map(r => (
              <div key={r.key} className="flex items-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.55)', border: '2px solid rgba(74,47,23,0.2)', padding: '4px 10px', gap: 10, fontSize: 14, fontWeight: 600 }}>
                {r.icon}<span>{r.text}</span>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="rounded-full font-bold border-[3px] shadow-lg hover:scale-105 active:scale-95 transition-transform" style={{ marginTop: 12, background: 'linear-gradient(#ffe98a,#f2b632)', borderColor: '#4a2f17', fontSize: 15, padding: '5px 22px' }}>Let's go!</button>
        </div>
      </div>
    </div>
  );
}
