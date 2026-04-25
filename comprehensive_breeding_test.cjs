const fs = require('fs');

console.log('=== COMPREHENSIVE BREEDING SYSTEM TEST ===\n');

// Read the current breeding calculator to understand the logic
const breedingCalcContent = fs.readFileSync('./src/utils/breedingCalculator.ts', 'utf8');
const codexContent = fs.readFileSync('./src/data/slimeCodex.ts', 'utf8');

// Extract all slimes with their elements
const slimeMatches = codexContent.match(/\{[^}]*id:\s*'([^']+)'[^}]*elements:\s*\[([^\]]+)\][^}]*\}/g);
const allSlimes = [];

slimeMatches.forEach(match => {
  const idMatch = match.match(/id:\s*'([^']+)'/);
  const elementsMatch = match.match(/elements:\s*\[([^\]]+)\]/);
  
  if (idMatch && elementsMatch) {
    const id = idMatch[1];
    const elementsStr = elementsMatch[1];
    const elements = elementsStr.match(/'([^']+)'/g).map(e => e.replace(/'/g, ''));
    
    allSlimes.push({ id, elements, elementCount: elements.length });
  }
});

console.log(`Total slimes in codex: ${allSlimes.length}`);

// Group slimes by element count
const singleElementSlimes = allSlimes.filter(s => s.elementCount === 1);
const dualElementSlimes = allSlimes.filter(s => s.elementCount === 2);
const multiElementSlimes = allSlimes.filter(s => s.elementCount > 2);

console.log(`Single-element slimes: ${singleElementSlimes.length}`);
console.log(`Dual-element slimes: ${dualElementSlimes.length}`);
console.log(`Multi-element slimes: ${multiElementSlimes.length}`);

// Test key breeding combinations
const testCombinations = [
  { parent1: ['water'], parent2: ['fire'], expected: ['steam_slime', 'lava_slime'] },
  { parent1: ['plant'], parent2: ['earth'], expected: ['nature_slime'] },
  { parent1: ['fire'], parent2: ['ice'], expected: ['gem_slime'] },
  { parent1: ['fire'], parent2: ['wind'], expected: ['bolt_slime'] },
  { parent1: ['water'], parent2: ['earth'], expected: [] }, // Should find exact matches
  { parent1: ['plant'], parent2: ['water'], expected: [] }, // Should find exact matches
];

console.log('\n=== TESTING KEY BREEDING COMBINATIONS ===');

testCombinations.forEach(({ parent1, parent2, expected }, index) => {
  console.log(`\nTest ${index + 1}: ${parent1.join('+')} + ${parent2.join('+')}`);
  
  // Simulate the breeding logic
  const parentUnion = [...new Set([...parent1, ...parent2])].sort();
  console.log(`Parent union: [${parentUnion.join(', ')}]`);
  
  // Find slimes with exact element matches
  const exactMatches = allSlimes.filter(slime => {
    if (slime.elements.length !== parentUnion.length) return false;
    const sortedElements = [...slime.elements].sort();
    return sortedElements.every((element, idx) => element === parentUnion[idx]);
  });
  
  console.log(`Exact matches found: ${exactMatches.length}`);
  exactMatches.forEach(slime => {
    console.log(`  - ${slime.id} (${slime.elements.join('+')})`);
  });
  
  // Check if expected slimes are found
  const foundExpected = expected.filter(expectedId => 
    exactMatches.some(slime => slime.id === expectedId)
  );
  
  if (foundExpected.length === expected.length) {
    console.log(`✅ All expected slimes found`);
  } else {
    console.log(`❌ Missing expected slimes: [${expected.filter(id => !foundExpected.includes(id)).join(', ')}]`);
  }
});

// Check for potential issues
console.log('\n=== POTENTIAL ISSUES ANALYSIS ===');

// 1. Check if there are any transformations that might break exact matching
const hasTransformationLogic = breedingCalcContent.includes('BREEDING_COMBOS') && 
                              breedingCalcContent.includes('transformationKey');

if (hasTransformationLogic) {
  console.log('⚠️  Transformation logic detected - this could interfere with exact matching');
  
  // Check what transformations exist
  const comboMatch = breedingCalcContent.match(/BREEDING_COMBOS[^}]+}/s);
  if (comboMatch) {
    console.log('Current transformations:');
    const lines = comboMatch[0].split('\n');
    lines.forEach(line => {
      if (line.includes("':")) {
        console.log(`  ${line.trim()}`);
      }
    });
  }
} else {
  console.log('✅ No transformation logic detected - exact matching should work');
}

// 2. Check for any remaining problematic elements
const problematicElements = ['lava']; // Elements that were removed
const slimesWithProblematicElements = allSlimes.filter(slime => 
  slime.elements.some(element => problematicElements.includes(element))
);

if (slimesWithProblematicElements.length > 0) {
  console.log(`❌ Found ${slimesWithProblematicElements.length} slimes with problematic elements:`);
  slimesWithProblematicElements.forEach(slime => {
    console.log(`  - ${slime.id}: [${slime.elements.join(', ')}]`);
  });
} else {
  console.log('✅ No slimes with problematic elements found');
}

console.log('\n=== RECOMMENDATIONS ===');
console.log('1. If transformation logic exists, ensure it only applies to valid single-element targets');
console.log('2. Verify water+fire shows both steam_slime and lava_slime');
console.log('3. Test all combinations in the actual UI to confirm they work');
console.log('4. Monitor for any breeding combinations that return no results unexpectedly');
