import { formatPokemonName } from './client/src/lib/pokeapi';
import fs from 'fs';
import path from 'path';

// Mock fetch for testing
const mockFetch = async (url: string) => {
  // In a real scan, we would fetch data. Here we simulate common issues or use a local cache if available.
  // For this script, we will focus on testing the formatPokemonName logic with known problematic patterns
  // and iterating through a list of known special Pokemon names.
  return { ok: true, json: async () => ({}) };
};

// List of Pokemon ID ranges to check (201 to 1025)
// Since we can't easily fetch all data in this script without a lot of requests,
// we will focus on testing the formatting logic against a list of known special cases
// and patterns that might cause issues.

const specialCases = [
  { name: 'mr-mime', species: 'mr-mime', baseZh: '魔牆人偶' },
  { name: 'mr-rime', species: 'mr-rime', baseZh: '踏冰人偶' },
  { name: 'mime-jr', species: 'mime-jr', baseZh: '魔尼尼' },
  { name: 'type-null', species: 'type-null', baseZh: '屬性：空' },
  { name: 'tapu-koko', species: 'tapu-koko', baseZh: '卡璞・鳴鳴' },
  { name: 'tapu-lele', species: 'tapu-lele', baseZh: '卡璞・蝶蝶' },
  { name: 'tapu-bulu', species: 'tapu-bulu', baseZh: '卡璞・哞哞' },
  { name: 'tapu-fini', species: 'tapu-fini', baseZh: '卡璞・鰭鰭' },
  { name: 'great-tusk', species: 'great-tusk', baseZh: '雄偉牙' },
  { name: 'scream-tail', species: 'scream-tail', baseZh: '吼叫尾' },
  { name: 'brute-bonnet', species: 'brute-bonnet', baseZh: '猛惡菇' },
  { name: 'flutter-mane', species: 'flutter-mane', baseZh: '振翼髮' },
  { name: 'slither-wing', species: 'slither-wing', baseZh: '爬地翅' },
  { name: 'sandy-shocks', species: 'sandy-shocks', baseZh: '沙鐵皮' },
  { name: 'iron-treads', species: 'iron-treads', baseZh: '鐵轍遺跡' },
  { name: 'iron-bundle', species: 'iron-bundle', baseZh: '鐵包袱' },
  { name: 'iron-hands', species: 'iron-hands', baseZh: '鐵臂膀' },
  { name: 'iron-jugulis', species: 'iron-jugulis', baseZh: '鐵脖頸' },
  { name: 'iron-moth', species: 'iron-moth', baseZh: '鐵毒蛾' },
  { name: 'iron-thorns', species: 'iron-thorns', baseZh: '鐵荊棘' },
  { name: 'roaring-moon', species: 'roaring-moon', baseZh: '轟鳴月' },
  { name: 'iron-valiant', species: 'iron-valiant', baseZh: '鐵武者' },
  { name: 'walking-wake', species: 'walking-wake', baseZh: '波盪水' },
  { name: 'iron-leaves', species: 'iron-leaves', baseZh: '鐵斑葉' },
  { name: 'gouging-fire', species: 'gouging-fire', baseZh: '破空焰' },
  { name: 'raging-bolt', species: 'raging-bolt', baseZh: '猛雷鼓' },
  { name: 'iron-boulder', species: 'iron-boulder', baseZh: '鐵磐岩' },
  { name: 'iron-crown', species: 'iron-crown', baseZh: '鐵頭殼' },
  { name: 'ting-lu', species: 'ting-lu', baseZh: '鼎鹿' },
  { name: 'chien-pao', species: 'chien-pao', baseZh: '古劍豹' },
  { name: 'wo-chien', species: 'wo-chien', baseZh: '古簡蝸' },
  { name: 'chi-yu', species: 'chi-yu', baseZh: '古玉魚' },
  { name: 'ho-oh', species: 'ho-oh', baseZh: '鳳王' },
  { name: 'porygon-z', species: 'porygon-z', baseZh: '多邊獸Z' },
  { name: 'jangmo-o', species: 'jangmo-o', baseZh: '心鱗寶' },
  { name: 'hakamo-o', species: 'hakamo-o', baseZh: '鱗甲龍' },
  { name: 'kommo-o', species: 'kommo-o', baseZh: '杖尾鱗甲龍' },
  { name: 'flabebe', species: 'flabebe', baseZh: '花蓓蓓' }, // Should check for accent
  { name: 'nidoran-f', species: 'nidoran-f', baseZh: '尼多蘭' },
  { name: 'nidoran-m', species: 'nidoran-m', baseZh: '尼多朗' },
  { name: 'farfetchd', species: 'farfetchd', baseZh: '大蔥鴨' }, // Should be Farfetch'd
  { name: 'sirfetchd', species: 'sirfetchd', baseZh: '蔥遊兵' }, // Should be Sirfetch'd
  { name: 'meowth-gmax', species: 'meowth', baseZh: '喵喵' },
  { name: 'pikachu-gmax', species: 'pikachu', baseZh: '皮卡丘' },
  { name: 'venusaur-gmax', species: 'venusaur', baseZh: '妙蛙花' },
  { name: 'charizard-gmax', species: 'charizard', baseZh: '噴火龍' },
  { name: 'blastoise-gmax', species: 'blastoise', baseZh: '水箭龜' },
  { name: 'butterfree-gmax', species: 'butterfree', baseZh: '巴大蝶' },
  { name: 'machamp-gmax', species: 'machamp', baseZh: '怪力' },
  { name: 'gengar-gmax', species: 'gengar', baseZh: '耿鬼' },
  { name: 'kingler-gmax', species: 'kingler', baseZh: '巨鉗蟹' },
  { name: 'lapras-gmax', species: 'lapras', baseZh: '拉普拉斯' },
  { name: 'eevee-gmax', species: 'eevee', baseZh: '伊布' },
  { name: 'snorlax-gmax', species: 'snorlax', baseZh: '卡比獸' },
  { name: 'garbodor-gmax', species: 'garbodor', baseZh: '灰塵山' },
  { name: 'melmetal-gmax', species: 'melmetal', baseZh: '美錄梅塔' },
  { name: 'rillaboom-gmax', species: 'rillaboom', baseZh: '轟擂金剛猩' },
  { name: 'cinderace-gmax', species: 'cinderace', baseZh: '閃焰王牌' },
  { name: 'inteleon-gmax', species: 'inteleon', baseZh: '千面避役' },
  { name: 'corviknight-gmax', species: 'corviknight', baseZh: '鋼鎧鴉' },
  { name: 'orbeetle-gmax', species: 'orbeetle', baseZh: '以歐路普' },
  { name: 'drednaw-gmax', species: 'drednaw', baseZh: '暴噬龜' },
  { name: 'coalossal-gmax', species: 'coalossal', baseZh: '巨炭山' },
  { name: 'flapple-gmax', species: 'flapple', baseZh: '蘋裹龍' },
  { name: 'appletun-gmax', species: 'appletun', baseZh: '豐蜜龍' },
  { name: 'sandaconda-gmax', species: 'sandaconda', baseZh: '沙螺蟒' },
  { name: 'toxtricity-amped-gmax', species: 'toxtricity', baseZh: '顫弦蠑螈' },
  { name: 'centiskorch-gmax', species: 'centiskorch', baseZh: '焚焰蚣' },
  { name: 'hatterene-gmax', species: 'hatterene', baseZh: '布莉姆溫' },
  { name: 'grimmsnarl-gmax', species: 'grimmsnarl', baseZh: '長毛巨魔' },
  { name: 'alcremie-gmax', species: 'alcremie', baseZh: '霜奶仙' },
  { name: 'copperajah-gmax', species: 'copperajah', baseZh: '大王銅象' },
  { name: 'duraludon-gmax', species: 'duraludon', baseZh: '鋁鋼龍' },
  { name: 'urshifu-single-strike-gmax', species: 'urshifu', baseZh: '武道熊師' },
  { name: 'urshifu-rapid-strike-gmax', species: 'urshifu', baseZh: '武道熊師' },
];

console.log('Scanning Pokemon names for formatting issues...');

specialCases.forEach(pokemon => {
  const formatted = formatPokemonName(pokemon.name, pokemon.baseZh, pokemon.species);
  
  // Check English Name
  let enName = formatted.enName;
  let issues = [];

  // Check for Gmax
  if (enName.includes('Gmax')) {
    issues.push(`Contains 'Gmax' instead of 'Gigantamax'`);
  }

  // Check for missing dots in Mr/Jr
  if ((pokemon.name.includes('mr') || pokemon.name.includes('jr')) && !enName.includes('.')) {
    issues.push(`Missing dot in Mr/Jr`);
  }

  // Check for Type: Null
  if (pokemon.name === 'type-null' && enName !== 'Type: Null') {
    issues.push(`Incorrect format for Type: Null (got '${enName}')`);
  }

  // Check for Farfetch'd / Sirfetch'd
  if ((pokemon.name === 'farfetchd' || pokemon.name === 'sirfetchd') && !enName.includes("'")) {
    issues.push(`Missing apostrophe in Farfetch'd/Sirfetch'd (got '${enName}')`);
  }

  // Check for Flabebe accent
  if (pokemon.name === 'flabebe' && !enName.includes('é')) {
    issues.push(`Missing accent in Flabébé (got '${enName}')`);
  }

  // Check for Nidoran gender symbols
  if (pokemon.name.includes('nidoran') && !enName.includes('♀') && !enName.includes('♂')) {
    issues.push(`Missing gender symbol in Nidoran (got '${enName}')`);
  }

  // Check for Ho-Oh
  if (pokemon.name === 'ho-oh' && enName !== 'Ho-Oh') {
    issues.push(`Incorrect format for Ho-Oh (got '${enName}')`);
  }

  // Check for Porygon-Z
  if (pokemon.name === 'porygon-z' && enName !== 'Porygon-Z') {
    issues.push(`Incorrect format for Porygon-Z (got '${enName}')`);
  }

  // Check for Jangmo-o line
  if (pokemon.name.endsWith('-o') && !enName.endsWith('-o')) {
    issues.push(`Incorrect format for Jangmo-o line (got '${enName}')`);
  }

  // Check for Paradox Pokemon (Iron/Great/etc)
  if ((pokemon.name.startsWith('iron-') || pokemon.name.startsWith('great-') || pokemon.name.startsWith('scream-')) && enName.includes('-')) {
     // Paradox pokemon should have spaces, not hyphens in display name usually, unless our formatPokemonName handles it
     // Actually formatPokemonName usually capitalizes and replaces hyphens with spaces for unknown forms
     // But let's see what it does.
  }

  if (issues.length > 0) {
    console.log(`[FAIL] ${pokemon.name} -> ${enName}`);
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log(`[PASS] ${pokemon.name} -> ${enName}`);
  }
});
