export interface Nature {
  name: string;
  increased?: string;
  decreased?: string;
}

export const NATURES: Nature[] = [
  { name: "勤奮", increased: undefined, decreased: undefined },
  { name: "怕寂寞", increased: "attack", decreased: "defense" },
  { name: "固執", increased: "attack", decreased: "special-attack" },
  { name: "調皮", increased: "attack", decreased: "special-defense" },
  { name: "勇敢", increased: "attack", decreased: "speed" },
  { name: "大膽", increased: "defense", decreased: "attack" },
  { name: "坦率", increased: undefined, decreased: undefined },
  { name: "悠閒", increased: "defense", decreased: "speed" },
  { name: "淘氣", increased: "defense", decreased: "special-attack" },
  { name: "樂天", increased: "defense", decreased: "special-defense" },
  { name: "內斂", increased: "special-attack", decreased: "attack" },
  { name: "穩重", increased: "special-attack", decreased: "defense" },
  { name: "馬虎", increased: "special-attack", decreased: "special-defense" },
  { name: "冷靜", increased: "special-attack", decreased: "speed" },
  { name: "溫和", increased: "special-defense", decreased: "attack" },
  { name: "溫順", increased: "special-defense", decreased: "defense" },
  { name: "慎重", increased: "special-defense", decreased: "special-attack" },
  { name: "自大", increased: "special-defense", decreased: "speed" },
  { name: "膽小", increased: "speed", decreased: "attack" },
  { name: "急躁", increased: "speed", decreased: "defense" },
  { name: "爽朗", increased: "speed", decreased: "special-attack" },
  { name: "天真", increased: "speed", decreased: "special-defense" },
  { name: "浮躁", increased: undefined, decreased: undefined },
  { name: "慢吞吞", increased: undefined, decreased: undefined },
  { name: "認真", increased: undefined, decreased: undefined },
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
