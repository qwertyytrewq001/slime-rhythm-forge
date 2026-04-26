const fs = require('fs');

console.log('=== DEBUGGING BREEDING COMBINATION ISSUES ===\n');

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

// Check problematic combinations
const problematicCombinations = [
  { parents: ['plant', 'earth'], expected: 1 },
  { parents: ['ice', 'earth'], expected: 1 },
  { parents: ['fire', 'wind'], expected: 1 }
];

problematicCombinations.forEach(test => {
  console.log(`\n🔍 CHECKING ${test.parents.join('+')}:`);
  
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
  
  // Also check for any slimes that have both elements but also additional elements
  const extraElementSlimes = allSlimes.filter(slime => {
    return test.parents.every(parent => slime.elements.includes(parent)) && 
           slime.elements.length > sortedUnion.length;
  });
  
  if (extraElementSlimes.length > 0) {
    console.log(`   Slimes with both elements plus extra elements:`);
    extraElementSlimes.forEach(slime => {
      console.log(`     ${slime.name} (${slime.id}): [${slime.elements.join(', ')}]`);
    });
  }
});

// Check for missing fire+wind combination
console.log('\n🔍 CHECKING FIRE+WIND SLIMES:');
const fireWindSlimes = allSlimes.filter(slime => 
  slime.elements.includes('fire') && slime.elements.includes('wind')
);

console.log(`Found ${fireWindSlimes.length} slimes with both fire and wind:`);
fireWindSlimes.forEach(slime => {
  console.log(`  ${slime.name} (${slime.id}): [${slime.elements.join(', ')}]`);
});

// Check if there's supposed to be a fire+wind slime
console.log('\n🔍 CHECKING FOR EXPECTED FIRE+WIND SLIME:');
const expectedFireWind = allSlimes.find(slime => 
  slime.elements.length === 2 &&
  slime.elements.includes('fire') && 
  slime.elements.includes('wind')
);

if (expectedFireWind) {
  console.log(`✅ Found fire+wind slime: ${expectedFireWind.name} (${expectedFireWind.id})`);
} else {
  console.log('❌ No fire+wind slime found - need to create one');
  console.log('   Possible candidates for fire+wind:');
  const candidates = ['bolt_slime', 'lightning_slime', 'storm_slime'];
  candidates.forEach(candidate => {
    const slime = allSlimes.find(s => s.id === candidate);
    if (slime) {
      console.log(`     ${slime.name} (${slime.id}): [${slime.elements.join(', ')}]`);
    }
  });
}
