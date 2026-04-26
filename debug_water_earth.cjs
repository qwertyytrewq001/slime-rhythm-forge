const fs = require('fs');

console.log('=== DEBUGGING WATER + EARTH BREEDING ===\n');

// Read and parse all slimes
const codexContent = fs.readFileSync('./src/data/slimeCodex.ts', 'utf8');
const slimeMatches = codexContent.match(/\{[^}]*id:\s*'([^']+)'[^}]*elements:\s*\[([^\]]+)\][^}]*\}/g);

const waterEarthSlimes = [];
const allSlimes = [];

slimeMatches.forEach(match => {
  const idMatch = match.match(/id:\s*'([^']+)'/);
  const elementsMatch = match.match(/elements:\s*\[([^\]]+)\]/);
  
  if (idMatch && elementsMatch) {
    const id = idMatch[1];
    const elementsStr = elementsMatch[1];
    const elements = elementsStr.match(/'([^']+)'/g).map(e => e.replace(/'/g, ''));
    
    allSlimes.push({ id, elements });
    
    // Check if slime has exactly water and earth elements
    const sortedElements = [...elements].sort();
    const targetElements = ['earth', 'water'].sort();
    
    if (sortedElements.length === targetElements.length &&
        sortedElements.every((element, index) => element === targetElements[index])) {
      waterEarthSlimes.push({
        id,
        name: id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        elements,
        weight: match.match(/weight:\s*(\d+)/)?.[1] || 'unknown'
      });
    }
  }
});

console.log(`Total slimes in codex: ${allSlimes.length}`);
console.log(`Slimes with exactly [water, earth] elements: ${waterEarthSlimes.length}\n`);

console.log('🌊 WATER + EARTH SLIMES:');
waterEarthSlimes.forEach(slime => {
  console.log(`  ${slime.name} (${slime.id}): [${slime.elements.join(', ')}] - Weight: ${slime.weight}`);
});

// Check what other water+earth variants exist
const waterEarthVariants = allSlimes.filter(slime => {
  return (slime.elements.includes('water') && slime.elements.includes('earth')) ||
         (slime.elements.includes('water') && slime.elements.includes('earth'));
});

console.log(`\n🔍 ALL SLIMES WITH WATER AND EARTH (any order):`);
waterEarthVariants.forEach(slime => {
  console.log(`  ${slime.id}: [${slime.elements.join(', ')}]`);
});

// Test breeding simulation
console.log('\n🧪 BREEDING SIMULATION:');
console.log('Water + Earth breeding should find these slimes:');

const parent1Elements = ['water'];
const parent2Elements = ['earth'];
const parentUnion = [...new Set([...parent1Elements, ...parent2Elements])];
const sortedUnion = parentUnion.sort();

console.log(`Parent union: [${sortedUnion.join(', ')}]`);

const matches = allSlimes.filter(slime => {
  if (slime.elements.length !== sortedUnion.length) return false;
  const sortedElements = [...slime.elements].sort();
  return sortedElements.every((element, index) => element === sortedUnion[index]);
});

console.log(`Found ${matches.length} matching slimes:`);
matches.forEach(slime => {
  console.log(`  ${slime.id}: [${slime.elements.join(', ')}]`);
});
