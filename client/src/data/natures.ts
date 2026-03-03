export interface Nature {
  name: string;
  enName: string;
  increased?: string;
  decreased?: string;
}

export const NATURES: Nature[] = [
  { name: "勤奮", enName: "Hardy", increased: undefined, decreased: undefined },
  { name: "怕寂寞", enName: "Lonely", increased: "attack", decreased: "defense" },
  { name: "固執", enName: "Adamant", increased: "attack", decreased: "special-attack" },
  { name: "調皮", enName: "Naughty", increased: "attack", decreased: "special-defense" },
  { name: "勇敢", enName: "Brave", increased: "attack", decreased: "speed" },
  { name: "大膽", enName: "Bold", increased: "defense", decreased: "attack" },
  { name: "坦率", enName: "Docile", increased: undefined, decreased: undefined },
  { name: "悠閒", enName: "Relaxed", increased: "defense", decreased: "speed" },
  { name: "淘氣", enName: "Impish", increased: "defense", decreased: "special-attack" },
  { name: "樂天", enName: "Lax", increased: "defense", decreased: "special-defense" },
  { name: "內斂", enName: "Modest", increased: "special-attack", decreased: "attack" },
  { name: "穩重", enName: "Mild", increased: "special-attack", decreased: "defense" },
  { name: "馬虎", enName: "Rash", increased: "special-attack", decreased: "special-defense" },
  { name: "冷靜", enName: "Quiet", increased: "special-attack", decreased: "speed" },
  { name: "溫和", enName: "Calm", increased: "special-defense", decreased: "attack" },
  { name: "溫順", enName: "Gentle", increased: "special-defense", decreased: "defense" },
  { name: "慎重", enName: "Careful", increased: "special-defense", decreased: "special-attack" },
  { name: "自大", enName: "Sassy", increased: "special-defense", decreased: "speed" },
  { name: "膽小", enName: "Timid", increased: "speed", decreased: "attack" },
  { name: "急躁", enName: "Hasty", increased: "speed", decreased: "defense" },
  { name: "爽朗", enName: "Jolly", increased: "speed", decreased: "special-attack" },
  { name: "天真", enName: "Naive", increased: "speed", decreased: "special-defense" },
  { name: "浮躁", enName: "Quirky", increased: undefined, decreased: undefined },
  { name: "害羞", enName: "Bashful", increased: undefined, decreased: undefined },
  { name: "認真", enName: "Serious", increased: undefined, decreased: undefined },
];

export const STAT_NAMES: Record<string, string> = {
  "hp": "HP",
  "attack": "攻擊",
  "defense": "防禦",
  "special-attack": "特攻",
  "special-defense": "特防",
  "speed": "速度",
};

export function getNatureModifier(nature: Nature, stat: string): number {
  if (nature.increased === stat) return 1.1;
  if (nature.decreased === stat) return 0.9;
  return 1.0;
}
