import { useEffect, useState } from 'react';
import { Slime } from '@/types/slime';
import { SlimeCanvas } from './SlimeCanvas';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS } from '@/data/traitData';

interface DiscoveryPopupProps {
  slime: Slime;
  reason: string;
  onClose: () => void;
}

export function DiscoveryPopup({ slime, reason, onClose }: DiscoveryPopupProps) {
  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ x: number; y: number; color: string; angle: number; speed: number }>>([]);

  useEffect(() => {
    setVisible(true);
    const particles = Array.from({ length: 30 }, () => ({
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      color: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#FF6347'][Math.floor(Math.random() * 6)],
      angle: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 3,
    }));
    setConfetti(particles);

    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getElementNames = () => {
    const elems = slime.elements || [slime.element];
    return elems.map(e => ELEMENT_DISPLAY_NAMES[e as keyof typeof ELEMENT_DISPLAY_NAMES] || e).join(', ');
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      style={{ fontFamily: "'Press Start 2P', cursive" }}
    >
      <div className="absolute inset-0 bg-black/70" />

      {/* Confetti */}
      {confetti.map((p, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `confetti-burst 2s ease-out forwards`,
            animationDelay: `${i * 0.03}s`,
            transform: `translate(${Math.cos(p.angle) * p.speed * 100}px, ${Math.sin(p.angle) * p.speed * 100}px)`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-scale-in">
        <div className="text-accent text-[9px] tracking-wider animate-pulse">
          NEW SPECIES UNLOCKED!
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" style={{ width: 160, height: 160, marginLeft: -16, marginTop: -16 }} />
          <SlimeCanvas slime={slime} size={128} animated />
        </div>

        <h2 className="text-primary text-xs text-center max-w-xs">
          {slime.name}
        </h2>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px]" style={{ color: RARITY_TIER_COLORS[slime.rarityTier] }}>
            {slime.rarityTier}
          </span>
          <span className="text-[8px] text-muted-foreground">
            {getElementNames()}
          </span>
        </div>

        <div className="text-muted-foreground text-[8px] text-center">
          {reason}
        </div>

        <div className="text-accent text-[9px] animate-pulse">
          +500 GOO
        </div>

        <div className="text-muted-foreground text-[7px] mt-2">
          tap to continue
        </div>
      </div>
    </div>
  );
}
