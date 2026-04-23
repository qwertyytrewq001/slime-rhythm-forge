import { getSpriteIdForSlime } from './spriteLoader';
import { createCodexSlime } from './slimeGenerator';

/**
 * Test sprite mapping for common slimes
 */
export function testSpriteMapping(): void {
  console.log('🧪 Testing sprite mapping...');
  
  // Test primal slimes
  const fireSlime = createCodexSlime('fire_primal');
  const waterSlime = createCodexSlime('water_primal');
  const plantSlime = createCodexSlime('plant_primal');
  
  console.log(`🔥 Fire Slime -> ${getSpriteIdForSlime(fireSlime)}`);
  console.log(`💧 Water Slime -> ${getSpriteIdForSlime(waterSlime)}`);
  console.log(`🌱 Plant Slime -> ${getSpriteIdForSlime(plantSlime)}`);
  
  // Test confectionary slimes
  const candySlime = createCodexSlime('candy_slime');
  console.log(`🍬 Candy Slime -> ${getSpriteIdForSlime(candySlime)}`);
  
  // Test disaster slimes
  const volcanoSlime = createCodexSlime('volcano_slime');
  console.log(`🌋 Volcano Slime -> ${getSpriteIdForSlime(volcanoSlime)}`);
  
  console.log('✅ Sprite mapping test complete!');
}
