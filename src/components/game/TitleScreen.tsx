import React, { useEffect, useState } from 'react';
import { audioEngine } from '@/utils/audioEngine';
import { Credits } from './Credits';

interface TitleScreenProps {
  onPlay: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

const ART = `${import.meta.env.BASE_URL}altar/`;

/**
 * The first thing a player sees. It sits over the looping altar video, and pressing Play is the click
 * browsers need before they allow any sound, so music and effects work from the first moment.
 */
export function TitleScreen({ onPlay, muted, onToggleMute }: TitleScreenProps) {
  const [leaving, setLeaving] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [playFailed, setPlayFailed] = useState(false);

  const [credits, setCredits] = useState(false);

  const start = () => {
    if (leaving) return;
    audioEngine.resume();
    setLeaving(true);
    setTimeout(onPlay, 450);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (credits) { if (e.key === 'Escape') setCredits(false); return; } if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving, credits]);

  return (
    <div
      className="fixed inset-0 z-[10050] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(18,7,38,0.45), rgba(18,7,38,0.82))', padding: '28px 0 20px', opacity: leaving ? 0 : 1, transition: 'opacity 0.45s ease', fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}
    >
      <style>{`
        @keyframes titleFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes titlePulse { 0%,100% { transform: scale(1); filter: brightness(1) } 50% { transform: scale(1.045); filter: brightness(1.18) } }
        @keyframes titleGlint { 0% { transform: translate(0,0); opacity: 0 } 25% { opacity: 1 } 100% { transform: translate(24px,-70px); opacity: 0 } }
      `}</style>

      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className="absolute rounded-full pointer-events-none" style={{ left: `${8 + ((i * 53) % 84)}%`, top: `${30 + ((i * 37) % 60)}%`, width: 5, height: 5, background: i % 2 ? '#fff3b0' : '#d9e6ff', boxShadow: '0 0 10px #fff3b0', animation: `titleGlint ${6 + (i % 4)}s ease-out ${-(i * 1.1) % 8}s infinite` }} />
      ))}

      {logoFailed ? (
        <h1 className="font-bold text-center" style={{ fontSize: 'clamp(40px, 8cqw, 96px)', color: '#ffe9a8', WebkitTextStroke: '6px #3a2150', paintOrder: 'stroke fill', animation: 'titleFloat 4s ease-in-out infinite' }}>RareSlime Forge</h1>
      ) : (
        <img src={`${ART}title_logo.png`} alt="RareSlime Forge" draggable={false} onError={() => setLogoFailed(true)} style={{ width: 'auto', height: 'auto', maxWidth: 'min(78cqw, 820px)', maxHeight: '44cqh', imageRendering: 'auto', animation: 'titleFloat 4s ease-in-out infinite', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))' }} />
      )}

      <button onClick={start} aria-label="Play" className="relative outline-none" style={{ marginTop: 'clamp(12px, 4cqh, 40px)', width: 'min(56cqw, 420px, 50cqh)', animation: 'titlePulse 1.8s ease-in-out infinite', background: 'transparent', border: 'none', padding: 0 }}>
        {playFailed ? (
          <span className="block rounded-full font-bold" style={{ background: 'linear-gradient(#ff7eb6,#ff1493)', border: '4px solid #fff3c0', color: '#fff', fontSize: 34, padding: '10px 0' }}>PLAY</span>
        ) : (
          <>
            <img src={`${ART}title_btn_play.png`} alt="" draggable={false} onError={() => setPlayFailed(true)} className="w-full block" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.5))' }} />
            <span className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontSize: 'clamp(22px, 3.4cqw, 40px)', color: '#5a2a08', letterSpacing: '0.12em', textShadow: '0 2px 0 rgba(255,255,255,0.55)' }}>PLAY</span>
          </>
        )}
      </button>

      <div className="font-semibold text-white/85" style={{ marginTop: 'clamp(8px, 2cqh, 20px)', fontSize: 'clamp(11px, 1.2cqw, 15px)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Press Play, or hit Enter</div>

      <button onClick={onToggleMute} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} className="absolute outline-none hover:scale-110 transition-transform" style={{ left: 22, bottom: 22, width: 56, background: 'transparent', border: 'none', padding: 0 }}>
        <img src={`${ART}title_btn_sound_${muted ? 'off' : 'on'}.png`} alt="" draggable={false} className="w-full" style={{ imageRendering: 'auto', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))' }} />
      </button>

      <button type="button" onClick={() => setCredits(true)} className="absolute font-semibold text-white/55 hover:text-white" style={{ right: 12, bottom: 8, padding: '6px 8px', fontSize: 11, background: 'transparent', border: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>Credits</button>
      {credits && <Credits onClose={() => setCredits(false)} />}
    </div>
  );
}
