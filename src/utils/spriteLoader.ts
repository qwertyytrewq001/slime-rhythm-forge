import { Slime } from '@/types/slime';
import { SLIME_CODEX_MAP } from '@/data/slimeCodex';

// Sprite cache for loaded images
const spriteCache = new Map<string, HTMLImageElement>();

/**
 * Load a slime sprite from the public folder
 */
export async function loadSlimeSprite(spriteId: string): Promise<HTMLImageElement> {
  // Check cache first
  if (spriteCache.has(spriteId)) {
    return spriteCache.get(spriteId)!;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      spriteCache.set(spriteId, img);
      resolve(img);
    };
    img.onerror = () => {
      console.warn(`Failed to load sprite: ${spriteId}.png`);
      reject(new Error(`Sprite not found: ${spriteId}.png`));
    };
    img.src = `/${spriteId}.png`;
  });
}

/**
 * Get sprite ID from slime (maps codex spriteId to actual file names)
 */
export function getSpriteIdForSlime(slime: Slime): string {
  // Try to get spriteId from codex
  const codexSlime = SLIME_CODEX_MAP.get(slime.id);
  if (codexSlime && codexSlime.spriteId) {
    // The spriteId in codex should directly match the sprite file name
    // Just return it directly, no mapping needed
    return codexSlime.spriteId;
  }
  
  // Fallback to element-based sprite naming
  const element = slime.element || 'fire';
  const elementMapping: Record<string, string> = {
    'fire': 'fire_slime',
    'water': 'water_slime',
    'plant': 'leaf_slime',
    'earth': 'rock_slime',
    'wind': 'wind_slime',
    'ice': 'snow_slime',
    'electric': 'bolt_slime',
    'metal': 'iron_slime',
    'light': 'star_slime',
    'shadow': 'dark_slime'
  };
  
  return elementMapping[element] || 'fire_slime';
}

/**
 * Preload essential sprites
 */
export async function preloadEssentialSprites(): Promise<void> {
  const essentialSprites = [
    'fire_slime', 'water_slime', 'leaf_slime', 'rock_slime', 'wind_slime',
    'snow_slime', 'bolt_slime', 'iron_slime', 'star_slime', 'dark_slime'
  ];

  const promises = essentialSprites.map(spriteId => 
    loadSlimeSprite(spriteId).catch(err => {
      console.warn(`Could not preload ${spriteId}:`, err);
      return null;
    })
  );

  await Promise.all(promises);
}
