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
import { JOY_MAX } from '@/utils/sanctuaryCore';
import { SanctuaryPanel } from './SanctuaryPanel';
import { ArtImg, Heart, giftLabel } from './sanctuary/sanctArt';
import { decorById } from '@/utils/sanctuaryCore';
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

interface Landmark {
  x: number; // % of the scene
  y: number;
  e: string; // what the slime thinks about it
}

// Things worth visiting in each Sanctuary backdrop (placed from the painted art; slimes stand in the lower band)
const LANDMARKS: Record<string, Landmark[]> = {
  fire: [{ x: 38, y: 66, e: '🌋' }, { x: 20, y: 70, e: '💎' }, { x: 60, y: 76, e: '🔥' }, { x: 82, y: 68, e: '🌿' }],
  water: [{ x: 24, y: 78, e: '🪷' }, { x: 68, y: 72, e: '💧' }, { x: 12, y: 66, e: '🗿' }, { x: 84, y: 65, e: '🏛️' }, { x: 47, y: 63, e: '🌊' }],
  plant: [{ x: 24, y: 76, e: '🪷' }, { x: 38, y: 63, e: '🍄' }, { x: 56, y: 66, e: '🌳' }, { x: 78, y: 70, e: '🪨' }, { x: 68, y: 78, e: '🌸' }],
  earth: [{ x: 18, y: 66, e: '🗿' }, { x: 45, y: 64, e: '✨' }, { x: 60, y: 76, e: '🌵' }, { x: 82, y: 74, e: '💎' }, { x: 25, y: 78, e: '🌼' }],
  wind: [{ x: 22, y: 76, e: '💧' }, { x: 12, y: 72, e: '💎' }, { x: 50, y: 70, e: '🌬️' }, { x: 75, y: 68, e: '💧' }, { x: 82, y: 78, e: '🌼' }],
  ice: [{ x: 18, y: 78, e: '🧊' }, { x: 35, y: 66, e: '🏮' }, { x: 60, y: 70, e: '❄️' }, { x: 70, y: 77, e: '⛏️' }, { x: 80, y: 64, e: '💎' }],
  electric: [{ x: 36, y: 64, e: '⚡' }, { x: 26, y: 74, e: '💧' }, { x: 60, y: 70, e: '🔌' }, { x: 78, y: 74, e: '🪷' }, { x: 14, y: 68, e: '💎' }],
  metal: [{ x: 34, y: 66, e: '🔥' }, { x: 55, y: 70, e: '⚙️' }, { x: 72, y: 66, e: '🔩' }, { x: 78, y: 78, e: '⚙️' }, { x: 20, y: 76, e: '⚒️' }],
  light: [{ x: 40, y: 62, e: '🏛️' }, { x: 22, y: 76, e: '💧' }, { x: 68, y: 68, e: '🌼' }, { x: 80, y: 76, e: '🌸' }, { x: 12, y: 70, e: '✨' }],
  shadow: [{ x: 22, y: 76, e: '🪷' }, { x: 38, y: 64, e: '🌺' }, { x: 60, y: 62, e: '🏰' }, { x: 75, y: 70, e: '🟣' }, { x: 12, y: 66, e: '🗿' }],
};

interface SlimeApi {
  poke: () => void;
  carry: () => void;
  drop: () => void;
  setPressed: (v: boolean) => void;
  setHover: (v: boolean) => void;
}

interface PointerSample {
  x: number;
  y: number;
  t: number;
}

interface BouncingSlimeProps {
  slime: Slime;
  selected: boolean;
  targeted: boolean;
  dragging: boolean;
  wantsFood: boolean;
  landmarks: Landmark[];
  attractRef: React.MutableRefObject<{ x: number; y: number } | null>;
  pointerRef: React.MutableRefObject<PointerSample | null>;
  histRef: React.MutableRefObject<PointerSample[]>;
  apiRef: React.MutableRefObject<Record<string, SlimeApi>>;
  eatNonce: number;
  onPoke: (id: string, quiet?: boolean) => void;
}

// The ground band slimes live in (percent of the scene), and how they feel about moving around it
const BAND = { minX: 10, maxX: 90, minY: 61, maxY: 80 };
const GRAVITY = 1150; // px/s^2: low on purpose, so hops hang in the air

interface Personality {
  idle: [number, number]; // seconds between moves
  jump: [number, number]; // launch speed, px/s
  range: number; // how far a wander can go, % of the scene
  float?: boolean; // always floats between places (and bounces on arrival)
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
  water: { idle: [0.6, 1.4], jump: [260, 340], range: 30, float: true },
  wind: { idle: [0.4, 1.0], jump: [260, 340], range: 38, float: true },
};

const CALM_BUBBLES = ['🎵', '✨', '🍃', '😊'];
const POKE_BUBBLES = ['💖', '😊', '😆'];
const PET_BUBBLES = ['💖', '🥰', '😊'];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Mode = 'idle' | 'crouch' | 'air' | 'land' | 'glide' | 'sleep' | 'carried' | 'inspect';
type Mood = 'calm' | 'lonely' | 'curious' | 'happy';

function BouncingSlime({ slime, selected, targeted, dragging, wantsFood, landmarks, attractRef, pointerRef, histRef, apiRef, eatNonce, onPoke }: BouncingSlimeProps) {
  const groundRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [eating, setEating] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [sleeping, setSleeping] = useState(false);
  const bubbleRef = useRef<string | null>(null);
  bubbleRef.current = bubble;
  const hover = useRef(false);
  const pressed = useRef(false);
  const cb = useRef({ onPoke, landmarks });
  cb.current = { onPoke, landmarks };

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
    viaFloat: false,
    jump: 0,
    bounceQ: [] as number[],
    explore: null as Landmark | null,
    inspecting: null as Landmark | null,
    lastLm: -1,
    sniff: 1,
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

  // Tapping makes it hop and squeal
  const poke = () => {
    const s = sim.current;
    s.last = performance.now() / 1000;
    if (s.mode === 'sleep') setSleeping(false);
    say(POKE_BUBBLES[Math.floor(Math.random() * POKE_BUBBLES.length)], 1400);
    if (s.mode === 'idle' || s.mode === 'land' || s.mode === 'glide' || s.mode === 'sleep' || s.mode === 'inspect') {
      s.mode = 'air';
      s.vz = 430;
      s.jump = 430;
      s.vx = 0;
      s.vy = 0;
      s.hasTarget = false;
      s.thrown = false;
      s.explore = null;
      s.bounceQ = [];
      s.z = Math.max(s.z, 1);
      s.syv += 4;
    }
    cb.current.onPoke(slime.id);
  };

  // What the Sanctuary's pointer controller can do to this slime
  useEffect(() => {
    const api: SlimeApi = {
      poke,
      carry: () => {
        const s = sim.current;
        s.mode = 'carried';
        s.thrown = false;
        s.hasTarget = false;
        s.explore = null;
        s.bounceQ = [];
        setSleeping(false);
        say('😮', 8000);
      },
      drop: () => {
        const s = sim.current;
        if (s.mode !== 'carried') return;
        s.last = performance.now() / 1000;
        const hist = histRef.current;
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
      },
      setPressed: (v: boolean) => {
        const was = pressed.current;
        pressed.current = v;
        if (!v && was) sim.current.syv += 5; // let go of a squish: boing
        if (v) sim.current.last = performance.now() / 1000;
      },
      setHover: (v: boolean) => {
        hover.current = v;
      },
    };
    apiRef.current[slime.id] = api;
    return () => {
      delete apiRef.current[slime.id];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slime.id]);

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
    const hopJump = () => rand(pers.jump[0] || 300, pers.jump[1] || 420) * 1.2 * rand(0.85, 1.15);

    // Head somewhere: floating (smooth glide, then a few bounces on arrival) or a chain of hops
    const goTo = (tx: number, ty: number, style: 'hop' | 'float', jump: number) => {
      const s = sim.current;
      s.fx = clamp(tx, BAND.minX, BAND.maxX);
      s.fy = clamp(ty, BAND.minY, BAND.maxY);
      s.hasTarget = Math.hypot(s.fx - s.x, s.fy - s.y) > 1.5;
      s.jump = jump;
      s.viaFloat = style === 'float';
      if (style === 'float') {
        s.mode = 'glide';
      } else {
        s.mode = 'crouch';
        s.t = 0.08;
      }
    };
    const travelStyle = (): 'hop' | 'float' => (pers.float || Math.random() < 0.45 ? 'float' : 'hop');

    const bounceIn = (jump: number) => {
      const s = sim.current;
      s.hasTarget = false;
      s.jump = jump;
      s.mode = 'crouch';
      s.t = 0.07;
    };
    const bounceNext = () => {
      const s = sim.current;
      const j = s.bounceQ.shift();
      if (j) bounceIn(j);
      else {
        s.mode = 'idle';
        s.t = idleTime();
      }
    };
    // Arrived: look around if this was an exploration, otherwise maybe a few happy bounces
    const finishTrip = (viaFloat: boolean) => {
      const s = sim.current;
      s.hasTarget = false;
      if (s.explore) {
        s.inspecting = s.explore;
        s.explore = null;
        s.mode = 'inspect';
        s.t = rand(2.6, 4.2);
        s.sniff = rand(0.6, 1.1);
        say(s.inspecting.e, 2600, false);
        return;
      }
      if (viaFloat && Math.random() < (pers.float ? 0.6 : 0.85)) {
        const base = rand(250, 330);
        s.bounceQ = [base, base * 0.7, base * 0.45].slice(0, Math.random() < 0.5 ? 2 : 3);
        bounceNext();
        return;
      }
      s.mode = 'idle';
      s.t = idleTime();
    };

    const decide = (p: { x: number; y: number } | null) => {
      const s = sim.current;
      const l = live.current;
      const parent = ground.parentElement;
      const rect = parent?.getBoundingClientRect();
      const attract = attractRef.current;
      const toPct = (pt: { x: number; y: number }) => ({
        x: rect && rect.width > 0 ? ((pt.x - rect.left) / rect.width) * 100 : s.x,
        y: rect && rect.height > 0 ? ((pt.y - rect.top) / rect.height) * 100 : s.y,
      });
      s.explore = null;

      if (l.targeted) {
        goTo(s.x, s.y, 'hop', 210); // food right over me: bounce with excitement
        return;
      }
      if (attract && rect) {
        const a = toPct(attract);
        const dx = a.x - s.x;
        const dy = clamp(a.y, BAND.minY, BAND.maxY) - s.y;
        if (Math.abs(dx) < 9 && Math.abs(dy) < 8) goTo(s.x, s.y, 'hop', 200);
        else goTo(s.x + clamp(dx, -26, 26), s.y + clamp(dy, -8, 8), pers.float ? 'float' : 'hop', hopJump());
        return;
      }
      if (s.mood === 'happy') {
        // pointer right here: playful bouncing in place, now and then a little shuffle
        if (Math.random() < 0.65) goTo(s.x, s.y, 'hop', 230);
        else goTo(s.x + rand(-6, 6), s.y + rand(-3, 3), 'hop', 240);
        return;
      }
      if (s.mood === 'curious' && p && rect && Math.random() < 0.55) {
        // sidle over to see what the pointer is up to
        const a = toPct(p);
        const dx = a.x - s.x;
        if (Math.abs(dx) > 10) {
          goTo(s.x + clamp(dx * 0.6, -16, 16), s.y + clamp((a.y - s.y) * 0.3, -4, 4), travelStyle(), hopJump());
          return;
        }
      }
      if (!pers.float && (s.mood === 'lonely' || s.mood === 'calm') && performance.now() / 1000 - s.last > 25 && Math.random() < 0.06) {
        s.mode = 'sleep';
        s.t = rand(7, 13);
        setSleeping(true);
        return;
      }
      // explore: wander over to something in the habitat and have a look at it
      const lms = cb.current.landmarks;
      if (lms.length && Math.random() < 0.3) {
        let i = Math.floor(Math.random() * lms.length);
        if (i === s.lastLm) i = (i + 1) % lms.length;
        s.lastLm = i;
        const lm = lms[i];
        s.explore = lm;
        goTo(lm.x + rand(-2.5, 2.5), lm.y + rand(-1.5, 1.5), travelStyle(), hopJump());
        return;
      }
      if (Math.random() < 0.1) {
        s.t = idleTime(); // just look around
        return;
      }
      // wander: half the time a trip across the whole scene, otherwise a nearby shuffle
      const reach = s.mood === 'lonely' ? pers.range * 0.75 : pers.range;
      let tx = Math.random() < 0.45 ? rand(BAND.minX + 4, BAND.maxX - 4) : s.x + rand(-reach, reach);
      if (tx < BAND.minX + 2 || tx > BAND.maxX - 2) tx = s.x + (s.x > 50 ? -1 : 1) * rand(reach * 0.5, reach);
      goTo(tx, s.y + rand(-6, 6), travelStyle(), hopJump() * (s.mood === 'lonely' ? 0.9 : 1));
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
      const p = pointerRef.current;
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

      // watching: lean toward the pointer (further into a pet); when exploring, sweep a slow look around
      const watching = (s.mood === 'curious' || s.mood === 'happy') && p && pDist < 340 && s.mode !== 'sleep' && s.mode !== 'carried';
      let lookTarget = watching ? clamp((p!.x - cx) / (hovering ? 70 : 200), -1, 1) : 0;
      if (s.mode === 'inspect') lookTarget = Math.sin(secs * 1.6 + s.phase);
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
            s.z += (16 + Math.sin(secs * 2.2 + s.phase) * 9 - s.z) * Math.min(1, dt * 6);
            s.vx *= Math.pow(0.25, dt);
            s.vy *= Math.pow(0.25, dt);
            s.x = clamp(s.x + (s.vx + Math.sin(secs * 0.6 + s.phase) * 1.4) * dt, BAND.minX, BAND.maxX);
            s.y = clamp(s.y + (s.vy + Math.cos(secs * 0.5 + s.phase) * 0.5) * dt, BAND.minY, BAND.maxY);
          } else {
            s.z += (0 - s.z) * Math.min(1, dt * 8); // settle softly after a float
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
            decide(p);
            if (s.mode === 'idle') s.t = idleTime();
          }
          break;
        }
        case 'inspect': {
          // exploring: sweeping a slow look around, a curious sniff-bob now and then
          syTarget = 1.03 + Math.sin(secs * 3 + s.phase) * 0.03;
          s.tilt += (Math.sin(secs * 1.6 + s.phase) * 8 - s.tilt) * 0.1;
          s.z += ((pers.float ? 16 + Math.sin(secs * 2.2 + s.phase) * 9 : 0) - s.z) * Math.min(1, dt * 6);
          s.sniff -= dt;
          if (s.sniff <= 0) {
            s.sniff = rand(0.8, 1.4);
            s.syv += 3.5;
          }
          if (s.t <= 0 || l.targeted || l.dragging || (p && pAge < 3 && pDist < 110)) {
            s.mode = 'idle';
            s.inspecting = null;
            s.t = rand(0.3, 0.8);
          }
          break;
        }
        case 'crouch': {
          syTarget = 0.86;
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
          syTarget = 1 + clamp(Math.abs(s.vz) / ref, 0, 1) * 0.16;
          s.tilt += (clamp(s.vx * 0.35, -14, 14) - s.tilt) * 0.2;
          if (s.thrown) s.tilt += Math.sin(secs * 20) * 1.2; // tumbling
          if (s.z <= 0 && s.vz < 0) {
            const impact = -s.vz;
            s.z = 0;
            if (s.thrown && impact > 170) {
              s.vz = impact * 0.5; // bounce again
              s.vx *= 0.7;
              s.vy *= 0.7;
              s.sy = 0.82;
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
              s.t = s.dizzy > 0 ? 0.25 : 0.1;
              s.sy = impact > 400 ? 0.76 : 0.87; // landing squash; the spring lets it wobble back
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
              s.t = 0.04;
            } else if (s.bounceQ.length && s.dizzy <= 0) {
              bounceNext();
            } else if (s.hasTarget || s.explore) {
              finishTrip(false);
            } else {
              s.mode = 'idle';
              s.hasTarget = false;
              s.t = l.targeted ? rand(0.25, 0.55) : Math.max(idleTime(), s.dizzy > 0 ? s.dizzy : 0);
            }
          }
          break;
        }
        case 'glide': {
          // floating between places: ease up, cruise with a bob, ease down; then bounce on arrival
          const dx = s.fx - s.x;
          const dy = s.fy - s.y;
          const dist = Math.hypot(dx, dy);
          const maxSpeed = l.dragging ? 32 : s.mood === 'lonely' ? 8 : s.mood === 'calm' ? 16 : 19;
          if (dist < 0.6 || !s.hasTarget) {
            finishTrip(true);
          } else {
            const sp = Math.min(maxSpeed, dist * 1.5);
            const k = Math.min(1, dt * 2.2);
            s.vx += ((dx / dist) * sp - s.vx) * k;
            s.vy += ((dy / dist) * sp - s.vy) * k;
          }
          s.x = clamp(s.x + s.vx * dt, BAND.minX, BAND.maxX);
          s.y = clamp(s.y + s.vy * dt, BAND.minY, BAND.maxY);
          s.tilt += (clamp(s.vx * 0.6, -12, 12) - s.tilt) * 0.12;
          const hoverH = pers.float ? 16 + Math.sin(secs * 2.6 + s.phase) * 9 : 15 + Math.sin(secs * 3 + s.phase) * 5;
          s.z += (hoverH - s.z) * Math.min(1, dt * 5);
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

      // Jelly: squash and stretch follow a soft damped spring, so every hop, landing and poke wobbles
      if (pressed.current && s.mode !== 'carried') syTarget = 0.8; // being squished
      s.syv += ((syTarget - s.sy) * 210 - s.syv * 11) * dt;
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

  const needed = xpToNextLevel(slime.level);
  const maxed = slime.level >= 50;
  const pct = maxed ? 100 : Math.min(100, (slime.xp / needed) * 100);
  const start = sim.current;

  // No pointer handlers here: the Sanctuary's controller finds slimes by geometry (see HabitatViewer)
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
        className="absolute inset-0 select-none outline-none pointer-events-none"
        style={{ transformOrigin: '50% 100%', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.25))' }}
      >
        {sleeping && (
          <div className="absolute top-[4%] left-[68%] z-30 pointer-events-none text-lg animate-pulse">💤</div>
        )}
        {bubble && !sleeping && (
          <div className="absolute z-30 pointer-events-none top-[2%] left-[70%] rounded-full bg-white/90 px-1.5 py-0.5 text-sm leading-none shadow animate-in zoom-in-50 fade-in duration-300">
            {bubble}
          </div>
        )}

        {(selected || targeted) && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1">
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
                  const dist = 34 + ((i * 37) % 28);
                  return (
                    <span
                      key={i}
                      className="absolute text-2xl"
                      style={{
                        ['--dx' as string]: `${Math.cos(angle) * dist}px`,
                        ['--dy' as string]: `${Math.sin(angle) * dist - 16}px`,
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
  const [manageOpen, setManageOpen] = useState(false);
  const fxId = useRef(0);
  const attractRef = useRef<{ x: number; y: number } | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerSample | null>(null);
  const histRef = useRef<PointerSample[]>([]);
  const apiRef = useRef<Record<string, SlimeApi>>({});
  const draggingFoodRef = useRef(false);
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
    if (c) addFx({ kind: 'burst', x: c.x, y: c.y - 24, emojis: ['💖'], count: quiet ? 2 : 3 }, 1100);
    if (!quiet) audioEngine.playSfx('tap');
    // Petting and poking make the sanctuary happier (rate limited in the rules, so spamming does nothing extra)
    dispatch({ type: 'SANCT_JOY', habitatId, source: 'pet', now: Date.now(), rolls: Array.from({ length: 12 }, Math.random) });
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
      dispatch({ type: 'SANCT_JOY', habitatId, source: 'feed', now: Date.now(), rolls: Array.from({ length: 12 }, Math.random) });
      setEatNonce(n => ({ ...n, [slimeId]: (n[slimeId] || 0) + 1 }));
      const at = centerOf(slimeId) ?? c;
      addFx({ kind: 'burst', x: at.x, y: at.y - 20, emojis: ['💖', '✨'], count: 6 });
      addFx({ kind: 'text', x: at.x + 35, y: at.y - 45, text: `+${info.xpValue} XP`, color: '#7CFFB2' }, 1300);
    }, 300);
    setTimeout(() => triggerDialogue('firstFeed'), 2400);
  };

  // One controller for every pointer interaction with the slimes. It finds the slime under the
  // pointer by geometry instead of relying on element hit-testing, so it keeps working while a
  // slime is moving, tilted, squashed or has anything transparent over it.
  draggingFoodRef.current = dragging;
  useEffect(() => {
    const press = { current: null as null | { id: string | null; startX: number; startY: number; moved: boolean } };
    let hoverId: string | null = null;
    const isUi = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('button, a, input, textarea, select, [role="dialog"], [data-sanctuary-ui]');
    const inScene = (x: number, y: number) => {
      const r = sceneRef.current?.getBoundingClientRect();
      return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const setCursor = (c: string) => { if (sceneRef.current) sceneRef.current.style.cursor = c; };
    const setHover = (id: string | null) => {
      if (id === hoverId) return;
      if (hoverId) apiRef.current[hoverId]?.setHover(false);
      if (id) apiRef.current[id]?.setHover(true);
      hoverId = id;
    };

    const down = (e: PointerEvent) => {
      if (e.button !== 0 || draggingFoodRef.current) return;
      if (!inScene(e.clientX, e.clientY) || isUi(e.target)) return;
      const id = slimeAt(e.clientX, e.clientY);
      window.getSelection()?.removeAllRanges();
      press.current = { id, startX: e.clientX, startY: e.clientY, moved: false };
      if (id) {
        apiRef.current[id]?.setPressed(true);
        e.preventDefault();
      }
    };
    const move = (e: PointerEvent) => {
      const now = performance.now();
      pointerRef.current = { x: e.clientX, y: e.clientY, t: now };
      const hist = histRef.current;
      hist.push({ x: e.clientX, y: e.clientY, t: now });
      while (hist.length > 1 && now - hist[0].t > 140) hist.shift();

      const pr = press.current;
      if (pr?.id && !pr.moved && Math.hypot(e.clientX - pr.startX, e.clientY - pr.startY) > 6) {
        pr.moved = true;
        apiRef.current[pr.id]?.setPressed(false);
        apiRef.current[pr.id]?.carry();
      }
      if (e.pointerType === 'mouse' && !draggingFoodRef.current && inScene(e.clientX, e.clientY) && !isUi(e.target)) {
        const h = pr?.moved ? pr.id : slimeAt(e.clientX, e.clientY);
        setHover(h);
        setCursor(pr?.moved ? 'grabbing' : h ? 'grab' : '');
      } else {
        setHover(null);
        setCursor('');
      }
    };
    const up = () => {
      const pr = press.current;
      press.current = null;
      if (!pr) return;
      if (pr.id) {
        const api = apiRef.current[pr.id];
        api?.setPressed(false);
        if (pr.moved) api?.drop();
        else {
          setSelectedId(pr.id); // a tap: pick it for feeding, and it reacts
          api?.poke();
        }
      } else if (!pr.moved) {
        setSelectedId(null); // tapped empty ground
      }
      setCursor(hoverId ? 'grab' : '');
    };

    window.addEventListener('pointerdown', down, true);
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);
    return () => {
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', up, true);
    };
  }, [slimeAt]);

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
          addFx({ kind: 'text', x: c.x - 80, y: c.y - 92, text: 'LEVEL UP!', color: '#FFD84D', big: true }, 2000);
          addFx({ kind: 'text', x: c.x - 25, y: c.y - 58, text: `Lv ${s.level}`, color: '#ffffff' }, 1800);
          if (evolved) {
            addFx({ kind: 'text', x: c.x - 70, y: c.y - 130, text: `${getStage(s.level) === 'teen' ? 'TEEN' : 'ADULT'} FORM!`, color: '#E7B4FF', big: true }, 2200);
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
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <div title="Joy: fill it for a gift. Petting and feeding help." className="flex items-center gap-2">
            <Heart size={26} />
            <div className="rounded-full overflow-hidden" style={{ width: 120, height: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.4)' }}>
              <div className="h-full" style={{ width: `${((habitat.joy ?? 0) / JOY_MAX) * 100}%`, background: 'linear-gradient(90deg,#ff9ac8,#ff4f9d)', transition: 'width 0.6s' }} />
            </div>
          </div>
          {(habitat.gifts?.length ?? 0) > 0 && (
            <button
              onClick={() => {
                (habitat.gifts ?? []).forEach((g, i) => {
                  dispatch({ type: 'SANCT_COLLECT', habitatId, giftId: g.id });
                  addFx({ kind: 'text', x: window.innerWidth / 2 - 80, y: 170 + i * 28, text: giftLabel(g), color: '#ffe14d' }, 1600);
                });
                audioEngine.playSfx('collect');
              }}
              className="rounded-full px-3 py-1 text-sm font-black text-white bg-gradient-to-r from-[#FF7EB6] to-[#FF1493] hover:scale-105 transition-transform animate-pulse"
              aria-label="Collect gifts"
            >
              🎁 {habitat.gifts?.length}
            </button>
          )}
          <button onClick={() => setManageOpen(true)} className="rounded-full px-3 py-1 text-sm font-black text-[#4a2f17] bg-[#f6e8c3] border-2 border-[#4a2f17] hover:scale-105 transition-transform" aria-label="Manage sanctuary">⚙ Manage</button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: theme.bgImage ? `url("${theme.bgImage}")` : layers.backdrop, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {!theme.bgImage && <div className="absolute inset-0" style={{ background: layers.midground }} />}
        {!theme.bgImage && <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: layers.ground }} />}

        {/* Tap empty ground to deselect; slimes are handled by the pointer controller above */}
        <div ref={sceneRef} className="absolute inset-0" style={{ pointerEvents: 'auto', touchAction: 'none' }}>
          {(habitat.decor ?? []).map((id, i) => decorById(id) && (
            <ArtImg key={id} file={`decor_${id}.png`} className="absolute pointer-events-none" style={{ left: `${[12, 84, 28, 68][i % 4]}%`, top: `${[58, 60, 52, 54][i % 4]}%`, width: '11%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 8px 6px rgba(0,0,0,0.35))', zIndex: 1 }} />
          ))}
          {assignedSlimes.map(slime => (
            <BouncingSlime
              key={slime.id}
              slime={slime}
              selected={selectedId === slime.id}
              targeted={targetId === slime.id}
              dragging={dragging}
              wantsFood={hasFood && slime.level < 50}
              landmarks={LANDMARKS[habitat.element] ?? []}
              attractRef={attractRef}
              pointerRef={pointerRef}
              histRef={histRef}
              apiRef={apiRef}
              eatNonce={eatNonce[slime.id] || 0}
              onPoke={handlePoke}
            />
          ))}

          {assignedSlimes.length < habitat.capacity && (
            <div className="absolute bottom-1/4 left-[15%] z-[150]" data-sanctuary-ui>
              <button
                onClick={() => setGalleryOpen(true)}
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
      {manageOpen && habitat && <SanctuaryPanel habitat={habitat} sw={Math.min(window.innerWidth, 1100)} onClose={() => setManageOpen(false)} />}
    </div>
  );
}
