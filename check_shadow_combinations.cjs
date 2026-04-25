const fs = require('fs');

console.log('=== SHADOW ELEMENT BREEDING COMBINATIONS ===\n');

// Read and parse all slimes
const codexContent = fs.readFileSync('./src/data/slimeCodex.ts', 'utf8');
const slimeMatches = codexContent.match(/\{[^}]*id:\s*'([^']+)'[^}]*elements:\s*\[([^\]]+)\][^}]*\}/g);

const shadowCombinations = [];

slimeMatches.forEach(match => {
  const idMatch = match.match(/id:\s*'([^']+)'/);
  const elementsMatch = match.match(/elements:\s*\[([^\]]+)\]/);
  
  if (idMatch && elementsMatch) {
    const id = idMatch[1];
    const elementsStr = elementsMatch[1];
    const elements = elementsStr.match(/'([^']+)'/g).map(e => e.replace(/'/g, ''));
    
    // Check if slime has shadow element
    if (elements.includes('shadow')) {
      shadowCombinations.push({
        id,
        name: id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        elements,
        elementCount: elements.length
      });
    }
  }
});

console.log(`Found ${shadowCombinations.length} slimes with shadow element:\n`);

// Group by element count
const singleShadow = shadowCombinations.filter(s => s.elementCount === 1);
const dualShadow = shadowCombinations.filter(s => s.elementCount === 2);
const multiShadow = shadowCombinations.filter(s => s.elementCount > 2);

console.log('🌑 SINGLE-ELEMENT SHADOW SLIMES:');
singleShadow.forEach(slime => {
  console.log(`  ${slime.name}: [${slime.elements.join(', ')}]`);
});

console.log('\n🌑 DUAL-ELEMENT SHADOW COMBINATIONS:');
dualShadow.forEach(slime => {
  const otherElements = slime.elements.filter(e => e !== 'shadow');
  console.log(`  Shadow + ${otherElements.join('+')}: ${slime.name} [${slime.elements.join(', ')}]`);
});

console.log('\n🌑 MULTI-ELEMENT SHADOW COMBINATIONS:');
multiShadow.forEach(slime => {
  const otherElements = slime.elements.filter(e => e !== 'shadow');
  console.log(`  Shadow + ${otherElements.join('+')}: ${slime.name} [${slime.elements.join(', ')}]`);
});

console.log('\n=== SUMMARY ===');
console.log(`Total shadow slimes: ${shadowCombinations.length}`);
console.log(`Single-element: ${singleShadow.length}`);
console.log(`Dual-element: ${dualShadow.length}`);
console.log(`Multi-element: ${multiShadow.length}`);
