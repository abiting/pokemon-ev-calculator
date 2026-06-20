import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// List of top 65 Pokemon in Double Battles based on user provided image
// Using their PokeAPI names to fetch sprites
const TOP_POKEMON = [
  { rank: 1, name: 'garchomp', usage: '53.5%' },        // 烈咬陸鯊
  { rank: 2, name: 'archaludon', usage: '42.1%' },      // 鋁鋼橋龍
  { rank: 3, name: 'raichu', usage: '37.1%' },          // 雷丘
  { rank: 4, name: 'meowscarada', usage: '34.6%' },     // 魔幻假面喵
  { rank: 5, name: 'mimikyu-disguised', usage: '24.4%' }, // 謎擬Ｑ
  { rank: 6, name: 'staraptor', usage: '23.0%' },       // 姆克鷹
  { rank: 7, name: 'swampert', usage: '20.9%' },        // 巨沼怪
  { rank: 8, name: 'corviknight', usage: '20.9%' },     // 鋼鎧鴉
  { rank: 9, name: 'charizard', usage: '18.7%' },       // 噴火龍
  { rank: 10, name: 'metagross', usage: '17.5%' },      // 巨金怪
  { rank: 11, name: 'hippowdon', usage: '16.3%' },      // 河馬獸
  { rank: 12, name: 'pelipper', usage: '16.1%' },       // 大嘴鷗
  { rank: 13, name: 'basculegion-male', usage: '13.2%' }, // 幽尾玄魚（公）
  { rank: 14, name: 'primarina', usage: '13.1%' },      // 西獅海壬
  { rank: 15, name: 'grimmsnarl', usage: '13.0%' },     // 長毛巨魔
  { rank: 16, name: 'blaziken', usage: '11.3%' },       // 火焰雞
  { rank: 17, name: 'gyarados', usage: '10.9%' },       // 暴鯉龍
  { rank: 18, name: 'gholdengo', usage: '10.0%' },      // 賽富豪
  { rank: 19, name: 'dragonite', usage: '9.6%' },       // 快龍
  { rank: 20, name: 'ninetales-alola', usage: '9.5%' }, // 阿羅拉九尾
  { rank: 21, name: 'glimmora', usage: '9.5%' },        // 晶光花
  { rank: 22, name: 'kingambit', usage: '9.1%' },        // 仆斬將軍
  { rank: 23, name: 'hydreigon', usage: '6.8%' },       // 三首惡龍
  { rank: 24, name: 'mawile', usage: '6.5%' },          // 大嘴娃
  { rank: 25, name: 'rotom-wash', usage: '6.4%' },      // 洛托姆（水）
  { rank: 26, name: 'aegislash-shield', usage: '6.0%' }, // 堅盾劍怪
  { rank: 27, name: 'skeledirge', usage: '6.0%' },      // 骨紋巨聲鱷
  { rank: 28, name: 'gengar', usage: '5.8%' },          // 耿鬼
  { rank: 29, name: 'dragalge', usage: '5.2%' },        // 毒藻龍
  { rank: 30, name: 'delphox', usage: '5.1%' },         // 妖火紅狐
  { rank: 31, name: 'scizor', usage: '4.6%' },          // 巨鉗螳螂
  { rank: 32, name: 'volcarona', usage: '4.4%' },       // 火神蛾
  { rank: 33, name: 'vanilluxe', usage: '4.2%' },       // 雙倍多多冰
  { rank: 34, name: 'lopunny', usage: '4.1%' },         // 長耳兔
  { rank: 35, name: 'meganium', usage: '4.1%' },        // 大竺葵
  { rank: 36, name: 'starmie', usage: '3.9%' },         // 寶石海星
  { rank: 37, name: 'greninja', usage: '3.7%' },        // 甲賀忍蛙
  { rank: 38, name: 'ceruledge', usage: '3.6%' },       // 蒼炎刃鬼
  { rank: 39, name: 'samurott-hisui', usage: '3.4%' },  // 大劍鬼（洗翠）
  { rank: 40, name: 'dragapult', usage: '3.0%' },       // 多龍巴魯託
  { rank: 41, name: 'annihilape', usage: '2.8%' },      // 棄世猴
  { rank: 42, name: 'venusaur', usage: '2.6%' },        // 妙蛙花
  { rank: 43, name: 'ursaluna', usage: '2.4%' },        // 大狃拉
  { rank: 44, name: 'umbreon', usage: '2.4%' },         // 月亮伊布
  { rank: 45, name: 'lucario', usage: '2.4%' },         // 路卡利歐
  { rank: 46, name: 'floette-eternal', usage: '2.4%' }, // 花葉蒂（永恆之花）
  { rank: 47, name: 'whimsicott', usage: '2.4%' },      // 風妖精
  { rank: 48, name: 'blastoise', usage: '2.3%' },       // 水箭龜
  { rank: 49, name: 'bellibolt', usage: '2.2%' },            // 電肚蛙
  { rank: 50, name: 'mamoswine', usage: '2.0%' },       // 象牙豬
  { rank: 51, name: 'rotom-heat', usage: '2.0%' },      // 洛托姆（火）
  { rank: 52, name: 'sylveon', usage: '1.7%' },         // 仙子伊布
  { rank: 53, name: 'araquanid', usage: '1.7%' },       // 滴蛛霸
  { rank: 54, name: 'azumarill', usage: '1.7%' },        // 瑪力露麗
  { rank: 55, name: 'tyranitar', usage: '1.7%' },       // 班基拉斯
  { rank: 56, name: 'clefable', usage: '1.7%' },         // 皮可西
  { rank: 57, name: 'excadrill', usage: '1.6%' },       // 龍頭地鼠
  { rank: 58, name: 'froslass', usage: '1.5%' },        // 雪妖女
  { rank: 59, name: 'espathra', usage: '1.5%' },        // 超能艷鴕
  { rank: 60, name: 'ditto', usage: '1.5%' },           // 百變怪
  { rank: 61, name: 'zoroark-hisui', usage: '1.5%' },    // 索羅亞克（洗翠）
  { rank: 62, name: 'eelektross', usage: '1.5%' },      // 麻麻鰻魚王
  { rank: 63, name: 'gardevoir', usage: '1.5%' },       // 沙奈朵
  { rank: 64, name: 'toxapex', usage: '1.5%' },         // 超壞星
  { rank: 65, name: 'snorlax', usage: '1.5%' },         // 卡比獸
];

export default function DoublesTierList() {
  useEffect(() => {
    document.title = 'VGC Doubles Usage Ranking - Pokémon Champions';
  }, []);

  // Helper function to get the sprite URL
  const getSpriteUrl = (pokemonName: string) => {
    return `https://play.pokemonshowdown.com/sprites/gen5/${pokemonName}.png`;
  };

  return (
    <div className="w-full h-full min-h-screen p-2 sm:p-4 bg-slate-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Usage Rate</h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-4">
          {TOP_POKEMON.map((pokemon) => (
            <Card key={pokemon.rank} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-1 sm:p-2 flex flex-col items-center">
                <div className="text-xs font-bold text-slate-500 mb-1">#{pokemon.rank}</div>
                <img
                  src={getSpriteUrl(pokemon.name)}
                  alt={pokemon.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://play.pokemonshowdown.com/sprites/gen5/${pokemon.name.split('-')[0]}.png`;
                  }}
                />
                <div className="text-xs text-slate-600 font-semibold mt-1">{pokemon.usage}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
