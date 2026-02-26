import { useGameState } from '@/hooks/useGameState';
import { SlimeCanvas } from './SlimeCanvas';
import { Shop } from './Shop';
import { ELEMENT_DISPLAY_NAMES, RARITY_TIER_COLORS, MODEL_NAMES } from '@/data/traitData';
import { Progress } from '@/components/ui/progress';

export function StatsPanel() {
  const { state } = useGameState();
  const slime = state.slimes.find(s => s.id === state.selectedSlimeId);

  const getElementNames = (s: any) => {
    const elems = s.elements || [s.element];
    return elems.map((e: string) => ELEMENT_DISPLAY_NAMES[e as keyof typeof ELEMENT_DISPLAY_NAMES] || e).join(', ');
  };

  const happiness = slime ? (state.happiness[slime.id] || 0) : 0;

  return (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-sm border-l-2 border-primary/15 p-3 overflow-y-auto"
      style={{ fontFamily: "'VT323', monospace" }}>
      <h2 className="text-center text-xs text-primary mb-2" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '9px' }}>
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

          {/* Species name — clean header */}
          <h3 className="text-sm text-foreground font-bold text-center">{slime.name}</h3>

          {/* Rarity Tier */}
          <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold"
            style={{
              color: RARITY_TIER_COLORS[slime.rarityTier],
              borderColor: RARITY_TIER_COLORS[slime.rarityTier] + '60',
              backgroundColor: RARITY_TIER_COLORS[slime.rarityTier] + '15',
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '8px',
            }}>
            {slime.rarityTier}
          </span>

          {/* Elements */}
          <span className="text-xs text-muted-foreground text-center">
            {getElementNames(slime)}
          </span>

          {/* Happiness */}
          <div className="w-full mt-1">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
              <span>Happiness</span>
              <span>{happiness}%</span>
            </div>
            <Progress value={happiness} className="h-1.5" />
          </div>

          {/* Goo production */}
          <div className="text-xs text-muted-foreground">
            {(slime.rarityScore * 0.1).toFixed(1)} goo/sec
          </div>

          {/* Model type */}
          <span className="text-[10px] text-muted-foreground/60">
            {MODEL_NAMES[slime.traits.model]} model
          </span>

          {slime.parentIds && (
            <div className="text-[9px] text-muted-foreground mt-1">
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
