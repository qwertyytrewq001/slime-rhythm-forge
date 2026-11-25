import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Pencil } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { NICKNAME_MAX } from '@/utils/nickname';

const INK = '#4a2f17';
// inside #root so the box is scaled with the rest of the game
const stageHost = () => document.getElementById('root') ?? document.body;

/** A pencil that opens a small box for naming one slime. The box sits near the top so a phone keyboard does not cover it. */
export function RenameButton({ slimeId, size = 24, label, className = '' }: { slimeId: string; size?: number; label?: string; className?: string }) {
  const { state, dispatch } = useGameState();
  const slime = state.slimes.find(s => s.id === slimeId);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  if (!slime) return null;
  const save = () => { dispatch({ type: 'RENAME_SLIME', id: slimeId, nickname: text }); setOpen(false); };

  return (
    // clicks must not reach the card or panel underneath (this also covers the box, which React treats as a child)
    <span className={`relative inline-flex ${className}`} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => { setText(slime.nickname ?? ''); setOpen(true); }}
        aria-label={`Rename ${slime.nickname || slime.name}`}
        className="inline-flex items-center justify-center gap-1 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
        style={{ height: size, minWidth: size, padding: label ? '0 10px' : 0, background: '#fff3cf', border: `2px solid ${INK}`, color: INK, fontSize: 12, fontFamily: "'Fredoka', sans-serif" }}
      >
        <Pencil style={{ width: size * 0.55, height: size * 0.55 }} />
        {label}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 flex items-start justify-center pointer-events-auto" style={{ zIndex: 30000, /* above the side panels (20001) */ background: 'rgba(15,8,30,0.7)', paddingTop: 12, fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }} onClick={() => setOpen(false)}>
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={e => { e.preventDefault(); save(); }}
            className="rounded-2xl shadow-2xl text-center"
            style={{ width: 'min(92cqw, 340px)', background: 'linear-gradient(#f6e8c3,#ecd9a8)', border: `4px solid ${INK}`, color: INK, padding: '10px 14px 12px' }}
          >
            <div className="font-bold" style={{ fontSize: 17 }}>Name your {slime.name}</div>
            <input
              type="text"
              autoFocus
              value={text}
              maxLength={NICKNAME_MAX}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
              placeholder={slime.name}
              enterKeyHint="done"
              autoComplete="off"
              aria-label="Slime name"
              className="w-full rounded-full text-center font-bold outline-none"
              style={{ margin: '8px 0', padding: '6px 12px', fontSize: 16, background: '#fff7dc', border: `3px solid ${INK}`, color: INK, userSelect: 'text', WebkitUserSelect: 'text', fontFamily: 'inherit' }}
            />
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full font-bold px-4 py-1" style={{ background: '#fff7dc', border: `3px solid ${INK}` }}>Cancel</button>
              <button type="submit" className="rounded-full font-bold text-white px-5 py-1" style={{ background: 'linear-gradient(#ff7eb6,#ff1493)', border: '3px solid #fff3c0' }}>Save</button>
            </div>
          </form>
        </div>,
        stageHost(),
      )}
    </span>
  );
}
