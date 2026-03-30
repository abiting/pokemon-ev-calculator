const https = require('https');
const fs = require('fs');

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
};

async function run() {
  let validItems = new Set();

  // Fetch holdable items
  const holdable = await fetchUrl('https://pokeapi.co/api/v2/item-attribute/holdable/');
  if (holdable && holdable.items) {
    holdable.items.forEach(i => validItems.add(i.name));
  }

  // Fetch holdable-active items
  const holdableActive = await fetchUrl('https://pokeapi.co/api/v2/item-attribute/holdable-active/');
  if (holdableActive && holdableActive.items) {
    holdableActive.items.forEach(i => validItems.add(i.name));
  }

  // Fetch all berries
  const berries = await fetchUrl('https://pokeapi.co/api/v2/item-category/baking-only/'); // Some berries are here
  // Actually, let's just fetch the 'berries' category or all items in 'berry' pocket
  const berryCategory = await fetchUrl('https://pokeapi.co/api/v2/item-category/effort-drop/');
  
  // Let's fetch the whole 'berries' pocket
  const berryPocket = await fetchUrl('https://pokeapi.co/api/v2/item-pocket/berries/');
  if (berryPocket && berryPocket.categories) {
    for (const cat of berryPocket.categories) {
      const catData = await fetchUrl(cat.url);
      if (catData && catData.items) {
        catData.items.forEach(i => validItems.add(i.name));
      }
    }
  }

  // Also include mega stones, z-crystals if they are not in holdable
  const megaStones = await fetchUrl('https://pokeapi.co/api/v2/item-category/mega-stones/');
  if (megaStones && megaStones.items) {
    megaStones.items.forEach(i => validItems.add(i.name));
  }

  const zCrystals = await fetchUrl('https://pokeapi.co/api/v2/item-category/z-crystals/');
  if (zCrystals && zCrystals.items) {
    zCrystals.items.forEach(i => validItems.add(i.name));
  }
  
  const speciesSpecific = await fetchUrl('https://pokeapi.co/api/v2/item-category/species-specific/');
  if (speciesSpecific && speciesSpecific.items) {
    speciesSpecific.items.forEach(i => validItems.add(i.name));
  }

  const typeEnhancement = await fetchUrl('https://pokeapi.co/api/v2/item-category/type-enhancement/');
  if (typeEnhancement && typeEnhancement.items) {
    typeEnhancement.items.forEach(i => validItems.add(i.name));
  }

  const choice = await fetchUrl('https://pokeapi.co/api/v2/item-category/choice/');
  if (choice && choice.items) {
    choice.items.forEach(i => validItems.add(i.name));
  }

  const plates = await fetchUrl('https://pokeapi.co/api/v2/item-category/plates/');
  if (plates && plates.items) {
    plates.items.forEach(i => validItems.add(i.name));
  }

  const jewels = await fetchUrl('https://pokeapi.co/api/v2/item-category/jewels/');
  if (jewels && jewels.items) {
    jewels.items.forEach(i => validItems.add(i.name));
  }

  const badHeldItems = await fetchUrl('https://pokeapi.co/api/v2/item-category/bad-held-items/');
  if (badHeldItems && badHeldItems.items) {
    badHeldItems.items.forEach(i => validItems.add(i.name));
  }

  const training = await fetchUrl('https://pokeapi.co/api/v2/item-category/training/');
  if (training && training.items) {
    training.items.forEach(i => validItems.add(i.name));
  }

  const heldItems = await fetchUrl('https://pokeapi.co/api/v2/item-category/held-items/');
  if (heldItems && heldItems.items) {
    heldItems.items.forEach(i => validItems.add(i.name));
  }

  // Convert to array and sort
  const finalItems = Array.from(validItems).sort();
  
  const path = '/home/ubuntu/pokemon-ev-calculator/client/src/data/items.json';
  fs.writeFileSync(path, JSON.stringify(finalItems, null, 2));
  console.log('Filtered length:', finalItems.length);
}
run();
