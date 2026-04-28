import { getSpriteIdForSlime } from './spriteLoader';
import { createCodexSlime } from './slimeGenerator';

/**
 * Test sprite mapping for common slimes
 */
export function testSpriteMapping(): void {
  console.log('🧪 Testing sprite mapping...');
  
  // Test primal slimes
  const fireSlime = createCodexSlime('fire_slime');
  const waterSlime = createCodexSlime('water_slime');
  const leafSlime = createCodexSlime('leaf_slime');
  
  console.log(`🔥 Fire Slime -> ${getSpriteIdForSlime(fireSlime)}`);
  console.log(`💧 Water Slime -> ${getSpriteIdForSlime(waterSlime)}`);
  console.log(`🌱 Leaf Slime -> ${getSpriteIdForSlime(leafSlime)}`);
  
  // Test confectionary slimes
  const candySlime = createCodexSlime('candy_slime');
  console.log(`🍬 Candy Slime -> ${getSpriteIdForSlime(candySlime)}`);
  
  // Test disaster slimes
  const volcanoSlime = createCodexSlime('volcano_slime');
  console.log(`🌋 Volcano Slime -> ${getSpriteIdForSlime(volcanoSlime)}`);
  
  console.log('✅ Sprite mapping test complete!');
}
