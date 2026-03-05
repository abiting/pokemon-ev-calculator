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
const CACHE_KEY_PREFIX = 'pokemon_cache_v22_';
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

  // 2. 搜尋本地中文對應表
  const matchingNames = Object.keys(pokemonZhMapping as Record<string, number>)
    .filter(name => name.includes(query));

  if (matchingNames.length === 0) {
    // 特殊處理英文搜尋映射
    const searchMap: Record<string, string> = {
      'morpeko': 'morpeko-full-belly',
      'oricorio': 'oricorio-baile',
      'tatsugiri': 'tatsugiri-curly',
      'toxtricity': 'toxtricity-amped',
      'darmanitan': 'darmanitan-standard'
    };

    const mappedQuery = searchMap[query.toLowerCase()] || query;

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

    return Promise.all(data.varieties.map(async (v: any) => {
      const id = parseInt(v.pokemon.url.split('/').filter(Boolean).pop());
      // 這裡我們需要一個簡單的方式來獲取變體的中文名，
      // 但 fetchPokemon 已經有這個邏輯了。
      // 為了避免循環依賴或重複代碼，我們這裡先簡單處理，
      // 或者我們讓 UI 層去 fetch 詳細資料。
      // 更好的方式是：這裡只返回基本資訊，UI 顯示時再 fetch 詳細資料（如果需要）
      // 或者我們這裡直接調用 fetchPokemon 的邏輯片段（需要重構）
      
      // 暫時返回基本結構，讓 UI 決定如何顯示
      return {
        id,
        name: v.pokemon.name,
        zhName: v.is_default ? baseZhName : `${baseZhName} (${v.pokemon.name})`, // 暫時名稱，fetchPokemon 會修正
        isDefault: v.is_default
      };
    }));
  } catch (error) {
    console.warn('獲取變體失敗:', error);
    return [];
  }
}

export function formatPokemonName(englishName: string, baseZhName: string, speciesName: string): { zhName: string, enName: string } {
  // Helper to capitalize words
  const capitalize = (s: string) => s.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  
  // Ensure base names are clean
  let cleanBaseZhName = baseZhName.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '');
  let baseEnName = capitalize(speciesName);

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
  } else if (englishName.includes('-mega')) {
    zhName = `超級${cleanBaseZhName}`;
    enName = `Mega ${baseEnName}`;
  } else if (englishName.includes('-gmax')) {
    zhName = `超極巨${cleanBaseZhName}`;
    enName = `Gigantamax ${baseEnName}`;
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
      // 英文名稱也嘗試格式化，將後綴移到前面或保留原樣但首字母大寫
      enName = capitalize(englishName);
    }

  // Final fix for special names that might have been overwritten
  if (enName === 'Mr Mime' || enName === 'Mr-mime') enName = 'Mr. Mime';
  if (enName === 'Mr Rime' || enName === 'Mr-rime') enName = 'Mr. Rime';
  if (enName === 'Mime Jr' || enName === 'Mime-jr') enName = 'Mime Jr.';
  if (enName === 'Type Null' || enName === 'Type-null') enName = 'Type: Null';
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

  return { zhName, enName };
}

export async function fetchPokemon(nameOrId: string | number): Promise<Pokemon> {
  // 如果是繁體中文名稱，轉換為 ID
  let searchTerm = nameOrId;
  if (typeof nameOrId === 'string') {
    // Handle Mr. Mime / Mr. Rime / Mime Jr. search
    const lowerName = nameOrId.toLowerCase();
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

    // 先嘗試完全匹配
    let pokemonId = (pokemonZhMapping as Record<string, number>)[nameOrId];
    
    // 如果沒有完全匹配，嘗試模糊搜尋
    if (!pokemonId) {
      const matchingNames = Object.keys(pokemonZhMapping as Record<string, number>)
        .filter(name => name.includes(nameOrId));
      
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
  
  // 獲取變體資訊 (對所有寶可夢都嘗試獲取，以支援像 Oricorio 這種預設型態也是變體的情況)
  try {
    const speciesResponse = await fetch(data.species.url);
    if (speciesResponse.ok) {
      const speciesData = await speciesResponse.json();
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
              name.includes('-ice') // Calyrex
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
          if (v.is_default) {
             // 如果是預設型態，直接使用基礎名稱 (稍後會被替換為正確的中文/英文名稱)
             displayName = 'default-form-placeholder'; 
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
	  data.enName = capitalize(englishName);
	  
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

  // 特別處理 Darmanitan Standard
  if (englishName === 'darmanitan-standard' || englishName === 'darmanitan') {
     data.enName = 'Darmanitan (Standard)';
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
