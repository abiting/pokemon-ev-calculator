import { fetchPokemonVarieties } from './client/src/lib/pokeapi';

async function test() {
  const vars = await fetchPokemonVarieties('https://pokeapi.co/api/v2/pokemon-species/376/');
  console.log(vars);
}

test();
