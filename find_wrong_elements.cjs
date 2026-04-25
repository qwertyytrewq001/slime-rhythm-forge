const fs = require('fs');

console.log('=== FINDING SLIMES WITH WRONG ELEMENTS ===\n');

// The 6 wrong elements that were removed from the system
const wrongElements = ['lava', 'nature', 'wild', 'mud', 'snow', 'mist', 'sand', 'ash', 'blizzard', 'storm', 'molten', 'bloom', 'darkness'];

console.log('Wrong elements to check:');
wrongElements.forEach(element => {
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
    
    // Check if any element is in the wrong elements list
    const hasWrongElement = elements.some(element => wrongElements.includes(element));
    
    if (hasWrongElement) {
      problematicSlimes.push({
        id,
        elements,
        wrongElements: elements.filter(e => wrongElements.includes(e))
      });
    }
  }
});

console.log(`\n=== FOUND ${problematicSlimes.length} SLIMES WITH WRONG ELEMENTS ===`);

if (problematicSlimes.length > 0) {
  problematicSlimes.forEach(slime => {
    console.log(`\n❌ ${slime.id}:`);
    console.log(`  Elements: [${slime.elements.join(', ')}]`);
    console.log(`  Wrong elements: [${slime.wrongElements.join(', ')}]`);
    console.log(`  Needs to be fixed`);
  });
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total problematic slimes: ${problematicSlimes.length}`);
  console.log('These need to be updated to use correct elements');
} else {
  console.log('✅ No slimes found with wrong elements');
}

console.log('\n=== CORRECT ELEMENTS (10 core elements) ===');
const correctElements = ['fire', 'water', 'plant', 'earth', 'wind', 'ice', 'electric', 'metal', 'light', 'shadow'];
correctElements.forEach(element => {
  console.log(`- ${element}`);
});
