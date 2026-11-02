import React from 'react';
import { GlimCharacter } from './GlimCharacter';

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
export const PaintedDialogue: React.FC<PaintedDialogueProps> = ({ speaker, expression, portrait, text, isTyping, onNext, onPrev, onSkip, canGoBack, index, total, extra }) => (
  <div className="fixed left-0 right-0 flex justify-center items-end pointer-events-none" style={{ bottom: 14, zIndex: 9999, fontFamily: FRED, padding: '0 10px' }}>
    <style>{`@keyframes pdRise { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: none } } @keyframes pdBlink { 50% { opacity: 0 } }`}</style>
    <div className="relative flex items-end pointer-events-auto" style={{ width: 'min(100%, 860px)', animation: 'pdRise 0.3s ease-out' }}>
      <div className="shrink-0 pointer-events-none" style={{ width: 'clamp(110px, 21vw, 190px)', height: 'clamp(110px, 21vw, 190px)', marginRight: -24, zIndex: 2, marginBottom: 4 }}>
        {portrait ?? <GlimCharacter expression={expression} size={190} />}
      </div>

      <div className="relative flex-1" style={{ minHeight: 150 }}>
        <div
          className="absolute inset-0"
          style={{ borderStyle: 'solid', borderWidth: '34px 36px', borderImageSource: `url(${U}dlg_box.png)`, borderImageSlice: '75 78 75 78 fill', borderImageRepeat: 'stretch', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.4))' }}
        />
        <div className="relative flex flex-col" style={{ padding: '38px 38px 18px 40px', minHeight: 150, color: '#4a2f17' }}>
          <div className="absolute pointer-events-none" style={{ top: -22, left: '50%', width: 170, transform: 'translateX(-50%)', zIndex: 3 }}>
            <img src={`${U}dlg_name.png`} alt="" draggable={false} className="w-full block" style={{ imageRendering: 'auto' }} />
            <span className="absolute flex items-center justify-center font-bold" style={{ left: '17%', right: '17%', top: 0, bottom: '8%', fontSize: 20, color: '#fff3d0', WebkitTextStroke: '4px #3a2150', paintOrder: 'stroke fill', letterSpacing: '0.06em' }}>{speaker}</span>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '28vh', minHeight: 54 }}>
            <p className="font-semibold" style={{ fontSize: 'clamp(15px, 2vw, 21px)', lineHeight: 1.35 }}>
              {text}
              {isTyping && <span style={{ animation: 'pdBlink 0.8s steps(1) infinite', marginLeft: 3 }}>|</span>}
            </p>
            {extra}
          </div>

          <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
            <span className="text-xs font-bold opacity-55">{total ? `${(index ?? 0) + 1} / ${total}` : ''}</span>
            <div className="flex items-center gap-2">
              {onPrev && canGoBack && (
                <button onClick={onPrev} aria-label="Previous" className="hover:scale-110 active:scale-90 transition-transform"><img src={`${U}dlg_next.png`} alt="" draggable={false} style={{ width: 38, transform: 'scaleX(-1)', imageRendering: 'auto' }} /></button>
              )}
              {onSkip && (
                <button onClick={onSkip} aria-label="Skip dialogue" className="hover:scale-110 active:scale-90 transition-transform"><img src={`${U}dlg_skip.png`} alt="" draggable={false} style={{ width: 38, imageRendering: 'auto' }} /></button>
              )}
              <button onClick={onNext} aria-label="Next" className="hover:scale-110 active:scale-90 transition-transform"><img src={`${U}dlg_next.png`} alt="" draggable={false} style={{ width: 46, imageRendering: 'auto' }} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
