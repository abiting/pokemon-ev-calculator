import { fetchPokemon } from './client/src/lib/pokeapi';
async function test() {
  const p = await fetchPokemon('venusaur-mega');
  console.log('apiName:', p.apiName);
  console.log('name:', p.name);
  console.log('enName:', p.enName);
}
test();
