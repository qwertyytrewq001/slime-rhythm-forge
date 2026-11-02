import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { audioEngine } from '@/utils/audioEngine';
import { ELEMENT_TIERS, ELEMENT_DISPLAY_NAMES } from '@/data/traitData';
import { Emblem } from './sanctuary/sanctArt';

const U = `${import.meta.env.BASE_URL}ui/`;
const A = `${import.meta.env.BASE_URL}altar/`;
const FRED = "'Fredoka', 'Trebuchet MS', sans-serif";
const INK = '#4a2f17';

const LevelBadge = ({ n, big }: { n: number; big?: boolean }) => (
  <div className="flex items-center justify-center font-bold text-white rounded-full" style={{ width: big ? 92 : 64, height: big ? 92 : 64, fontSize: big ? 44 : 30, background: big ? 'radial-gradient(circle at 35% 30%, #ffe98a, #e09a1a)' : 'radial-gradient(circle at 35% 30%, #e8dcc0, #b9a57a)', border: `${big ? 5 : 4}px solid ${INK}`, boxShadow: big ? '0 0 22px rgba(255,214,90,0.75), 0 6px 10px rgba(0,0,0,0.35)' : '0 4px 8px rgba(0,0,0,0.3)', WebkitTextStroke: `${big ? 5 : 4}px ${INK}`, paintOrder: 'stroke fill', fontFamily: FRED }}>{n}</div>
);

export function PlayerLevelUpPopup() {
  const { state, dispatch } = useGameState();
  const [isVisible, setIsVisible] = useState(false);
  const [localLevelUp, setLocalLevelUp] = useState<typeof state.lastPlayerLevelUp>(null);

  useEffect(() => {
    if (state.lastPlayerLevelUp && !isVisible) {
      setLocalLevelUp(state.lastPlayerLevelUp);
      setIsVisible(true);
      audioEngine.playSfx('achievement');
      // Keep it open until they click "Continue"
    }
  }, [state.lastPlayerLevelUp]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      dispatch({ type: 'CLEAR_PLAYER_LEVEL_UP' });
      setLocalLevelUp(null);
    }, 500);
  };

  if (!localLevelUp && !isVisible) return null;

  const level = localLevelUp?.level || 0;
  const unlockedElements = level === 6 ? ELEMENT_TIERS[2] : level === 11 ? ELEMENT_TIERS[3] : [];
  const hasUnlocks = unlockedElements.length > 0;

  return (
    <div className={`fixed inset-0 z-[10100] flex items-center justify-center transition-all duration-700 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ fontFamily: FRED }}>
      <style>{`@keyframes lvlBanner { 0% { opacity: 0; transform: translateY(-30px) scale(0.7) } 60% { transform: translateY(4px) scale(1.04) } 100% { opacity: 1; transform: none } } @keyframes lvlPop { 0% { transform: scale(0.4) } 60% { transform: scale(1.18) } 100% { transform: scale(1) } }`}</style>
      <div className="absolute inset-0 bg-[#1d1235]/70 backdrop-blur-sm" onClick={handleClose} />

      <div className={`relative w-full mx-4 transition-all duration-700 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'}`} style={{ maxWidth: 520, maxHeight: '94vh' }}>
        {/* ribbon straddling the top of the card */}
        <div className="relative mx-auto pointer-events-none" style={{ width: 'min(92%, 470px)', marginBottom: -34, zIndex: 3, animation: 'lvlBanner 0.6s ease-out both' }}>
          <img src={`${A}love_banner.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))' }} />
          <span className="absolute inset-0 flex items-center justify-center font-bold text-center px-10" style={{ fontSize: 'clamp(18px, 4vw, 27px)', color: '#fff3d0', WebkitTextStroke: '5px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.05em', lineHeight: 1.05 }}>Resonance Increased!</span>
        </div>

        <div className="relative rounded-[28px] overflow-hidden text-center" style={{ background: 'linear-gradient(#f6e8c3,#ecd9a8)', border: `5px solid ${INK}`, boxShadow: '0 22px 50px rgba(0,0,0,0.5)', color: INK, padding: '52px 28px 24px' }}>
          <div className="font-semibold opacity-75" style={{ fontSize: 15, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Your spirit has deepened</div>

          <div className="flex items-center justify-center gap-5 mb-4">
            <div className="flex flex-col items-center"><span className="text-xs font-bold opacity-60 mb-1 tracking-widest">OLD</span><LevelBadge n={level - 1} /></div>
            <img src={`${U}dlg_next.png`} alt="" draggable={false} style={{ width: 46, imageRendering: 'auto' }} />
            <div className="flex flex-col items-center"><span className="text-xs font-bold mb-1 tracking-widest" style={{ color: '#b8660e' }}>NEW</span><div style={{ animation: 'lvlPop 0.6s ease-out 0.3s both' }}><LevelBadge n={level} big /></div></div>
          </div>

          {hasUnlocks ? (
            <div className="rounded-2xl text-left" style={{ background: 'rgba(255,255,255,0.5)', border: `2px solid ${INK}33`, padding: '12px 14px' }}>
              <div className="font-bold text-center mb-2" style={{ fontSize: 16 }}>New eggs and sanctums unlocked!</div>
              <div className="flex flex-wrap justify-center gap-2">
                {unlockedElements.map(e => (
                  <span key={e} className="inline-flex items-center gap-1 font-bold rounded-full" style={{ background: '#fff7dc', border: `2px solid ${INK}`, padding: '2px 10px 2px 4px', fontSize: 13 }}>
                    <Emblem element={e} size={26} />{ELEMENT_DISPLAY_NAMES[e]}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl" style={{ background: 'rgba(255,255,255,0.5)', border: `2px solid ${INK}33`, padding: '12px 16px', fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>
              Your resonance grows with every discovery. Keep breeding to unlock deeper mysteries of the forge.
            </div>
          )}

          <button onClick={handleClose} className="relative mt-4 mx-auto block hover:scale-105 active:scale-95 transition-transform" style={{ width: 'min(100%, 270px)', background: 'transparent', border: 'none', padding: 0 }}>
            <img src={`${A}ui_btn_begin.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 0 10px rgba(190,120,255,0.7))' }} />
            <span className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontSize: 20, color: '#fff', WebkitTextStroke: '3px #4a1d7a', paintOrder: 'stroke fill', letterSpacing: '0.05em' }}>Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
