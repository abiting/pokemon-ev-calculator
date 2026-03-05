import type { Pokemon } from '@/types/pokemon';
import { ABILITY_TRANSLATIONS } from './ability-translations';
import pokemonZhMapping from '@/data/zh-tw-mapping-full.json';

// 建立反向查找對應表（ID → 繁體中文名稱）
const idToZhMapping: Record<number, string> = {};
Object.entries(pokemonZhMapping as Record<string, number>).forEach(([name, id]) => {
  if (!idToZhMapping[id]) {
    idToZhMapping[id] = name;
  }
});

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_KEY_PREFIX = 'pokemon_cache_';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 小時

interface CacheData {
  data: Pokemon;
  timestamp: number;
}

export interface SearchResult {
  id: number;
  name: string;
  zhName: string;
  isDefault: boolean;
}

export async function searchPokemon(query: string): Promise<SearchResult[]> {
  // 1. 嘗試解析為 ID
  const id = parseInt(query);
  if (!isNaN(id)) {
    return [];
  }

  // 2. 搜尋本地中文對應表
  const matchingNames = Object.keys(pokemonZhMapping as Record<string, number>)
    .filter(name => name.includes(query));

  if (matchingNames.length === 0) {
    // 如果中文搜尋沒有結果，允許使用者直接搜尋英文
    return [{
      id: 0,
      name: query,
      zhName: `搜尋 "${query}"`,
      isDefault: true
    }];
  }

  // 3. 構建結果列表
  const results: SearchResult[] = matchingNames.map(name => ({
    id: (pokemonZhMapping as Record<string, number>)[name],
    name: name,
    zhName: name,
    isDefault: true
  }));

  return results;
}

export async function fetchPokemonVarieties(speciesUrl: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(speciesUrl);
    if (!response.ok) return [];
    const data = await response.json();
    
    // 獲取基礎中文名稱
    const zhHantName = data.names.find((n: any) => n.language.name === 'zh-Hant');
    const baseZhName = zhHantName ? zhHantName.name : data.name;

    return Promise.all(data.varieties
      .filter((v: any) => {
        const name = v.pokemon.name;
        // 保留預設型態
        if (v.is_default) return true;
        
        // 僅保留種族值不同的形態
        if (name.includes('-mega') || 
            name.includes('-gmax') || 
            name.includes('-alola') || 
            name.includes('-galar') || 
            name.includes('-hisui') || 
            name.includes('-paldea') ||
            name.includes('-primal') ||
            name.includes('-eternamax') ||
            name.includes('-origin') || 
            name.includes('-therian') || 
            name.includes('-incarnate') || 
            name.includes('-black') || 
            name.includes('-white') || 
            name.includes('-dusk') || 
            name.includes('-dawn') || 
            name.includes('-ultra') || 
            name.includes('-crowned') || 
            name.includes('-rapid-strike') || 
            name.includes('-single-strike') || 
            name.includes('-low-key') || 
            name.includes('-female') || 
            name.includes('-male') ||
            name.startsWith('rotom-') || 
            name.startsWith('deoxys-') || 
            name.startsWith('wormadam-') || 
            name.startsWith('shaymin-') || 
            name.startsWith('giratina-') || 
            name.startsWith('tornadus-') || 
            name.startsWith('thundurus-') || 
            name.startsWith('landorus-') || 
            name.startsWith('kyurem-') || 
            name.startsWith('keldeo-') || 
            name.startsWith('meloetta-') || 
            name.startsWith('aegislash-') || 
            name.startsWith('pumpkaboo-') || 
            name.startsWith('gourgeist-') || 
            name.startsWith('zygarde-') || 
            name.startsWith('hoopa-') || 
            name.startsWith('lycanroc-') || 
            name.startsWith('wishiwashi-') || 
            name.startsWith('minior-') || 
            name.startsWith('mimikyu-') || 
            name.startsWith('necrozma-') || 
            name.startsWith('toxtricity-') || 
            name.startsWith('eiscue-') || 
            name.startsWith('indeedee-') || 
            name.startsWith('morpeko-') || 
            name.startsWith('urshifu-') || 
            name.startsWith('calyrex-') || 
            name.startsWith('basculegion-') || 
            name.startsWith('enamorus-') || 
            name.startsWith('palafin-') || 
            name.startsWith('dudunsparce-') || 
            name.startsWith('gimmighoul-') || 
            name.startsWith('ogerpon-') || 
            name.startsWith('terapagos-')
        ) return true;
        
        return false;
      })
      .map(async (v: any) => {
        const id = parseInt(v.pokemon.url.split('/').filter(Boolean).pop());
        
        // 格式化名稱
        const { zhName } = formatPokemonName(v.pokemon.name, baseZhName, data.name);
        
        return {
          id,
          name: v.pokemon.name,
          zhName: v.is_default ? baseZhName : zhName,
          isDefault: v.is_default
        };
      }));
  } catch (error) {
    console.warn('獲取變體失敗:', error);
    return [];
  }
}

export function formatPokemonName(englishName: string, baseZhName: string, speciesName: string): { zhName: string, enName: string } {
  const capitalize = (s: string) => s.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  const baseEnName = capitalize(speciesName);
  
  let zhName = '';
  let enName = '';

  if (englishName.includes('-mega-x')) {
    zhName = `超級${baseZhName} X`;
    enName = `Mega ${baseEnName} X`;
  } else if (englishName.includes('-mega-y')) {
    zhName = `超級${baseZhName} Y`;
    enName = `Mega ${baseEnName} Y`;
  } else if (englishName.includes('-mega')) {
    zhName = `超級${baseZhName}`;
    enName = `Mega ${baseEnName}`;
  } else if (englishName.includes('-gmax')) {
    zhName = `超極巨化${baseZhName}`;
    enName = `Gigantamax ${baseEnName}`;
  } else if (englishName.includes('-eternamax')) {
    zhName = `無極巨化${baseZhName}`;
    enName = `Eternamax ${baseEnName}`;
  } else if (englishName.includes('-alola')) {
    zhName = `阿羅拉${baseZhName}`;
    enName = `Alolan ${baseEnName}`;
  } else if (englishName.includes('-galar')) {
    zhName = `伽勒爾${baseZhName}`;
    enName = `Galarian ${baseEnName}`;
  } else if (englishName.includes('-hisui')) {
    zhName = `洗翠${baseZhName}`;
    enName = `Hisuian ${baseEnName}`;
  } else if (englishName.includes('-paldea')) {
    zhName = `帕底亞${baseZhName}`;
    enName = `Paldean ${baseEnName}`;
  } else if (englishName.includes('-origin')) {
    zhName = `${baseZhName}（起源形態）`;
    enName = `Origin ${baseEnName}`;
  } else if (englishName.includes('-therian')) {
    zhName = `${baseZhName}（靈獸形態）`;
    enName = `Therian ${baseEnName}`;
  } else if (englishName.includes('-incarnate')) {
    zhName = `${baseZhName}（化身形態）`;
    enName = `Incarnate ${baseEnName}`;
  } else if (englishName.includes('-black')) {
    zhName = `暗黑${baseZhName}`;
    enName = `Black ${baseEnName}`;
  } else if (englishName.includes('-white')) {
    zhName = `焰白${baseZhName}`;
    enName = `White ${baseEnName}`;
  } else if (englishName.includes('-crowned')) {
    zhName = `${baseZhName}（劍之王/盾之王）`;
    enName = `Crowned ${baseEnName}`;
  } else if (englishName.includes('-rapid-strike')) {
    zhName = `${baseZhName}（連擊流）`;
    enName = `Rapid Strike ${baseEnName}`;
  } else if (englishName.includes('-single-strike')) {
    zhName = `${baseZhName}（一擊流）`;
    enName = `Single Strike ${baseEnName}`;
  } else {
    // 其他特殊形態
    const suffix = englishName.replace(speciesName, '').replace(/^-/, '');
    let zhSuffix = suffix;
    // 簡單翻譯常見後綴
    if (suffix === 'altered') zhSuffix = '別種形態';
    
    zhName = `${baseZhName}（${zhSuffix}）`;
    enName = capitalize(englishName);
  }
  return { zhName, enName };
}

export async function fetchPokemon(nameOrId: string | number): Promise<Pokemon> {
  let searchTerm = nameOrId;
  
  // 中文轉 ID
  if (typeof nameOrId === 'string') {
    let pokemonId = (pokemonZhMapping as Record<string, number>)[nameOrId];
    if (!pokemonId) {
      // 模糊搜尋
      const matchingNames = Object.keys(pokemonZhMapping as Record<string, number>)
        .filter(name => name.includes(nameOrId));
      
      if (matchingNames.length === 1) {
        pokemonId = (pokemonZhMapping as Record<string, number>)[matchingNames[0]];
      } else if (matchingNames.length > 1) {
        const candidates = matchingNames.map(name => ({
          name,
          id: (pokemonZhMapping as Record<string, number>)[name]
        }));
        throw { isAmbiguous: true, candidates };
      }
    }
    if (pokemonId) searchTerm = pokemonId;
  }

  const cacheKey = `${CACHE_KEY_PREFIX}${searchTerm}`;
  
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cacheData: CacheData = JSON.parse(cached);
      if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
        return cacheData.data;
      }
    }
  } catch (error) {
    console.warn('快取讀取失敗:', error);
  }

  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${searchTerm.toString().toLowerCase()}`);
  if (!response.ok) {
    throw new Error('找不到該寶可夢');
  }

  const data: any = await response.json();
  
  // 獲取物種資訊以取得中文名
  let zhName = data.name;
  let varieties: SearchResult[] = [];
  
  try {
    const speciesResponse = await fetch(data.species.url);
    if (speciesResponse.ok) {
      const speciesData = await speciesResponse.json();
      const zhHantName = speciesData.names.find((n: any) => n.language.name === 'zh-Hant');
      if (zhHantName) {
        zhName = zhHantName.name;
      }
      
      // 獲取變體列表
      varieties = await fetchPokemonVarieties(data.species.url);
    }
  } catch (e) {
    console.warn('Failed to fetch species data', e);
  }

  // 格式化名稱
  const { zhName: formattedZhName, enName } = formatPokemonName(data.name, zhName, data.species.name);
  
  // 如果是預設型態，直接使用基礎中文名
  const finalZhName = data.is_default ? zhName : formattedZhName;

  const pokemon: Pokemon = {
    id: data.id,
    name: finalZhName,
    enName: enName,
    types: data.types.map((t: any) => {
      const typeMap: Record<string, string> = {
        normal: '一般', fire: '火', water: '水', electric: '電', grass: '草',
        ice: '冰', fighting: '格鬥', poison: '毒', ground: '地面', flying: '飛行',
        psychic: '超能力', bug: '蟲', rock: '岩石', ghost: '幽靈', dragon: '龍',
        steel: '鋼', dark: '惡', fairy: '妖精'
      };
      return typeMap[t.type.name] || t.type.name;
    }),
    stats: {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      spAttack: data.stats[3].base_stat,
      spDefense: data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
    },
    evs: {
      hp: data.stats[0].effort,
      attack: data.stats[1].effort,
      defense: data.stats[2].effort,
      spAttack: data.stats[3].effort,
      spDefense: data.stats[4].effort,
      speed: data.stats[5].effort,
    },
    abilities: data.abilities.map((a: any) => ({
      name: ABILITY_TRANSLATIONS[a.ability.name] || a.ability.name,
      isHidden: a.is_hidden
    })),
    imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    varieties: varieties.length > 1 ? varieties : undefined
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: pokemon,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('快取寫入失敗:', e);
  }

  return pokemon;
}
