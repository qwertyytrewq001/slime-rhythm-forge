import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { audioEngine } from '@/utils/audioEngine';
import { CROPS, isReady } from '@/utils/farmCore';
import { dayPhase, nowForDay, totalGifts } from '@/utils/sanctuaryCore';

const BASE = import.meta.env.BASE_URL;
type Mood = 'kind' | 'excited' | 'smug' | 'explain' | 'worried' | 'sad' | 'giggle' | 'sleepy' | 'wave';
// trimmed to the character (public/altar/glim_<mood>.png) so he can be sized by height
const FACE: Record<Mood, string> = Object.fromEntries(['kind', 'excited', 'smug', 'explain', 'worried', 'sad', 'giggle', 'sleepy', 'wave'].map(m => [m, `altar/glim_${m}.png`])) as Record<Mood, string>;
/** Glim dozes off when it is night where the player is. */
const idleMood = (): Mood => (dayPhase(nowForDay()).night ? 'sleepy' : 'kind');

// Glim's own voice: a very serious guardian who is also, clearly, a little round slime.
const CHATTER: Array<{ m: Mood; t: string }> = [
  { m: 'smug', t: 'I am not "a slime". I am a GUARDIAN. A very round one.' },
  { m: 'explain', t: 'Slimes living in a sanctuary of their own element make double goo. Cozy and profitable.' },
  { m: 'explain', t: 'Golden crops give triple the food and double the Farm XP. Water your plants for a head start!' },
  { m: 'kind', t: 'Pet your slimes in the sanctuaries. Happy slimes leave gifts. I checked.' },
  { m: 'smug', t: 'Fun fact: I have never lost a staring contest. Want to try?' },
  { m: 'explain', t: 'Upgrading a sanctuary opens more island space and makes its element perk stronger.' },
  { m: 'kind', t: 'Take your time here. The forge has nowhere to be.' },
  { m: 'explain', t: 'Only Adults (Lv 10+) can take part in the breeding ritual. Feed them up!' },
  { m: 'smug', t: 'Between us, the visitor Wicks pays very well for Moonpetals.' },
  { m: 'kind', t: 'Auto-replant is on the farm bar. A lazy guardian is a wise guardian.' },
  { m: 'explain', t: 'Night falls in the sanctuaries when it does in your world. Slimes sleep. Do not poke them. Poke them a little.' },
  { m: 'smug', t: 'Tap me again. Go on. I dare you.' },
];

/**
 * Glim lives at the left edge of the home screen, peeking in. He slides out when he has something to tell you
 * (something is waiting, or every minute or so with a tip), then tucks away again. Tap him any time.
 */
export function GlimCompanion() {
  const { state } = useGameState();
  const [out, setOut] = useState(false);
  const [mood, setMood] = useState<Mood>(idleMood);
  const [bubble, setBubble] = useState<{ t: string; id: number } | null>(null);
  const [sparks, setSparks] = useState<number[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const taps = useRef<number[]>([]);
  const chatIdx = useRef(Math.floor(Math.random() * CHATTER.length));
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const b = setInterval(() => { setNowMs(Date.now()); setMood(m => (m === 'kind' || m === 'sleepy' ? idleMood() : m)); }, 5000);
    return () => { clearInterval(b); timers.current.forEach(clearTimeout); };
  }, []);

  // a wave hello when you arrive
  useEffect(() => {
    const t = window.setTimeout(() => say('wave', 'Welcome back, guardian!', 3600), 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // every minute or so, if nothing is waiting, he pops out with a tip; when something new is waiting he points it out
  const lastHint = useRef<string | null>(null);
  useEffect(() => {
    const t = window.setInterval(() => {
      if (document.hidden) return;
      setBubble(b => {
        if (!b) {
          const c = CHATTER[chatIdx.current % CHATTER.length];
          chatIdx.current += 3 + Math.floor(Math.random() * 3);
          say(c.m, c.t, 7000);
        }
        return b;
      });
    }, 70_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** The most useful thing Glim could tell you right now, or null. */
  const hint = useMemo((): { m: Mood; t: string } | null => {
    const v = state.visitor;
    if (v && !v.done) return { m: 'excited', t: `Wicks the Wanderer is visiting the Sanctuary Isles! He is after ${v.qty} ${CROPS[v.crop].name}.` };
    const ripe = state.farmPlots.filter(p => p.unlocked && isReady(p, nowMs)).length;
    if (ripe > 0) return { m: 'excited', t: `${ripe} crop${ripe === 1 ? ' is' : 's are'} ripe on the farm. Go pick ${ripe === 1 ? 'it' : 'them'}!` };
    const gifts = totalGifts(state.habitats);
    if (gifts > 0) return { m: 'kind', t: `Your slimes left ${gifts} gift${gifts === 1 ? '' : 's'} in the sanctuaries. How thoughtful.` };
    if (state.activeBreeding && nowMs >= state.activeBreeding.endTime) return { m: 'excited', t: 'The ritual is finished! Something is waiting at the altar.' };
    if (state.activeHatching) return { m: 'explain', t: 'There is an egg waiting to hatch. Tap it, gently. Or not gently.' };
    return null;
  }, [state.visitor, state.farmPlots, state.habitats, state.activeBreeding, state.activeHatching, nowMs]);

  useEffect(() => {
    const key = hint ? hint.t : null;
    if (key && key !== lastHint.current) {
      lastHint.current = key;
      const w = window.setTimeout(() => say(hint!.m, hint!.t, 8000), 2600);
      timers.current.push(w);
    }
    if (!key) lastHint.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hint]);

  const latest = useRef(0);
  const say = (m: Mood, t: string, ms = 6500) => {
    const id = ++latest.current;
    setMood(m);
    setBubble({ t, id });
    setOut(true);
    timers.current.push(window.setTimeout(() => { if (latest.current !== id) return; setBubble(null); setMood(idleMood()); setOut(false); }, ms));
  };

  const onTap = () => {
    audioEngine.playSfx('tap');
    const now = Date.now();
    taps.current = [...taps.current.filter(x => now - x < 3000), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      setSparks(s => [...s, now]);
      timers.current.push(window.setTimeout(() => setSparks(s => s.filter(x => x !== now)), 1500));
      say('giggle', 'Hehe! Stop, that tickles! I am a serious guardian!', 4200);
      return;
    }
    if (hint) { say(hint.m, hint.t); return; }
    const c = CHATTER[chatIdx.current % CHATTER.length];
    chatIdx.current += 3 + Math.floor(Math.random() * 3); // skip around so it does not feel like a list
    say(c.m, c.t);
  };

  const H = 'clamp(74px, 8.2vw, 112px)';
  const peeking = hint && !out;
  return (
    <div className="fixed pointer-events-none" style={{ left: 0, top: '41%', zIndex: 55 }}>
      <style>{`
        @keyframes glimBreathe { 0%,100% { transform: scale(1,1) } 50% { transform: scale(1.025,0.975) } }
        @keyframes glimArrive { 0% { transform: scale(0.9,1.1) } 40% { transform: scale(1.1,0.9) } 70% { transform: scale(0.97,1.04) } 100% { transform: scale(1,1) } }
        @keyframes glimSpark { 0% { transform: translate(0,0) scale(0.4); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 0 } }
        @keyframes glimBubble { 0% { opacity: 0; transform: translateY(6px) scale(0.92) } 100% { opacity: 1; transform: none } }
        @keyframes glimBadge { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
      `}</style>

      <div style={{ transform: out ? 'translateX(2px)' : 'translateX(-66%)', transition: 'transform 0.6s cubic-bezier(.3,1.45,.5,1)' }}>
        <button onClick={onTap} aria-label="Glim" className="pointer-events-auto relative block outline-none" style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
          <div key={out ? 'out' : 'in'} style={{ animation: out ? 'glimArrive 0.55s ease-out, glimBreathe 4s ease-in-out 0.6s infinite' : 'glimBreathe 5s ease-in-out infinite', transformOrigin: '50% 100%' }}>
            <img src={`${BASE}${FACE[mood]}`} alt="" draggable={false} className="block" style={{ height: H, width: 'auto', imageRendering: 'auto', filter: 'drop-shadow(0 5px 6px rgba(0,0,0,0.4))' }} />
          </div>
          {peeking && (
            <span className="absolute rounded-full text-white font-bold flex items-center justify-center" style={{ right: '-6%', top: '0%', width: 22, height: 22, background: '#e8344c', border: '2px solid #fff', fontSize: 13, animation: 'glimBadge 1s ease-in-out infinite' }}>!</span>
          )}
          {sparks.map(id => Array.from({ length: 8 }).map((_, i) => {
            const ang = (i / 8) * Math.PI * 2;
            return <img key={`${id}-${i}`} src={`${BASE}altar/particle_light.png`} alt="" className="absolute" style={{ left: '45%', top: '40%', width: 20, imageRendering: 'auto', ['--dx' as string]: `${Math.cos(ang) * 60}px`, ['--dy' as string]: `${Math.sin(ang) * 60 - 18}px`, animation: `glimSpark 1.1s ease-out ${i * 0.03}s forwards` }} />;
          }))}
        </button>

        {bubble && (
          <div
            key={bubble.id}
            className="absolute font-semibold"
            style={{ left: '100%', top: '4%', marginLeft: 6, width: 'clamp(180px, 20vw, 270px)', background: 'linear-gradient(#f6e8c3,#ecd9a8)', border: '3px solid #4a2f17', borderRadius: 18, boxShadow: '0 6px 14px rgba(0,0,0,0.35)', color: '#4a2f17', padding: '8px 12px', fontSize: 'clamp(11px, 1.05vw, 14px)', lineHeight: 1.25, fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif", animation: 'glimBubble 0.25s ease-out 0.25s both' }}
          >
            {bubble.t}
          </div>
        )}
      </div>
    </div>
  );
}
