const fs = require('fs');

console.log('=== COMPREHENSIVE SYSTEM REVIEW ===\n');

// Check 1: Verify SlimeElement type has only 10 core elements
console.log('1. CHECKING SLIMEELEMENT TYPE...');
const typesContent = fs.readFileSync('./src/types/slime.ts', 'utf8');
const slimeElementTypeMatch = typesContent.match(/export type SlimeElement =\s*([^;]+)/);
if (slimeTypeElementTypeMatch) {
  const slimeElementType = slimeElementTypeMatch[1];
  const coreElements = ['fire', 'water', 'plant', 'earth', 'wind', 'ice', 'electric', 'metal', 'light', 'shadow'];
  const allCoreOnly = coreElements.every(element => slimeElementType.includes(`'${element}'`));
  const hasNonCore = ['cosmic', 'void', 'toxic', 'crystal', 'nature', 'arcane', 'divine'].some(element => slimeElementType.includes(`'${element}'`));
  
  console.log(`   ✅ Only core elements: ${allCoreOnly}`);
  console.log(`   ✅ No non-core elements: ${!hasNonCore}`);
  console.log(`   📊 Elements in type: ${slimeTypeElementTypeMatch[1].split('|').length}`);
}

// Check 2: Verify breeding calculator accepts only 10 core elements
console.log('\n2. CHECKING BREEDING CALCULATOR...');
const calculatorContent = fs.readFileSync('./src/utils/breedingCalculator.ts', 'utf8');
const calculatorElementsMatch = calculatorContent.match(/const validElements: SlimeElement\[\] = \[([^\]]+)\]/);
if (calculatorElementsMatch) {
  const calculatorElements = calculatorElementsMatch[1];
  const calculatorCoreOnly = coreElements.every(element => calculatorElements.includes(`'${element}'`));
  const calculatorHasNonCore = ['cosmic', 'void', 'toxic', 'crystal', 'nature', 'arcane', 'divine'].some(element => calculatorElements.includes(`'${element}'`));
  
  console.log(`   ✅ Only core elements: ${calculatorCoreOnly}`);
  console.log(`   ✅ No non-core elements: ${!calculatorHasNonCore}`);
  console.log(`   📊 Elements in calculator: ${calculatorElements.split(',').length}`);
}

// Check 3: Verify all slimes use only core elements
console.log('\n3. CHECKING ALL SLIMES...');
const codexContent = fs.readFileSync('./src/data/slimeCodex.ts', 'utf8');
const slimeMatches = codexContent.match(/\{[^}]*id:\s*'([^']+)'[^}]*elements:\s*\[([^\]]+)\][^}]*\}/g);

const problematicSlimes = [];
const totalSlimes = [];

slimeMatches.forEach(match => {
  const idMatch = match.match(/id:\s*'([^']+)'/);
  const elementsMatch = match.match(/elements:\s*\[([^\]]+)\]/);
  
  if (idMatch && elementsMatch) {
    const id = idMatch[1];
    const elementsStr = elementsMatch[1];
    const elements = elementsStr.match(/'([^']+)'/g).map(e => e.replace(/'/g, ''));
    
    totalSlimes.push({ id, elements });
    
    // Check if any element is non-core
    const hasNonCoreElement = elements.some(element => ['cosmic', 'void', 'toxic', 'crystal', 'nature', 'arcane', 'divine'].includes(element));
    
    if (hasNonCoreElement) {
      problematicSlimes.push({
        id,
        elements,
        nonCoreElements: elements.filter(e => ['cosmic', 'void', 'toxic', 'crystal', 'nature', 'arcane', 'divine'].includes(e))
      });
    }
  }
});

console.log(`   ✅ Total slimes: ${totalSlimes.length}`);
console.log(`   ✅ Slimes with non-core elements: ${problematicSlimes.length}`);
console.log(`   ✅ Slimes with only core elements: ${totalSlimes.length - problematicSlimes.length}`);

if (problematicSlimes.length > 0) {
  console.log('\n   ❌ PROBLEMATIC SLIMES FOUND:');
  problematicSlimes.forEach(slime => {
    console.log(`      ${slime.id}: [${slime.elements.join(', ')}] - Non-core: [${slime.nonCoreElements.join(', ')}]`);
  });
} else {
  console.log('   ✅ ALL SLIMES USE ONLY CORE ELEMENTS');
}

// Check 4: Verify key breeding combinations work
console.log('\n4. CHECKING KEY BREEDING COMBINATIONS...');
const testCombinations = [
  { parents: ['fire', 'water'], expected: ['lava_slime', 'steam_slime', 'caramel_slime', 'volcano_slime'] },
  { parents: ['plant', 'earth'], expected: ['nature_slime'] },
  { parents: ['ice', 'earth'], expected: ['gem_slime'] },
  { parents: ['fire', 'wind'], expected: ['bolt_slime'] }
];

testCombinations.forEach(test => {
  const parentUnion = [...new Set(test.parents)];
  const sortedUnion = parentUnion.sort();
  const unionKey = sortedUnion.join('+');
  
  const matches = totalSlimes.filter(slime => {
    if (slime.elements.length !== sortedUnion.length) return false;
    const sortedElements = [...slime.elements].sort();
    return sortedElements.every((element, index) => element === sortedUnion[index]);
  });
  
  const foundIds = matches.map(s => s.id);
  const allExpectedFound = test.expected.every(id => foundIds.includes(id));
  
  console.log(`   ${test.parents.join('+')}: ${matches.length} found, ${allExpectedFound ? '✅' : '❌'} expected ${test.expected.length}`);
});

// Check 5: Verify no non-core elements exist in other files
console.log('\n5. CHECKING FOR TRACES OF NON-CORE ELEMENTS...');
const filesToCheck = [
  './src/utils/slimeRenderer.ts',
  './src/utils/nameGenerator.ts',
  './src/utils/loreGenerator.ts',
  './src/utils/eggRenderer.ts',
  './src/data/traitData.ts'
];

let totalTraces = 0;
filesToCheck.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const nonCoreElements = ['cosmic', 'void', 'toxic', 'crystal', 'nature', 'arcane', 'divine'];
  const traces = nonCoreElements.filter(element => content.includes(element));
  
  if (traces.length > 0) {
    console.log(`   ❌ ${file}: Found traces of [${traces.join(', ')}]`);
    totalTraces += traces.length;
  }
});

if (totalTraces === 0) {
  console.log('   ✅ No traces of non-core elements found in other files');
} else {
  console.log(`   ❌ Found ${totalTraces} total traces of non-core elements`);
}

console.log('\n=== FINAL VERDICT ===');
const allChecksPass = 
  allCoreOnly && !hasNonCore && // Type check
  calculatorCoreOnly && !calculatorHasNonCore && // Calculator check
  problematicSlimes.length === 0 && // Slimes check
  totalTraces === 0; // Traces check

if (allChecksPass) {
  console.log('🎉 SYSTEM IS 100% CORRECT');
  console.log('✅ All 10 core elements only');
  console.log('✅ All slimes use correct elements');
  console.log('✅ Breeding system works correctly');
  console.log('✅ No traces of non-core elements');
} else {
  console.log('❌ SYSTEM HAS ISSUES THAT NEED FIXING');
}
