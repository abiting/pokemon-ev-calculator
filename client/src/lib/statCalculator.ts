import type { Nature } from '@/data/natures';

export interface StatCalculationParams {
  baseStat: number;
  iv: number;
  ev: number;
  level: number;
  nature?: Nature;
  statName: string;
  isHP?: boolean;
  pokemonId?: number;
}

/**
 * 計算寶可夢的實際能力值
 * 公式來源：https://bulbapedia.bulbagarden.net/wiki/Stat#Determination_of_stats
 */
export function calculateStat(params: StatCalculationParams): number {
  const { baseStat, iv, ev, level, nature, statName, isHP = false, pokemonId } = params;
  
  if (isHP) {
    // 脱殼忍者 (#292) 的 HP 永遠為 1
    if (pokemonId === 292) {
      return 1;
    }
    
    // HP 計算公式：floor(((2 * Base + IV + floor(EV / 4)) * Level) / 100) + Level + 10
    return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  } else {
    // 其他能力值計算公式：(floor(((2 * Base + IV + floor(EV / 4)) * Level) / 100) + 5) * Nature
    const baseStat_calc = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    
    // 套用性格修正
    let natureModifier = 1.0;
    if (nature) {
      if (nature.increased === statName) {
        natureModifier = 1.1;
      } else if (nature.decreased === statName) {
        natureModifier = 0.9;
      }
    }
    
    return Math.floor(baseStat_calc * natureModifier);
  }
}

/**
 * 計算能力值增加量（相對於 0 EV 的情況）
 */
export function calculateStatIncrease(params: StatCalculationParams): number {
  const withEV = calculateStat(params);
  const withoutEV = calculateStat({ ...params, ev: 0 });
  return withEV - withoutEV;
}
