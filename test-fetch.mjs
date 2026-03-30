import fs from 'fs';

const pokemonZhMapping = JSON.parse(fs.readFileSync('./client/src/data/zh-tw-mapping-full.json', 'utf-8'));

function normalize(str) {
  return str
    .replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/Ⅱ/g, '2')
    .replace(/II/g, '2')
    .replace(/２/g, '2')
    .toLowerCase();
}

let nameOrId = 'lucario-mega';
let pokemonId = pokemonZhMapping[nameOrId];

if (!pokemonId) {
  const normalizedInput = normalize(nameOrId);
  const match = Object.keys(pokemonZhMapping).find(key => normalize(key) === normalizedInput);
  if (match) {
    pokemonId = pokemonZhMapping[match];
  }
}

if (!pokemonId) {
  const normalizedInput = normalize(nameOrId);
  const matchingNames = Object.keys(pokemonZhMapping)
    .filter(name => normalize(name).includes(normalizedInput));
  
  if (matchingNames.length === 1) {
    pokemonId = pokemonZhMapping[matchingNames[0]];
  } else if (matchingNames.length > 1) {
    console.log('Ambiguous:', matchingNames);
  }
}

console.log('pokemonId:', pokemonId);
console.log('searchTerm:', pokemonId || nameOrId);
