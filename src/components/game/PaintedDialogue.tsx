import React, { useState } from 'react';
import { GlimCharacter } from './GlimCharacter';
import { soundtrack } from '@/utils/soundtrack';
import { useStageSize } from '@/utils/stage';

/** A quick page-turn each time the dialogue moves on, back or is skipped. */
const turn = (fn?: () => void, flip?: () => void) => () => { void soundtrack.sfx('page_turn'); flip?.(); fn?.(); };

const U = `${import.meta.env.BASE_URL}ui/`;
const FRED = "'Fredoka', 'Trebuchet MS', sans-serif";

interface PaintedDialogueProps {
  speaker: string;
  expression: string;
  /** Shown instead of Glim's face, for other speakers (for example Voss). */
  portrait?: React.ReactNode;
  text: string;
  isTyping: boolean;
  onNext: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  canGoBack?: boolean;
  index?: number;
  total?: number;
  extra?: React.ReactNode;
}

/**
 * The one dialogue box used for every Glim (and Voss) conversation: Glim at a sensible size beside a painted
 * parchment box with a name ribbon and painted next and skip buttons.
 */
export const PaintedDialogue: React.FC<PaintedDialogueProps> = ({ speaker, expression, portrait, text, isTyping, onNext, onPrev, onSkip, canGoBack, index, total, extra }) => {
  // counts page turns so each one replays the page-flip animation on the text
  const [flip, setFlip] = useState(0);
  const turned = () => setFlip(n => n + 1);
  const short = useStageSize().h < 560; // a phone held sideways: a slimmer box so the screen behind stays visible
  return (
  <div className="fixed left-0 right-0 flex justify-center items-end pointer-events-none" style={{ bottom: 14, zIndex: 9999, fontFamily: FRED, padding: '0 10px' }}>
    <style>{`@keyframes pdRise { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: none } } @keyframes pdBlink { 50% { opacity: 0 } } @keyframes pdFlip { 0% { transform: translateX(26px); opacity: 0 } 60% { opacity: 1 } 100% { transform: translateX(0); opacity: 1 } } @keyframes pdSheen { 0% { transform: translateX(-110%) } 100% { transform: translateX(110%) } }`}</style>
    <div className="relative flex items-end pointer-events-auto" style={{ width: 'min(100%, 860px)', animation: 'pdRise 0.3s ease-out' }}>
      <div className="shrink-0 pointer-events-none" style={short ? { width: 'clamp(90px, 18cqw, 140px)', height: 'clamp(90px, 18cqw, 140px)', marginRight: -18, zIndex: 2, marginBottom: 2 } : { width: 'clamp(110px, 21cqw, 190px)', height: 'clamp(110px, 21cqw, 190px)', marginRight: -24, zIndex: 2, marginBottom: 4 }}>
        {portrait ?? <GlimCharacter expression={expression} size={short ? 120 : 190} />}
      </div>

      <div className="relative flex-1" style={{ minHeight: short ? 96 : 150 }}>
        <div
          className="absolute inset-0"
          style={{ borderStyle: 'solid', borderWidth: short ? '22px 26px' : '34px 36px', borderImageSource: `url(${U}dlg_box.png)`, borderImageSlice: '75 78 75 78 fill', borderImageRepeat: 'stretch', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.4))' }}
        />
        <div className="relative flex flex-col" style={{ padding: short ? '26px 28px 8px 30px' : '38px 38px 18px 40px', minHeight: short ? 96 : 150, color: '#4a2f17' }}>
          <div className="absolute pointer-events-none" style={{ top: short ? -18 : -22, left: '50%', width: short ? 130 : 170, transform: 'translateX(-50%)', zIndex: 3 }}>
            <img src={`${U}dlg_name.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto' }} />
            <span className="absolute flex items-center justify-center font-bold" style={{ left: '17%', right: '17%', top: 0, bottom: '32%', fontSize: short ? 16 : 20, color: '#fff3d0', WebkitTextStroke: '4px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.06em' }}>{speaker}</span>
          </div>

          <div className="relative flex-1 overflow-y-auto overflow-x-hidden" style={{ maxHeight: short ? '22cqh' : '28cqh', minHeight: short ? 40 : 54 }}>
            {flip > 0 && <span key={`sheen${flip}`} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(100deg, transparent 30%, rgba(255,250,230,0.75) 50%, transparent 70%)', animation: 'pdSheen 0.4s ease-out both', zIndex: 2 }} />}
            <div key={flip} style={{ animation: flip > 0 ? 'pdFlip 0.28s cubic-bezier(.2,.8,.3,1) both' : undefined }}>
            <p className="font-semibold" style={{ fontSize: short ? 'clamp(13px, 1.7cqw, 17px)' : 'clamp(15px, 2cqw, 21px)', lineHeight: short ? 1.25 : 1.35 }}>
              {text}
              {isTyping && <span style={{ animation: 'pdBlink 0.8s steps(1) infinite', marginLeft: 3 }}>|</span>}
            </p>
            {extra}
            </div>
          </div>

          <div className="flex items-center justify-between" style={{ marginTop: short ? 2 : 8 }}>
            <span className="text-xs font-bold opacity-55">{total ? `${(index ?? 0) + 1} / ${total}` : ''}</span>
            <div className="flex items-center gap-2">
              {onPrev && canGoBack && (
                <button onClick={turn(onPrev, turned)} aria-label="Previous" className="hover:scale-110 active:scale-90 transition-transform"><img src={`${U}dlg_next.png`} alt="" draggable={false} style={{ width: 38, transform: 'scaleX(-1)', imageRendering: 'auto' }} /></button>
              )}
              {onSkip && (
                <button onClick={turn(onSkip, turned)} aria-label="Skip dialogue" className="hover:scale-110 active:scale-90 transition-transform"><img src={`${U}dlg_skip.png`} alt="" draggable={false} style={{ width: short ? 32 : 38, imageRendering: 'auto' }} /></button>
              )}
              <button onClick={turn(onNext, turned)} aria-label="Next" className="hover:scale-110 active:scale-90 transition-transform"><img src={`${U}dlg_next.png`} alt="" draggable={false} style={{ width: short ? 38 : 46, imageRendering: 'auto' }} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
