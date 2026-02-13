import { useGameState } from '@/hooks/useGameState';
import { X } from 'lucide-react';

export function Achievements({ onClose }: { onClose: () => void }) {
  const { state } = useGameState();

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-card border-4 border-primary rounded-lg p-4 w-80 max-h-96 overflow-y-auto"
        style={{ fontFamily: "'VT323', monospace" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm text-primary" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            🏆 Achievements
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2">
          {state.achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-2 rounded border-2 ${
                ach.unlocked
                  ? 'border-accent bg-accent/10'
                  : 'border-border/30 bg-muted/20 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{ach.unlocked ? '🏅' : '🔒'}</span>
                <div>
                  <p className="text-sm text-foreground font-bold">{ach.name}</p>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                  <p className="text-[10px] text-accent-foreground">Reward: {ach.reward}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
