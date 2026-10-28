import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { audioEngine } from '@/utils/audioEngine';
import { CROPS, isReady } from '@/utils/farmCore';
import { totalGifts } from '@/utils/sanctuaryCore';

const BASE = import.meta.env.BASE_URL;
type Mood = 'kind' | 'excited' | 'smug' | 'explain' | 'worried';
// trimmed to the character (public/altar/glim_<mood>.png) so he can be sized by height
const FACE: Record<Mood, string> = {
  kind: 'altar/glim_kind.png', excited: 'altar/glim_excited.png', smug: 'altar/glim_smug.png', explain: 'altar/glim_explain.png', worried: 'altar/glim_worried.png',
};

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

const ANCHORS = [{ l: 5, t: 40 }, { l: 85, t: 38 }, { l: 7, t: 60 }, { l: 84, t: 58 }];

/** Glim, floating around the home screen: tap him for hints, tips, and the occasional giggle. */
export function GlimCompanion() {
  const { state } = useGameState();
  const [anchor, setAnchor] = useState(0);
  const [mood, setMood] = useState<Mood>('kind');
  const [bubble, setBubble] = useState<{ t: string; id: number } | null>(null);
  const [sparks, setSparks] = useState<number[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const taps = useRef<number[]>([]);
  const chatIdx = useRef(Math.floor(Math.random() * CHATTER.length));
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const a = setInterval(() => setAnchor(n => (n + 1) % ANCHORS.length), 24_000);
    const b = setInterval(() => setNowMs(Date.now()), 5000);
    return () => { clearInterval(a); clearInterval(b); timers.current.forEach(clearTimeout); };
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

  const say = (m: Mood, t: string, ms = 6500) => {
    const id = Date.now();
    setMood(m);
    setBubble({ t, id });
    timers.current.push(window.setTimeout(() => { setBubble(b => (b && b.id === id ? null : b)); setMood('kind'); }, ms));
  };

  const onTap = () => {
    audioEngine.playSfx('tap');
    const now = Date.now();
    taps.current = [...taps.current.filter(x => now - x < 3000), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      setSparks(s => [...s, now]);
      timers.current.push(window.setTimeout(() => setSparks(s => s.filter(x => x !== now)), 1500));
      say('excited', 'Hehe! Stop, that tickles! I am a serious guardian!', 4200);
      return;
    }
    if (hint) { say(hint.m, hint.t); return; }
    const c = CHATTER[chatIdx.current % CHATTER.length];
    chatIdx.current += 3 + Math.floor(Math.random() * 3); // skip around so it does not feel like a list
    say(c.m, c.t);
  };

  const a = ANCHORS[anchor];
  const left = a.l < 50;

  return (
    <div className="fixed pointer-events-none" style={{ left: `${a.l}%`, top: `${a.t}%`, zIndex: 55, transition: 'left 7s ease-in-out, top 7s ease-in-out' }}>
      <style>{`
        @keyframes glimBob { 0%,100% { transform: translateY(0) rotate(-1.5deg) } 50% { transform: translateY(-14px) rotate(1.5deg) } }
        @keyframes glimHop { 0% { transform: translateY(0) scale(1,1) } 30% { transform: translateY(-34px) scale(0.94,1.08) } 60% { transform: translateY(0) scale(1.08,0.92) } 100% { transform: translateY(0) scale(1,1) } }
        @keyframes glimSpark { 0% { transform: translate(0,0) scale(0.4); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 0 } }
        @keyframes glimBubble { 0% { opacity: 0; transform: translateY(8px) scale(0.9) } 100% { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes glimBadge { 0%,100% { transform: scale(1) } 50% { transform: scale(1.18) } }
      `}</style>

      {bubble && (
        <div
          key={bubble.id}
          className="absolute rounded-2xl font-semibold shadow-xl"
          style={{ top: '-8%', [left ? 'left' : 'right']: '96%', width: 'clamp(170px, 19vw, 260px)', background: 'linear-gradient(#f6e8c3,#ecd9a8)', border: '3px solid #4a2f17', color: '#4a2f17', padding: '8px 12px', fontSize: 'clamp(11px, 1.05vw, 14px)', lineHeight: 1.25, fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif", animation: 'glimBubble 0.25s ease-out forwards' }}
        >
          {bubble.t}
        </div>
      )}

      <button onClick={onTap} aria-label="Glim" className="pointer-events-auto relative block outline-none" style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
        <div key={bubble ? bubble.id : 'idle'} style={{ animation: bubble ? 'glimHop 0.6s ease-out' : 'glimBob 3.6s ease-in-out infinite' }}>
          <img src={`${BASE}${FACE[mood]}`} alt="" draggable={false} className="block" style={{ height: 'clamp(96px, 11vw, 150px)', width: 'auto', imageRendering: 'auto', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.4))' }} />
        </div>
        {hint && !bubble && (
          <span className="absolute rounded-full text-white font-bold flex items-center justify-center" style={{ right: '4%', top: '2%', width: 26, height: 26, background: '#e8344c', border: '2px solid #fff', fontSize: 15, animation: 'glimBadge 1s ease-in-out infinite' }}>!</span>
        )}
        {sparks.map(id => Array.from({ length: 8 }).map((_, i) => {
          const ang = (i / 8) * Math.PI * 2;
          return <img key={`${id}-${i}`} src={`${BASE}altar/particle_light.png`} alt="" className="absolute" style={{ left: '45%', top: '40%', width: 22, imageRendering: 'auto', ['--dx' as string]: `${Math.cos(ang) * 70}px`, ['--dy' as string]: `${Math.sin(ang) * 70 - 20}px`, animation: `glimSpark 1.1s ease-out ${i * 0.03}s forwards` }} />;
        }))}
      </button>
    </div>
  );
}
