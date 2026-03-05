export interface Pokemon {
  id: number;
  name: string;
  enName: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  abilities: {
    name: string;
    isHidden: boolean;
  }[];
  imageUrl: string;
  varieties?: {
    id: number;
    name: string;
    zhName: string;
    isDefault: boolean;
  }[];
}
