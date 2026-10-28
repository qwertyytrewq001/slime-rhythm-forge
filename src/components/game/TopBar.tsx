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
const NavPlate: React.FC<{ art: string; icon: string; color: string; label: string; onClick?: () => void; badge?: number; badgeLabel?: string }> = ({ art, icon, color, label, onClick, badge, badgeLabel }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="relative transition-transform duration-150 hover:scale-105 hover:brightness-110 active:scale-95 outline-none"
    style={{ width: 'clamp(170px, 17vw, 250px)', background: 'transparent', border: 'none', padding: 0 }}
  >
    <img src={`${ART}nav_${art}.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.45))' }} />
    {/* the old icon sits in the medallion, on a dark backing that hides the plate's own icon */}
    <span className="absolute rounded-full" style={{ left: '8.6%', top: '50%', width: '25%', aspectRatio: '1', transform: 'translateY(-50%)', background: 'radial-gradient(circle at 40% 35%, #6b4a2c, #3a2314)', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.35)' }} />
    <img src={`${import.meta.env.BASE_URL}${encodeURI(icon)}`} alt="" draggable={false} className="absolute" style={{ left: '21.1%', top: '50%', height: '104%', width: 'auto', maxWidth: '38%', objectFit: 'contain', transform: 'translate(-50%, -52%)', imageRendering: 'auto', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }} />
    <span
      className="absolute flex items-center justify-center text-center text-game-ui"
      style={{ left: '36%', right: '5%', top: 0, bottom: 0, fontSize: 'clamp(10px, 1vw, 15px)', color, letterSpacing: '0.06em', lineHeight: 1.05 }}
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
            <NavPlate art="sanctuaries" icon="habitats_icon.png" color="#c4ffb2" label="SANCTUARIES" onClick={onOpenSanctuaries} badge={giftsWaiting} badgeLabel={`${giftsWaiting} gifts waiting`} />
            <NavPlate art="farm" icon="farm_building.png" color="#ffcf6b" label="FARM" onClick={onOpenFarm} badge={readyCrops} badgeLabel={`${readyCrops} crops ready`} />
          </>
        ) : (
          <NavPlate art="altar" icon="altar_icon.png" color="#b2ebff" label="ALTAR" onClick={onBackToAltar} />
        )}
      </div>
      <div className="flex items-start gap-3 pointer-events-auto">
        {home && (
          <>
            <NavPlate art="den" icon="altar_icon.png" color="#b2ebff" label="BREEDING DEN" onClick={onOpenBreedingDen} />
            <NavPlate art="battle" icon="battlemap_icon (1).png" color="#ffe066" label="BATTLE MAP" onClick={onOpenBattle} />
          </>
        )}
      </div>
    </div>
  );
}
