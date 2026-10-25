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
  frozen: boolean;
  eatNonce: number;
  onSelect: (id: string) => void;
}

const GROUND_LEVEL = 75;

function BouncingSlime({ slime, selected, targeted, frozen, eatNonce, onSelect }: BouncingSlimeProps) {
  const [position, setPosition] = useState({ x: Math.random() * 60 + 20, y: 60 });
  const [velocity, setVelocity] = useState({ x: (Math.random() - 0.5) * 1.5, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [eating, setEating] = useState(false);
  const startTime = useRef(Date.now() + Math.random() * 2000);
  const holdRef = useRef(false);
  holdRef.current = frozen || selected;

  // Chomp whenever fed
  useEffect(() => {
    if (!eatNonce) return;
    setEating(true);
    const t = setTimeout(() => setEating(false), 600);
    return () => clearTimeout(t);
  }, [eatNonce]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      setPosition(prev => {
        // Selected slimes (and everyone while food is being dragged) settle on the ground and hold still
        if (holdRef.current) {
          const vx = velocity.x * 0.7;
          setVelocity({ x: vx, y: 0 });
          setRotation(0);
          setScale(1);
          return { x: Math.min(90, Math.max(10, prev.x + vx)), y: prev.y + (GROUND_LEVEL - prev.y) * 0.2 };
        }

        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelX = velocity.x;
        let newVelY = velocity.y;

        const element = slime.element;
        switch(element) {
          case 'fire':
          case 'electric':
            newVelX += (Math.random() - 0.5) * 0.4;
            newVelY += (Math.random() - 0.5) * 0.4;
            break;
          case 'water':
          case 'wind':
            newVelY = Math.sin(elapsed * 2) * 0.5;
            break;
          case 'plant':
          case 'earth':
            newVelX *= 0.98;
            break;
          default:
            newVelY += 0.12;
        }

        if (!['water', 'wind'].includes(element)) {
          newVelY += 0.15;
        }

        if (newX < 10 || newX > 90) {
          newVelX *= -0.8;
          newX = newX < 10 ? 10 : 90;
        }

        if (newY > GROUND_LEVEL) {
          newVelY *= -0.6;
          newY = GROUND_LEVEL;
          if (Math.random() > 0.97) newVelY = -3 - (Math.random() * 2);
        }

        newVelX *= 0.99;
        newVelY *= 0.99;

        setVelocity({ x: newVelX, y: newVelY });
        setRotation(newVelX * 10);
        setScale(1 + Math.sin(elapsed * 4) * 0.05);

        return { x: newX, y: newY };
      });
    }, 30);

    return () => clearInterval(interval);
  }, [velocity, slime.element]);

  const needed = xpToNextLevel(slime.level);
  const maxed = slime.level >= 50;
  const pct = maxed ? 100 : Math.min(100, (slime.xp / needed) * 100);

  return (
    <div
      className="absolute transition-none cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onSelect(slime.id); }}
      data-slime-id={slime.id}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        zIndex: selected || targeted ? 25 : 20,
        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))',
        pointerEvents: 'auto'
      }}
    >
      {(selected || targeted) && (
        <div
          className={`absolute left-1/2 bottom-2 -translate-x-1/2 h-6 rounded-[50%] blur-[3px] pointer-events-none ${targeted ? 'w-36 bg-[#7CFFB2]/70' : 'w-28 bg-[#FF7EB6]/60 animate-pulse'}`}
        />
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
        imageRendering: 'pixelated',
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

export function HabitatViewer({ habitatId, onClose }: HabitatViewerProps) {
  const { state, dispatch } = useGameState();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [eatNonce, setEatNonce] = useState<Record<string, number>>({});
  const [fx, setFx] = useState<Fx[]>([]);
  const fxId = useRef(0);
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

  const handleFeed = (food: SlimeFoodType, slimeId: string, origin: { x: number; y: number }) => {
    const slime = state.slimes.find(s => s.id === slimeId);
    if (!slime) return;
    const info = SLIME_FOODS[food];
    const c = centerOf(slimeId) ?? origin;

    if (slime.level >= 50) {
      addFx({ kind: 'text', x: c.x - 70, y: c.y - 90, text: 'Already max level!', color: '#ffffff' }, 1400);
      return;
    }
    const owned = state.inventory[food] || 0;
    if (owned < 1 && state.goo < info.cost) {
      addFx({ kind: 'text', x: c.x - 50, y: c.y - 90, text: `Need ${info.cost} 💧`, color: '#ff8a8a' }, 1400);
      return;
    }

    setSelectedId(slimeId);
    audioEngine.playSfx('collect');
    addFx({ kind: 'fly', x: origin.x, y: origin.y, toX: c.x, toY: c.y, img: foodSpriteUrl(food) }, 450);

    // The slime eats when the food reaches it
    setTimeout(() => {
      const live = stateRef.current;
      const have = live.inventory[food] || 0;
      if (have < 1 && live.goo < info.cost) return;
      dispatch({ type: 'FEED_SLIME_XP', slimeId, foodType: food, fromInventory: have > 0 });
      setEatNonce(n => ({ ...n, [slimeId]: (n[slimeId] || 0) + 1 }));
      const at = centerOf(slimeId) ?? c;
      addFx({ kind: 'burst', x: at.x, y: at.y - 20, emojis: ['💖', '✨'], count: 6 });
      addFx({ kind: 'text', x: at.x + 35, y: at.y - 45, text: `+${info.xpValue} XP`, color: '#7CFFB2' }, 1300);
    }, 300);
    setTimeout(() => triggerDialogue('firstFeed'), 2400);
  };

  // Celebrate level-ups (and evolutions) on the slime itself, whatever caused them
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
    <div className="fixed inset-0 z-[10000] flex flex-col bg-black/80" style={{ pointerEvents: 'auto' }}>
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
              frozen={dragging}
              eatNonce={eatNonce[slime.id] || 0}
              onSelect={setSelectedId}
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
        .slime-eat { animation: slimeEat .55s ease-out; }
        .slime-target { animation: slimeTarget .5s ease-in-out infinite; filter: brightness(1.15) drop-shadow(0 0 14px rgba(124,255,178,.9)); }
      `}</style>
    </div>
  );
}
