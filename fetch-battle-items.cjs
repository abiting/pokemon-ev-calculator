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

  // 1. Fetch holdable-active items
  const holdableActive = await fetchUrl('https://pokeapi.co/api/v2/item-attribute/holdable-active/');
  if (holdableActive && holdableActive.items) {
    holdableActive.items.forEach(i => validItems.add(i.name));
  }

  // 2. Fetch all berries
  const berryPocket = await fetchUrl('https://pokeapi.co/api/v2/item-pocket/berries/');
  if (berryPocket && berryPocket.categories) {
    for (const cat of berryPocket.categories) {
      const catData = await fetchUrl(cat.url);
      if (catData && catData.items) {
        catData.items.forEach(i => validItems.add(i.name));
      }
    }
  }

  // 3. Fetch mega stones
  const megaStones = await fetchUrl('https://pokeapi.co/api/v2/item-category/mega-stones/');
  if (megaStones && megaStones.items) {
    megaStones.items.forEach(i => validItems.add(i.name));
  }

  // 4. Fetch Z-crystals
  const zCrystals = await fetchUrl('https://pokeapi.co/api/v2/item-category/z-crystals/');
  if (zCrystals && zCrystals.items) {
    zCrystals.items.forEach(i => validItems.add(i.name));
  }

  // 5. Fetch specific categories that are definitely battle items
  const categoriesToInclude = [
    'species-specific', // Light Ball, Thick Club, etc.
    'type-enhancement', // Charcoal, Mystic Water, etc.
    'choice',           // Choice Band, etc.
    'plates',           // Arceus plates
    'jewels',           // Flying Gem, etc.
    'bad-held-items',   // Iron Ball, Flame Orb, etc.
    'held-items',       // Leftovers, Rocky Helmet, etc.
    'training',         // Macho Brace, Power Weight, etc. (sometimes used in battle for speed drop)
  ];

  for (const cat of categoriesToInclude) {
    const catData = await fetchUrl(`https://pokeapi.co/api/v2/item-category/${cat}/`);
    if (catData && catData.items) {
      catData.items.forEach(i => validItems.add(i.name));
    }
  }

  // 6. Gen 9 items might not be categorized well, let's manually add some known Gen 9 battle items if they exist in PokeAPI
  const gen9BattleItems = [
    'ability-shield', 'clear-amulet', 'punching-glove', 'covert-cloak', 
    'loaded-dice', 'booster-energy', 'fairy-feather', 'wellspring-mask',
    'hearthflame-mask', 'cornerstone-mask', 'metal-alloy', 'stellar-tera-shard'
  ];
  
  gen9BattleItems.forEach(i => validItems.add(i));

  // Remove some items that might have sneaked in but aren't battle items
  const toRemove = [
    'exp-share', 'lucky-egg', 'amulet-coin', 'cleanse-tag', 'smoke-ball', 
    'everstone', 'soothe-bell', 'oval-stone', 'destiny-knot', 'power-weight',
    'power-bracer', 'power-belt', 'power-lens', 'power-band', 'power-anklet',
    'macho-brace' // Removing training items as they are rarely used in actual competitive battles
  ];

  toRemove.forEach(i => validItems.delete(i));

  // Convert to array and sort
  const finalItems = Array.from(validItems).sort();
  
  const path = '/home/ubuntu/pokemon-ev-calculator/client/src/data/items.json';
  fs.writeFileSync(path, JSON.stringify(finalItems, null, 2));
  console.log('Filtered length:', finalItems.length);
}
run();
