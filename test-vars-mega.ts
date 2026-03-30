import { fetchPokemonVarieties } from './client/src/lib/pokeapi';
async function test() {
  const vars = await fetchPokemonVarieties(10033);
  console.log(vars);
}
test();
