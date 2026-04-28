const fs = require('fs');

// Read the slime codex file
const content = fs.readFileSync('src/data/slimeCodex.ts', 'utf8');

// Find all slime objects
const slimeObjects = content.match(/\{\s*id:\s*['"][^'"]+['"],\s*name:\s*['"][^'"]+['"],\s*elements:\s*\[[^\]]*\]/g);

console.log('=== ALL 68 SLIMES ===\n');

slimeObjects.forEach((slimeStr, index) => {
  // Extract ID
  const idMatch = slimeStr.match(/id:\s*['"]([^'"]+)['"]/);
  const id = idMatch ? idMatch[1] : '';
  
  // Extract name
  const nameMatch = slimeStr.match(/name:\s*['"]([^'"]+)['"]/);
  const name = nameMatch ? nameMatch[1] : '';
  
  // Extract elements
  const elementsMatch = slimeStr.match(/elements:\s*\[([^\]]*)\]/);
  const elementsStr = elementsMatch ? elementsMatch[1] : '';
  const elements = elementsStr.match(/'([^']+)'/g) || [];
  const cleanElements = elements.map(e => e.replace(/'/g, ''));
  
  console.log(`${index + 1}. ${name}`);
  console.log(`   Elements: ${cleanElements.join(', ')}`);
  console.log('');
});

console.log(`Total Slimes: ${slimeObjects.length}`);
