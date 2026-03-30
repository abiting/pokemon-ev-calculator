const https = require('https');
const fs = require('fs');

const fetchCategory = (category) => {
  return new Promise((resolve, reject) => {
    https.get(`https://pokeapi.co/api/v2/item-category/${category}/`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.items.map(i => i.name));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
};

async function run() {
  const categories = ['standard-balls', 'special-balls', 'apricorn-balls'];
  let ballsToRemove = [];
  for (const cat of categories) {
    const items = await fetchCategory(cat);
    ballsToRemove = ballsToRemove.concat(items);
  }
  
  const path = '/home/ubuntu/pokemon-ev-calculator/client/src/data/items.json';
  const items = JSON.parse(fs.readFileSync(path, 'utf8'));
  const filtered = items.filter(item => !ballsToRemove.includes(item));
  fs.writeFileSync(path, JSON.stringify(filtered, null, 2));
  console.log('Original length:', items.length);
  console.log('Filtered length:', filtered.length);
}
run();
