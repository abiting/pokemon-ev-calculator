import fetch from 'node-fetch';

async function test() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon-species/3');
  const data = await response.json();
  
  const baseZhName = '妙蛙花';
  const speciesName = data.name;
  
  const capitalize = (s) => s.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  let cleanBaseZhName = baseZhName.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '');
  let baseEnName = capitalize(speciesName);
  
  for (const v of data.varieties) {
    const englishName = v.pokemon.name;
    let zhName = '';
    let enName = '';
    
    if (englishName.includes('-mega-x')) {
      zhName = `超級${cleanBaseZhName} X`;
      enName = `Mega ${baseEnName} X`;
    } else if (englishName.includes('-mega-y')) {
      zhName = `超級${cleanBaseZhName} Y`;
      enName = `Mega ${baseEnName} Y`;
    } else if (englishName.includes('-mega')) {
      zhName = `超級${cleanBaseZhName}`;
      enName = `Mega ${baseEnName}`;
    } else if (englishName.includes('-gmax')) {
      zhName = `超極巨${cleanBaseZhName}`;
      enName = `Gigantamax ${baseEnName}`;
    } else {
      zhName = cleanBaseZhName;
      const formParts = englishName.replace(speciesName, '').split('-').filter(Boolean);
      if (formParts.length > 0) {
        const formName = formParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
        enName = `${baseEnName} (${formName})`;
        zhName = `${cleanBaseZhName}（${formName}）`;
      } else {
        enName = baseEnName;
      }
    }
    console.log(`${englishName}: enName="${enName}", zhName="${zhName}"`);
  }
}

test();
