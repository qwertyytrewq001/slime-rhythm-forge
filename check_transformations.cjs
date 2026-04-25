const fs = require('fs');

console.log('=== Checking All Transformation Targets ===\n');

// Read all slimes to check elements
const codexContent = fs.readFileSync('./src/data/slimeCodex.ts', 'utf8');
const slimeMatches = codexContent.match(/elements: \[([^\]]+)\]/g);

const singleElementSlimes = new Set();
slimeMatches.forEach(match => {
  const elements = match.match(/'([^']+)'/g);
  if (elements && elements.length === 1) {
    singleElementSlimes.add(elements[0].replace(/'/g, ''));
  }
});

console.log('Single-element slimes found:');
Array.from(singleElementSlimes).sort().forEach(element => {
  console.log(`- ${element}`);
});

console.log('\n=== Transformation Targets Analysis ===');

const transformations = {
  'plant+earth': ['nature'],
  'plant+water': ['wild'],
  'fire+ice': ['crystal'],
  'light+shadow': ['cosmic', 'void', 'arcane', 'divine'],
  'fire+wind': ['electric'],
  'water+earth': ['mud'],
  'water+ice': ['snow'],
  'water+wind': ['mist'],
  'earth+wind': ['sand'],
  'fire+plant': ['ash'],
  'ice+wind': ['blizzard'],
  'electric+water': ['storm'],
  'metal+fire': ['molten'],
  'light+plant': ['bloom'],
  'shadow+earth': ['darkness']
};

let brokenTransformations = [];

Object.entries(transformations).forEach(([combo, targets]) => {
  const missing = targets.filter(target => !singleElementSlimes.has(target));
  if (missing.length > 0) {
    brokenTransformations.push({ combo, missing, targets });
    console.log(`❌ ${combo}: Missing single-element slimes for [${missing.join(', ')}]`);
  } else {
    console.log(`✅ ${combo}: All targets exist`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total transformations: ${Object.keys(transformations).length}`);
console.log(`Broken transformations: ${brokenTransformations.length}`);
console.log(`Working transformations: ${Object.keys(transformations).length - brokenTransformations.length}`);

if (brokenTransformations.length > 0) {
  console.log('\n=== BROKEN TRANSFORMATIONS ===');
  brokenTransformations.forEach(({ combo, missing, targets }) => {
    console.log(`${combo}:`);
    console.log(`  Expected: [${targets.join(', ')}]`);
    console.log(`  Missing: [${missing.join(', ')}]`);
    console.log(`  Status: This combination is completely broken!`);
  });
}
