import { searchPokemon, fetchPokemon } from './client/src/lib/pokeapi';

async function test() {
  try {
    console.log("Searching for 'floette'...");
    const results = await searchPokemon('floette');
    console.log(results);
    
    console.log("\nFetching 'floette'...");
    const floette = await fetchPokemon('floette');
    console.log("Varieties:", floette.varieties.map((v: any) => v.pokemon.name));
    
    console.log("\nFetching '10296'...");
    const mega = await fetchPokemon(10296);
    console.log("Mega name:", mega.name, mega.zhName);
  } catch (e) {
    console.error(e);
  }
}

test();
