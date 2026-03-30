const fs = require('fs');
const path = '/home/ubuntu/pokemon-ev-calculator/client/src/data/items.json';
const items = JSON.parse(fs.readFileSync(path, 'utf8'));
const filtered = items.filter(i => !/^(tm|hm|tr)\d+/.test(i));
fs.writeFileSync(path, JSON.stringify(filtered, null, 2));
console.log('Original length:', items.length);
console.log('Filtered length:', filtered.length);
