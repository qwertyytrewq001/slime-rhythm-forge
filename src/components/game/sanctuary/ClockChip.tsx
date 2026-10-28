import React, { useEffect, useState } from 'react';
import { DayInfo, clockText, nowForDay } from '@/utils/sanctuaryCore';

const ART = `${import.meta.env.BASE_URL}altar/`;

/**
 * The in-game clock: a painted dial with hands that move with the real time, a small badge for the phase of
 * the day (dawn, day, afternoon, sunset, evening, night), the time, and the phase name.
 */
export const ClockChip: React.FC<{ day: DayInfo; sw: number }> = ({ day, sw }) => {
  const [now, setNow] = useState(() => nowForDay());
  useEffect(() => {
    const t = setInterval(() => setNow(nowForDay()), 10_000);
    return () => clearInterval(t);
  }, []);
  const hourDeg = ((now.getHours() % 12) + now.getMinutes() / 60) * 30;
  const minDeg = now.getMinutes() * 6;
  const size = sw * 0.052;

  const hand = (file: string, deg: number, length: number) => (
    <img
      src={`${ART}${file}`}
      alt=""
      draggable={false}
      className="absolute pointer-events-none"
      style={{ left: '50%', top: '50%', height: size * length, width: 'auto', transform: `translate(-50%, -92%) rotate(${deg}deg)`, transformOrigin: '50% 92%', imageRendering: 'auto', transition: 'transform 0.6s ease-out' }}
    />
  );

  return (
    <div
      className="flex items-center rounded-full shadow-lg"
      title={`${day.label}. The sanctuaries follow your own clock.`}
      style={{ background: 'rgba(30,14,40,0.82)', border: '3px solid #f2d68a', color: '#fff3d0', gap: sw * 0.006, padding: `${sw * 0.003}px ${sw * 0.014}px ${sw * 0.003}px ${sw * 0.004}px`, fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}
    >
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <img src={`${ART}time_clock.png`} alt="" draggable={false} className="w-full h-full block" style={{ imageRendering: 'auto' }} />
        {hand('time_hand_short.png', hourDeg, 0.3)}
        {hand('time_hand_long.png', minDeg, 0.4)}
        <span className="absolute rounded-full" style={{ left: '50%', top: '50%', width: size * 0.09, height: size * 0.09, transform: 'translate(-50%,-50%)', background: '#b8862a' }} />
        <img src={`${ART}time_${day.phase}.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ right: '-26%', bottom: '-18%', width: size * 0.56, imageRendering: 'auto', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }} />
      </div>
      <div className="leading-none" style={{ marginLeft: size * 0.22 }}>
        <div className="font-bold" style={{ fontSize: sw * 0.0135 }}>{clockText(now)}</div>
        <div className="font-semibold opacity-80" style={{ fontSize: sw * 0.0092 }}>{day.label}</div>
      </div>
    </div>
  );
};
