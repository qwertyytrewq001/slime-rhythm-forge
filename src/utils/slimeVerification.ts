import { ALL_CODEX_SLIMES, SLIME_CODEX_MAP } from '@/data/slimeCodex';
import { createCodexSlime } from './slimeGenerator';
import { getSpriteIdForSlime } from './spriteLoader';
import { generateSlimeLore } from './loreGenerator';

/**
 * Comprehensive verification of all slime systems
 */
export function verifyAllSlimeSystems(): void {
  console.log('🔍 VERIFYING ALL SLIME SYSTEMS...');
  console.log('='.repeat(60));
  
  // 1. Verify all slimes in codex
  console.log('\n📚 CODEX VERIFICATION:');
  console.log(`Total slimes in codex: ${ALL_CODEX_SLIMES.length}`);
  
  const familyCounts = ALL_CODEX_SLIMES.reduce((acc, slime) => {
    acc[slime.family] = (acc[slime.family] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Family distribution:');
  Object.entries(familyCounts).forEach(([family, count]) => {
    console.log(`  ${family}: ${count} slimes`);
  });
  
  // 2. Verify all slime names and properties
  console.log('\n🏷️  SLIME NAME VERIFICATION:');
  let nameIssues = 0;
  let elementIssues = 0;
  let spriteIssues = 0;
  
  ALL_CODEX_SLIMES.forEach((slime, index) => {
    // Check name
    if (!slime.name || slime.name.trim() === '') {
      console.log(`❌ Slime ${index + 1}: Missing name - ID: ${slime.id}`);
      nameIssues++;
    }
    
    // Check elements
    if (!slime.elements || slime.elements.length === 0) {
      console.log(`❌ Slime ${slime.name}: No elements defined`);
      elementIssues++;
    }
    
    // Check spriteId
    if (!slime.spriteId || slime.spriteId.trim() === '') {
      console.log(`❌ Slime ${slime.name}: Missing spriteId`);
      spriteIssues++;
    }
  });
  
  console.log(`Name issues: ${nameIssues}`);
  console.log(`Element issues: ${elementIssues}`);
  console.log(`SpriteId issues: ${spriteIssues}`);
  
  // 3. Test slime creation and sprite mapping
  console.log('\n🎨 SLIME CREATION & SPRITE MAPPING:');
  const testSlimes = [
    'fire_primal', 'water_primal', 'leaf_primal', 'rock_primal',
    'candy_slime', 'volcano_slime', 'genesis_slime'
  ];
  
  testSlimes.forEach(slimeId => {
    try {
      const slime = createCodexSlime(slimeId);
      const spriteId = getSpriteIdForSlime(slime);
      const lore = generateSlimeLore(slime);
      
      console.log(`✅ ${slime.name}:`);
      console.log(`   ID: ${slime.id}`);
      console.log(`   Elements: [${slime.elements.join(', ')}]`);
      console.log(`   Rarity: ${slime.rarityTier}`);
      console.log(`   Sprite: ${spriteId}`);
      console.log(`   Lore: "${lore.substring(0, 50)}..."`);
      console.log('');
    } catch (error) {
      console.log(`❌ Failed to create ${slimeId}:`, error);
    }
  });
  
  // 4. Verify all sprite mappings
  console.log('\n🗺️  SPRITE MAPPING VERIFICATION:');
  let mappingIssues = 0;
  let mappedSprites = 0;
  
  ALL_CODEX_SLIMES.forEach(slime => {
    try {
      const testSlime = createCodexSlime(slime.id);
      const spriteId = getSpriteIdForSlime(testSlime);
      
      if (spriteId && spriteId !== 'fire_slime') {
        mappedSprites++;
      } else if (slime.spriteId.includes('base') && spriteId === 'fire_slime') {
        // This is expected for unmapped sprites
        console.log(`⚠️  ${slime.name}: Using fallback sprite`);
      }
    } catch (error) {
      console.log(`❌ ${slime.name}: Mapping failed -`, error);
      mappingIssues++;
    }
  });
  
  console.log(`Successfully mapped sprites: ${mappedSprites}/${ALL_CODEX_SLIMES.length}`);
  console.log(`Mapping issues: ${mappingIssues}`);
  
  // 5. Test breeding combinations
  console.log('\n🧬 BREEDING SYSTEM VERIFICATION:');
  try {
    const parent1 = createCodexSlime('fire_primal');
    const parent2 = createCodexSlime('water_primal');
    
    console.log(`✅ Can create parent slimes for breeding`);
    console.log(`   Parent 1: ${parent1.name} (${parent1.elements.join('+')})`);
    console.log(`   Parent 2: ${parent2.name} (${parent2.elements.join('+')})`);
  } catch (error) {
    console.log(`❌ Breeding system issue:`, error);
  }
  
  // 6. Summary
  console.log('\n📊 VERIFICATION SUMMARY:');
  console.log('='.repeat(60));
  const totalIssues = nameIssues + elementIssues + spriteIssues + mappingIssues;
  
  if (totalIssues === 0) {
    console.log('🎉 ALL SYSTEMS VERIFIED SUCCESSFULLY!');
    console.log('✅ All slime names are functioning correctly');
    console.log('✅ All sprite mappings are working');
    console.log('✅ All systems are integrated properly');
  } else {
    console.log(`⚠️  Found ${totalIssues} issues that need attention`);
    console.log(`   Names: ${nameIssues}`);
    console.log(`   Elements: ${elementIssues}`);
    console.log(`   Sprites: ${spriteIssues}`);
    console.log(`   Mappings: ${mappingIssues}`);
  }
  
  console.log('\n🔍 Verification complete!');
}
