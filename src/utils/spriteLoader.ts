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
      'choco_earth_fire': 'chocolate_slime',
      'caramel_lava_water': 'caramel_slime',
      'toffee_metal_fire': 'toffee_slime',
      'pudding_water_earth': 'pudding_slime',
      'donut_earth_nature': 'donut_slime',
      'gummy_plant_water': 'gummybear_slime',
      'cotton_wind_plant': 'cotton_candy_slime',
      'mint_plant_ice': 'mint_slime',
      'berry_plant_nature': 'berry_slime',
      'soda_water_electric': 'soda_slime',
      'honey_plant_light': 'honey_slime',
      
      // Disaster slimes
      'volcano_lava_fire': 'volcano_slime',
      'tsunami_water_wind': 'tsunami_slime',
      'earthquake_earth_metal': 'earthquake_slime',
      'tornado_wind_electric': 'tornado_slime',
      'blizzard_ice_wind': 'blizzard_slime',
      'wildfire_fire_plant': 'wildfire_slime',
      'acid_rain_toxic_water': 'acidrain_slime',
      'sandstorm_earth_wind': 'sandstorm_slime',
      'meteor_cosmic_earth': 'meteor slime',
      'solar_flare_cosmic_fire': 'solarflare_slime',
      
      // Biome slimes
      'swamp_toxic_water': 'swamp_slime',
      'savanna_earth_wind': 'savanna_slime',
      'desert_earth_fire': 'desert_slime',
      'rainforest_plant_water': 'rainforest_slime',
      'oasis_water_nature': 'oasis_slime',
      'tundra_ice_earth': 'tundra_slime',
      'cave_earth_shadow': 'cave_slime',
      'coral_water_crystal': 'coral_slime',
      'jungle_plant_nature': 'jungle_slime',
      'alpine_wind_ice': 'alpine_slime',
      'canyon_earth_lava': 'canyon_slime',
      'mangrove_plant_toxic': 'mangrove_slime',
      'meadow_nature_light': 'meadow_slime',
      'island_water_earth': 'island_slime',
      'bamboo_plant_metal': 'bamboo_slime',
      
      // Mythical slimes
      'genesis_divine_nature_earth_water': 'genesis_slime',
      'apocalypse_void_fire_lava_shadow': 'apocalypse_slime',
      'galaxy_whale_cosmic_water_wind_arcane': 'galaxy_whale_slime',
      'mecha_god_metal_electric_light_crystal': 'mechagod_slime',
      'eldritch_horror_void_toxic_shadow_arcane': 'eldritch_slime',
      'yggdrasil_plant_nature_earth_divine': 'yggdrasil_slime',
      'star_eater_cosmic_void_fire_metal': 'star_eater_slime',
      'harmony_light_nature_wind_water': 'harmoney_slime',
      'pandora_void_arcane_toxic_fire': 'pandora_slime',
      'the_alpha_blob_divine_cosmic_void_nature': 'alpha_blob',
      
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
