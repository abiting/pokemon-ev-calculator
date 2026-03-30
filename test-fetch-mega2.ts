import { fetchPokemon } from './client/src/lib/pokeapi';

async function test() {
  const data = await fetchPokemon('venusaur-mega');
  console.log('name:', data.name);
  console.log('apiName:', data.apiName);
  console.log('enName:', data.enName);
}

test();
