const fs = require('fs');

console.log('=== FINDING SLIMES USING NON-CORE ELEMENTS ===\n');

// The 10 core elements that should remain
const coreElements = ['fire', 'water', 'plant', 'earth', 'wind', 'ice', 'electric', 'metal', 'light', 'shadow'];

// Elements that need to be removed
const nonCoreElements = ['cosmic', 'void', 'toxic', 'crystal', 'nature', 'arcane', 'divine'];

console.log('Core elements (should remain):');
coreElements.forEach(element => {
  console.log(`- ${element}`);
});

console.log('\nNon-core elements (need to be removed):');
nonCoreElements.forEach(element => {
  console.log(`- ${element}`);
});

// Read and parse all slimes
const codexContent = fs.readFileSync('./src/data/slimeCodex.ts', 'utf8');
const slimeMatches = codexContent.match(/\{[^}]*id:\s*'([^']+)'[^}]*elements:\s*\[([^\]]+)\][^}]*\}/g);

const problematicSlimes = [];
slimeMatches.forEach(match => {
  const idMatch = match.match(/id:\s*'([^']+)'/);
  const elementsMatch = match.match(/elements:\s*\[([^\]]+)\]/);
  
  if (idMatch && elementsMatch) {
    const id = idMatch[1];
    const elementsStr = elementsMatch[1];
    const elements = elementsStr.match(/'([^']+)'/g).map(e => e.replace(/'/g, ''));
    
    // Check if any element is in non-core elements
    const hasNonCoreElement = elements.some(element => nonCoreElements.includes(element));
    
    if (hasNonCoreElement) {
      problematicSlimes.push({
        id,
        elements,
        nonCoreElements: elements.filter(e => nonCoreElements.includes(e))
      });
    }
  }
});

console.log(`\n=== FOUND ${problematicSlimes.length} SLIMES WITH NON-CORE ELEMENTS ===`);

if (problematicSlimes.length > 0) {
  problematicSlimes.forEach(slime => {
    console.log(`\n❌ ${slime.id}:`);
    console.log(`  Elements: [${slime.elements.join(', ')}]`);
    console.log(`  Non-core elements: [${slime.nonCoreElements.join(', ')}]`);
    console.log(`  Needs to be fixed`);
  });
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total problematic slimes: ${problematicSlimes.length}`);
  console.log('These need to be updated to use only core elements');
} else {
  console.log('✅ No slimes found with non-core elements');
}
