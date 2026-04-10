import pokemonZhMapping from './client/src/data/zh-tw-mapping-full.json';
const idToZhMapping: Record<number, string> = {};
Object.entries(pokemonZhMapping as Record<string, number>).forEach(([name, id]) => {
  idToZhMapping[id] = name;
});
console.log("ID 1013 Chinese Name:", idToZhMapping[1013]);
