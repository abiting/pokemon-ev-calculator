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
        throw new Error(`找到多個匹配結果：${matchingNames.slice(0, 5).join('、')}${matchingNames.length > 5 ? '...' : ''}。請輸入更完整的名稱。`);
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
        
        let baseName = zhHantName ? zhHantName.name : data.species.name;
        
        // 如果本地對應表有該物種的翻譯，優先使用
        if (speciesId && idToZhMapping[speciesId]) {
          baseName = idToZhMapping[speciesId];
        }

        // 格式化英文名稱 (e.g., "venusaur-mega" -> "Mega Venusaur")
        const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
        const baseEnName = capitalize(data.species.name);
        
        // 根據英文名稱後綴添加中文前綴/後綴
        if (englishName.includes('-mega-x')) {
          data.zhName = `超級${baseName} X`;
          data.enName = `Mega ${baseEnName} X`;
        } else if (englishName.includes('-mega-y')) {
          data.zhName = `超級${baseName} Y`;
          data.enName = `Mega ${baseEnName} Y`;
        } else if (englishName.includes('-mega')) {
          data.zhName = `超級${baseName}`;
          data.enName = `Mega ${baseEnName}`;
        } else if (englishName.includes('-gmax')) {
          data.zhName = `超極巨化${baseName}`;
          data.enName = `Gigantamax ${baseEnName}`;
        } else if (englishName.includes('-eternamax')) {
          data.zhName = `無極巨化${baseName}`;
          data.enName = `Eternamax ${baseEnName}`;
        } else if (englishName.includes('-alola')) {
          data.zhName = `阿羅拉${baseName}`;
          data.enName = `Alolan ${baseEnName}`;
        } else if (englishName.includes('-galar')) {
          data.zhName = `伽勒爾${baseName}`;
          data.enName = `Galarian ${baseEnName}`;
        } else if (englishName.includes('-hisui')) {
          data.zhName = `洗翠${baseName}`;
          data.enName = `Hisuian ${baseEnName}`;
        } else if (englishName.includes('-paldea')) {
          data.zhName = `帕底亞${baseName}`;
          data.enName = `Paldean ${baseEnName}`;
        } else {
          // 其他特殊形態，保留英文後綴但使用中文基礎名稱
          const suffix = englishName.replace(data.species.name, '').replace(/^-/, '');
          data.zhName = `${baseName} (${suffix})`;
          // 英文名稱也嘗試格式化，將後綴移到前面或保留原樣但首字母大寫
          data.enName = capitalize(englishName);
        }
        data.name = data.zhName;
      } else {
        data.zhName = englishName;
        data.name = englishName;
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
