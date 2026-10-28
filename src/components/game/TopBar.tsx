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

/** A painted wooden sign with an icon medallion; the label sits in the empty wood. */
const NavPlate: React.FC<{ art: string; label: string; onClick?: () => void; badge?: number; badgeLabel?: string }> = ({ art, label, onClick, badge, badgeLabel }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="relative transition-transform duration-150 hover:scale-105 hover:brightness-110 active:scale-95 outline-none"
    style={{ width: 'clamp(170px, 17vw, 250px)', background: 'transparent', border: 'none', padding: 0 }}
  >
    <img src={`${ART}nav_${art}.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.45))' }} />
    <span
      className="absolute flex items-center justify-center font-bold text-center"
      style={{ left: '31%', right: '8%', top: 0, bottom: 0, fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif", fontSize: 'clamp(11px, 1.05vw, 16px)', color: '#fff3d0', textShadow: '0 2px 0 rgba(40,18,6,0.85), 0 0 6px rgba(0,0,0,0.5)', letterSpacing: '0.04em', lineHeight: 1.05 }}
    >
      {label}
    </span>
    {badge ? (
      <span
        aria-label={badgeLabel}
        className="absolute rounded-full text-white font-bold flex items-center justify-center"
        style={{ top: -6, right: -4, minWidth: 22, height: 22, padding: '0 6px', fontSize: 12, background: '#e8453c', border: '2px solid #fff', fontFamily: "'Fredoka', sans-serif", boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
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
    <div className="flex justify-between px-4 pt-2 pb-[135px] bg-transparent relative z-[60] pointer-events-none">
      <div className="flex items-start gap-3 pointer-events-auto">
        {home ? (
          <>
            <NavPlate art="sanctuaries" label="SANCTUARIES" onClick={onOpenSanctuaries} badge={giftsWaiting} badgeLabel={`${giftsWaiting} gifts waiting`} />
            <NavPlate art="farm" label="FARM" onClick={onOpenFarm} badge={readyCrops} badgeLabel={`${readyCrops} crops ready`} />
          </>
        ) : (
          <NavPlate art="altar" label="ALTAR" onClick={onBackToAltar} />
        )}
      </div>
      <div className="flex items-start gap-3 pointer-events-auto">
        {home && (
          <>
            <NavPlate art="den" label="BREEDING DEN" onClick={onOpenBreedingDen} />
            <NavPlate art="battle" label="BATTLE MAP" onClick={onOpenBattle} />
          </>
        )}
      </div>
    </div>
  );
}
