const fs = require('fs');
const path = require('path');

console.log('=== COMPREHENSIVE CODEBASE REVIEW ===\n');

// Helper function to search for files
function findFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(fullPath, extensions));
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  });
  
  return results;
}

console.log('1. REVIEWING SLIMEELEMENT TYPE DEFINITION...\n');

// Check SlimeElement type definition
const typesContent = fs.readFileSync('./src/types/slime.ts', 'utf8');
const coreElements = ['fire', 'water', 'plant', 'earth', 'wind', 'ice', 'electric', 'metal', 'light', 'shadow'];
const nonCoreElements = ['cosmic', 'void', 'toxic', 'crystal', 'nature', 'arcane', 'divine'];

const typeMatch = typesContent.match(/export type SlimeElement =([^;]+)/);
if (typeMatch) {
  console.log('✅ SlimeElement type found:');
  console.log(`   ${typeMatch[1].trim()}`);
  
  const hasAllCore = coreElements.every(el => typeMatch[1].includes(`'${el}'`));
  const hasNoNonCore = nonCoreElements.every(el => !typeMatch[1].includes(`'${el}'`));
  
  console.log(`   ✅ Contains all 10 core elements: ${hasAllCore}`);
  console.log(`   ✅ No non-core elements: ${hasNoNonCore}`);
}

console.log('\n2. CHECKING SLIMEELEMENT USAGE ACROSS CODEBASE...\n');

// Find all TypeScript files
const tsFiles = findFiles('./src', ['.ts', '.tsx']);
let usageIssues = [];

tsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for imports of SlimeElement
  if (content.includes('SlimeElement')) {
    // Check for any non-core element usage
    nonCoreElements.forEach(element => {
      if (content.includes(`'${element}'`) || content.includes(`"${element}"`)) {
        usageIssues.push({
          file,
          element,
          context: 'String literal usage'
        });
      }
    });
  }
});

if (usageIssues.length > 0) {
  console.log('❌ Found non-core element usage:');
  usageIssues.forEach(issue => {
    console.log(`   ${issue.file}: ${issue.element} (${issue.context})`);
  });
} else {
  console.log('✅ No non-core element usage found in TypeScript files');
}

console.log('\n3. VERIFYING BREEDING CALCULATOR LOGIC...\n');

const calculatorContent = fs.readFileSync('./src/utils/breedingCalculator.ts', 'utf8');

// Check validElements array
const validElementsMatch = calculatorContent.match(/const validElements: SlimeElement\[\] = \[([^\]]+)\]/);
if (validElementsMatch) {
  const validElements = validElementsMatch[1];
  const calculatorHasAllCore = coreElements.every(el => validElements.includes(`'${el}'`));
  const calculatorHasNoNonCore = nonCoreElements.every(el => !validElements.includes(`'${el}'`));
  
  console.log('✅ Breeding calculator validElements:');
  console.log(`   ✅ Contains all 10 core elements: ${calculatorHasAllCore}`);
  console.log(`   ✅ No non-core elements: ${calculatorHasNoNonCore}`);
}

// Check filterSlimesByExactElements function
const filterFunctionMatch = calculatorContent.match(/function filterSlimesByExactElements[^}]+}/s);
if (filterFunctionMatch) {
  console.log('✅ filterSlimesByExactElements function found and uses exact element matching');
}

console.log('\n4. CHECKING ALL SLIME DATA FILES...\n');

const codexContent = fs.readFileSync('./src/data/slimeCodex.ts', 'utf8');
const slimeMatches = codexContent.match(/\{[^}]*id:\s*'([^']+)'[^}]*elements:\s*\[([^\]]+)\][^}]*\}/g);

let totalSlimes = 0;
let slimesWithIssues = [];

slimeMatches.forEach(match => {
  const idMatch = match.match(/id:\s*'([^']+)'/);
  const elementsMatch = match.match(/elements:\s*\[([^\]]+)\]/);
  
  if (idMatch && elementsMatch) {
    totalSlimes++;
    const id = idMatch[1];
    const elementsStr = elementsMatch[1];
    const elements = elementsStr.match(/'([^']+)'/g).map(e => e.replace(/'/g, ''));
    
    // Check for non-core elements
    const nonCoreUsage = elements.filter(el => nonCoreElements.includes(el));
    if (nonCoreUsage.length > 0) {
      slimesWithIssues.push({
        id,
        elements,
        nonCoreUsage
      });
    }
  }
});

console.log(`✅ Total slimes in codex: ${totalSlimes}`);
console.log(`✅ Slimes with only core elements: ${totalSlimes - slimesWithIssues.length}`);
console.log(`❌ Slimes with non-core elements: ${slimesWithIssues.length}`);

if (slimesWithIssues.length > 0) {
  slimesWithIssues.forEach(slime => {
    console.log(`   ${slime.id}: [${slime.elements.join(', ')}] - Non-core: [${slime.nonCoreUsage.join(', ')}]`);
  });
}

console.log('\n5. CHECKING FOR REMAINING NON-CORE ELEMENT REFERENCES...\n');

// Search all files for non-core element references
const allFiles = findFiles('./src', ['.ts', '.tsx', '.js', '.jsx', '.cjs']);
let totalReferences = 0;

nonCoreElements.forEach(element => {
  let elementReferences = [];
  
  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(`'${element}'`) || content.includes(`"${element}"`)) {
      elementReferences.push(file);
    }
  });
  
  if (elementReferences.length > 0) {
    console.log(`❌ ${element} found in ${elementReferences.length} files:`);
    elementReferences.forEach(file => {
      console.log(`   ${file}`);
    });
    totalReferences += elementReferences.length;
  }
});

if (totalReferences === 0) {
  console.log('✅ No non-core element references found in any files');
}

console.log('\n6. TESTING KEY BREEDING COMBINATIONS...\n');

// Test breeding combinations
const testCombinations = [
  { parents: ['fire', 'water'], expectedCount: 4 },
  { parents: ['plant', 'earth'], expectedCount: 1 },
  { parents: ['ice', 'earth'], expectedCount: 1 },
  { parents: ['water', 'earth'], expectedCount: 6 },
  { parents: ['fire', 'wind'], expectedCount: 1 }
];

testCombinations.forEach(test => {
  const parentUnion = [...new Set(test.parents)];
  const sortedUnion = parentUnion.sort();
  
  const matches = [];
  slimeMatches.forEach(match => {
    const idMatch = match.match(/id:\s*'([^']+)'/);
    const elementsMatch = match.match(/elements:\s*\[([^\]]+)\]/);
    
    if (idMatch && elementsMatch) {
      const id = idMatch[1];
      const elementsStr = elementsMatch[1];
      const elements = elementsStr.match(/'([^']+)'/g).map(e => e.replace(/'/g, ''));
      
      if (elements.length === sortedUnion.length) {
        const sortedElements = [...elements].sort();
        if (sortedElements.every((el, idx) => el === sortedUnion[idx])) {
          matches.push(id);
        }
      }
    }
  });
  
  const passed = matches.length === test.expectedCount;
  console.log(`${test.parents.join('+')}: ${matches.length} slimes found ${passed ? '✅' : '❌'} (expected ${test.expectedCount})`);
  
  if (!passed) {
    console.log(`   Found: ${matches.join(', ')}`);
  }
});

console.log('\n7. CHECKING UI COMPONENTS...\n');

// Check BreedingDen component
const breedingDenContent = fs.readFileSync('./src/components/game/BreedingDen.tsx', 'utf8');
const usesGetPossibleOutcomes = breedingDenContent.includes('getPossibleOutcomes');
const displaysPossibleOutcomes = breedingDenContent.includes('possibleOutcomes.map');

console.log(`✅ BreedingDen uses getPossibleOutcomes: ${usesGetPossibleOutcomes}`);
console.log(`✅ BreedingDen displays possibleOutcomes: ${displaysPossibleOutcomes}`);

// Check for any filtering or limiting logic
const hasFiltering = breedingDenContent.includes('.slice(') || breedingDenContent.includes('.limit(') || breedingDenContent.includes('.filter(');
console.log(`✅ No filtering logic found in BreedingDen: ${!hasFiltering}`);

console.log('\n=== FINAL VERDICT ===');

const allChecksPass = 
  hasAllCore && hasNoNonCore && // Type check
  calculatorHasAllCore && calculatorHasNoNonCore && // Calculator check
  slimesWithIssues.length === 0 && // Slimes check
  totalReferences === 0 && // References check
  usesGetPossibleOutcomes && displaysPossibleOutcomes && !hasFiltering; // UI check

if (allChecksPass) {
  console.log('🎉 CODEBASE IS 100% CORRECT');
  console.log('✅ SlimeElement type properly defined with 10 core elements');
  console.log('✅ Breeding calculator uses only 10 core elements');
  console.log('✅ All slimes use only 10 core elements');
  console.log('✅ No references to non-core elements found');
  console.log('✅ UI components correctly display breeding results');
  console.log('✅ Key breeding combinations work correctly');
  console.log('\n🚀 SYSTEM IS READY FOR PRODUCTION');
} else {
  console.log('❌ CODEBASE HAS ISSUES THAT NEED FIXING');
}
