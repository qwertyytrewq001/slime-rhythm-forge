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
  // Try to get spriteId from codex and map to actual file name
  const codexSlime = SLIME_CODEX_MAP.get(slime.id);
  if (codexSlime && codexSlime.spriteId) {
    // Map codex spriteId to actual file name
    const spriteMapping: Record<string, string> = {
      'fire_base': 'fire_slime',
      'water_base': 'water_slime', 
      'plant_base': 'leaf_slime',
      'earth_base': 'rock_slime',
      'wind_base': 'wind_slime',
      'ice_base': 'snow_slime',
      'electric_base': 'bolt_slime',
      'metal_base': 'iron_slime',
      'light_base': 'star_slime',
      'shadow_base': 'dark_slime',
      
      // Confectionary slimes
      'candy_plant_fire': 'candy_slime',
      'chocolate_earth_fire': 'chocolate_slime',
      'caramel_fire_water': 'caramel_slime',
      'toffee_earth_water': 'toffee_slime',
      'pudding_water_ice': 'pudding_slime',
      'donut_plant_water': 'donut_slime',
      'gummybear_plant_fire': 'gummybear_slime',
      'cotton_candy_water_wind': 'cotton_candy_slime',
      'mint_ice_water': 'mint_slime',
      'berry_plant_water': 'berry_slime',
      'soda_water_ice': 'soda_slime',
      'honey_plant_water': 'honey_slime',
      
      // Disaster slimes
      'volcano_lava_fire': 'volcano_slime',
      'tsunami_water_earth': 'tsunami_slime',
      'earthquake_earth_metal': 'earthquake_slime',
      'tornado_wind_earth': 'tornado_slime',
      'blizzard_ice_wind': 'blizzard_slime',
      'wildfire_fire_wind': 'wildfire_slime',
      'acidrain_toxic_water': 'acidrain_slime',
      'sandstorm_earth_wind': 'sandstorm_slime',
      'avalanche_ice_earth': 'tundra_slime',
      'solarflare_light_fire': 'solarflare_slime',
      
      // Biome slimes
      'swamp_toxic_water': 'swamp_slime',
      'desert_earth_fire': 'desert_slime',
      'jungle_plant_water': 'jungle_slime',
      'oasis_water_earth': 'oasis_slime',
      'alpine_ice_earth': 'alpine_slime',
      'cave_earth_shadow': 'cave_slime',
      'coral_water_plant': 'coral_slime',
      'mangrove_plant_water': 'mangrove_slime',
      'meadow_plant_light': 'meadow_slime',
      'rainforest_plant_water': 'rainforest_slime',
      'savanna_earth_fire': 'savanna_slime',
      'tundra_ice_earth': 'tundra_slime',
      'island_water_earth': 'island_slime',
      'canyon_earth_wind': 'canyon_slime',
      'bamboo_plant_earth': 'bamboo_slime',
      
      // Mythical slimes
      'genesis_divine_nature_earth_water': 'genesis_slime',
      'star_eater_cosmic_shadow_light': 'star_eater_slime',
      'galaxy_whale_cosmic_water_light': 'galaxy_whale_slime',
      'yggdrasil_nature_earth_plant_divine': 'yggdrasil_slime',
      'mechagod_metal_electric_fire': 'mechagod_slime',
      'eldritch_void_shadow_arcane': 'eldritch_slime',
      'glitched_electric_void_arcane': 'glitched_slime',
      'harmony_light_divine_arcane': 'harmoney_slime',
      'pandora_cosmic_void_arcane': 'pandora_slime',
      'angel_divine_light_arcane': 'angel_slime',
      
      // Additional mappings
      'lava_fire_earth': 'lava_slime',
      'nature_plant_earth': 'nature_slime',
      'steam_fire_water': 'steam_slime',
      'crystal_fire_ice': 'ice_crystal_slime',
      'gem_earth_crystal': 'gem_slime',
      'glow_light_arcane': 'glow_slime',
      'ooze_toxic_water': 'ooze_slime',
      'rune_arcane_metal': 'rune_slime',
      'meteor_cosmic_fire': 'meteor slime',
      'balloon_wind_light': 'balloon_slime',
      'crayon_light_earth': 'crayon_slime'
    };
    
    const mappedSpriteId = spriteMapping[codexSlime.spriteId];
    if (mappedSpriteId) {
      return mappedSpriteId;
    }
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
