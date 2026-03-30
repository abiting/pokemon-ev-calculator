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
const CACHE_KEY_PREFIX = 'pokemon_cache_v28_';
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
    // 如果是 ID，直接返回單一結果（這裡簡化處理，實際可能需要 fetch 確認）
    // 但為了保持一致性，我們還是走 fetchPokemon 流程，或者這裡先返回一個預測結果
    // 為了準確，我們這裡先只處理名稱搜尋，ID 搜尋直接交給 fetchPokemon
    return [];
  }

  // Special handling for Nidoran search
  if (query.toLowerCase() === 'nidoran') {
    return [
      { id: 29, name: 'nidoran-f', zhName: '尼多蘭', isDefault: true },
      { id: 32, name: 'nidoran-m', zhName: '尼多朗', isDefault: true }
    ];
  }

  // 2. 搜尋本地中文對應表
  // Normalize function to handle full-width/half-width and case sensitivity
  const normalize = (str: string) => {
    return str
      .replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // Full-width to half-width
      .replace(/Ⅱ/g, '2') // Handle Roman Numeral II
      .replace(/II/g, '2') // Handle ASCII II
      .replace(/２/g, '2') // Handle Full-width 2 explicitly if not covered by range
      .toLowerCase();
  };

  const normalizedQuery = normalize(query);
  const matchingNames = Object.keys(pokemonZhMapping as Record<string, number>)
    .filter(name => normalize(name).includes(normalizedQuery));

  if (matchingNames.length === 0) {
    // 特殊處理英文搜尋映射
    const searchMap: Record<string, string> = {
      // Gen 7
      'morpeko': 'morpeko-full-belly',
      'oricorio': 'oricorio-baile',
      'tatsugiri': 'tatsugiri-curly',
      'toxtricity': 'toxtricity-amped',
      'urshifu': 'urshifu-single-strike',
      'darmanitan': 'darmanitan-standard',
      'necrozma': 'necrozma',
      'lycanroc': 'lycanroc-midday',
      'minior': 'minior-red-meteor',
      'mimikyu': 'mimikyu-disguised',
      'wishiwashi': 'wishiwashi-solo',
      
      // Gen 4
      'wormadam': 'wormadam-plant',
      'giratina': 'giratina-altered',
      'shaymin': 'shaymin-land',
      
      // Gen 5
      'basculin': 'basculin-red-striped',
      'tornadus': 'tornadus-incarnate',
      'thundurus': 'thundurus-incarnate',
      'landorus': 'landorus-incarnate',
      'keldeo': 'keldeo-ordinary',
      'meloetta': 'meloetta-aria',
      
      // Gen 6
      'meowstic': 'meowstic-male',
      'aegislash': 'aegislash-shield',
      'pumpkaboo': 'pumpkaboo-average',
      'gourgeist': 'gourgeist-average',
      'zygarde': 'zygarde-50',
      
      // Gen 3
      'deoxys': 'deoxys-normal',

      // Gen 9 DLC
      'gouging fire': 'gouging-fire',
      'raging bolt': 'raging-bolt',
      'iron boulder': 'iron-boulder',
      'iron crown': 'iron-crown',
      'walking wake': 'walking-wake',
      'iron leaves': 'iron-leaves',
      'archaludon': 'archaludon',
      'hydrapple': 'hydrapple',
      'dipplin': 'dipplin',
      'poltchageist': 'poltchageist',
      'sinistcha': 'sinistcha',
      'okidogi': 'okidogi',
      'munkidori': 'munkidori',
      'fezandipiti': 'fezandipiti',
      'ogerpon': 'ogerpon',
      'terapagos': 'terapagos',
      'pecharunt': 'pecharunt',
    };



    // Try to map from searchMap first
    let mappedQuery = searchMap[query.toLowerCase()];
    
    // If not found in map, try replacing spaces with hyphens for English names
    if (!mappedQuery) {
       mappedQuery = query.toLowerCase().replace(/\s+/g, '-');
    }

    // Force fix for Ogerpon
    if (mappedQuery === 'ogerpon') {
       return [{
          id: 1017,
          name: 'ogerpon',
          zhName: '厄鬼椪',
          isDefault: true
       }];
    }

    // 如果中文搜尋沒有結果，允許使用者直接搜尋英文
    // 回傳一個特殊的結果，讓 UI 知道這是一個直接搜尋的建議
    return [{
      id: 0, // 0 表示這是一個搜尋建議，不是具體的 ID
      name: mappedQuery,
      zhName: `搜尋 "${query}"`,
      isDefault: true
    }];
  }

  // 3. 構建結果列表
  const results: SearchResult[] = matchingNames.map(name => ({
    id: (pokemonZhMapping as Record<string, number>)[name],
    name: name, // 這裡暫時用中文名當 name，後續 fetchPokemon 會處理
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

    // Hardcoded injection for Ogerpon forms if they are missing or incomplete
    if (data.name === 'ogerpon') {
       const ogerponForms = [
          { name: 'ogerpon', url: 'https://pokeapi.co/api/v2/pokemon/1017' },
          { name: 'ogerpon-wellspring-mask', url: 'https://pokeapi.co/api/v2/pokemon/10174' },
          { name: 'ogerpon-hearthflame-mask', url: 'https://pokeapi.co/api/v2/pokemon/10175' },
          { name: 'ogerpon-cornerstone-mask', url: 'https://pokeapi.co/api/v2/pokemon/10176' }
       ];
       
       return ogerponForms.map(form => {
          const id = parseInt(form.url.split('/').filter(Boolean).pop() || '0');
          let enName = 'Ogerpon (Teal Mask)';
          let zhName = '厄鬼椪（碧草面具）';
          
          if (form.name.includes('wellspring')) {
             enName = 'Ogerpon (Wellspring Mask)';
             zhName = '厄鬼椪（水井面具）';
          } else if (form.name.includes('hearthflame')) {
             enName = 'Ogerpon (Hearthflame Mask)';
             zhName = '厄鬼椪（火灶面具）';
          } else if (form.name.includes('cornerstone')) {
             enName = 'Ogerpon (Cornerstone Mask)';
             zhName = '厄鬼椪（礎石面具）';
          }
          
          return {
             id,
             name: enName,
             zhName: zhName,
             isDefault: form.name === 'ogerpon'
          };
       });
    }

    // Hardcoded injection for Terapagos forms
    if (data.name === 'terapagos') {
       const terapagosForms = [
          { name: 'terapagos', url: 'https://pokeapi.co/api/v2/pokemon/1024' },
          { name: 'terapagos-terastal', url: 'https://pokeapi.co/api/v2/pokemon/10276' },
          { name: 'terapagos-stellar', url: 'https://pokeapi.co/api/v2/pokemon/10277' }
       ];
       
       return terapagosForms.map(form => {
          const id = parseInt(form.url.split('/').filter(Boolean).pop() || '0');
          let enName = 'Terapagos (Normal Form)';
          let zhName = '太樂巴戈斯（普通形態）';
          
          if (form.name.includes('terastal')) {
             enName = 'Terapagos (Terastal Form)';
             zhName = '太樂巴戈斯（太晶形態）';
          } else if (form.name.includes('stellar')) {
             enName = 'Terapagos (Stellar Form)';
             zhName = '太樂巴戈斯（星晶形態）';
          }
          
          return {
             id,
             name: enName,
             zhName: zhName,
             isDefault: form.name === 'terapagos'
          };
       });
    }

    const varieties = await Promise.all(data.varieties.map(async (v: any) => {
      const id = parseInt(v.pokemon.url.split('/').filter(Boolean).pop());
      // 這裡我們需要一個簡單的方式來獲取變體的中文名，
      // 但 fetchPokemon 已經有這個邏輯了。
      // 為了避免循環依賴或重複代碼，我們這裡先簡單處理，
      // 或者我們讓 UI 層去 fetch 詳細資料。
      // 更好的方式是：這裡只返回基本資訊，UI 顯示時再 fetch 詳細資料（如果需要）
      // 或者我們這裡直接調用 fetchPokemon 的邏輯片段（需要重構）
      
      // 使用 formatPokemonName 確保名稱一致性
      const formatted = formatPokemonName(v.pokemon.name, baseZhName, data.name);
      
      // 特別處理 Darmanitan 的變體名稱
      if (v.pokemon.name.includes('darmanitan')) {
         console.log('Processing Darmanitan variety:', v.pokemon.name); // Debug log
         
         if (v.pokemon.name === 'darmanitan-standard' || v.pokemon.name === 'darmanitan') {
            formatted.enName = 'Darmanitan';
            formatted.zhName = '達摩狒狒（普通模式）';
         } else if (v.pokemon.name.includes('zen') && !v.pokemon.name.includes('galar')) {
            formatted.enName = 'Darmanitan (Zen)';
            formatted.zhName = '達摩狒狒（達摩模式）';
         } else if (v.pokemon.name.includes('galar') && !v.pokemon.name.includes('zen')) {
            formatted.enName = 'Darmanitan (Galarian)';
            formatted.zhName = '達摩狒狒（伽勒爾的樣子）';
         } else if (v.pokemon.name.includes('galar') && v.pokemon.name.includes('zen')) {
            formatted.enName = 'Darmanitan (Galarian Zen)';
            formatted.zhName = '達摩狒狒（伽勒爾達摩模式）';
         }
      }

      // 特別處理 Ogerpon 的變體名稱
      if (v.pokemon.name.includes('ogerpon')) {
         if (v.pokemon.name === 'ogerpon') {
            formatted.enName = 'Ogerpon (Teal Mask)';
            formatted.zhName = '厄鬼椪（碧草面具）';
         } else if (v.pokemon.name.includes('wellspring')) {
            formatted.enName = 'Ogerpon (Wellspring Mask)';
            formatted.zhName = '厄鬼椪（水井面具）';
         } else if (v.pokemon.name.includes('hearthflame')) {
            formatted.enName = 'Ogerpon (Hearthflame Mask)';
            formatted.zhName = '厄鬼椪（火灶面具）';
         } else if (v.pokemon.name.includes('cornerstone')) {
            formatted.enName = 'Ogerpon (Cornerstone Mask)';
            formatted.zhName = '厄鬼椪（礎石面具）';
         }
      }

      // 特別處理 Lycanroc 的變體名稱
      if (v.pokemon.name.includes('lycanroc')) {
         console.log('Processing Lycanroc variety:', v.pokemon.name); // Debug log
         
         if (v.pokemon.name === 'lycanroc-midday' || v.pokemon.name === 'lycanroc') {
            formatted.enName = 'Lycanroc';
            formatted.zhName = '鬃岩狼人（白晝的樣子）';
         } else if (v.pokemon.name.includes('midnight')) {
            formatted.enName = 'Lycanroc (Midnight Form)';
            formatted.zhName = '鬃岩狼人（黑夜的樣子）';
         } else if (v.pokemon.name.includes('dusk')) {
            formatted.enName = 'Lycanroc (Dusk Form)';
            formatted.zhName = '鬃岩狼人（黃昏的樣子）';
         }
      }

      // 特別處理 Mimikyu 的變體名稱
      if (v.pokemon.name.includes('mimikyu')) {
         console.log('Processing Mimikyu variety:', v.pokemon.name); // Debug log
         
         if (v.pokemon.name === 'mimikyu-disguised' || v.pokemon.name === 'mimikyu') {
            formatted.enName = 'Mimikyu';
            formatted.zhName = '謎擬 Ｑ';
         } else {
            // 謎擬 Ｑ 的其他形態（現形、霸主等）種族值相同，直接過濾掉
            return null;
         }
      }

      // 特別處理 Minior 的變體名稱
      if (v.pokemon.name.includes('minior')) {
         if (v.pokemon.name === 'minior-red-meteor') {
            formatted.enName = 'Minior (Meteor)';
            formatted.zhName = '小隕星（流星的樣子）';
         } else if (v.pokemon.name === 'minior-red' || v.pokemon.name === 'minior-red-core') {
            formatted.enName = 'Minior (Red Core)';
            formatted.zhName = '小隕星（紅色核心）';
         } else {
            // 過濾掉其他顏色的重複形態，只保留紅色核心和流星作為代表
            return null;
         }
      }

      // 特別處理 Necrozma 的變體名稱
      if (v.pokemon.name.includes('necrozma')) {
         console.log('Processing Necrozma variety:', v.pokemon.name); // Debug log
         
         if (v.pokemon.name === 'necrozma') {
            formatted.enName = 'Necrozma';
            formatted.zhName = '奈克洛茲瑪';
         } else if (v.pokemon.name.includes('dusk')) {
            formatted.enName = 'Necrozma (Dusk Mane)';
            formatted.zhName = '奈克洛茲瑪（黃昏之鬃）';
         } else if (v.pokemon.name.includes('dawn')) {
            formatted.enName = 'Necrozma (Dawn Wings)';
            formatted.zhName = '奈克洛茲瑪（拂曉之翼）';
         } else if (v.pokemon.name.includes('ultra')) {
            formatted.enName = 'Ultra Necrozma';
            formatted.zhName = '究極奈克洛茲瑪';
         }
      }

      // 特別處理 Ogerpon 的變體名稱
      if (v.pokemon.name.includes('ogerpon')) {
         if (v.pokemon.name === 'ogerpon') {
            formatted.enName = 'Ogerpon (Teal Mask)';
            formatted.zhName = '厄鬼椪（碧草面具）';
         } else if (v.pokemon.name.includes('wellspring')) {
            formatted.enName = 'Ogerpon (Wellspring Mask)';
            formatted.zhName = '厄鬼椪（水井面具）';
         } else if (v.pokemon.name.includes('hearthflame')) {
            formatted.enName = 'Ogerpon (Hearthflame Mask)';
            formatted.zhName = '厄鬼椪（火灶面具）';
         } else if (v.pokemon.name.includes('cornerstone')) {
            formatted.enName = 'Ogerpon (Cornerstone Mask)';
            formatted.zhName = '厄鬼椪（礎石面具）';
         }
      }

      // 特別處理 Zygarde 的變體名稱
      if (v.pokemon.name.includes('zygarde')) {
         if (v.pokemon.name.includes('zygarde-10') || v.pokemon.name.includes('zygarde-10-power-construct')) {
            formatted.enName = 'Zygarde (10% Forme)';
            formatted.zhName = '基格爾德（10%形態）';
         } else if (v.pokemon.name === 'zygarde-50' || v.pokemon.name === 'zygarde') {
            formatted.enName = 'Zygarde';
            formatted.zhName = '基格爾德（50%形態）';
         } else if (v.pokemon.name === 'zygarde-complete') {
            formatted.enName = 'Zygarde (Complete Forme)';
            formatted.zhName = '基格爾德（完全體形態）';
         }
      }

      return {
        id,
        name: formatted.enName, // 使用格式化後的英文名稱
        zhName: formatted.zhName,
        isDefault: v.is_default
      };
    }));
    
    return varieties.filter((v): v is SearchResult => v !== null);
  } catch (error) {
    console.warn('獲取變體失敗:', error);
    return [];
  }
}

export function formatPokemonName(englishName: string, baseZhName: string, speciesName: string): { zhName: string, enName: string } {
  // Hardcoded fix for Nidoran F and M
  if (englishName === 'nidoran-f') {
    return { zhName: '尼多蘭', enName: 'Nidoran (Female)' };
  }
  if (englishName === 'nidoran-m') {
    return { zhName: '尼多朗', enName: 'Nidoran (Male)' };
  }

  // Hardcoded fix for Treasures of Ruin (Wo-Chien, Chien-Pao, Ting-Lu, Chi-Yu)
  if (englishName === 'wo-chien') {
    return { zhName: '古簡蝸', enName: 'Wo-Chien' };
  }
  if (englishName === 'chien-pao') {
    return { zhName: '古劍豹', enName: 'Chien-Pao' };
  }
  if (englishName === 'ting-lu') {
    return { zhName: '古鼎鹿', enName: 'Ting-Lu' };
  }
  if (englishName === 'chi-yu') {
    return { zhName: '古玉魚', enName: 'Chi-Yu' };
  }

  // Hardcoded fix for Ogerpon forms
  if (englishName.includes('ogerpon')) {
    if (englishName === 'ogerpon') {
      return { zhName: '厄鬼椪（碧草面具）', enName: 'Ogerpon (Teal Mask)' };
    }
    if (englishName.includes('wellspring')) {
      return { zhName: '厄鬼椪（水井面具）', enName: 'Ogerpon (Wellspring Mask)' };
    }
    if (englishName.includes('hearthflame')) {
      return { zhName: '厄鬼椪（火灶面具）', enName: 'Ogerpon (Hearthflame Mask)' };
    }
    if (englishName.includes('cornerstone')) {
      return { zhName: '厄鬼椪（礎石面具）', enName: 'Ogerpon (Cornerstone Mask)' };
    }
  }

  // Hardcoded overrides for specific Pokemon forms to ensure correct display
  if (englishName.includes('lycanroc-midnight')) {
    return {
      zhName: '鬃岩狼人（黑夜的樣子）',
      enName: 'Lycanroc (Midnight Form)'
    };
  }
  if (englishName.includes('lycanroc-dusk')) {
    return {
      zhName: '鬃岩狼人（黃昏的樣子）',
      enName: 'Lycanroc (Dusk Form)'
    };
  }
  if (englishName.includes('necrozma-dusk')) {
    return {
      zhName: '奈克洛茲瑪（黃昏之鬃）',
      enName: 'Necrozma (Dusk Mane)'
    };
  }
  if (englishName.includes('necrozma-dawn')) {
    return {
      zhName: '奈克洛茲瑪（拂曉之翼）',
      enName: 'Necrozma (Dawn Wings)'
    };
  }
  if (englishName.includes('necrozma-ultra')) {
    return {
      zhName: '究極奈克洛茲瑪',
      enName: 'Ultra Necrozma'
    };
  }
  if (englishName.includes('urshifu-rapid-strike-gmax')) {
    return {
      zhName: '超極巨武道熊師（連擊流）',
      enName: 'Gigantamax Urshifu (Rapid Strike)'
    };
  }
  if (englishName.includes('urshifu-single-strike-gmax')) {
    return {
      zhName: '超極巨武道熊師（一擊流）',
      enName: 'Gigantamax Urshifu (Single Strike)'
    };
  }
  if (englishName.includes('urshifu-rapid-strike')) {
    return {
      zhName: '武道熊師（連擊流）',
      enName: 'Urshifu (Rapid Strike)'
    };
  }
  if (englishName === 'urshifu-single-strike' || englishName === 'urshifu') {
    return {
      zhName: '武道熊師（一擊流）',
      enName: 'Urshifu (Single Strike)'
    };
  }
  if (englishName.includes('toxtricity-amped-gmax')) {
    return {
      zhName: '超極巨顫弦蠑螈（高調的樣子）',
      enName: 'Gigantamax Toxtricity (Amped Form)'
    };
  }
  if (englishName.includes('toxtricity-low-key-gmax')) {
    return {
      zhName: '超極巨顫弦蠑螈（低調的樣子）',
      enName: 'Gigantamax Toxtricity (Low Key Form)'
    };
  }
  if (englishName.includes('toxtricity-low-key')) {
    return {
      zhName: '顫弦蠑螈（低調的樣子）',
      enName: 'Toxtricity (Low Key Form)'
    };
  }
  // Rotom forms special handling
  if (englishName.includes('rotom-heat')) {
    return { zhName: '洛托姆（加熱）', enName: 'Rotom (Heat)' };
  }
  if (englishName.includes('rotom-wash')) {
    return { zhName: '洛托姆（清洗）', enName: 'Rotom (Wash)' };
  }
  if (englishName.includes('rotom-frost')) {
    return { zhName: '洛托姆（結冰）', enName: 'Rotom (Frost)' };
  }
  if (englishName.includes('rotom-fan')) {
    return { zhName: '洛托姆（旋轉）', enName: 'Rotom (Fan)' };
  }
  if (englishName.includes('rotom-mow')) {
    return { zhName: '洛托姆（切割）', enName: 'Rotom (Mow)' };
  }
  if (englishName === 'rotom') {
    return { zhName: '洛托姆', enName: 'Rotom' };
  }
  if (englishName === 'toxtricity-amped' || englishName === 'toxtricity') {
    return {
      zhName: '顫弦蠑螈（高調的樣子）',
      enName: 'Toxtricity (Amped Form)'
    };
  }
  if (englishName.includes('calyrex-ice')) {
    return {
      zhName: '蕾冠王（騎白馬的樣子）',
      enName: 'Calyrex (Ice Rider)'
    };
  }
  if (englishName.includes('calyrex-shadow')) {
    return {
      zhName: '蕾冠王（騎黑馬的樣子）',
      enName: 'Calyrex (Shadow Rider)'
    };
  }
  if (englishName.includes('ursaluna-bloodmoon')) {
    return {
      zhName: '月月熊（赫月）',
      enName: 'Ursaluna (Bloodmoon)'
    };
  }


  // Helper to capitalize words
  const capitalize = (s: string) => s.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  
  // Ensure base names are clean
  let cleanBaseZhName = baseZhName.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '');
  let baseEnName = capitalize(speciesName);

  // Fix Nidoran base names
  if (speciesName === 'nidoran-f') {
    baseEnName = 'Nidoran (Female)';
    cleanBaseZhName = '尼多蘭';
  }
  if (speciesName === 'nidoran-m') {
    baseEnName = 'Nidoran (Male)';
    cleanBaseZhName = '尼多朗';
  }

  // Fix Mr. Mime, Mr. Rime, Mime Jr.
  if (baseEnName === 'Mr Mime') baseEnName = 'Mr. Mime';
  if (baseEnName === 'Mr Rime') baseEnName = 'Mr. Rime';
  if (baseEnName === 'Mime Jr') baseEnName = 'Mime Jr.';

  // Hardcoded fix for Venusaur (ID 3)
  if (speciesName === 'venusaur' || englishName.includes('venusaur')) {
    cleanBaseZhName = '妙蛙花';
  }
  
  let zhName = '';
  let enName = '';

  // Handle Special Forms (Mega, Gmax, Regional)
  if (englishName.includes('-mega-x')) {
    zhName = `超級${cleanBaseZhName} X`;
    enName = `Mega ${baseEnName} X`;
  } else if (englishName.includes('-mega-y')) {
    zhName = `超級${cleanBaseZhName} Y`;
    enName = `Mega ${baseEnName} Y`;
  } else if (englishName.includes('lucario-mega')) {
    // Special handling for Mega Lucario Z
    if (englishName.includes('-z') || englishName === 'lucario-mega-z') {
      zhName = '超級路卡利歐 Z';
      enName = 'Mega Lucario Z';
    } else {
      zhName = '超級路卡利歐';
      enName = 'Mega Lucario';
    }
  } else if (englishName.includes('-mega')) {
    zhName = `超級${cleanBaseZhName}`;
    enName = `Mega ${baseEnName}`;
  } else if (englishName.includes('-gmax')) {
    zhName = `超極巨${cleanBaseZhName}`;
    enName = `Gigantamax ${baseEnName}`;
  } else if (englishName.includes('-primal')) {
    zhName = `原始${cleanBaseZhName}`;
    enName = `Primal ${baseEnName}`;
  } else if (englishName.includes('wormadam-plant') || englishName === 'wormadam') {
    zhName = `${cleanBaseZhName}（草木蓑衣）`;
    enName = `Wormadam (Plant Cloak)`;
  } else if (englishName.includes('wormadam-sandy')) {
    zhName = `${cleanBaseZhName}（砂土蓑衣）`;
    enName = `Wormadam (Sandy Cloak)`;
  } else if (englishName.includes('wormadam-trash')) {
    zhName = `${cleanBaseZhName}（垃圾蓑衣）`;
    enName = `Wormadam (Trash Cloak)`;
  } else if (englishName.includes('minior-red-meteor')) {
    zhName = `${cleanBaseZhName}（流星的樣子）`;
    enName = `Minior (Meteor)`;
  } else if (englishName.includes('minior-red') || englishName.includes('minior-red-core')) {
    zhName = `${cleanBaseZhName}（紅色核心）`;
    enName = `Minior (Red Core)`;
  } else if (englishName.includes('deoxys-normal') || englishName === 'deoxys') {
    zhName = `${cleanBaseZhName}（普通形態）`;
    enName = `Deoxys`;
  } else if (englishName.includes('deoxys-attack')) {
    zhName = `${cleanBaseZhName}（攻擊形態）`;
    enName = `Deoxys (Attack)`;
  } else if (englishName.includes('deoxys-defense')) {
    zhName = `${cleanBaseZhName}（防禦形態）`;
    enName = `Deoxys (Defense)`;
  } else if (englishName.includes('deoxys-speed')) {
    zhName = `${cleanBaseZhName}（速度形態）`;
    enName = `Deoxys (Speed)`;
  } else if (englishName.includes('zygarde-10') || englishName.includes('zygarde-10-power-construct')) {
    zhName = `${cleanBaseZhName}（10%形態）`;
    enName = `Zygarde (10% Forme)`;
  } else if (englishName.includes('zygarde-50') || englishName === 'zygarde') {
    zhName = `${cleanBaseZhName}（50%形態）`;
    enName = `Zygarde`;
  } else if (englishName.includes('zygarde-complete')) {
    zhName = `${cleanBaseZhName}（完全體形態）`;
    enName = `Zygarde (Complete Forme)`;
  } else if (englishName.includes('giratina-altered') || englishName === 'giratina') {
    zhName = `${cleanBaseZhName}（別種形態）`;
    enName = `Giratina`;
  } else if (englishName.includes('giratina-origin')) {
    zhName = `${cleanBaseZhName}（起源形態）`;
    enName = `Giratina (Origin)`;
  } else if (englishName.includes('dialga-origin')) {
    zhName = `${cleanBaseZhName}（起源形態）`;
    enName = `Dialga (Origin)`;
  } else if (englishName.includes('palkia-origin')) {
    zhName = `${cleanBaseZhName}（起源形態）`;
    enName = `Palkia (Origin)`;
  } else if (englishName.includes('shaymin-land') || englishName === 'shaymin') {
    zhName = `${cleanBaseZhName}（陸上形態）`;
    enName = `Shaymin`;
  } else if (englishName.includes('shaymin-sky')) {
    zhName = `${cleanBaseZhName}（天空形態）`;
    enName = `Shaymin (Sky)`;
  } else if (englishName.includes('tornadus-incarnate') || englishName === 'tornadus') {
    zhName = `${cleanBaseZhName}（化身形態）`;
    enName = `Tornadus`;
  } else if (englishName.includes('tornadus-therian')) {
    zhName = `${cleanBaseZhName}（靈獸形態）`;
    enName = `Tornadus (Therian)`;
  } else if (englishName.includes('thundurus-incarnate') || englishName === 'thundurus') {
    zhName = `${cleanBaseZhName}（化身形態）`;
    enName = `Thundurus`;
  } else if (englishName.includes('thundurus-therian')) {
    zhName = `${cleanBaseZhName}（靈獸形態）`;
    enName = `Thundurus (Therian)`;
  } else if (englishName.includes('landorus-incarnate') || englishName === 'landorus') {
    zhName = `${cleanBaseZhName}（化身形態）`;
    enName = `Landorus`;
  } else if (englishName.includes('landorus-therian')) {
    zhName = `${cleanBaseZhName}（靈獸形態）`;
    enName = `Landorus (Therian)`;
  } else if (englishName.includes('enamorus-incarnate') || englishName === 'enamorus') {
    zhName = `${cleanBaseZhName}（化身形態）`;
    enName = `Enamorus (Incarnate)`;
  } else if (englishName.includes('enamorus-therian')) {
    zhName = `${cleanBaseZhName}（靈獸形態）`;
    enName = `Enamorus (Therian)`;
  } else if (englishName.includes('kyurem-black')) {
    zhName = `闇黑${cleanBaseZhName}`;
    enName = `Black Kyurem`;
  } else if (englishName.includes('kyurem-white')) {
    zhName = `焰白${cleanBaseZhName}`;
    enName = `White Kyurem`;
  } else if (englishName.includes('keldeo-ordinary') || englishName === 'keldeo') {
    zhName = `${cleanBaseZhName}（平常樣子）`;
    enName = `Keldeo`;
  } else if (englishName.includes('keldeo-resolute')) {
    zhName = `${cleanBaseZhName}（覺悟的樣子）`;
    enName = `Keldeo (Resolute)`;
  } else if (englishName.includes('meloetta-aria') || englishName === 'meloetta') {
    zhName = `${cleanBaseZhName}（歌聲形態）`;
    enName = `Meloetta`;
  } else if (englishName.includes('meloetta-pirouette')) {
    zhName = `${cleanBaseZhName}（舞步形態）`;
    enName = `Meloetta (Pirouette)`;
  } else if (englishName.includes('hoopa-confined') || englishName === 'hoopa') {
    zhName = `${cleanBaseZhName}（懲戒胡帕）`;
    enName = `Hoopa (Confined)`;
  } else if (englishName.includes('hoopa-unbound')) {
    zhName = `${cleanBaseZhName}（解放形態）`;
    enName = `Hoopa (Unbound)`;
  } else if (englishName.includes('aegislash-shield') || englishName === 'aegislash') {
    zhName = `${cleanBaseZhName}（盾牌形態）`;
    enName = `Aegislash`;
  } else if (englishName.includes('aegislash-blade')) {
    zhName = `${cleanBaseZhName}（刀劍形態）`;
    enName = `Aegislash (Blade)`;
  } else if (englishName.includes('wishiwashi-solo') || englishName === 'wishiwashi') {
    zhName = `${cleanBaseZhName}（單獨樣子）`;
    enName = `Wishiwashi`;
  } else if (englishName.includes('wishiwashi-school')) {
    zhName = `${cleanBaseZhName}（魚群樣子）`;
    enName = `Wishiwashi (School Form)`;
  } else if (englishName.includes('pumpkaboo-small')) {
    zhName = `${cleanBaseZhName}（小尺寸）`;
    enName = `Pumpkaboo (Small)`;
  } else if (englishName.includes('pumpkaboo-average') || englishName === 'pumpkaboo') {
    zhName = `${cleanBaseZhName}（普通尺寸）`;
    enName = `Pumpkaboo`;
  } else if (englishName.includes('pumpkaboo-large')) {
    zhName = `${cleanBaseZhName}（大尺寸）`;
    enName = `Pumpkaboo (Large)`;
  } else if (englishName.includes('pumpkaboo-super')) {
    zhName = `${cleanBaseZhName}（特大尺寸）`;
    enName = `Pumpkaboo (Super)`;
  } else if (englishName.includes('gourgeist-small')) {
    zhName = `${cleanBaseZhName}（小尺寸）`;
    enName = `Gourgeist (Small)`;
  } else if (englishName.includes('gourgeist-average') || englishName === 'gourgeist') {
    zhName = `${cleanBaseZhName}（普通尺寸）`;
    enName = `Gourgeist`;
  } else if (englishName.includes('gourgeist-large')) {
    zhName = `${cleanBaseZhName}（大尺寸）`;
    enName = `Gourgeist (Large)`;
  } else if (englishName.includes('gourgeist-super')) {
    zhName = `${cleanBaseZhName}（特大尺寸）`;
    enName = `Gourgeist (Super)`;
  } else if (englishName.includes('-eternamax')) {
    zhName = `無極巨${cleanBaseZhName}`;
    enName = `Eternamax ${baseEnName}`;
  } else if (englishName.includes('-alola')) {
    zhName = `${cleanBaseZhName}（阿羅拉的樣子）`;
    enName = `${baseEnName} (Alolan)`;
  } else if (englishName.includes('-galar')) {
    zhName = `${cleanBaseZhName}（伽勒爾的樣子）`;
    enName = `${baseEnName} (Galarian)`;
  } else if (englishName.includes('-hisui')) {
    zhName = `${cleanBaseZhName}（洗翠的樣子）`;
    enName = `${baseEnName} (Hisuian)`;
  } else if (englishName.includes('-paldea')) {
    zhName = `${cleanBaseZhName}（帕底亞的樣子）`;
    enName = `${baseEnName} (Paldean)`;
  } else if (englishName.includes('oricorio-pom-pom')) {
    zhName = `${baseZhName}（啪滋啪滋風格）`;
    enName = `Oricorio (Pom-Pom)`;
  } else if (englishName.includes('oricorio-pau')) {
    zhName = `${baseZhName}（呼拉呼拉風格）`;
    enName = `Oricorio (Pa'u)`;
  } else if (englishName.includes('oricorio-sensu')) {
    zhName = `${baseZhName}（輕盈輕盈風格）`;
    enName = `Oricorio (Sensu)`;
  } else if (englishName === 'oricorio' || englishName === 'oricorio-baile') {
    // 預設型態 (Baile Style)
    zhName = `${baseZhName}（熱辣熱辣風格）`;
    enName = `Oricorio (Baile)`;
  } else if (englishName.startsWith('oricorio-')) {
    // 其他 Oricorio 風格的通用處理，防止漏網之魚
    const style = englishName.replace('oricorio-', '');
    const styleCapitalized = style.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Oricorio (${styleCapitalized})`;
    
    // 嘗試對應中文風格
    if (style === 'pom-pom') zhName = `${baseZhName}（啪滋啪滋風格）`;
    else if (style === 'pau') zhName = `${baseZhName}（呼拉呼拉風格）`;
    else if (style === 'sensu') zhName = `${baseZhName}（輕盈輕盈風格）`;
    else zhName = `${baseZhName}（${styleCapitalized}風格）`;
  } else if (englishName.startsWith('squawkabilly-')) {
    // 怒鸚哥 (Squawkabilly) 羽色處理
    const plumage = englishName.replace('squawkabilly-', '');
    const plumageCapitalized = plumage.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Squawkabilly (${plumageCapitalized})`;
    
    if (plumage === 'blue-plumage') zhName = `${baseZhName}（藍羽毛）`;
    else if (plumage === 'yellow-plumage') zhName = `${baseZhName}（黃羽毛）`;
    else if (plumage === 'white-plumage') zhName = `${baseZhName}（白羽毛）`;
    else zhName = `${baseZhName}（${plumageCapitalized}）`;
  } else if (englishName.startsWith('tatsugiri-')) {
    // 米立龍 (Tatsugiri) 姿勢處理
    if (englishName.includes('-mega')) {
       zhName = `超級${baseZhName}`;
       enName = `Mega Tatsugiri`;
    } else {
       // 簡化為單一名稱
       zhName = baseZhName;
       enName = 'Tatsugiri';
    }
  } else if (englishName.startsWith('toxtricity-')) {
    // 顫弦蠑螈 (Toxtricity) 形態處理
    const form = englishName.replace('toxtricity-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Toxtricity (${formCapitalized})`;
    
    if (form === 'amped') zhName = `${baseZhName}（高調）`;
    else if (form === 'low-key') zhName = `${baseZhName}（低調）`;
    else if (form === 'gmax') {
       zhName = `超極巨${baseZhName}`;
       enName = `Toxtricity (Gmax)`;
    }
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.startsWith('darmanitan-')) {
    // 達摩狒狒 (Darmanitan) 形態處理
    const form = englishName.replace('darmanitan-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Darmanitan (${formCapitalized})`;
    
    if (form === 'zen' || form === 'zen-mode') zhName = `${baseZhName}（達摩模式）`;
    else if (form === 'galar-zen' || form === 'galar-zen-mode') zhName = `${baseZhName}（伽勒爾達摩模式）`;
    else if (form === 'galar-standard') zhName = `${baseZhName}（伽勒爾的樣子）`;
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.startsWith('basculin-')) {
    // 野蠻鱸魚 (Basculin) 形態處理
    const form = englishName.replace('basculin-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Basculin (${formCapitalized})`;
    
    if (form === 'white-striped') zhName = `${baseZhName}（白條紋的樣子）`;
    else if (form === 'blue-striped') zhName = `${baseZhName}（藍條紋的樣子）`;
    else if (form === 'red-striped') zhName = `${baseZhName}（紅條紋的樣子）`;
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.startsWith('dudunsparce-')) {
    // 土龍節節 (Dudunsparce) 節數處理
    const form = englishName.replace('dudunsparce-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Dudunsparce (${formCapitalized})`;
    
    if (form === 'three-segment') zhName = `${baseZhName}（三節形態）`;
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.startsWith('maushold-')) {
    // 一對鼠 (Maushold) 家族處理
    const form = englishName.replace('maushold-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Maushold (${formCapitalized})`;
    
    if (form === 'family-of-three') zhName = `${baseZhName}（三隻家庭）`;
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.startsWith('palafin-')) {
    // 海豚俠 (Palafin) 形態處理
    const form = englishName.replace('palafin-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Palafin (${formCapitalized})`;
    
    if (form === 'hero') zhName = `${baseZhName}（全能形態）`;
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.includes('zacian-crowned')) {
    zhName = `${baseZhName}（劍之王）`;
    enName = `Zacian (Crowned Sword)`;
  } else if (englishName.includes('zamazenta-crowned')) {
    zhName = `${baseZhName}（盾之王）`;
    enName = `Zamazenta (Crowned Shield)`;
  } else if (englishName.startsWith('rotom-')) {
    const form = englishName.replace('rotom-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Rotom (${formCapitalized})`;
    
    if (form === 'heat') zhName = '加熱洛託姆';
    else if (form === 'wash') zhName = '清洗洛託姆';
    else if (form === 'frost') zhName = '結冰洛託姆';
    else if (form === 'fan') zhName = '旋轉洛託姆';
    else if (form === 'mow') zhName = '切割洛託姆';
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.includes('morpeko-full-belly') || englishName === 'morpeko') {
    zhName = `${baseZhName}（滿腹花紋）`;
    enName = `Morpeko (Full Belly)`;
  } else if (englishName.includes('morpeko-hangry')) {
    zhName = `${baseZhName}（空腹花紋）`;
    enName = `Morpeko (Hangry)`;
  } else {
      // 其他特殊形態，保留英文後綴但使用中文基礎名稱
      const suffix = englishName.replace(speciesName, '').replace(/^-/, '');
      // 嘗試翻譯常見後綴
      let zhSuffix = suffix;
      if (suffix === 'gmax') zhSuffix = '超極巨';
      else if (suffix === 'mega') zhSuffix = '超級進化';
      else if (suffix === 'alola') zhSuffix = '阿羅拉樣子';
      else if (suffix === 'galar') zhSuffix = '伽勒爾樣子';
      else if (suffix === 'hisui') zhSuffix = '洗翠樣子';
      else if (suffix === 'paldea') zhSuffix = '帕底亞樣子';
      
      zhName = `${baseZhName}（${zhSuffix}）`; // 使用全形括號
      
      // 英文名稱格式化：將後綴用括號包起來，但隱藏預設形態後綴
      const defaultSuffixes = [
        'normal', 'standard', 'incarnate', 'ordinary', 'aria', 'shield', 'average', 'small', 'large', 'super', 
        'solo', 'red-meteor', 'disguised', 'full-belly', '50', 'baile', 'midday', 'plant', 'altered', 'land', 
        'red-striped', 'male', 'female'
      ];

      if (!suffix || defaultSuffixes.includes(suffix) || suffix === 'male' || suffix === 'female') {
         enName = baseEnName;
      } else {
         const suffixCapitalized = suffix.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
         enName = `${baseEnName} (${suffixCapitalized})`;
      }
    }

  // Final fix for special names that might have been overwritten
  if (enName === 'Mr Mime' || enName === 'Mr-mime') enName = 'Mr. Mime';
  if (enName === 'Mr Rime' || enName === 'Mr-rime') enName = 'Mr. Rime';
  if (enName === 'Mime Jr' || enName === 'Mime-jr') enName = 'Mime Jr.';
  if (enName === 'Type Null' || enName === 'Type-null') enName = 'Type: Null';
  if (zhName.includes('謎擬Q') || zhName.includes('謎擬 Q') || zhName.includes('謎擬　Ｑ')) zhName = zhName.replace(/謎擬[\s　]*[QＱ]/g, '謎擬Ｑ');
  if (enName === 'Tapu Koko' || enName === 'Tapu-koko') enName = 'Tapu Koko'; // Ensure space
  if (enName === 'Tapu Lele' || enName === 'Tapu-lele') enName = 'Tapu Lele';
  if (enName === 'Tapu Bulu' || enName === 'Tapu-bulu') enName = 'Tapu Bulu';
  if (enName === 'Tapu Fini' || enName === 'Tapu-fini') enName = 'Tapu Fini';
  if (enName === 'Great Tusk' || enName === 'Great-tusk') enName = 'Great Tusk';
  if (enName === 'Scream Tail' || enName === 'Scream-tail') enName = 'Scream Tail';
  if (enName === 'Brute Bonnet' || enName === 'Brute-bonnet') enName = 'Brute Bonnet';
  if (enName === 'Flutter Mane' || enName === 'Flutter-mane') enName = 'Flutter Mane';
  if (enName === 'Slither Wing' || enName === 'Slither-wing') enName = 'Slither Wing';
  if (enName === 'Sandy Shocks' || enName === 'Sandy-shocks') enName = 'Sandy Shocks';
  if (enName === 'Iron Treads' || enName === 'Iron-treads') enName = 'Iron Treads';
  if (enName === 'Iron Bundle' || enName === 'Iron-bundle') enName = 'Iron Bundle';
  if (enName === 'Iron Hands' || enName === 'Iron-hands') enName = 'Iron Hands';
  if (enName === 'Iron Jugulis' || enName === 'Iron-jugulis') enName = 'Iron Jugulis';
  if (enName === 'Iron Moth' || enName === 'Iron-moth') enName = 'Iron Moth';
  if (enName === 'Iron Thorns' || enName === 'Iron-thorns') enName = 'Iron Thorns';
  if (enName === 'Roaring Moon' || enName === 'Roaring-moon') enName = 'Roaring Moon';
  if (enName === 'Iron Valiant' || enName === 'Iron-valiant') enName = 'Iron Valiant';
  if (enName === 'Walking Wake' || enName === 'Walking-wake') enName = 'Walking Wake';
  if (enName === 'Iron Leaves' || enName === 'Iron-leaves') enName = 'Iron Leaves';
  if (enName === 'Porygon2') enName = 'Porygon２';

  return { zhName, enName };
}

export async function fetchPokemon(nameOrId: string | number): Promise<Pokemon> {
  // 如果是繁體中文名稱，轉換為 ID
  let searchTerm = nameOrId;
  if (typeof nameOrId === 'string') {
    // Handle Mr. Mime / Mr. Rime / Mime Jr. search
    const lowerName = nameOrId.toLowerCase();
    if (lowerName === 'nidoran') {
      // If they just search 'nidoran', we default to female (or throw ambiguous error)
      // Since searchPokemon already handles 'nidoran' and returns both, this is just a fallback
      // if they somehow bypass the search suggestions.
      const error = new Error('Ambiguous search') as any;
      error.isAmbiguous = true;
      error.candidates = [
        { id: 29, name: 'nidoran-f', zhName: '尼多蘭' },
        { id: 32, name: 'nidoran-m', zhName: '尼多朗' }
      ];
      throw error;
    }
    if (lowerName === 'mr. mime' || lowerName === 'mr mime') searchTerm = 'mr-mime';
    else if (lowerName === 'mr. rime' || lowerName === 'mr rime') searchTerm = 'mr-rime';
    else if (lowerName === 'mime jr.' || lowerName === 'mime jr') searchTerm = 'mime-jr';
    else if (lowerName === 'type: null' || lowerName === 'type null') searchTerm = 'type-null';
    else if (lowerName === 'tapu koko') searchTerm = 'tapu-koko';
    else if (lowerName === 'tapu lele') searchTerm = 'tapu-lele';
    else if (lowerName === 'tapu bulu') searchTerm = 'tapu-bulu';
    else if (lowerName === 'tapu fini') searchTerm = 'tapu-fini';
    else if (lowerName === 'great tusk') searchTerm = 'great-tusk';
    else if (lowerName === 'scream tail') searchTerm = 'scream-tail';
    else if (lowerName === 'brute bonnet') searchTerm = 'brute-bonnet';
    else if (lowerName === 'flutter mane') searchTerm = 'flutter-mane';
    else if (lowerName === 'slither wing') searchTerm = 'slither-wing';
    else if (lowerName === 'sandy shocks') searchTerm = 'sandy-shocks';
    else if (lowerName === 'iron treads') searchTerm = 'iron-treads';
    else if (lowerName === 'iron bundle') searchTerm = 'iron-bundle';
    else if (lowerName === 'iron hands') searchTerm = 'iron-hands';
    else if (lowerName === 'iron jugulis') searchTerm = 'iron-jugulis';
    else if (lowerName === 'iron moth') searchTerm = 'iron-moth';
    else if (lowerName === 'iron thorns') searchTerm = 'iron-thorns';
    else if (lowerName === 'roaring moon') searchTerm = 'roaring-moon';
    else if (lowerName === 'iron valiant') searchTerm = 'iron-valiant';
    else if (lowerName === 'walking wake') searchTerm = 'walking-wake';
    else if (lowerName === 'iron leaves') searchTerm = 'iron-leaves';
    else if (lowerName === 'oricorio') searchTerm = 'oricorio-baile'; // Oricorio default form
    else if (lowerName === 'morpeko') searchTerm = 'morpeko-full-belly'; // Morpeko default form
    else if (lowerName === 'tatsugiri') searchTerm = 'tatsugiri-curly'; // Tatsugiri default form
    else if (lowerName === 'toxtricity') searchTerm = 'toxtricity-amped'; // Toxtricity default form
    else if (lowerName === 'darmanitan') searchTerm = 'darmanitan-standard'; // Darmanitan default form
    else if (lowerName === 'deoxys') searchTerm = 'deoxys-normal';
    else if (lowerName === 'wormadam') searchTerm = 'wormadam-plant';
    else if (lowerName === 'giratina') searchTerm = 'giratina-altered';
    else if (lowerName === 'shaymin') searchTerm = 'shaymin-land';
    else if (lowerName === 'basculin') searchTerm = 'basculin-red-striped';
    else if (lowerName === 'tornadus') searchTerm = 'tornadus-incarnate';
    else if (lowerName === 'thundurus') searchTerm = 'thundurus-incarnate';
    else if (lowerName === 'landorus') searchTerm = 'landorus-incarnate';
    else if (lowerName === 'keldeo') searchTerm = 'keldeo-ordinary';
    else if (lowerName === 'meloetta') searchTerm = 'meloetta-aria';
    else if (lowerName === 'meowstic') searchTerm = 'meowstic-male';
    else if (lowerName === 'aegislash') searchTerm = 'aegislash-shield';
    else if (lowerName === 'pumpkaboo') searchTerm = 'pumpkaboo-average';
    else if (lowerName === 'gourgeist') searchTerm = 'gourgeist-average';
    else if (lowerName === 'zygarde') searchTerm = 'zygarde-50';
    else if (lowerName === 'lycanroc') searchTerm = 'lycanroc-midday';
    else if (lowerName === 'minior') searchTerm = 'minior-red-meteor';
    else if (lowerName === 'mimikyu') searchTerm = 'mimikyu-disguised';
    else if (lowerName === 'wishiwashi') searchTerm = 'wishiwashi-solo';
    else if (lowerName === 'urshifu') searchTerm = 'urshifu-single-strike';
    else if (lowerName === 'wo chien') searchTerm = 'wo-chien';
    else if (lowerName === 'chien pao') searchTerm = 'chien-pao';
    else if (lowerName === 'ting lu') searchTerm = 'ting-lu';
    else if (lowerName === 'chi yu') searchTerm = 'chi-yu';
    else if (lowerName === 'gouging fire') searchTerm = 'gouging-fire';
    else if (lowerName === 'raging bolt') searchTerm = 'raging-bolt';
    else if (lowerName === 'iron boulder') searchTerm = 'iron-boulder';
    else if (lowerName === 'iron crown') searchTerm = 'iron-crown';
    else if (lowerName === 'archaludon') searchTerm = 'archaludon';
    else if (lowerName === 'hydrapple') searchTerm = 'hydrapple';
    else if (lowerName === 'dipplin') searchTerm = 'dipplin';
    else if (lowerName === 'poltchageist') searchTerm = 'poltchageist';
    else if (lowerName === 'sinistcha') searchTerm = 'sinistcha';
    else if (lowerName === 'okidogi') searchTerm = 'okidogi';
    else if (lowerName === 'munkidori') searchTerm = 'munkidori';
    else if (lowerName === 'fezandipiti') searchTerm = 'fezandipiti';
    else if (lowerName === 'ogerpon') searchTerm = 'ogerpon';
    else if (lowerName === 'terapagos') searchTerm = 'terapagos';
    else if (lowerName === 'pecharunt') searchTerm = 'pecharunt';

    // 0. 如果是數字字串，直接轉換為數字 ID
    const numericId = parseInt(nameOrId);
    if (!isNaN(numericId) && numericId.toString() === nameOrId) {
       searchTerm = numericId;
    } else {

    // Normalize function to handle full-width/half-width and case sensitivity
    const normalize = (str: string) => {
      return str
        .replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
        .replace(/Ⅱ/g, '2') // Handle Roman Numeral II
        .replace(/II/g, '2') // Handle ASCII II
        .replace(/２/g, '2') // Handle Full-width 2 explicitly if not covered by range
        .toLowerCase();
    };

    // 先嘗試完全匹配
    let pokemonId = (pokemonZhMapping as Record<string, number>)[nameOrId];

    // 如果沒有完全匹配，嘗試標準化匹配
    if (!pokemonId) {
      const normalizedInput = normalize(nameOrId);
      const match = Object.keys(pokemonZhMapping as Record<string, number>).find(key => normalize(key) === normalizedInput);
      if (match) {
        pokemonId = (pokemonZhMapping as Record<string, number>)[match];
      }
    }
    
    // 如果還是沒有匹配，嘗試模糊搜尋（使用標準化後的字串）
    if (!pokemonId) {
      const normalizedInput = normalize(nameOrId);
      const matchingNames = Object.keys(pokemonZhMapping as Record<string, number>)
        .filter(name => normalize(name).includes(normalizedInput));
      
      if (matchingNames.length === 1) {
        // 只有一個匹配結果，直接使用
        pokemonId = (pokemonZhMapping as Record<string, number>)[matchingNames[0]];
      } else if (matchingNames.length > 1) {
        // 多個匹配結果，拋出錯誤並提示
        // 這裡改為拋出特殊錯誤，攜帶候選列表，讓 UI 處理
        const candidates = matchingNames.map(name => ({
          name,
          id: (pokemonZhMapping as Record<string, number>)[name]
        }));
        throw { isAmbiguous: true, candidates };
      }
    }
    
    if (pokemonId) {
      searchTerm = pokemonId;
    }
    } // End of else block for non-numeric string
  } else if (typeof nameOrId === 'number' && nameOrId > 10000) {
    // 直接支援 ID > 10000 的特殊形態（如 Mega 進化）
    searchTerm = nameOrId;
  }
  
  const cacheKey = `${CACHE_KEY_PREFIX}${searchTerm}`;
  
  // 檢查快取
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

  // 從 API 獲取資料
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${searchTerm.toString().toLowerCase()}`);
  
  if (!response.ok) {
    throw new Error('找不到該寶可夢，請檢查名稱或編號是否正確');
  }

  const data: any = await response.json();
  
  // 繼承基礎形態的招式 (Mega 和 Gmax 形態通常沒有完整的招式表)
  if (data.name.includes('-mega') || data.name.includes('-gmax')) {
    try {
      const speciesResponse = await fetch(data.species.url);
      if (speciesResponse.ok) {
        const speciesData = await speciesResponse.json();
        const defaultVariety = speciesData.varieties.find((v: any) => v.is_default);
        if (defaultVariety && defaultVariety.pokemon.name !== data.name) {
          const defaultResponse = await fetch(defaultVariety.pokemon.url);
          if (defaultResponse.ok) {
            const defaultData = await defaultResponse.json();
            data.moves = defaultData.moves;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch base form moves', e);
    }
  }
  
  // 獲取變體資訊 (對所有寶可夢都嘗試獲取，以支援像 Oricorio 這種預設型態也是變體的情況)
  try {
    const speciesResponse = await fetch(data.species.url);
    if (speciesResponse.ok) {
      const speciesData = await speciesResponse.json();
      

      
      // Manual injection for Terapagos
      if (speciesData.name === 'terapagos') {
         speciesData.varieties = [
            { is_default: true, pokemon: { name: 'terapagos', url: 'https://pokeapi.co/api/v2/pokemon/1024' } },
            { is_default: false, pokemon: { name: 'terapagos-terastal', url: 'https://pokeapi.co/api/v2/pokemon/10276' } },
            { is_default: false, pokemon: { name: 'terapagos-stellar', url: 'https://pokeapi.co/api/v2/pokemon/10277' } }
         ];
      }

      data.varieties = speciesData.varieties
        .filter((v: any) => {
          const name = v.pokemon.name;
          // 保留預設型態
          if (v.is_default) return true;
          
          // 簡化過濾邏輯：只保留會影響能力值的形態
          
          // 0. 排除所有霸主型態 (Totem)，因為它們通常與普通地區形態重複
          if (name.includes('-totem')) return false;
          
          // 排除皮卡丘的帽子形態 (Cosplay / Cap)
          if (name.startsWith('pikachu-') && !name.includes('-gmax') && !name.includes('-mega')) return false;

          // 排除薩戮德 (Zarude) 的阿爸形態 (Dada)，因為能力值相同
          if (name === 'zarude-dada') return false;

          // 排除米立龍 (Tatsugiri) 的其他形態，只保留預設 (curly) 和 Mega
          if (name.startsWith('tatsugiri-')) {
             // 如果是 Mega，只保留 curly 的 mega (去重)
             if (name.includes('-mega')) {
                return name.includes('curly');
             }
             // 如果不是 Mega，只保留 curly
             if (name !== 'tatsugiri-curly') return false;
          }

          // 排除肯泰羅 (Tauros) 的其他帕底亞形態，只保留鬥戰種 (Combat Breed)
          if (name.startsWith('tauros-paldea')) {
             // 如果是鬥戰種，保留
             if (name === 'tauros-paldea-combat-breed') return true;
             // 其他帕底亞形態 (Blaze, Aqua) 排除
             return false;
          }

          // 1. Mega 進化
          if (name.includes('-mega')) return true;
          // 2. 極巨化 (Gmax)
          if (name.includes('-gmax')) return true;
          // 3. 地區形態 (Alola, Galar, Hisui, Paldea)
          if (name.includes('-alola') || name.includes('-galar') || name.includes('-hisui') || name.includes('-paldea')) return true;
          // 4. 原始回歸 (Primal)
          if (name.includes('-primal')) return true;
          // 5. 特殊戰鬥形態 (Origin, Therian, Incarnate, Black/White Kyurem, Dusk/Dawn Necrozma, Crowned Zacian/Zamazenta, etc.)
          if (name.includes('-origin') || 
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
              name.includes('-hero') || // Palafin Hero
              name.includes('-school') || // Wishiwashi School
              name.includes('-complete') || // Zygarde Complete
              name.includes('-unbound') || // Hoopa Unbound
              name.includes('-resolute') || // Keldeo Resolute
              name.includes('-pirouette') || // Meloetta Pirouette
              name.includes('-blade') || // Aegislash Blade
              name.includes('-sky') || // Shaymin Sky
              name.includes('-sunny') || // Castform / Cherrim (雖然能力值可能一樣，但屬性不同)
              name.includes('-rainy') || 
              name.includes('-snowy') ||
              name.includes('-attack') || // Deoxys
              name.includes('-defense') || 
              name.includes('-zen') || // Darmanitan Zen Mode
              name.includes('-speed') ||
              name.includes('-sandy') || // Wormadam
              name.includes('-trash') ||
              name.includes('-midnight') || // Lycanroc
              name.includes('-dusk') ||
              name.includes('-ice') || // Eiscue Noice
              name.includes('-hangry') || // Morpeko
              name.includes('-shadow') || // Calyrex
              name.includes('-ice') || // Calyrex
              name.includes('-bloodmoon') || // Ursaluna Bloodmoon
              name.includes('-wellspring') || // Ogerpon
              name.includes('-hearthflame') || // Ogerpon
              name.includes('-cornerstone') || // Ogerpon
              name.includes('-terastal') || // Terapagos
              name.includes('-stellar') // Terapagos
             ) return true;

          // 6. 排除純外觀形態 (如花舞鳥風格、米立龍姿勢、怒鸚哥羽色等，除非使用者特別要求，否則預設隱藏以簡化列表)
          // 這些形態通常種族值相同，只是外觀或屬性微調（花舞鳥屬性不同，但這裡先簡化，若使用者搜尋特定風格，會由搜尋建議處理）
          // 修正：花舞鳥屬性不同，應該保留！
          if (name.startsWith('oricorio-')) return true;
          if (name.startsWith('wormadam-')) return true;
          if (name.startsWith('rotom-') && name !== 'rotom') return true; // Rotom forms change types/stats

          return false;
        })
        .map((v: any) => {
          const id = parseInt(v.pokemon.url.split('/').filter(Boolean).pop());
          // 獲取顯示名稱
          let displayName = v.pokemon.name;
          
          // 使用 formatPokemonName 格式化名稱
          // 注意：這裡我們暫時無法獲取準確的中文名稱，所以傳入 speciesData.name 作為佔位符
          // 這不會影響 enName 的生成
          const formatted = formatPokemonName(v.pokemon.name, speciesData.name, speciesData.name);
          if (formatted.enName) {
             displayName = formatted.enName;
          }

          if (v.is_default) {
             // 如果是預設型態，且格式化後的名稱與物種名稱相同（沒有特殊後綴），則使用 default-form-placeholder
             // 但如果像 Urshifu (Single Strike) 這樣有特殊後綴，則保留顯示名稱
             if (displayName.toLowerCase() === speciesData.name.toLowerCase()) {
                displayName = 'default-form-placeholder';
             }
          }

          return {
            is_default: v.is_default,
            pokemon: {
              name: v.pokemon.name,
              url: v.pokemon.url,
              id: id, // Add ID for easier access
              displayName: displayName // Add a temporary display name
            }
          };
        });
    }
  } catch (e) {
    console.warn('Failed to fetch species data', e);
  }
	  
	  const englishName = data.name; // Store original English name
	  
	  // 強制格式化英文名稱，確保去連接號且首字母大寫
	  const capitalize = (s: string) => s.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
	  // 只有當 enName 尚未設定時，才執行預設的 capitalize 邏輯
	  if (!data.enName) {
	    data.enName = capitalize(englishName);
	  }
	  
  // 特別處理 Oricorio Baile
  if (englishName === 'oricorio-baile' || englishName === 'oricorio') {
     data.enName = 'Oricorio Baile';
  }
  
  // 特別處理 Tatsugiri Curly
  if (englishName === 'tatsugiri-curly' || englishName === 'tatsugiri') {
     data.enName = 'Tatsugiri';
  }
  
  // 特別處理 Toxtricity Amped
  if (englishName === 'toxtricity-amped' || englishName === 'toxtricity') {
     data.enName = 'Toxtricity (Amped)';
  }



  // 特別處理 Lycanroc
  if (englishName.startsWith('lycanroc-') || englishName === 'lycanroc') {
     const form = englishName.replace('lycanroc-', '');
     if (englishName === 'lycanroc' || form === 'midday') {
        data.enName = 'Lycanroc (Midday)';
        data.zhName = '鬃岩狼人（白晝的樣子）';
     } else if (form === 'midnight') {
        data.enName = 'Lycanroc (Midnight)';
        data.zhName = '鬃岩狼人（黑夜的樣子）';
     } else if (form === 'dusk') {
        data.enName = 'Lycanroc (Dusk)';
        data.zhName = '鬃岩狼人（黃昏的樣子）';
     }
  }

  // 特別處理 Mimikyu
  if (englishName.startsWith('mimikyu-') || englishName === 'mimikyu') {
     const form = englishName.replace('mimikyu-', '');
     if (englishName === 'mimikyu' || form === 'disguised') {
        data.enName = 'Mimikyu';
        data.zhName = '謎擬Ｑ';
     } else if (form === 'busted') {
        data.enName = 'Mimikyu (Busted)';
        data.zhName = '謎擬Ｑ（現形）';
     } else if (form === 'totem-disguised') {
        data.enName = 'Mimikyu (Totem)';
        data.zhName = '謎擬Ｑ（霸主）';
     } else if (form === 'totem-busted') {
        data.enName = 'Mimikyu (Totem Busted)';
        data.zhName = '謎擬Ｑ（霸主現形）';
     }
  }

  // 特別處理 Necrozma
  if (englishName.startsWith('necrozma-') || englishName === 'necrozma') {
     const form = englishName.replace('necrozma-', '');
     if (englishName === 'necrozma') {
        data.enName = 'Necrozma';
        if (idToZhMapping[data.id]) data.zhName = idToZhMapping[data.id];
     } else if (form === 'dusk' || form === 'dusk-mane') {
        data.enName = 'Necrozma (Dusk Mane)';
        if (idToZhMapping[data.id]) data.zhName = `${idToZhMapping[data.id]}（黃昏之鬃）`;
     } else if (form === 'dawn' || form === 'dawn-wings') {
        data.enName = 'Necrozma (Dawn Wings)';
        if (idToZhMapping[data.id]) data.zhName = `${idToZhMapping[data.id]}（拂曉之翼）`;
     } else if (form === 'ultra') {
        data.enName = 'Ultra Necrozma';
        if (idToZhMapping[data.id]) data.zhName = `究極${idToZhMapping[data.id]}`;
     }
  }

  // 特別處理 Basculin
  if (englishName.startsWith('basculin-')) {
     const form = englishName.replace('basculin-', '');
     if (form === 'white-striped') {
        data.enName = 'Basculin (White-Striped)';
        data.zhName = '野蠻鱸魚（白條紋的樣子）';
     } else if (form === 'blue-striped') {
        data.enName = 'Basculin (Blue-Striped)';
        data.zhName = '野蠻鱸魚（藍條紋的樣子）';
     } else if (form === 'red-striped') {
        data.enName = 'Basculin (Red-Striped)';
        data.zhName = '野蠻鱸魚（紅條紋的樣子）';
     }
  }

  // 特別處理 Dialga Origin
  if (englishName.includes('dialga-origin')) {
     data.enName = 'Dialga (Origin)';
     data.zhName = '帝牙盧卡（起源形態）';
  }
  
  // 特別處理 Palkia Origin
  if (englishName.includes('palkia-origin')) {
     data.enName = 'Palkia (Origin)';
     data.zhName = '帕路奇亞（起源形態）';
  }

  // 特別處理 Rotom
  if (englishName.startsWith('rotom-')) {
     const form = englishName.replace('rotom-', '');
     if (form === 'heat') {
        data.enName = 'Rotom (Heat)';
        data.zhName = '加熱洛託姆';
     } else if (form === 'wash') {
        data.enName = 'Rotom (Wash)';
        data.zhName = '清洗洛託姆';
     } else if (form === 'frost') {
        data.enName = 'Rotom (Frost)';
        data.zhName = '結冰洛託姆';
     } else if (form === 'fan') {
        data.enName = 'Rotom (Fan)';
        data.zhName = '旋轉洛託姆';
     } else if (form === 'mow') {
        data.enName = 'Rotom (Mow)';
        data.zhName = '切割洛託姆';
     }
  }

  // 特別處理 Darmanitan
  if (englishName.startsWith('darmanitan-') || englishName === 'darmanitan') {
     // 處理 base form (standard)
     if (englishName === 'darmanitan-standard' || englishName === 'darmanitan') {
        data.enName = 'Darmanitan (Standard)';
        if (idToZhMapping[data.id]) data.zhName = `${idToZhMapping[data.id]}（普通模式）`;
     }
     
     const form = englishName.replace('darmanitan-', '');
     
     if (form === 'zen' || form === 'zen-mode') {
        data.enName = 'Darmanitan (Zen)';
        if (idToZhMapping[data.id]) data.zhName = `${idToZhMapping[data.id]}（達摩模式）`;
     } else if (form === 'galar-standard' || form === 'galarian-standard') {
        data.enName = 'Darmanitan (Galarian)';
        if (idToZhMapping[data.id]) data.zhName = `${idToZhMapping[data.id]}（伽勒爾的樣子）`;
     } else if (form === 'galar-zen' || form === 'galarian-zen') {
        data.enName = 'Darmanitan (Galarian Zen)';
        if (idToZhMapping[data.id]) data.zhName = `${idToZhMapping[data.id]}（伽勒爾達摩模式）`;
     }
  }
  
  // 獲取繁體中文名稱
  // 優先使用本地翻譯對應表，避免 PokeAPI 的簡體字問題
  if (idToZhMapping[data.id]) {
    // 如果已經有特殊處理過的 zhName (例如 Darmanitan)，不要覆蓋它
    if (!data.zhName) {
        data.zhName = idToZhMapping[data.id];
    }
    // 對於 .name，我們也應該小心不要覆蓋特殊處理過的名稱
    // 但為了保持相容性，我們通常將 .name 設為中文名
    // 這裡我們做一個判斷：如果 zhName 已經被設定且包含括號（表示有形態），則使用 zhName
    if (data.zhName && (data.zhName.includes('（') || data.zhName.includes('('))) {
        data.name = data.zhName;
    } else {
        data.name = idToZhMapping[data.id];
    }
  } else if (data.id > 10000) {
    // 特殊形態（如 Mega 進化）處理邏輯
    try {
      // 嘗試獲取原始物種名稱
      const speciesResponse = await fetch(data.species.url);
      if (speciesResponse.ok) {
        const speciesData = await speciesResponse.json();
        const zhHantName = speciesData.names.find(
          (n: any) => n.language.name === 'zh-Hant'
        );
        
        // 嘗試從 species URL 獲取 ID，並使用本地對應表
        const speciesIdMatch = data.species.url.match(/\/pokemon-species\/(\d+)\//);
        const speciesId = speciesIdMatch ? parseInt(speciesIdMatch[1]) : 0;
        
        // 統一使用 Species ID 作為顯示 ID
        if (speciesId > 0) {
          data.id = speciesId;
        }
        
        // 優先使用本地對應表獲取基礎中文名稱，避免 API 缺漏或簡體字
        let baseName = '';
        if (speciesId && idToZhMapping[speciesId]) {
          baseName = idToZhMapping[speciesId];
        } else {
          // 如果本地沒有，才使用 API 返回的名稱
          baseName = zhHantName ? zhHantName.name : data.species.name;
        }

        const formatted = formatPokemonName(englishName, baseName, data.species.name);
        data.zhName = formatted.zhName;
        data.enName = formatted.enName;
        data.name = data.zhName;
      } else {
        // 如果 species fetch 失敗，嘗試從 URL 解析 ID 並查表
        const speciesIdMatch = data.species.url.match(/\/pokemon-species\/(\d+)\//);
        const speciesId = speciesIdMatch ? parseInt(speciesIdMatch[1]) : 0;
        
        if (speciesId > 0) {
           data.id = speciesId;
           let baseName = data.species.name;
           if (idToZhMapping[speciesId]) {
              baseName = idToZhMapping[speciesId];
           }
           const formatted = formatPokemonName(englishName, baseName, data.species.name);
           data.zhName = formatted.zhName;
           data.enName = formatted.enName;
           data.name = data.zhName;
        } else {
           // 即使沒有 ID，也嘗試格式化英文名稱
           const formatted = formatPokemonName(englishName, englishName, data.species.name);
           data.zhName = formatted.zhName;
           data.enName = formatted.enName;
           data.name = data.zhName;
        }
      }
    } catch (error) {
      console.warn('無法獲取特殊形態中文名稱:', error);
      data.zhName = englishName;
      data.name = englishName;
    }
  } else {
    // 如果本地沒有翻譯，才從 API 獲取
    try {
      const speciesResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${data.id}`);
      if (speciesResponse.ok) {
        const speciesData = await speciesResponse.json();
        const zhHantName = speciesData.names.find(
          (n: any) => n.language.name === 'zh-Hant'
        );
        if (zhHantName) {
          data.zhName = zhHantName.name;
          data.name = zhHantName.name;
        } else {
          // 如果沒有繁中名稱，使用英文名稱作為預設
          data.zhName = englishName;
          data.name = englishName;
        }
      }
	    } catch (error) {
	      console.warn('無法獲取繁體中文名稱:', error);
	      data.zhName = englishName;
	      data.name = englishName;
	    }
	  }
	
	  // 統一格式化英文名稱 (確保所有寶可夢都經過標準化處理)
	  if (!data.enName || !data.enName.includes('(')) {
	    const formatted = formatPokemonName(englishName, data.zhName || englishName, data.species.name);
	    if (formatted.enName && formatted.enName !== englishName) {
	      data.enName = formatted.enName;
	    }
	  }
	
	  // 特別處理 Darmanitan (使用 ID 強制修正) - 移至最後以避免被覆蓋
  if (data.id === 555) {
     data.enName = 'Darmanitan (Standard)';
     data.zhName = '達摩狒狒';
     data.name = data.zhName;
  } else if (data.id === 10017) {
     data.enName = 'Darmanitan (Zen)';
     data.zhName = '達摩狒狒（達摩模式）';
     data.name = data.zhName;
  } else if (data.id === 10177) {
     data.enName = 'Darmanitan (Galar)';
     data.zhName = '達摩狒狒（伽勒爾的樣子）';
     data.name = data.zhName;
  } else if (data.id === 10178) {
     data.enName = 'Darmanitan (Galar Zen)';
     data.zhName = '達摩狒狒（伽勒爾達摩模式）';
     data.name = data.zhName;
  }

  // 儲存到快取
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('快取儲存失敗:', error);
  }

  return data;
}

export function calculateStatIncrease(ev: number): number {
  return Math.floor(ev / 4);
}

export function getTotalEV(evs: Record<string, number>): number {
  return Object.values(evs).reduce((sum, val) => sum + val, 0);
}

export function getHighQualitySprite(pokemon: Pokemon): string {
  return pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
}

export async function fetchAbilityDetails(abilityUrl: string): Promise<{ name: string; zhName: string }> {
  try {
    const response = await fetch(abilityUrl);
    if (!response.ok) {
      throw new Error('無法獲取特性資料');
    }
    const data = await response.json();
    // 優先使用本地翻譯對應表，確保穩定性
    const localTranslation = ABILITY_TRANSLATIONS[data.name];
    
    if (localTranslation) {
      return {
        name: data.name,
        zhName: localTranslation
      };
    }

    // 如果本地沒有翻譯，嘗試從 API 獲取
    const zhHantName = data.names.find(
      (n: any) => n.language.name === 'zh-Hant'
    );
    
    return {
      name: data.name,
      zhName: zhHantName?.name || data.name
    };
  } catch (error) {
    console.warn('無法獲取特性繁中名稱:', error);
    return { name: '', zhName: '未知特性' };
  }
}
