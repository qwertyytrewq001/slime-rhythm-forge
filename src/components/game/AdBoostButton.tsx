import React, { useEffect, useState } from 'react';
import { canOfferRewarded, rewardedBreak } from '@/utils/portal';

/**
 * A "watch a short video" button for timers and food. Shows only on a portal build where an ad can really run,
 * never rewards unless the ad played to the end, and rests for a minute after each use so it is not pushy.
 */
const COOLDOWN_MS = 60_000;
const lastUsed: Record<string, number> = {};
// A daily limit so the boosts stay a treat, not a chore (resets each day, kept per browser)
const DAILY_MAX = 10;
const dayKey = () => `rf-ads-${new Date().toISOString().slice(0, 10)}`;
const usedToday = () => { try { return parseInt(localStorage.getItem(dayKey()) || '0', 10) || 0; } catch { return 0; } };
const countUse = () => { try { localStorage.setItem(dayKey(), String(usedToday() + 1)); } catch { /* storage blocked: no limit */ } };

interface Props {
  kind: string; // one cooldown per kind: 'hatch', 'breed', 'farm', 'food'
  label: string;
  onReward: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const AdBoostButton: React.FC<Props> = ({ kind, label, onReward, style, className }) => {
  const [offer, setOffer] = useState(canOfferRewarded());
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);

  // the portal SDK finishes loading a moment after the page does
  useEffect(() => {
    if (offer) return;
    const id = window.setInterval(() => { if (canOfferRewarded()) { setOffer(true); window.clearInterval(id); } }, 1500);
    return () => window.clearInterval(id);
  }, [offer]);

  const left = Math.max(0, COOLDOWN_MS - (Date.now() - (lastUsed[kind] ?? 0)));
  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setTick(t => t + 1), Math.min(left, 1000));
    return () => window.clearTimeout(id);
  }, [left]);

  if (!offer || usedToday() >= DAILY_MAX) return null;

  const click = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy || left > 0) return;
    setBusy(true);
    const ok = await rewardedBreak();
    setBusy(false);
    lastUsed[kind] = Date.now();
    if (ok) { countUse(); onReward(); } // no reward when the ad failed or was blocked
    setTick(t => t + 1);
  };

  return (
    <button
      onClick={click}
      disabled={busy || left > 0}
      className={`rounded-full font-bold border-[3px] hover:scale-105 active:scale-95 transition-transform whitespace-nowrap ${className ?? ''}`}
      style={{
        fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif",
        fontSize: 13,
        padding: '4px 14px',
        background: 'linear-gradient(#b38cff,#7a4fd6)', // purple: rewarded buttons must not be green
        borderColor: '#fff3c0',
        color: '#fff',
        textShadow: '0 1px 2px rgba(40,10,80,0.7)',
        opacity: busy || left > 0 ? 0.55 : 1,
        pointerEvents: 'auto',
        ...style,
      }}
    >
      🎬 {left > 0 ? `${Math.ceil(left / 1000)}s` : label}
    </button>
  );
};
