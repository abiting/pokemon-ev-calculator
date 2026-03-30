import { fetchPokemon, fetchPokemonVarieties } from './client/src/lib/pokeapi';

async function test() {
  console.log('Fetching normal venusaur...');
  const p1 = await fetchPokemon('venusaur');
  console.log('p1:', p1.name, p1.apiName, p1.enName);
  
  console.log('Fetching varieties...');
  const vars = await fetchPokemonVarieties(p1.species.url);
  console.log('vars:', vars);
  
  console.log('Fetching mega venusaur...');
  const p2 = await fetchPokemon('venusaur-mega');
  console.log('p2:', p2.name, p2.apiName, p2.enName);
  
  console.log('Switching back to normal venusaur...');
  const p3 = await fetchPokemon('venusaur');
  console.log('p3:', p3.name, p3.apiName, p3.enName);
}

test();
