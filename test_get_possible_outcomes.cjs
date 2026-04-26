const fs = require('fs');

console.log('=== TESTING GETPOSSIBLEOUTCOMES FUNCTION ===\n');

// Simulate the getPossibleOutcomes function logic
function validateSlimeElements(elements) {
  if (!elements || !Array.isArray(elements)) {
    return 'Elements must be an array';
  }
  if (elements.length === 0) {
    return 'Elements array cannot be empty';
  }
  if (elements.length > 4) {
    return 'Slimes cannot have more than 4 elements';
  }
  
  const validElements = [
    'fire', 'water', 'plant', 'earth', 'wind',
    'ice', 'electric', 'metal', 'light', 'shadow'
  ];
  
  for (const element of elements) {
    if (!validElements.includes(element)) {
      return `Invalid element: ${element}`;
    }
  }
  
  return null;
}

function getPossibleOutcomes(parent1Elements, parent2Elements) {
  // Input validation
  const parent1Validation = validateSlimeElements(parent1Elements);
  const parent2Validation = validateSlimeElements(parent2Elements);
  
  if (parent1Validation) {
    console.error(`❌ Invalid parent1 elements in getPossibleOutcomes: ${parent1Validation}`);
    return [];
  }
  
  if (parent2Validation) {
    console.error(`❌ Invalid parent2 elements in getPossibleOutcomes: ${parent2Validation}`);
    return [];
  }
  
  // Parent Union (PU): Combine all unique elements from both parents
  const parentUnion = [...new Set([...parent1Elements, ...parent2Elements])];
  console.log(`🧬 GetPossibleOutcomes - Parent Union: [${parentUnion.join(', ')}]`);
  
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
        weight: match.match(/weight:\s*(\d+)/)?.[1] || 'unknown'
      });
    }
  });
  
  // Database Filtration: Only slimes with EXACTLY the parent elements
  const validOutcomes = allSlimes.filter(slime => {
    // Sort once for comparison
    const parentElementsSorted = [...parentUnion].sort();
    
    // Quick length check first for performance
    if (slime.elements.length !== parentElementsSorted.length) {
      return false;
    }
    
    // Sort slime elements for comparison
    const slimeElements = [...slime.elements].sort();
    
    // Compare element by element
    return slimeElements.every((element, index) => element === parentElementsSorted[index]);
  });
  
  console.log(`🧬 GetPossibleOutcomes - Valid Outcomes Found: ${validOutcomes.length} slimes`);
  
  return validOutcomes;
}

// Test water + earth breeding
console.log('🧪 TESTING WATER + EARTH BREEDING:');
const outcomes = getPossibleOutcomes(['water'], ['earth']);

console.log('\n📊 RESULTS:');
outcomes.forEach((slime, index) => {
  console.log(`  ${index + 1}. ${slime.name} (${slime.id}): [${slime.elements.join(', ')}] - Weight: ${slime.weight}`);
});

console.log(`\n✅ Total outcomes: ${outcomes.length}`);
