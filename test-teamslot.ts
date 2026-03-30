import { fetchPokemon, fetchPokemonVarieties } from './client/src/lib/pokeapi';

async function test() {
  const p1 = await fetchPokemon('venusaur');
  const vars = await fetchPokemonVarieties(p1.species.url);
  
  console.log('--- Normal Venusaur ---');
  console.log('pokemon.apiName:', p1.apiName);
  console.log('pokemon.name:', p1.name);
  console.log('Select value:', p1.apiName || p1.name);
  console.log('Options:');
  vars.forEach(v => {
    console.log(`  - label: ${v.name}, value: ${v.apiName || v.name}, matches: ${(p1.apiName || p1.name) === (v.apiName || v.name)}`);
  });

  const p2 = await fetchPokemon('venusaur-mega');
  console.log('\n--- Mega Venusaur ---');
  console.log('pokemon.apiName:', p2.apiName);
  console.log('pokemon.name:', p2.name);
  console.log('Select value:', p2.apiName || p2.name);
  console.log('Options:');
  vars.forEach(v => {
    console.log(`  - label: ${v.name}, value: ${v.apiName || v.name}, matches: ${(p2.apiName || p2.name) === (v.apiName || v.name)}`);
  });
}

test();
