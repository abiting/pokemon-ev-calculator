
import { ABILITY_TRANSLATIONS } from './ability-translations';
import pokemonZhMapping from '../data/zh-tw-mapping-full.json';

// 建立反向查找對應表（ID → 繁體中文名稱）
const idToZhMapping: Record<number, string> = {};
Object.entries(pokemonZhMapping as Record<string, number>).forEach(([name, id]) => {
  if (!idToZhMapping[id]) {
    idToZhMapping[id] = name;
  }
});

export function formatPokemonName(englishName: string, baseZhName: string, speciesName: string): { zhName: string, enName: string } {
  // Helper to capitalize words
  const capitalize = (s: string) => s.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  
  // Ensure base names are clean
  const cleanBaseZhName = baseZhName.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '');
  const baseEnName = capitalize(speciesName);
  
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
    enName = `Gmax ${baseEnName}`;
  } else if (englishName.includes('-eternamax')) {
    zhName = `無極巨${cleanBaseZhName}`;
    enName = `Eternamax ${baseEnName}`;
  } else if (englishName.includes('-alola')) {
    zhName = `阿羅拉${cleanBaseZhName}`;
    enName = `Alolan ${baseEnName}`;
  } else if (englishName.includes('-galar')) {
    zhName = `伽勒爾${cleanBaseZhName}`;
    enName = `Galarian ${baseEnName}`;
  } else if (englishName.includes('-hisui')) {
    zhName = `洗翠${cleanBaseZhName}`;
    enName = `Hisuian ${baseEnName}`;
  } else if (englishName.includes('-paldea')) {
    zhName = `帕底亞${cleanBaseZhName}`;
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
  } else if (englishName === 'oricorio' || englishName === 'oricorio-baile') {
    // 預設型態 (Baile Style)
    zhName = `${baseZhName}（熱辣熱辣風格）`;
    enName = `Oricorio Baile`;
  } else if (englishName.startsWith('oricorio-')) {
    // 其他 Oricorio 風格的通用處理，防止漏網之魚
    const style = englishName.replace('oricorio-', '');
    const styleCapitalized = style.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Oricorio ${styleCapitalized}`;
    
    // 嘗試對應中文風格
    if (style === 'pom-pom') zhName = `${baseZhName}（啪滋啪滋風格）`;
    else if (style === 'pau') zhName = `${baseZhName}（呼拉呼拉風格）`;
    else if (style === 'sensu') zhName = `${baseZhName}（輕盈輕盈風格）`;
    else zhName = `${baseZhName}（${styleCapitalized}風格）`;
  } else if (englishName.startsWith('squawkabilly-')) {
    // 怒鸚哥 (Squawkabilly) 羽色處理
    const plumage = englishName.replace('squawkabilly-', '');
    const plumageCapitalized = plumage.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Squawkabilly ${plumageCapitalized}`;
    
    if (plumage === 'blue-plumage') zhName = `${baseZhName}（藍羽毛）`;
    else if (plumage === 'yellow-plumage') zhName = `${baseZhName}（黃羽毛）`;
    else if (plumage === 'white-plumage') zhName = `${baseZhName}（白羽毛）`;
    else zhName = `${baseZhName}（${plumageCapitalized}）`;
  } else if (englishName.startsWith('tatsugiri-')) {
    // 米立龍 (Tatsugiri) 姿勢處理
    const form = englishName.replace('tatsugiri-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Tatsugiri ${formCapitalized}`;
    
    if (form === 'droopy') zhName = `${baseZhName}（下垂姿勢）`;
    else if (form === 'stretchy') zhName = `${baseZhName}（上弓姿勢）`;
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.startsWith('dudunsparce-')) {
    // 土龍節節 (Dudunsparce) 節數處理
    const form = englishName.replace('dudunsparce-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Dudunsparce ${formCapitalized}`;
    
    if (form === 'three-segment') zhName = `${baseZhName}（三節形態）`;
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.startsWith('maushold-')) {
    // 一對鼠 (Maushold) 家族處理
    const form = englishName.replace('maushold-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Maushold ${formCapitalized}`;
    
    if (form === 'family-of-three') zhName = `${baseZhName}（三隻家庭）`;
    else zhName = `${baseZhName}（${formCapitalized}）`;
  } else if (englishName.startsWith('palafin-')) {
    // 海豚俠 (Palafin) 形態處理
    const form = englishName.replace('palafin-', '');
    const formCapitalized = form.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    enName = `Palafin ${formCapitalized}`;
    
    if (form === 'hero') zhName = `${baseZhName}（全能形態）`;
    else zhName = `${baseZhName}（${formCapitalized}）`;
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
  return { zhName, enName };
}
