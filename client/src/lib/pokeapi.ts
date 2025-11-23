import type { Pokemon } from '@/types/pokemon';
import pokemonZhMapping from '@/data/zh-tw-mapping-full.json';

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
    const pokemonId = (pokemonZhMapping as Record<string, number>)[nameOrId];
    if (pokemonId) {
      searchTerm = pokemonId;
    }
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

  const data: Pokemon = await response.json();
  
  // 獲取繁體中文名稱
  try {
    const speciesResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${data.id}`);
    if (speciesResponse.ok) {
      const speciesData = await speciesResponse.json();
      const zhHantName = speciesData.names.find(
        (n: any) => n.language.name === 'zh-Hant'
      );
      if (zhHantName) {
        data.name = zhHantName.name;
      }
    }
  } catch (error) {
    console.warn('無法獲取繁體中文名稱:', error);
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
