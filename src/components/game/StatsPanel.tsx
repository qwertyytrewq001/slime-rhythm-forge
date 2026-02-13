import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Shop } from './Shop';
import { SHAPE_NAMES, EYE_NAMES, MOUTH_NAMES, SPIKE_NAMES, PATTERN_NAMES, GLOW_NAMES, AURA_NAMES, ACCESSORY_NAMES, COLOR_PALETTE } from '@/data/traitData';

export function StatsPanel() {
  const { state } = useGameState();
  const slime = state.slimes.find(s => s.id === state.selectedSlimeId);

  return (
    <div className="flex flex-col h-full bg-card/50 border-l-4 border-primary/20 p-3 overflow-y-auto"
      style={{ fontFamily: "'VT323', monospace" }}>
      <h2 className="text-center text-sm text-primary mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
        Stats
      </h2>

      {slime ? (
        <div className="flex flex-col items-center gap-2">
          <SlimeCanvas slime={slime} size={120} animated />
          <h3 className="text-base text-foreground font-bold text-center">{slime.name}</h3>
          <div className="text-sm text-accent-foreground">
            {'★'.repeat(slime.rarityStars)}{'☆'.repeat(5 - slime.rarityStars)}
            <span className="ml-1 text-xs text-muted-foreground">({slime.rarityScore}pts)</span>
          </div>
          <div className="text-xs text-muted-foreground">
            💧 {(slime.rarityScore * 0.1).toFixed(1)} goo/sec
          </div>

          <div className="w-full mt-2 space-y-1 text-xs">
            <TraitRow label="Shape" value={SHAPE_NAMES[slime.traits.shape]} />
            <TraitRow label="Color 1" value={COLOR_PALETTE[slime.traits.color1]} isColor />
            <TraitRow label="Color 2" value={COLOR_PALETTE[slime.traits.color2]} isColor />
            <TraitRow label="Eyes" value={EYE_NAMES[slime.traits.eyes]} />
            <TraitRow label="Mouth" value={MOUTH_NAMES[slime.traits.mouth]} />
            <TraitRow label="Spikes" value={SPIKE_NAMES[slime.traits.spikes]} />
            <TraitRow label="Pattern" value={PATTERN_NAMES[slime.traits.pattern]} />
            <TraitRow label="Glow" value={GLOW_NAMES[slime.traits.glow]} />
            <TraitRow label="Size" value={`${slime.traits.size}x`} />
            <TraitRow label="Aura" value={AURA_NAMES[slime.traits.aura]} />
            <TraitRow label="Rhythm" value={`Beat ${slime.traits.rhythm}`} />
            <TraitRow label="Accessory" value={ACCESSORY_NAMES[slime.traits.accessory]} />
          </div>

          {slime.parentIds && (
            <div className="text-[10px] text-muted-foreground mt-2">
              Bred from 2 parents
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center px-2">
            Select a slime to see its stats
          </p>
        </div>
      )}

      <div className="mt-auto pt-3">
        <Shop />
      </div>
    </div>
  );
}

function TraitRow({ label, value, isColor }: { label: string; value: string; isColor?: boolean }) {
  return (
    <div className="flex justify-between items-center py-0.5 border-b border-border/30">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground flex items-center gap-1">
        {isColor && <span className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: value }} />}
        {isColor ? value : value}
      </span>
    </div>
  );
}
