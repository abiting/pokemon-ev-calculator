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
    // 如果是 ID，直接返回單一結果（這裡簡化處理，實際可能需要 fetch 確認）
    // 但為了保持一致性，我們還是走 fetchPokemon 流程，或者這裡先返回一個預測結果
    // 為了準確，我們這裡先只處理名稱搜尋，ID 搜尋直接交給 fetchPokemon
    return [];
  }

  // 2. 搜尋本地中文對應表
  const matchingNames = Object.keys(pokemonZhMapping as Record<string, number>)
    .filter(name => name.includes(query));

  if (matchingNames.length === 0) {
    // 嘗試英文搜尋（這裡暫時略過，因為主要針對中文使用者）
    return [];
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
  // 格式化英文名稱 (e.g., "venusaur-mega" -> "Mega Venusaur", "pom-pom" -> "Pom Pom")
  // 將連接號替換為空格，並將每個單字首字母大寫
  const capitalize = (s: string) => s.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  const baseEnName = capitalize(speciesName);
  
  let zhName = '';
  let enName = '';

  // 根據英文名稱後綴添加中文前綴/後綴
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
  } else if (englishName.includes('oricorio-pom-pom')) {
    zhName = `${baseZhName}（啪滋啪滋風格）`;
    enName = `Oricorio Pom-Pom`;
  } else if (englishName.includes('oricorio-pau')) {
    zhName = `${baseZhName}（呼拉呼拉風格）`;
    enName = `Oricorio Pa'u`;
  } else if (englishName.includes('oricorio-sensu')) {
    zhName = `${baseZhName}（輕盈輕盈風格）`;
    enName = `Oricorio Sensu`;
  } else if (englishName === 'oricorio') {
    // 預設型態 (Baile Style)
    zhName = `${baseZhName}（熱辣熱辣風格）`;
    enName = `Oricorio Baile`;
  } else {
    // 其他特殊形態，保留英文後綴但使用中文基礎名稱
    const suffix = englishName.replace(speciesName, '').replace(/^-/, '');
    zhName = `${baseZhName}（${suffix}）`; // 使用全形括號
    // 英文名稱也嘗試格式化，將後綴移到前面或保留原樣但首字母大寫
    enName = capitalize(englishName);
  }
  
  return { zhName, enName };
}

export async function fetchPokemon(nameOrId: string | number): Promise<Pokemon> {
  // 如果是繁體中文名稱，轉換為 ID
  let searchTerm = nameOrId;
  if (typeof nameOrId === 'string') {
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
  
  // 獲取變體資訊 (如果這是預設型態)
  if (data.id <= 10000) { // 假設 ID <= 10000 是普通寶可夢
     try {
        const speciesResponse = await fetch(data.species.url);
        if (speciesResponse.ok) {
           const speciesData = await speciesResponse.json();
           data.varieties = speciesData.varieties.map((v: any) => {
              const id = parseInt(v.pokemon.url.split('/').filter(Boolean).pop());
              return {
                 is_default: v.is_default,
                 pokemon: {
                    name: v.pokemon.name,
                    url: v.pokemon.url,
                    id: id // Add ID for easier access
                 }
              };
           });
        }
     } catch (e) {
        console.warn('Failed to fetch varieties', e);
     }
  }
  const englishName = data.name; // Store original English name
  data.enName = englishName;
  
  // 獲取繁體中文名稱
  // 優先使用本地翻譯對應表，避免 PokeAPI 的簡體字問題
  if (idToZhMapping[data.id]) {
    data.zhName = idToZhMapping[data.id];
    data.name = idToZhMapping[data.id]; // Keep backward compatibility for existing code using .name
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
           if (idToZhMapping[speciesId]) {
              const baseName = idToZhMapping[speciesId];
              const formatted = formatPokemonName(englishName, baseName, data.species.name);
              data.zhName = formatted.zhName;
              data.enName = formatted.enName;
              data.name = data.zhName;
           } else {
              data.zhName = englishName;
              data.name = englishName;
           }
        } else {
           data.zhName = englishName;
           data.name = englishName;
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
