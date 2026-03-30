export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  front_default: string;
  other?: {
    'official-artwork'?: {
      front_default: string;
    };
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface AbilityDetail {
  name: string;
  names: Array<{
    language: {
      name: string;
    };
    name: string;
  }>;
}

export interface Pokemon {
  id: number;
  name: string;
  apiName?: string;
  enName?: string;
  zhName?: string;
  stats: PokemonStat[];
  types: PokemonType[];
  sprites: PokemonSprites;
  abilities: PokemonAbility[];
  abilityDetails?: AbilityDetail[];
  varieties?: Array<{
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
      id?: number;
    };
  }>;
  species: {
    name: string;
    url: string;
  };
  moves?: PokemonMove[];
  held_items?: PokemonHeldItem[];
}

export interface EVDistribution {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
  [key: string]: number;
}

export const STAT_NAMES: Record<string, string> = {
  'hp': 'HP',
  'attack': '攻擊',
  'defense': '防禦',
  'special-attack': '特攻',
  'special-defense': '特防',
  'speed': '速度',
};

export const TYPE_COLORS: Record<string, string> = {
  'normal': 'bg-gray-400',
  'fire': 'bg-orange-500',
  'water': 'bg-blue-500',
  'electric': 'bg-yellow-400',
  'grass': 'bg-green-500',
  'ice': 'bg-cyan-300',
  'fighting': 'bg-red-600',
  'poison': 'bg-purple-500',
  'ground': 'bg-yellow-600',
  'flying': 'bg-indigo-400',
  'psychic': 'bg-pink-500',
  'bug': 'bg-lime-500',
  'rock': 'bg-yellow-700',
  'ghost': 'bg-purple-700',
  'dragon': 'bg-indigo-600',
  'dark': 'bg-gray-700',
  'steel': 'bg-gray-500',
  'fairy': 'bg-pink-300',
};

export const TYPE_NAMES: Record<string, string> = {
  'normal': '一般',
  'fire': '火',
  'water': '水',
  'electric': '電',
  'grass': '草',
  'ice': '冰',
  'fighting': '格鬥',
  'poison': '毒',
  'ground': '地面',
  'flying': '飛行',
  'psychic': '超能力',
  'bug': '蟲',
  'rock': '岩石',
  'ghost': '幽靈',
  'dragon': '龍',
  'dark': '惡',
  'steel': '鋼',
  'fairy': '妖精',
};

export interface PokemonMoveVersion {
  move_learn_method: {
    name: string;
    url: string;
  };
  version_group: {
    name: string;
    url: string;
  };
  level_learned_at: number;
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: PokemonMoveVersion[];
}

export interface PokemonHeldItemVersion {
  version: {
    name: string;
    url: string;
  };
  rarity: number;
}

export interface PokemonHeldItem {
  item: {
    name: string;
    url: string;
  };
  version_details: PokemonHeldItemVersion[];
}
