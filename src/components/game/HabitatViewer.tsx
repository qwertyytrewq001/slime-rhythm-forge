import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState, xpToNextLevel, getStage } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { HABITAT_THEMES, ELEMENT_DISPLAY_NAMES } from '@/data/traitData';
import { Slime, SLIME_FOODS, SlimeFoodType } from '@/types/slime';
import { ChevronLeft, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SlimeGallery } from './SlimeGallery';
import { FeedTray } from './FeedTray';
import { foodSpriteUrl } from '@/data/foodSprites';
import { audioEngine } from '@/utils/audioEngine';
import { setSanctuaryOpen } from '@/utils/sanctuaryState';
import { triggerDialogue } from '@/utils/dialogueTriggers';

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

interface HabitatViewerProps {
  habitatId: string;
  onClose: () => void;
  onOpenFarm?: () => void;
}

// Pixel-art layered backgrounds for each element type
const ENVIRONMENT_LAYERS: Record<string, { ground: string; midground: string; backdrop: string; details: JSX.Element | null }> = {
  fire: {
    ground: 'linear-gradient(to top, #1a0a00 0%, #3a1a00 50%, #8B4513 100%)',
    midground: 'linear-gradient(180deg, rgba(255,69,0,0.3) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #FF6347 0%, #3D1408 100%)',
    details: (
      <>
        <div className="absolute bottom-0 left-1/4 w-32 h-40" style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #1a0a00 50%, #FF4500 100%)',
          clipPath: 'polygon(20% 100%, 0% 0%, 50% 20%, 100% 0%, 80% 100%)',
          filter: 'drop-shadow(-4px 0px 8px rgba(255,69,0,0.4))'
        }} />
        <div className="absolute bottom-8 right-12 w-16 h-2 rounded-full" style={{ background: '#FF4500', filter: 'blur(2px)' }} />
        <div className="absolute bottom-4 right-24 w-12 h-1.5 rounded-full" style={{ background: '#FF6347', opacity: 0.7, filter: 'blur(1px)' }} />
      </>
    )
  },
  water: {
    ground: 'linear-gradient(to top, #001a3a 0%, #003a6a 50%, #4169E1 100%)',
    midground: 'linear-gradient(180deg, rgba(65,169,225,0.4) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 40%, #87CEEB 0%, #082038 100%)',
    details: (
      <>
        <div className="absolute inset-x-0 bottom-1/3 h-1/3 opacity-20" style={{
          background: 'linear-gradient(180deg, transparent, #87CEEB)',
          animation: 'wave 3s ease-in-out infinite'
        }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full border border-blue-300" style={{
            width: '8px', height: '8px', left: `${20 + i * 15}%`, bottom: `${10 + i % 3 * 20}%`,
            animation: `float 2s ease-in-out infinite`, animationDelay: `${i * 0.3}s`, opacity: 0.5
          }} />
        ))}
      </>
    )
  },
  plant: {
    ground: 'linear-gradient(to top, #0a2810 0%, #1a4a20 50%, #32CD32 80%, #228B22 100%)',
    midground: 'linear-gradient(180deg, rgba(50,205,50,0.3) 0%, transparent 60%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #90EE90 0%, #0A2810 100%)',
    details: (
      <>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute" style={{
            left: `${15 + i * 20}%`, bottom: '0', width: '24px', height: '120px',
            background: 'linear-gradient(180deg, transparent, #228B22 50%, #1a4a20)',
            opacity: 0.8, filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.4))'
          }}>
            <div style={{
              position: 'absolute', top: '-30px', left: '-20px', width: '60px', height: '60px',
              background: 'radial-gradient(circle, #32CD32 0%, transparent 70%)', borderRadius: '50% 50% 30% 70%'
            }} />
          </div>
        ))}
        <div className="absolute bottom-0 left-0 right-0 h-6" style={{
          background: 'repeating-linear-gradient(90deg, transparent, transparent 4px, #32CD32 4px, #32CD32 8px)', opacity: 0.7
        }} />
      </>
    )
  },
  ice: {
    ground: 'linear-gradient(to top, #0a1a38 0%, #1a3a68 50%, #B0E0E6 100%)',
    midground: 'linear-gradient(180deg, rgba(175,238,238,0.3) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #E0FFFF 0%, #102838 100%)',
    details: (
      <>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute" style={{
            left: `${10 + i * 15}%`, top: '20px', width: '6px', height: `${40 + i % 3 * 20}px`,
            background: 'linear-gradient(180deg, #E0FFFF 0%, #B0E0E6 100%)', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', opacity: 0.8
          }} />
        ))}
        <div className="absolute bottom-0 left-0 right-0 h-8" style={{
          background: 'linear-gradient(90deg, transparent 0%, #ADD8E6 25%, transparent 50%, #ADD8E6 75%, transparent 100%)', opacity: 0.6
        }} />
      </>
    )
  },
  electric: {
    ground: 'linear-gradient(to top, #2a1a08 0%, #4a2a08 50%, #FFD700 80%, #3a3a20 100%)',
    midground: 'linear-gradient(180deg, rgba(255,215,0,0.2) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #FFF8DC 0%, #282008 100%)',
    details: (
      <>
        <div className="absolute bottom-16 left-1/4 w-8 h-32 border-2 border-yellow-300" style={{
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)', opacity: 0.6
        }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: '3px', height: '3px', left: `${30 + i * 10}%`, bottom: `${50 + (i % 4) * 15}%`,
            background: '#FFD700', animation: `spark-flash 0.5s ease-in-out infinite`, animationDelay: `${i * 0.1}s`, opacity: 0.8
          }} />
        ))}
      </>
    )
  },
  earth: {
    ground: 'linear-gradient(to top, #1a0a00 0%, #3a2a08 50%, #A0522D 80%, #8B4513 100%)',
    midground: 'linear-gradient(180deg, rgba(160,82,45,0.3) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #DEB887 0%, #2A1A08 100%)',
    details: (
      <>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute rounded-lg" style={{
            left: `${10 + (i * 11) % 80}%`, bottom: `${5 + (i % 3) * 20}%`,
            width: `${12 + (i % 3) * 8}px`, height: `${12 + (i % 3) * 8}px`,
            background: `linear-gradient(135deg, #A0522D 0%, #8B4513 100%)`,
            opacity: 0.7 + (i % 3) * 0.1, transform: `rotate(${i * 45}deg)`
          }} />
        ))}
        <div className="absolute bottom-0 left-0 right-0 h-4" style={{
          background: 'repeating-linear-gradient(90deg, #8B4513, #8B4513 3px, #A0522D 3px, #A0522D 6px)'
        }} />
      </>
    )
  },
  wind: {
    ground: 'linear-gradient(to top, #1a2838 0%, #3a4858 50%, #E0E8F0 80%, #B0C4DE 100%)',
    midground: 'linear-gradient(180deg, rgba(176,196,222,0.3) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 50%, #F0F8FF 0%, #1A2838 100%)',
    details: (
      <>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="absolute opacity-70" style={{
            left: `${10 + i * 30}%`, top: `${20 + i * 15}%`, width: '60px', height: '20px',
            background: 'white', borderRadius: '50%', boxShadow: 'inset -5px -5px 10px rgba(0,0,0,0.1)',
            animation: `drift 4s linear infinite`, animationDelay: `${i * 1}s`
          }} />
        ))}
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 60px)',
          animation: `float 3s ease-in-out infinite`
        }} />
      </>
    )
  },
  default: {
    ground: 'linear-gradient(to top, #1a1a2a 0%, #2a2a3a 50%, #4a4a5a 100%)',
    midground: 'linear-gradient(180deg, rgba(100,100,150,0.2) 0%, transparent 50%)',
    backdrop: 'radial-gradient(ellipse at 50% 30%, #6a6a8a 0%, #0a0a1a 100%)',
    details: null
  }
};

interface BouncingSlimeProps {
  slime: Slime;
  selected: boolean;
  targeted: boolean;
  dragging: boolean;
  wantsFood: boolean;
  attractRef: React.MutableRefObject<{ x: number; y: number } | null>;
  eatNonce: number;
  onSelect: (id: string) => void;
  onPoke: (id: string, quiet?: boolean) => void;
}

// The ground band slimes live in (percent of the scene), and how they feel about moving around it
const BAND = { minX: 10, maxX: 90, minY: 61, maxY: 80 };
const GRAVITY = 1150; // px/s^2: low on purpose, so hops hang in the air

interface Personality {
  idle: [number, number]; // seconds between moves
  jump: [number, number]; // launch speed, px/s
  range: number; // how far a wander can go, % of the scene
  float?: boolean; // glides instead of hopping
}
const DEFAULT_PERSONALITY: Personality = { idle: [0.7, 1.7], jump: [330, 440], range: 32 };
const PERSONALITIES: Record<string, Personality> = {
  fire: { idle: [0.4, 1.1], jump: [430, 560], range: 38 },
  electric: { idle: [0.3, 0.9], jump: [450, 590], range: 40 },
  plant: { idle: [0.9, 2.0], jump: [270, 360], range: 28 },
  earth: { idle: [1.0, 2.2], jump: [250, 340], range: 26 },
  metal: { idle: [0.9, 2.0], jump: [300, 400], range: 28 },
  ice: { idle: [0.7, 1.7], jump: [330, 430], range: 32 },
  light: { idle: [0.6, 1.5], jump: [380, 480], range: 34 },
  shadow: { idle: [0.7, 1.7], jump: [330, 450], range: 34 },
  water: { idle: [0.6, 1.4], jump: [0, 0], range: 30, float: true },
  wind: { idle: [0.4, 1.0], jump: [0, 0], range: 38, float: true },
};

const CALM_BUBBLES = ['🎵', '✨', '🍃', '😊'];
const POKE_BUBBLES = ['💖', '😊', '😆'];
const PET_BUBBLES = ['💖', '🥰', '😊'];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Mode = 'idle' | 'crouch' | 'air' | 'land' | 'glide' | 'sleep' | 'carried';
type Mood = 'calm' | 'lonely' | 'curious' | 'happy';

function BouncingSlime({ slime, selected, targeted, dragging, wantsFood, attractRef, eatNonce, onSelect, onPoke }: BouncingSlimeProps) {
  const groundRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [eating, setEating] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [sleeping, setSleeping] = useState(false);
  const bubbleRef = useRef<string | null>(null);
  bubbleRef.current = bubble;
  const ptr = useRef<{ x: number; y: number; t: number } | null>(null);
  const ptrHist = useRef<{ x: number; y: number; t: number }[]>([]);
  const dragInfo = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const hover = useRef(false);
  const pressed = useRef(false);
  const cb = useRef({ onPoke });
  cb.current = { onPoke };

  // Latest props for the animation loop, which must not restart on every render
  const live = useRef({ selected, targeted, dragging, wantsFood });
  live.current = { selected, targeted, dragging, wantsFood };

  const sim = useRef({
    x: rand(22, 78),
    y: rand(BAND.minY + 2, BAND.maxY - 2),
    z: 0,
    vz: 0,
    vx: 0,
    vy: 0,
    sy: 1,
    syv: 0,
    tilt: 0,
    mode: 'idle' as Mode,
    t: rand(0.2, 1.4),
    fx: 0,
    fy: 0,
    hasTarget: false,
    jump: 0,
    thrown: false,
    throwPower: 0,
    dizzy: 0,
    phase: rand(0, 6),
    bubbleIn: rand(4, 10),
    look: 0,
    blinkIn: rand(2.5, 6),
    last: performance.now() / 1000,
    mood: 'calm' as Mood,
    lonelySince: 0,
    lonelyIn: rand(4, 8),
    pet: 0,
  });

  // Show a reaction bubble. Soft ones (mood chatter) never interrupt a bubble that is already up.
  const say = (emoji: string, ms = 1600, force = true) => {
    if (!force && bubbleRef.current) return;
    setBubble(emoji);
    setTimeout(() => setBubble(b => (b === emoji ? null : b)), ms);
  };

  // Chomp whenever fed
  useEffect(() => {
    if (!eatNonce) return;
    setEating(true);
    say('😋', 1600);
    sim.current.last = performance.now() / 1000;
    const t = setTimeout(() => setEating(false), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eatNonce]);

  // Pointer: slimes watch it, can be petted, picked up, and thrown
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const now = performance.now();
      ptr.current = { x: e.clientX, y: e.clientY, t: now };
      const hist = ptrHist.current;
      hist.push({ x: e.clientX, y: e.clientY, t: now });
      while (hist.length > 1 && now - hist[0].t > 140) hist.shift();
      const d = dragInfo.current;
      if (d && !d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) {
        d.moved = true;
        suppressClick.current = true;
        pressed.current = false;
        const s = sim.current;
        s.mode = 'carried';
        s.thrown = false;
        setSleeping(false);
        say('😮', 8000);
      }
    };
    const up = () => {
      const wasPressed = pressed.current;
      pressed.current = false;
      const d = dragInfo.current;
      dragInfo.current = null;
      const s = sim.current;
      if (wasPressed && !(d?.moved)) s.syv += 5; // let go of a squish: boing
      if (d?.moved) {
        if (s.mode === 'carried') {
          s.last = performance.now() / 1000;
          const hist = ptrHist.current;
          const rect = groundRef.current?.parentElement?.getBoundingClientRect();
          let vpx = 0;
          let vpy = 0;
          if (hist.length > 1) {
            const a = hist[0];
            const b = hist[hist.length - 1];
            const dt = (b.t - a.t) / 1000;
            if (dt > 0.02) {
              vpx = (b.x - a.x) / dt;
              vpy = (b.y - a.y) / dt;
            }
          }
          const speed = Math.hypot(vpx, vpy);
          s.mode = 'air';
          s.jump = 1;
          s.hasTarget = false;
          if (speed > 380 && rect && rect.width > 0) {
            // thrown: keep the pointer's momentum
            s.thrown = true;
            s.throwPower = clamp(speed / 1400, 0.2, 1.4);
            s.vx = clamp((vpx / rect.width) * 100 * 0.9, -110, 110);
            s.vy = clamp((vpy / rect.height) * 100 * 0.5, -35, 35);
            s.vz = clamp(220 - vpy * 0.5, 120, 760);
            say('🤩', 2200);
          } else {
            s.thrown = false;
            s.vz = 0;
            s.vx = 0;
            s.vy = 0;
            say('😄', 1600);
          }
        }
        setTimeout(() => { suppressClick.current = false; }, 60);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ground = groundRef.current;
    const body = bodyRef.current;
    const shadow = shadowRef.current;
    if (!ground || !body || !shadow) return;
    const pers = PERSONALITIES[slime.element] ?? DEFAULT_PERSONALITY;
    let raf = 0;
    let last = performance.now();

    const idleTime = () => {
      const s = sim.current;
      const mult = s.mood === 'lonely' ? 1.4 : s.mood === 'curious' ? 0.7 : 1;
      return rand(pers.idle[0], pers.idle[1]) * mult;
    };

    const startHop = (tx: number, ty: number, jump: number) => {
      const s = sim.current;
      s.fx = clamp(tx, BAND.minX, BAND.maxX);
      s.fy = clamp(ty, BAND.minY, BAND.maxY);
      s.hasTarget = Math.hypot(s.fx - s.x, s.fy - s.y) > 1.5;
      s.jump = jump;
      if (pers.float) {
        s.mode = 'glide';
      } else {
        s.mode = 'crouch';
        s.t = 0.12;
      }
    };

    // One hop of a chain: move part of the way to the target, so travelling is a series of bounces
    const launchHop = () => {
      const s = sim.current;
      let hx = 0;
      let hy = 0;
      if (s.hasTarget) {
        const dx = s.fx - s.x;
        const dy = s.fy - s.y;
        const d = Math.hypot(dx, dy) || 1;
        const step = Math.min(d, 9 + s.jump / 55);
        hx = (dx / d) * step;
        hy = (dy / d) * step;
      }
      const T = (2 * s.jump) / GRAVITY;
      s.vz = s.jump;
      s.vx = hx / T;
      s.vy = hy / T;
      s.mode = 'air';
    };

    const decide = (p: { x: number; y: number } | null, pDist: number) => {
      const s = sim.current;
      const l = live.current;
      const parent = ground.parentElement;
      const rect = parent?.getBoundingClientRect();
      const attract = attractRef.current;
      const toPct = (pt: { x: number; y: number }) => ({
        x: rect && rect.width > 0 ? ((pt.x - rect.left) / rect.width) * 100 : s.x,
        y: rect && rect.height > 0 ? ((pt.y - rect.top) / rect.height) * 100 : s.y,
      });
      const hopJump = () => rand(pers.jump[0] || 300, pers.jump[1] || 420) * 1.25;

      if (l.targeted) {
        startHop(s.x, s.y, 210); // food right over me: bounce with excitement
        return;
      }
      if (attract && rect) {
        const a = toPct(attract);
        const dx = a.x - s.x;
        const dy = clamp(a.y, BAND.minY, BAND.maxY) - s.y;
        if (Math.abs(dx) < 9 && Math.abs(dy) < 8) startHop(s.x, s.y, 200);
        else startHop(s.x + clamp(dx, -26, 26), s.y + clamp(dy, -8, 8), hopJump());
        return;
      }
      if (s.mood === 'happy') {
        // pointer right here: playful bouncing in place, now and then a little shuffle
        if (Math.random() < 0.65) startHop(s.x, s.y, 230);
        else startHop(s.x + rand(-6, 6), s.y + rand(-3, 3), 240);
        return;
      }
      if (s.mood === 'curious' && p && rect && Math.random() < 0.55) {
        // sidle over to see what the pointer is up to
        const a = toPct(p);
        const dx = a.x - s.x;
        if (Math.abs(dx) > 10) {
          startHop(s.x + clamp(dx * 0.6, -16, 16), s.y + clamp((a.y - s.y) * 0.3, -4, 4), hopJump());
          return;
        }
      }
      if (!pers.float && (s.mood === 'lonely' || s.mood === 'calm') && performance.now() / 1000 - s.last > 25 && Math.random() < 0.06) {
        s.mode = 'sleep';
        s.t = rand(7, 13);
        setSleeping(true);
        return;
      }
      if (Math.random() < 0.1) {
        s.t = idleTime(); // just look around
        return;
      }
      // wander: half the time a trip across the whole scene, otherwise a nearby shuffle (never pinned to an edge)
      const reach = s.mood === 'lonely' ? pers.range * 0.75 : pers.range;
      let tx = Math.random() < 0.45 ? rand(BAND.minX + 4, BAND.maxX - 4) : s.x + rand(-reach, reach);
      if (tx < BAND.minX + 2 || tx > BAND.maxX - 2) tx = s.x + (s.x > 50 ? -1 : 1) * rand(reach * 0.5, reach);
      startHop(tx, s.y + rand(-6, 6), hopJump() * (s.mood === 'lonely' ? 0.9 : 1));
    };

    const setMood = (m: Mood) => {
      const s = sim.current;
      const prev = s.mood;
      s.mood = m;
      if (s.mode === 'sleep' || s.mode === 'carried') return;
      const grounded = s.mode === 'idle' || s.mode === 'land';
      if (m === 'lonely') {
        say('🥺', 2600, false);
        s.lonelyIn = rand(7, 12);
      } else if (m === 'curious' && prev !== 'happy') {
        say('❓', 1500, false);
      } else if (m === 'happy' && prev !== 'happy') {
        say('💖', 1500, false);
      }
      // noticing company after being alone: a little startled hop
      if (prev === 'lonely' && m !== 'lonely' && grounded && !pers.float) {
        s.mode = 'air';
        s.vz = 360;
        s.jump = 360;
        s.vx = 0;
        s.vy = 0;
        s.hasTarget = false;
        s.thrown = false;
        s.syv += 4;
        say('❗', 1100);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      const l = live.current;
      const secs = now / 1000;
      s.t -= dt;

      const box = body.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const p = ptr.current;
      const pDist = p ? Math.hypot(p.x - cx, p.y - cy) : Infinity;
      const pAge = p ? (now - p.t) / 1000 : 99;
      const hovering = hover.current && pAge < 4;
      if (pDist < 130 && pAge < 4) s.last = secs;

      // What does it feel about the pointer? Lonely needs 5s of the pointer being away or idle.
      let want: Mood = 'calm';
      if (hovering || (p && pDist < 110 && pAge < 3)) want = 'happy';
      else if (p && pDist < 340 && pAge < 6) want = 'curious';
      else if (!p || pAge > 20 || pDist > 560) want = 'lonely';
      if (want === 'lonely' && s.mood !== 'lonely') {
        if (!s.lonelySince) s.lonelySince = secs;
        if (secs - s.lonelySince > 5) setMood('lonely');
      } else {
        s.lonelySince = 0;
        if (want !== s.mood) setMood(want);
      }

      // watching: lean toward the pointer, further into a pet
      const watching = (s.mood === 'curious' || s.mood === 'happy') && p && pDist < 340 && s.mode !== 'sleep' && s.mode !== 'carried';
      const lookTarget = watching ? clamp((p!.x - cx) / (hovering ? 70 : 200), -1, 1) : 0;
      s.look += (lookTarget - s.look) * 0.12;

      // petting: rubbing the pointer over it
      const rubbing = hovering && !pressed.current && s.mode !== 'carried' && !!p && now - p.t < 160;
      if (rubbing) {
        s.pet += dt;
        if (s.pet > 1.1) {
          s.pet = 0;
          say(PET_BUBBLES[Math.floor(Math.random() * PET_BUBBLES.length)], 1400);
          cb.current.onPoke(slime.id, true);
        }
      } else {
        s.pet = Math.max(0, s.pet - dt * 2);
      }

      let syTarget = 1;
      switch (s.mode) {
        case 'idle': {
          const breathe = Math.sin(secs * 3 + s.phase) * 0.03;
          syTarget = 1 + breathe + (s.mood === 'curious' ? 0.04 : 0) + (s.mood === 'happy' ? 0.02 : 0) - (s.mood === 'lonely' ? 0.07 : 0);
          if (rubbing) syTarget -= 0.05 + Math.sin(secs * 12) * 0.02;
          s.tilt += (s.look * 5 - (s.mood === 'lonely' ? 3 : 0) - s.tilt) * 0.15;
          if (pers.float) {
            // floaty idle: keep drifting and bobbing, never parked
            s.z = 16 + Math.sin(secs * 2.2 + s.phase) * 9;
            s.vx *= Math.pow(0.25, dt);
            s.vy *= Math.pow(0.25, dt);
            s.x = clamp(s.x + (s.vx + Math.sin(secs * 0.6 + s.phase) * 1.4) * dt, BAND.minX, BAND.maxX);
            s.y = clamp(s.y + (s.vy + Math.cos(secs * 0.5 + s.phase) * 0.5) * dt, BAND.minY, BAND.maxY);
          } else {
            s.x = clamp(s.x + Math.sin(secs * 0.8 + s.phase) * 0.5 * dt, BAND.minX, BAND.maxX); // slow sway
          }
          s.blinkIn -= dt;
          if (s.blinkIn <= 0) {
            s.syv -= 3.2; // blink-squish
            s.blinkIn = rand(2.5, 6);
          }
          s.bubbleIn -= dt;
          if (s.bubbleIn <= 0) {
            s.bubbleIn = rand(8, 15);
            if (s.mood === 'calm') {
              const pick = l.wantsFood && Math.random() < 0.35 ? '🍓' : CALM_BUBBLES[Math.floor(Math.random() * CALM_BUBBLES.length)];
              say(pick, 2000, false);
            }
          }
          if (s.mood === 'lonely') {
            s.lonelyIn -= dt;
            if (s.lonelyIn <= 0) {
              s.lonelyIn = rand(8, 13);
              say(Math.random() < 0.6 ? '🥺' : '💧', 2200, false);
            }
          }
          if (s.t <= 0) {
            decide(p, pDist);
            if (s.mode === 'idle') s.t = idleTime();
          }
          break;
        }
        case 'crouch': {
          syTarget = 0.78;
          if (s.t <= 0) launchHop();
          break;
        }
        case 'air': {
          s.vz -= GRAVITY * dt;
          s.z += s.vz * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.x < BAND.minX) { s.x = BAND.minX; s.vx = s.thrown ? Math.abs(s.vx) * 0.4 : 0; }
          if (s.x > BAND.maxX) { s.x = BAND.maxX; s.vx = s.thrown ? -Math.abs(s.vx) * 0.4 : 0; }
          if (s.y < BAND.minY) { s.y = BAND.minY; s.vy = s.thrown ? Math.abs(s.vy) * 0.7 : 0; }
          if (s.y > BAND.maxY) { s.y = BAND.maxY; s.vy = s.thrown ? -Math.abs(s.vy) * 0.7 : 0; }
          const ref = s.thrown ? 520 : s.jump || 1;
          syTarget = 1 + clamp(Math.abs(s.vz) / ref, 0, 1) * 0.2;
          s.tilt += (clamp(s.vx * 0.35, -14, 14) - s.tilt) * 0.2;
          if (s.thrown) s.tilt += Math.sin(secs * 20) * 1.2; // tumbling
          if (s.z <= 0 && s.vz < 0) {
            const impact = -s.vz;
            s.z = 0;
            if (s.thrown && impact > 170) {
              s.vz = impact * 0.5; // bounce again
              s.vx *= 0.7;
              s.vy *= 0.7;
              s.sy = 0.78;
              s.syv = 0;
            } else {
              if (s.thrown && s.throwPower > 0.5) {
                s.dizzy = 1.4;
                say('😵', 2200);
              }
              s.thrown = false;
              s.vx = 0;
              s.vy = 0;
              s.mode = 'land';
              s.t = s.dizzy > 0 ? 0.25 : 0.14;
              s.sy = impact > 400 ? 0.7 : 0.8;
              s.syv = 0;
            }
          }
          break;
        }
        case 'land': {
          s.tilt *= 0.8;
          if (s.dizzy > 0) {
            s.dizzy -= dt;
            s.tilt = Math.sin(secs * 16) * 7 * Math.min(1, s.dizzy);
          }
          if (s.t <= 0) {
            const remaining = s.hasTarget ? Math.hypot(s.fx - s.x, s.fy - s.y) : 0;
            if (s.hasTarget && remaining > 1.6 && s.dizzy <= 0) {
              s.mode = 'crouch'; // keep bouncing toward the target
              s.t = 0.05;
            } else {
              s.mode = 'idle';
              s.hasTarget = false;
              s.t = l.targeted ? rand(0.25, 0.55) : Math.max(idleTime(), s.dizzy > 0 ? s.dizzy : 0);
            }
          }
          break;
        }
        case 'glide': {
          // floaters ease toward their target: smooth speed-up and slow-down, leaning into the move
          const dx = s.fx - s.x;
          const dy = s.fy - s.y;
          const dist = Math.hypot(dx, dy);
          const maxSpeed = l.dragging ? 32 : s.mood === 'lonely' ? 7 : s.mood === 'calm' ? 15 : 18;
          if (dist < 0.6 || !s.hasTarget) {
            s.mode = 'idle';
            s.hasTarget = false;
            s.t = idleTime();
          } else {
            const sp = Math.min(maxSpeed, dist * 1.6);
            const k = Math.min(1, dt * 2.4);
            s.vx += ((dx / dist) * sp - s.vx) * k;
            s.vy += ((dy / dist) * sp - s.vy) * k;
          }
          s.x = clamp(s.x + s.vx * dt, BAND.minX, BAND.maxX);
          s.y = clamp(s.y + s.vy * dt, BAND.minY, BAND.maxY);
          s.tilt += (clamp(s.vx * 0.6, -12, 12) - s.tilt) * 0.12;
          s.z = 16 + Math.sin(secs * 2.6 + s.phase) * 9;
          syTarget = 1 + Math.sin(secs * 2.6 + s.phase) * 0.04;
          break;
        }
        case 'sleep': {
          syTarget = 0.86 + Math.sin(secs * 1.3 + s.phase) * 0.025;
          s.tilt *= 0.9;
          s.z = 0;
          if (s.t <= 0 || l.selected || l.targeted || l.dragging || (p && pAge < 5 && pDist < 110)) {
            s.mode = 'idle';
            s.t = 0.35;
            s.sy = 1.18;
            s.syv = 0;
            setSleeping(false);
          }
          break;
        }
        case 'carried': {
          // dangling from the pointer
          const rect = ground.parentElement?.getBoundingClientRect();
          if (p && rect && rect.width > 0) {
            const tx = clamp(((p.x - rect.left) / rect.width) * 100, BAND.minX, BAND.maxX);
            const ty = clamp(((p.y - rect.top) / rect.height) * 100 + 10, BAND.minY, BAND.maxY);
            const prevX = s.x;
            s.x += (tx - s.x) * 0.35;
            s.y += (ty - s.y) * 0.35;
            s.tilt = clamp((s.x - prevX) * 14, -14, 14) + Math.sin(secs * 14) * 3;
          }
          s.z += (46 - s.z) * 0.3;
          syTarget = 1.07 + Math.sin(secs * 10) * 0.02;
          break;
        }
      }

      // Jelly: squash and stretch follow a damped spring, so every hop, landing and poke wobbles
      if (pressed.current && s.mode !== 'carried') syTarget = 0.8; // being squished
      s.syv += ((syTarget - s.sy) * 260 - s.syv * 15) * dt;
      s.sy += s.syv * dt;
      s.sy = clamp(s.sy, 0.55, 1.4);
      const sx = 1 + (1 - s.sy) * 0.7;

      // Depth: lower on screen reads as closer
      const depth = (s.y - BAND.minY) / (BAND.maxY - BAND.minY);
      const scale = 0.82 + 0.3 * depth;
      ground.dataset.mode = s.mode;
      ground.dataset.mood = s.mood;
      ground.style.left = `${s.x}%`;
      ground.style.top = `${s.y}%`;
      ground.style.zIndex = String(20 + Math.round(s.y));
      ground.style.transform = `translate(-50%, -100%) translateY(10px) scale(${scale})`;
      body.style.transform = `translate(${s.look * 4}px, ${-s.z}px) rotate(${s.tilt}deg) scale(${sx}, ${s.sy})`;
      const lift = clamp(s.z / 170, 0, 1);
      shadow.style.transform = `translateX(-50%) scale(${1 - lift * 0.45}, ${1 - lift * 0.45})`;
      shadow.style.opacity = String(0.4 - lift * 0.22);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slime.element]);

  // Tapping makes it hop and squeal
  const poke = () => {
    const s = sim.current;
    s.last = performance.now() / 1000;
    if (s.mode === 'sleep') setSleeping(false);
    say(POKE_BUBBLES[Math.floor(Math.random() * POKE_BUBBLES.length)], 1400);
    if (s.mode === 'idle' || s.mode === 'land' || s.mode === 'glide' || s.mode === 'sleep') {
      s.mode = 'air';
      s.vz = 430;
      s.jump = 430;
      s.vx = 0;
      s.vy = 0;
      s.hasTarget = false;
      s.thrown = false;
      s.z = Math.max(s.z, 1);
      s.syv += 4;
    }
    cb.current.onPoke(slime.id);
  };

  const needed = xpToNextLevel(slime.level);
  const maxed = slime.level >= 50;
  const pct = maxed ? 100 : Math.min(100, (slime.xp / needed) * 100);
  const start = sim.current;

  return (
    <div
      ref={groundRef}
      className="absolute pointer-events-none"
      style={{ left: `${start.x}%`, top: `${start.y}%`, width: 120, height: 120, transform: 'translate(-50%, -100%)', transformOrigin: '50% 100%' }}
    >
      {/* soft ground shadow, shrinks as the slime leaves the floor */}
      <div
        ref={shadowRef}
        className="absolute left-1/2 bottom-[2px] w-24 h-5 rounded-[50%] bg-black blur-[3px]"
        style={{ transform: 'translateX(-50%)', opacity: 0.4 }}
      />

      {(selected || targeted) && (
        <div
          className={`absolute left-1/2 bottom-[-2px] -translate-x-1/2 h-6 rounded-[50%] blur-[3px] ${targeted ? 'w-36 bg-[#7CFFB2]/70' : 'w-28 bg-[#FF7EB6]/60 animate-pulse'}`}
        />
      )}

      <div
        ref={bodyRef}
        data-slime-id={slime.id}
        className="absolute inset-0 cursor-pointer pointer-events-auto select-none outline-none"
        draggable={false}
        onMouseDown={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onDoubleClick={(e) => e.preventDefault()}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') hover.current = true; }}
        onPointerLeave={() => { hover.current = false; }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          window.getSelection()?.removeAllRanges();
          dragInfo.current = { startX: e.clientX, startY: e.clientY, moved: false };
          pressed.current = true;
          sim.current.last = performance.now() / 1000;
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (suppressClick.current) return;
          onSelect(slime.id);
          poke();
        }}
        style={{ transformOrigin: '50% 100%', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.25))', touchAction: 'none' }}
      >
        {sleeping && (
          <div className="absolute -top-6 left-[62%] z-30 pointer-events-none text-xl animate-pulse">💤</div>
        )}
        {bubble && !sleeping && (
          <div
            className={`absolute z-30 pointer-events-none rounded-full bg-white/90 px-2 py-0.5 text-base shadow animate-in zoom-in-50 fade-in duration-300 ${
              selected || targeted ? 'top-0 left-[78%]' : '-top-7 left-1/2 -translate-x-1/2'
            }`}
          >
            {bubble}
          </div>
        )}

        {(selected || targeted) && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 rounded-full border border-white/25 bg-black/65 backdrop-blur-md px-3 py-1 whitespace-nowrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-white">{slime.name}</span>
              <span className="text-[10px] font-black text-amber-300">Lv {slime.level}</span>
            </div>
            <div className="w-24 h-2 rounded-full bg-black/60 border border-white/25 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div
          className={eating ? 'slime-eat' : targeted ? 'slime-target' : ''}
          style={{ pointerEvents: 'none', transformOrigin: '50% 90%' }}
        >
          <SlimeCanvas slime={slime} size={120} animated={true} />
        </div>
      </div>
    </div>
  );
}

// ---- Feeding effects, drawn above everything in viewport coordinates ----

type Fx =
  | { id: number; kind: 'fly'; x: number; y: number; toX: number; toY: number; img: string }
  | { id: number; kind: 'text'; x: number; y: number; text: string; color: string; big?: boolean }
  | { id: number; kind: 'burst'; x: number; y: number; emojis: string[]; count: number }
  | { id: number; kind: 'ring'; x: number; y: number; color: string }
  | { id: number; kind: 'flash'; x: number; y: number };

function FlyingFood({ fx }: { fx: Extract<Fx, { kind: 'fly' }> }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <img
      src={fx.img}
      alt=""
      className="fixed w-16 h-16 pointer-events-none"
      style={{
        left: go ? fx.toX : fx.x,
        top: go ? fx.toY : fx.y,
        transform: `translate(-50%, -50%) scale(${go ? 0.2 : 1.1}) rotate(${go ? 140 : -8}deg)`,
        opacity: go ? 0.2 : 1,
        transition: 'all 300ms cubic-bezier(.5,0,.9,.4)',
        imageRendering: 'auto',
      }}
    />
  );
}

function FxLayer({ items }: { items: Fx[] }) {
  return (
    <div className="fixed inset-0 z-[10050] pointer-events-none overflow-hidden">
      {items.map(fx => {
        switch (fx.kind) {
          case 'fly':
            return <FlyingFood key={fx.id} fx={fx} />;
          case 'text':
            return (
              <div
                key={fx.id}
                className="fixed whitespace-nowrap font-black text-center"
                style={{
                  left: fx.x,
                  top: fx.y,
                  color: fx.color,
                  fontSize: fx.big ? 34 : 20,
                  fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif",
                  textShadow: '0 2px 0 rgba(0,0,0,0.65), 0 0 12px rgba(0,0,0,0.5)',
                  WebkitTextStroke: fx.big ? '1px rgba(0,0,0,0.5)' : undefined,
                  animation: `fxRise ${fx.big ? 1.8 : 1.2}s ease-out forwards`,
                }}
              >
                {fx.text}
              </div>
            );
          case 'burst':
            return (
              <div key={fx.id} className="fixed" style={{ left: fx.x, top: fx.y }}>
                {Array.from({ length: fx.count }).map((_, i) => {
                  const angle = (i / fx.count) * Math.PI * 2 + (fx.id % 7);
                  const dist = 60 + ((i * 37) % 45);
                  return (
                    <span
                      key={i}
                      className="absolute text-2xl"
                      style={{
                        ['--dx' as string]: `${Math.cos(angle) * dist}px`,
                        ['--dy' as string]: `${Math.sin(angle) * dist - 30}px`,
                        animation: `fxBurst 1s ease-out ${i * 0.03}s forwards`,
                      }}
                    >
                      {fx.emojis[i % fx.emojis.length]}
                    </span>
                  );
                })}
              </div>
            );
          case 'ring':
            return (
              <div
                key={fx.id}
                className="fixed rounded-full"
                style={{ left: fx.x, top: fx.y, width: 40, height: 40, border: `5px solid ${fx.color}`, animation: 'fxRing 0.9s ease-out forwards' }}
              />
            );
          case 'flash':
            return (
              <div
                key={fx.id}
                className="fixed rounded-full"
                style={{ left: fx.x, top: fx.y, width: 260, height: 260, background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0))', animation: 'fxFlash 0.8s ease-out forwards' }}
              />
            );
        }
      })}
    </div>
  );
}

export function HabitatViewer({ habitatId, onClose, onOpenFarm }: HabitatViewerProps) {
  const { state, dispatch } = useGameState();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [eatNonce, setEatNonce] = useState<Record<string, number>>({});
  const [fx, setFx] = useState<Fx[]>([]);
  const fxId = useRef(0);
  const attractRef = useRef<{ x: number; y: number } | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const habitat = state.habitats.find(h => h.id === habitatId);

  const assignedSlimes = (habitat?.assignedSlimeIds ?? [])
    .map(id => state.slimes.find(s => s.id === id))
    .filter(Boolean) as Slime[];

  const addFx = useCallback((item: DistributiveOmit<Fx, 'id'>, life = 1900) => {
    const id = ++fxId.current;
    setFx(list => [...list, { ...item, id } as Fx]);
    setTimeout(() => setFx(list => list.filter(f => f.id !== id)), life);
  }, []);

  const centerOf = useCallback((slimeId: string) => {
    const el = document.querySelector(`[data-slime-id="${slimeId}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const slimeAt = useCallback((x: number, y: number) => {
    let best: string | null = null;
    let bestDist = Infinity;
    document.querySelectorAll('[data-slime-id]').forEach(el => {
      const r = el.getBoundingClientRect();
      const pad = 24;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) {
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        if (d < bestDist) { bestDist = d; best = el.getAttribute('data-slime-id'); }
      }
    });
    return best;
  }, []);

  const handleSlimeSelect = (slimeId: string) => {
    if (!habitat) return;
    const slime = state.slimes.find(s => s.id === slimeId);
    if (slime && slime.elements.includes(habitat.element)) {
      dispatch({ type: 'ASSIGN_SLIME_TO_HABITAT', habitatId, slimeId });
      setGalleryOpen(false);
    }
  };

  const handlePoke = (slimeId: string, quiet = false) => {
    const c = centerOf(slimeId);
    if (c) addFx({ kind: 'burst', x: c.x, y: c.y - 30, emojis: ['💖'], count: quiet ? 2 : 3 }, 1100);
    if (!quiet) audioEngine.playSfx('tap');
  };

  const handleFeed = (food: SlimeFoodType, slimeId: string, origin: { x: number; y: number }) => {
    const slime = state.slimes.find(s => s.id === slimeId);
    if (!slime) return;
    const info = SLIME_FOODS[food];
    const c = centerOf(slimeId) ?? origin;

    if (slime.level >= 50) {
      addFx({ kind: 'text', x: c.x - 70, y: c.y - 90, text: 'Already max level!', color: '#ffffff' }, 1400);
      return;
    }
    if ((state.inventory[food] || 0) < 1) {
      addFx({ kind: 'text', x: c.x - 60, y: c.y - 90, text: 'None left in the bag', color: '#ff8a8a' }, 1400);
      return;
    }

    setSelectedId(slimeId);
    audioEngine.playSfx('collect');
    addFx({ kind: 'fly', x: origin.x, y: origin.y, toX: c.x, toY: c.y, img: foodSpriteUrl(food) }, 450);

    // The slime eats when the food reaches it
    setTimeout(() => {
      const live = stateRef.current;
      if ((live.inventory[food] || 0) < 1) return;
      dispatch({ type: 'FEED_SLIME_XP', slimeId, foodType: food });
      setEatNonce(n => ({ ...n, [slimeId]: (n[slimeId] || 0) + 1 }));
      const at = centerOf(slimeId) ?? c;
      addFx({ kind: 'burst', x: at.x, y: at.y - 20, emojis: ['💖', '✨'], count: 6 });
      addFx({ kind: 'text', x: at.x + 35, y: at.y - 45, text: `+${info.xpValue} XP`, color: '#7CFFB2' }, 1300);
    }, 300);
    setTimeout(() => triggerDialogue('firstFeed'), 2400);
  };

  // Celebrate level-ups (and evolutions) on the slime itself, whatever caused them
  const hasFood = Object.values(state.inventory).some(n => n > 0);
  const levelKey = assignedSlimes.map(s => `${s.id}:${s.level}`).join('|');
  const prevLevels = useRef<Record<string, number>>({});
  useEffect(() => {
    for (const s of assignedSlimes) {
      const prev = prevLevels.current[s.id];
      if (prev !== undefined && s.level > prev) {
        const c = centerOf(s.id);
        if (c) {
          audioEngine.playSfx('achievement');
          const evolved = getStage(s.level) !== getStage(prev);
          addFx({ kind: 'ring', x: c.x - 20, y: c.y - 20, color: '#FFD84D' }, 1000);
          if (evolved) addFx({ kind: 'flash', x: c.x - 130, y: c.y - 130 }, 900);
          addFx({ kind: 'burst', x: c.x, y: c.y, emojis: ['⭐', '✨', '💖'], count: evolved ? 16 : 10 }, 1300);
          addFx({ kind: 'text', x: c.x - 80, y: c.y - 110, text: 'LEVEL UP!', color: '#FFD84D', big: true }, 2000);
          addFx({ kind: 'text', x: c.x - 25, y: c.y - 70, text: `Lv ${s.level}`, color: '#ffffff' }, 1800);
          if (evolved) {
            addFx({ kind: 'text', x: c.x - 70, y: c.y - 160, text: `${getStage(s.level) === 'teen' ? 'TEEN' : 'ADULT'} FORM!`, color: '#E7B4FF', big: true }, 2200);
          }
        }
      }
      prevLevels.current[s.id] = s.level;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelKey]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setSanctuaryOpen(true);
    return () => {
      document.body.style.overflow = originalOverflow;
      setSanctuaryOpen(false);
    };
  }, []);

  if (!habitat) return null;

  const theme = HABITAT_THEMES[habitat.element];
  const layers = ENVIRONMENT_LAYERS[habitat.element] || ENVIRONMENT_LAYERS.default;

  return (
    <div
      className="sanctuary-root fixed inset-0 z-[10000] flex flex-col bg-black/80 select-none"
      style={{ pointerEvents: 'auto', WebkitUserSelect: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none' }}
    >
      <div className="sticky top-0 z-40 flex-shrink-0 bg-gradient-to-b from-black/95 via-black/90 to-black/70 pt-4 pb-8 px-6 backdrop-blur-md border-b border-white/10">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-lg transition-all">
          <ChevronLeft className="w-6 h-6 text-[#FF7EB6]" />
        </button>
        <h2 className="text-center text-2xl font-black uppercase tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive", color: theme.accent }}>
          {ELEMENT_DISPLAY_NAMES[habitat.element]} Sanctuary
        </h2>
        <p className="text-center text-xs text-white/60 mt-2 font-bold tracking-wider">{theme.desc}</p>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: theme.bgImage ? `url("${theme.bgImage}")` : layers.backdrop, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {!theme.bgImage && <div className="absolute inset-0" style={{ background: layers.midground }} />}
        {!theme.bgImage && <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: layers.ground }} />}

        {/* Tap empty space to put the slime back down */}
        <div className="absolute inset-0" style={{ pointerEvents: 'auto' }} onClick={() => setSelectedId(null)}>
          {assignedSlimes.map(slime => (
            <BouncingSlime
              key={slime.id}
              slime={slime}
              selected={selectedId === slime.id}
              targeted={targetId === slime.id}
              dragging={dragging}
              wantsFood={hasFood && slime.level < 50}
              attractRef={attractRef}
              eatNonce={eatNonce[slime.id] || 0}
              onSelect={setSelectedId}
              onPoke={handlePoke}
            />
          ))}

          {assignedSlimes.length < habitat.capacity && (
            <div className="absolute bottom-1/4 left-[15%] z-30">
              <button
                onClick={(e) => { e.stopPropagation(); setGalleryOpen(true); }}
                className="w-16 h-16 rounded-full bg-black/60 border-4 border-dashed border-white/40 hover:border-[#FF7EB6] hover:scale-110 transition-all flex items-center justify-center group"
                aria-label="Add a slime"
              >
                <Plus className="w-8 h-8 text-white/40 group-hover:text-[#FF7EB6]" />
              </button>
            </div>
          )}
        </div>

        {assignedSlimes.length > 0 && (
          <FeedTray
            slimeAt={slimeAt}
            selectedSlimeId={selectedId && assignedSlimes.some(s => s.id === selectedId) ? selectedId : null}
            onDragHover={setTargetId}
            onDragActive={setDragging}
            onDragMove={p => { attractRef.current = p; }}
            onOpenFarm={onOpenFarm}
            onFeed={handleFeed}
            onNeedSelect={() => {
              const first = assignedSlimes[0];
              const c = first && centerOf(first.id);
              if (c) addFx({ kind: 'text', x: c.x - 70, y: c.y - 90, text: 'Drag it onto a slime!', color: '#ffffff' }, 1500);
            }}
          />
        )}
      </div>

      <div className="sticky bottom-0 z-40 flex-shrink-0 bg-gradient-to-t from-black/95 via-black/90 to-black/70 px-6 py-4 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-bold tracking-wider uppercase">Inhabitants</p>
            <p className="text-lg font-black text-white">{assignedSlimes.length} <span className="text-white/60">/ {habitat.capacity}</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Available Goo</p>
            <p className="text-lg font-black text-[#FF7EB6]">{state.goo.toFixed(1)} 💧</p>
          </div>
        </div>
      </div>

      <Sheet open={galleryOpen} onOpenChange={setGalleryOpen}>
        <SheetContent side="bottom" className="h-[80vh] bg-obsidian-glass p-0 border-t-4 border-[#FF7EB6]/50 shadow-2xl">
          <SheetHeader className="p-4 border-b border-white/10 bg-black/40">
            <SheetTitle className="text-center text-sm font-black text-[#FF7EB6] uppercase tracking-[0.3em]" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              Select {ELEMENT_DISPLAY_NAMES[habitat.element]} Slime
            </SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-hidden">
             <SlimeGallery onSelect={handleSlimeSelect} filterElement={habitat.element} />
          </div>
        </SheetContent>
      </Sheet>

      <FxLayer items={fx} />

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.8); } }
        @keyframes spark-flash { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes drift { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(20px); } }
        @keyframes sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes snowfall { to { transform: translateY(1000%); } }
        @keyframes spark-jump { 0% { transform: translate(0,0); opacity:1; } 100% { transform: translate(0, -50px); opacity:0; } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slimeEat { 0% { transform: scale(1,1) } 18% { transform: scale(1.28,0.72) } 38% { transform: scale(0.84,1.22) } 58% { transform: scale(1.12,0.9) } 100% { transform: scale(1,1) } }
        @keyframes slimeTarget { 0%,100% { transform: scale(1.1) } 50% { transform: scale(1.18,1.05) } }
        @keyframes fxRise { 0% { transform: translateY(10px) scale(.6); opacity: 0 } 15% { transform: translateY(0) scale(1.15); opacity: 1 } 100% { transform: translateY(-70px) scale(1); opacity: 0 } }
        @keyframes fxBurst { 0% { transform: translate(0,0) scale(.4); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(1.1); opacity: 0 } }
        @keyframes fxRing { 0% { transform: translate(0,0) scale(.3); opacity: 1 } 100% { transform: translate(0,0) scale(5); opacity: 0 } }
        @keyframes fxFlash { 0% { transform: scale(.4); opacity: 1 } 100% { transform: scale(1.6); opacity: 0 } }
        .sanctuary-root, .sanctuary-root * { -webkit-user-select: none; user-select: none; -webkit-user-drag: none; }
        .sanctuary-root ::selection, .sanctuary-root canvas::selection { background: transparent; color: inherit; }
        .sanctuary-root canvas { -webkit-user-drag: none; outline: none; }
        .slime-eat { animation: slimeEat .55s ease-out; }
        .slime-target { animation: slimeTarget .5s ease-in-out infinite; filter: brightness(1.15) drop-shadow(0 0 14px rgba(124,255,178,.9)); }
      `}</style>
    </div>
  );
}
