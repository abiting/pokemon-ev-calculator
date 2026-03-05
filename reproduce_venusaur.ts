
import { formatPokemonName } from './client/src/lib/pokeapi';

console.log('Starting reproduction script with fix...');

// Test cases with potentially incorrect baseZhName
const testCases = [
  { englishName: 'venusaur', baseZhName: 'venusaur', speciesName: 'venusaur' },
  { englishName: 'venusaur-mega', baseZhName: 'venusaur', speciesName: 'venusaur' },
  { englishName: 'venusaur-gmax', baseZhName: 'venusaur', speciesName: 'venusaur' }
];

console.log('Testing formatPokemonName with incorrect baseZhName (expecting fix):');
testCases.forEach(test => {
  console.log(`Processing: ${test.englishName}`);
  const result = formatPokemonName(test.englishName, test.baseZhName, test.speciesName);
  console.log(`Input: ${test.englishName}, BaseZh: ${test.baseZhName} => Zh: ${result.zhName}, En: ${result.enName}`);
});

console.log('Script finished.');
