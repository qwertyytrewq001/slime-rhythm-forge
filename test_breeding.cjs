const { getPossibleOutcomes } = require('./src/utils/breedingCalculator.ts');

console.log('=== Testing Breeding System ===\n');

// Test water + fire breeding
const result = getPossibleOutcomes(['water'], ['fire']);
console.log('Water + Fire breeding outcomes:');
console.log(`Found ${result.length} slimes:`);
result.forEach(slime => {
  console.log(`- ${slime.name} (${slime.elements.join('+')})`);
});

console.log('\n=== Expected Results ===');
console.log('Should find:');
console.log('- Steam Slime (fire+water)');
console.log('- Lava Slime (fire+water)');

console.log('\n=== Debug Info ===');
console.log('Checking if the issue is in transformation logic...');
