import React, { useEffect, useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { isReady } from '../../utils/farmCore';
import { totalGifts } from '../../utils/sanctuaryCore';

interface TopBarProps {
  onBackToAltar?: () => void;
  onOpenHabitats?: () => void;
  onOpenBattle?: () => void;
  onOpenSanctuaries?: () => void;
  onOpenBreedingDen?: () => void;
  onOpenFarm?: () => void;
  currentView?: 'breeding' | 'breedingDen' | 'habitats' | 'battleMap' | 'sanctuaries' | 'hatchery' | 'farm';
}

const ART = `${import.meta.env.BASE_URL}altar/`;

/** Where each plate's medallion is (percent of the plate): measured from the images. h is the plate image height at 520 px wide. */
const PLATE: Record<string, { cx: number; cy: number; d: number; h: number }> = {
  sanctuaries: { cx: 22.31, cy: 46.26, d: 25.31, h: 227 },
  farm: { cx: 22.31, cy: 46.26, d: 25.31, h: 227 },
  den: { cx: 22.5, cy: 46.64, d: 24.92, h: 223 },
  battle: { cx: 23.27, cy: 46.15, d: 25.69, h: 234 },
  altar: { cx: 23.08, cy: 46.15, d: 25.69, h: 234 },
};

/** A painted wooden sign with an icon medallion; the label sits in the empty wood. */
export const NavPlate: React.FC<{ art: string; icon: string; color: string; label: string; onClick?: () => void; badge?: number; badgeLabel?: string }> = ({ art, icon, color, label, onClick, badge, badgeLabel }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="relative transition-transform duration-150 hover:scale-105 hover:brightness-110 active:scale-95 outline-none"
    style={{ width: 'clamp(150px, 17vw, 250px)', background: 'transparent', border: 'none', padding: 0 }}
  >
    <img src={`${ART}nav_${art}.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.45))' }} />
    {/* the plate image already has a clean cream medallion (measured centre and size below); only the icon goes on top */}
    <img src={`${import.meta.env.BASE_URL}${encodeURI(icon)}`} alt="" draggable={false} className="absolute pointer-events-none" style={{ left: `${PLATE[art].cx}%`, top: `${PLATE[art].cy}%`, width: `${PLATE[art].d * 0.84}%`, height: `${PLATE[art].d * 0.84 * (520 / PLATE[art].h)}%`, objectFit: 'contain', transform: 'translate(-50%, -50%)', imageRendering: 'auto' }} />
    <span
      className="absolute flex items-center justify-center text-center text-game-ui"
      style={{ left: '36%', right: '5%', top: 0, bottom: 0, fontSize: 'clamp(10px, 1vw, 15px)', color, letterSpacing: '0.06em', lineHeight: 1.05, textShadow: '0 2px 0 rgba(20,10,5,0.9), 0 0 5px rgba(0,0,0,0.6)' }}
    >
      {label}
    </span>
    {badge ? (
      <span
        aria-label={badgeLabel}
        className="absolute rounded-full text-white font-bold flex items-center justify-center"
        style={{ top: 2, right: 2, minWidth: 22, height: 22, padding: '0 6px', fontSize: 12, background: '#e8453c', border: '2px solid #fff', fontFamily: "'Fredoka', sans-serif", boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
      >
        {badge}
      </span>
    ) : null}
  </button>
);

export function TopBar({ onBackToAltar, onOpenSanctuaries, onOpenBattle, onOpenBreedingDen, onOpenFarm, currentView }: TopBarProps) {
  const { state } = useGameState();
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);
  const giftsWaiting = totalGifts(state.habitats) + (state.visitor && !state.visitor.done ? 1 : 0);
  const readyCrops = state.farmPlots.filter(p => isReady(p, nowMs)).length;

  const home = currentView === 'breeding';

  return (
    <div className="flex justify-between px-4 pt-3 pb-[135px] sm:pb-[135px] bg-transparent relative z-[60] pointer-events-none">
      <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 pointer-events-auto">
        {home ? (
          <>
            <NavPlate art="sanctuaries" icon="ui/navicon_habitats.png" color="#c4ffb2" label="SANCTUARIES" onClick={onOpenSanctuaries} badge={giftsWaiting} badgeLabel={`${giftsWaiting} gifts waiting`} />
            <NavPlate art="farm" icon="ui/navicon_farm.png" color="#ffcf6b" label="FARM" onClick={onOpenFarm} badge={readyCrops} badgeLabel={`${readyCrops} crops ready`} />
          </>
        ) : (
          <NavPlate art="altar" icon="ui/navicon_altar.png" color="#b2ebff" label="ALTAR" onClick={onBackToAltar} />
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 pointer-events-auto">
        {home && (
          <>
            <NavPlate art="den" icon="ui/navicon_altar.png" color="#b2ebff" label="BREEDING DEN" onClick={onOpenBreedingDen} />
            <NavPlate art="battle" icon="ui/navicon_battle.png" color="#ffe066" label="BATTLE MAP" onClick={onOpenBattle} />
          </>
        )}
      </div>
    </div>
  );
}
