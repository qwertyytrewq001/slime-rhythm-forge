import React, { useEffect, useState } from 'react';
import { DayInfo, clockText, nowForDay } from '@/utils/sanctuaryCore';

const ART = `${import.meta.env.BASE_URL}altar/`;

/**
 * The little in-game clock: a sun or moon for the phase of the day, the time, and the phase name.
 * It looks for painted icons at public/altar/time_<phase>.png and falls back to the sun and moon
 * particles until those exist.
 */
export const ClockChip: React.FC<{ day: DayInfo; sw: number }> = ({ day, sw }) => {
  const [text, setText] = useState(() => clockText(nowForDay()));
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    const t = setInterval(() => setText(clockText(nowForDay())), 15_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => setStage(0), [day.phase]);

  const src = stage === 0 ? `${ART}time_${day.phase}.png` : `${ART}particle_${day.icon === 'moon' ? 'shadow' : 'light'}.png`;
  return (
    <div
      className="flex items-center rounded-full shadow-lg"
      title={`${day.label}. The sanctuaries follow your own clock.`}
      style={{ background: 'rgba(30,14,40,0.82)', border: '3px solid #f2d68a', color: '#fff3d0', gap: sw * 0.005, padding: `${sw * 0.0025}px ${sw * 0.011}px ${sw * 0.0025}px ${sw * 0.004}px`, fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}
    >
      {stage < 2 ? (
        <img src={src} alt="" draggable={false} onError={() => setStage(s => (s === 0 ? 1 : 2))} style={{ width: sw * 0.026, height: sw * 0.026, imageRendering: 'auto', objectFit: 'contain' }} />
      ) : (
        <span style={{ fontSize: sw * 0.018 }}>{day.icon === 'moon' ? '🌙' : '☀️'}</span>
      )}
      <div className="leading-none">
        <div className="font-bold" style={{ fontSize: sw * 0.0125 }}>{text}</div>
        <div className="font-semibold opacity-80" style={{ fontSize: sw * 0.0088 }}>{day.label}</div>
      </div>
    </div>
  );
};
