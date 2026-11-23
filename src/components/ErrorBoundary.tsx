import React from 'react';

const SAVE_KEY = 'rareslime-forge-save';

interface State { failed: boolean; message: string }

/**
 * If something in the game throws, show a friendly screen instead of a blank white page.
 * "Repair" removes the unfinished breeding and hatching from the save (the most common cause) and reloads, keeping everything else.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return { failed: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown) {
    console.error('The game hit an error:', error);
  }

  repair = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        data.activeBreeding = null;
        data.activeHatching = null;
        data.breedSlot1 = null;
        data.breedSlot2 = null;
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      }
    } catch { /* if the save cannot be read, a plain reload is all we can do */ }
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 0%, #3a2766, #1a1033)', padding: 16, fontFamily: "'Fredoka', 'Trebuchet MS', sans-serif" }}>
        <div style={{ maxWidth: 420, textAlign: 'center', background: 'linear-gradient(#f6e8c3,#ecd9a8)', border: '5px solid #4a2f17', borderRadius: 28, padding: '28px 24px', color: '#4a2f17', boxShadow: '0 22px 50px rgba(0,0,0,0.55)' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Oops, the slimes tripped</div>
          <p style={{ fontSize: 16, margin: '10px 0 18px', lineHeight: 1.4 }}>Something went wrong, but your slimes and goo are safe. Try reloading. If it happens again, use Repair, which clears only the unfinished breeding or egg.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.location.reload()} style={{ background: '#fff7dc', border: '3px solid #4a2f17', borderRadius: 999, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer', color: '#4a2f17' }}>Reload</button>
            <button onClick={this.repair} style={{ background: '#ffd34d', border: '3px solid #4a2f17', borderRadius: 999, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer', color: '#4a2f17' }}>Repair</button>
          </div>
          <div style={{ marginTop: 14, fontSize: 11, opacity: 0.55, wordBreak: 'break-word' }}>{this.state.message}</div>
        </div>
      </div>
    );
  }
}
