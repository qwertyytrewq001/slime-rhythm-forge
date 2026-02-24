import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Shop } from './Shop';
import { SHAPE_NAMES, EYE_NAMES, MOUTH_NAMES, SPIKE_NAMES, PATTERN_NAMES, GLOW_NAMES, AURA_NAMES, ACCESSORY_NAMES, COLOR_PALETTE, MODEL_NAMES, ELEMENT_NAMES, ELEMENT_ICONS, RARITY_TIER_COLORS, ELEMENT_MODEL_FEATURES } from '@/data/traitData';

export function StatsPanel() {
  const { state } = useGameState();
  const slime = state.slimes.find(s => s.id === state.selectedSlimeId);

  return (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-sm border-l-4 border-primary/20 p-3 overflow-y-auto"
      style={{ fontFamily: "'VT323', monospace" }}>
      <h2 className="text-center text-sm text-primary mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
        Stats
      </h2>

      {slime ? (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {slime.rarityStars >= 4 && (
              <div className="absolute inset-0 rounded-full blur-xl animate-pulse"
                style={{
                  width: 150, height: 150, marginLeft: -15, marginTop: -15,
                  backgroundColor: RARITY_TIER_COLORS[slime.rarityTier] + '25',
                }} />
            )}
            <SlimeCanvas slime={slime} size={120} animated />
          </div>

          <h3 className="text-base text-foreground font-bold text-center">{slime.name}</h3>

          {/* Rarity Tier badge */}
          <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold"
            style={{
              color: RARITY_TIER_COLORS[slime.rarityTier],
              borderColor: RARITY_TIER_COLORS[slime.rarityTier] + '60',
              backgroundColor: RARITY_TIER_COLORS[slime.rarityTier] + '15',
              fontFamily: "'Press Start 2P', cursive",
            }}>
            {slime.rarityTier}
          </span>

          {/* Multi-Element badges */}
          <div className="flex flex-wrap items-center gap-1 justify-center">
            {(slime.elements || [slime.element]).map((elem, i) => (
              <span key={elem + i} className={`text-xs px-1.5 py-0.5 rounded border ${i === 0 ? 'border-primary/40 bg-primary/10' : 'border-secondary/30 bg-secondary/5'}`}>
                {ELEMENT_ICONS[elem]} {ELEMENT_NAMES[elem]?.split(' ')[1]}
              </span>
            ))}
          </div>

          {/* Model + Feature */}
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-secondary/10 px-2 py-0.5 rounded border border-secondary/30">
              {slime.traits.model === 0 ? '😊' : slime.traits.model === 1 ? '😤' : '🌊'} {MODEL_NAMES[slime.traits.model]}
            </span>
            <span className="text-[9px] text-muted-foreground italic">
              {ELEMENT_MODEL_FEATURES[slime.element]?.[slime.traits.model === 0 ? 'blob' : slime.traits.model === 1 ? 'spiky' : 'jelly']}
            </span>
          </div>

          <div className="text-sm text-accent-foreground">
            {'★'.repeat(Math.min(slime.rarityStars, 7))}{'☆'.repeat(Math.max(0, 7 - slime.rarityStars))}
            <span className="ml-1 text-xs text-muted-foreground">({slime.rarityScore}pts)</span>
          </div>
          <div className="text-xs text-muted-foreground">
            💧 {(slime.rarityScore * 0.1).toFixed(1)} goo/sec
          </div>

          {/* Hybrid info */}
          {(slime.elements?.length || 0) >= 2 && (
            <div className="text-[10px] text-accent-foreground bg-accent/10 px-2 py-0.5 rounded border border-accent/30">
              ⚗️ {slime.elements.length}-Element Hybrid
            </div>
          )}

          <div className="w-full mt-2 space-y-1 text-xs">
            <TraitRow label="🔷 Shape" value={SHAPE_NAMES[slime.traits.shape]} />
            <TraitRow label="🎨 Color 1" value={COLOR_PALETTE[slime.traits.color1]} isColor />
            <TraitRow label="🎨 Color 2" value={COLOR_PALETTE[slime.traits.color2]} isColor />
            <TraitRow label="👀 Eyes" value={EYE_NAMES[slime.traits.eyes]} />
            <TraitRow label="👄 Mouth" value={MOUTH_NAMES[slime.traits.mouth]} />
            <TraitRow label="⚔️ Spikes" value={SPIKE_NAMES[slime.traits.spikes]} />
            <TraitRow label="✨ Pattern" value={PATTERN_NAMES[slime.traits.pattern]} />
            <TraitRow label="💡 Glow" value={GLOW_NAMES[slime.traits.glow]} />
            <TraitRow label="📏 Size" value={`${slime.traits.size}x`} />
            <TraitRow label="🌀 Aura" value={AURA_NAMES[slime.traits.aura]} />
            <TraitRow label="🎵 Rhythm" value={`Beat ${slime.traits.rhythm}`} />
            <TraitRow label="👑 Accessory" value={ACCESSORY_NAMES[slime.traits.accessory]} />
          </div>

          {slime.parentIds && (
            <div className="text-[10px] text-muted-foreground mt-2">
              🧬 Bred from 2 parents
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
