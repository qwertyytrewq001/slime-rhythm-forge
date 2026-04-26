const fs = require('fs');

console.log('=== TESTING NEW SHADOW COMBINATIONS ===\n');

// Read and parse all slimes
const codexContent = fs.readFileSync('./src/data/slimeCodex.ts', 'utf8');
const slimeMatches = codexContent.match(/\{[^}]*id:\s*'([^']+)'[^}]*elements:\s*\[([^\]]+)\][^}]*\}/g);

const allSlimes = [];
slimeMatches.forEach(match => {
  const idMatch = match.match(/id:\s*'([^']+)'/);
  const elementsMatch = match.match(/elements:\s*\[([^\]]+)\]/);
  
  if (idMatch && elementsMatch) {
    const id = idMatch[1];
    const elementsStr = elementsMatch[1];
    const elements = elementsStr.match(/'([^']+)'/g).map(e => e.replace(/'/g, ''));
    
    allSlimes.push({
      id,
      name: id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      elements,
      elementCount: elements.length
    });
  }
});

// Test the new combinations
const newCombinations = [
  { parents: ['shadow', 'water'], expected: 1 },
  { parents: ['shadow', 'water', 'earth'], expected: 1 }
];

newCombinations.forEach(test => {
  console.log(`🔍 CHECKING ${test.parents.join('+')}:`);
  
  const parentUnion = [...new Set(test.parents)];
  const sortedUnion = parentUnion.sort();
  
  const matches = allSlimes.filter(slime => {
    if (slime.elements.length !== sortedUnion.length) return false;
    const sortedElements = [...slime.elements].sort();
    return sortedElements.every((element, index) => element === sortedUnion[index]);
  });
  
  console.log(`   Parent union: [${sortedUnion.join(', ')}]`);
  console.log(`   Found ${matches.length} slimes (expected ${test.expected}):`);
  
  matches.forEach(slime => {
    console.log(`     ${slime.name} (${slime.id}): [${slime.elements.join(', ')}]`);
  });
  
  if (matches.length === test.expected) {
    console.log(`   ✅ CORRECT: ${matches.length}/${test.expected} slimes found`);
  } else {
    console.log(`   ❌ INCORRECT: ${matches.length}/${test.expected} slimes found`);
  }
  console.log();
});

// Also check all shadow combinations
console.log('🔍 ALL SHADOW COMBINATIONS:');
const shadowSlimes = allSlimes.filter(slime => slime.elements.includes('shadow'));

shadowSlimes.forEach(slime => {
  console.log(`  ${slime.name} (${slime.id}): [${slime.elements.join(', ')}]`);
});

console.log(`\nTotal shadow slimes: ${shadowSlimes.length}`);
