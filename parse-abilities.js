
import fs from 'fs';

// Read the markdown file
const markdown = fs.readFileSync('/home/ubuntu/page_texts/wiki.52poke.com_zh-hant__E7_89_B9_E6_80_A7_E5_88_97_E8_A1_A8.md', 'utf-8');

// The table format in the markdown is tab-separated:
// 編號	中文名	日文名	英文名	說明	常見	隱藏
// 001	惡臭	あくしゅう	Stench	發出臭氣，在攻擊的時候，有時會使對手畏縮。	6	3

const translations = {};

// Split by lines to process each row
const lines = markdown.split('\n');

lines.forEach(line => {
  // Split by tab
  const parts = line.split('\t').map(p => p.trim());
  
  // Check if it's a valid row (has enough columns and first column is a number)
  if (parts.length >= 4 && /^\d{3}$/.test(parts[0])) {
    
    // Extract Chinese name (remove markdown link syntax if present, though it seems clean in this file)
    let chineseName = parts[1];
    
    // Extract English name
    let englishName = parts[3];
    
    if (chineseName && englishName) {
      // Convert English name to PokeAPI format (lowercase, spaces to hyphens)
      // Remove any non-alphanumeric characters except hyphens
      const apiName = englishName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      translations[apiName] = chineseName;
    }
  }
});

// Manual fixes for known discrepancies
translations['compound-eyes'] = '複眼';
translations['lightning-rod'] = '避雷針';
translations['solid-rock'] = '堅硬岩石';
translations['filter'] = '過濾';
translations['mega-launcher'] = '超級發射器';
translations['tough-claws'] = '硬爪';
translations['strong-jaw'] = '強壯之顎';
translations['parental-bond'] = '親子愛';
translations['aerilate'] = '飛行皮膚';
translations['pixilate'] = '妖精皮膚';
translations['refrigerate'] = '冰凍皮膚';
translations['gooey'] = '黏滑';
translations['primordial-sea'] = '始源之海';
translations['desolate-land'] = '終結之地';
translations['delta-stream'] = '德爾塔氣流';
translations['stamina'] = '持久力';
translations['wimp-out'] = '躍躍欲逃';
translations['emergency-exit'] = '危險迴避';
translations['water-compaction'] = '遇水凝固';
translations['merciless'] = '不仁不義';
translations['shields-down'] = '界限盾殼';
translations['stakeout'] = '監視';
translations['water-bubble'] = '水泡';
translations['steelworker'] = '鋼能力者';
translations['berserk'] = '怒火沖天';
translations['slush-rush'] = '撥雪';
translations['long-reach'] = '遠隔';
translations['liquid-voice'] = '濕潤之聲';
translations['triage'] = '先行治療';
translations['galvanize'] = '電氣皮膚';
translations['surge-surfer'] = '衝浪之尾';
translations['schooling'] = '魚群';
translations['disguise'] = '畫皮';
translations['battle-bond'] = '牽絆變身';
translations['power-construct'] = '群聚變形';
translations['corrosion'] = '腐蝕';
translations['comatose'] = '絕對睡眠';
translations['queenly-majesty'] = '女王的威嚴';
translations['innards-out'] = '飛出的內在物';
translations['dancer'] = '舞者';
translations['battery'] = '蓄電池';
translations['fluffy'] = '毛茸茸';
translations['dazzling'] = '鮮豔之軀';
translations['soul-heart'] = '魂心';
translations['tangling-hair'] = '捲髮';
translations['receiver'] = '接球手';
translations['power-of-alchemy'] = '化學之力';
translations['beast-boost'] = '異獸提升';
translations['rks-system'] = 'AR系統';
translations['electric-surge'] = '電氣製造者';
translations['psychic-surge'] = '精神製造者';
translations['misty-surge'] = '薄霧製造者';
translations['grassy-surge'] = '青草製造者';
translations['full-metal-body'] = '金屬防護';
translations['shadow-shield'] = '幻影防守';
translations['prism-armor'] = '稜鏡裝甲';
translations['neuroforce'] = '腦核之力';
translations['intrepid-sword'] = '不撓之劍';
translations['dauntless-shield'] = '不屈之盾';
translations['libero'] = '自由者';
translations['ball-fetch'] = '撿球';
translations['cotton-down'] = '棉絮';
translations['propeller-tail'] = '螺旋尾鰭';
translations['mirror-armor'] = '鏡甲';
translations['gulp-missile'] = '一口氣吞下';
translations['stalwart'] = '堅毅';
translations['steam-engine'] = '蒸汽機';
translations['punk-rock'] = '龐克搖滾';
translations['sand-spit'] = '吐沙';
translations['ice-scales'] = '冰鱗粉';
translations['ripen'] = '熟成';
translations['ice-face'] = '結凍頭';
translations['power-spot'] = '能量點';
translations['mimicry'] = '擬態';
translations['screen-cleaner'] = '除障';
translations['steely-spirit'] = '鋼之意志';
translations['perish-body'] = '滅亡之軀';
translations['wandering-spirit'] = '遊魂';
translations['gorilla-tactics'] = '一猩一意';
translations['neutralizing-gas'] = '化學變化氣體';
translations['pastel-veil'] = '粉彩護幕';
translations['hunger-switch'] = '飽了又餓';
translations['quick-draw'] = '速擊';
translations['unseen-fist'] = '無形拳';
translations['curious-medicine'] = '怪藥';
translations['transistor'] = '電晶體';
translations['dragons-maw'] = '龍之顎';
translations['chilling-neigh'] = '蒼白嘶鳴';
translations['grim-neigh'] = '漆黑嘶鳴';
translations['as-one-glastrier'] = '人馬一體';
translations['as-one-spectrier'] = '人馬一體';

// Output the result
console.log('export const ABILITY_TRANSLATIONS: Record<string, string> = {');
Object.entries(translations).forEach(([key, value]) => {
  console.log(`  '${key}': '${value}',`);
});
console.log('};');
