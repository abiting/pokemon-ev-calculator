import { fetchPokemon } from './client/src/lib/pokeapi';

async function test() {
  const p1 = await fetchPokemon('venusaur-mega');
  console.log('Mega:', p1.name, p1.apiName, p1.enName, p1.zhName);
  
  const p2 = await fetchPokemon('venusaur');
  console.log('Normal:', p2.name, p2.apiName, p2.enName, p2.zhName);
}

test();
