import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getHighQualitySprite, fetchAbilityDetails } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { STAT_NAMES, TYPE_COLORS, TYPE_NAMES } from '@/types/pokemon';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PokemonCardProps {
  pokemon: Pokemon;
  showEVYield?: boolean;
  language?: 'zh' | 'en';
}

const STAT_NAMES_EN: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

const TYPE_NAMES_EN: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fire',
  water: 'Water',
  grass: 'Grass',
  electric: 'Electric',
  ice: 'Ice',
  fighting: 'Fighting',
  poison: 'Poison',
  ground: 'Ground',
  flying: 'Flying',
  psychic: 'Psychic',
  bug: 'Bug',
  rock: 'Rock',
  ghost: 'Ghost',
  dragon: 'Dragon',
  steel: 'Steel',
  dark: 'Dark',
  fairy: 'Fairy',
};

export default function PokemonCard({ pokemon, showEVYield = true, language = 'zh' }: PokemonCardProps) {
  const spriteUrl = getHighQualitySprite(pokemon);
  const [abilities, setAbilities] = useState<Array<{ name: string; zhName: string; isHidden: boolean }>>([]);
  const [isAbilitiesOpen, setIsAbilitiesOpen] = useState(false);
  const [isLoadingAbilities, setIsLoadingAbilities] = useState(true);

  useEffect(() => {
    const loadAbilities = async () => {
      setIsLoadingAbilities(true);
      const abilityPromises = pokemon.abilities.map(async (ability) => {
        const details = await fetchAbilityDetails(ability.ability.url);
        return {
          ...details,
          isHidden: ability.is_hidden
        };
      });
      const results = await Promise.all(abilityPromises);
      setAbilities(results);
      setIsLoadingAbilities(false);
    };
    loadAbilities();
  }, [pokemon.id]);

  return (
	    <Card className="bg-white/95 backdrop-blur-sm border-2 border-dashed border-cyan-300 shadow-lg">
	      <CardHeader>
	        <CardTitle className="text-2xl font-bold text-center">
	          {/* 強制顯示原始 ID，如果 id > 10000，則嘗試從 species url 解析，或者直接使用 pokemon.species.url */}
	          {/* 由於 Pokemon 介面沒有 species.id，我們這裡做一個簡單的判斷：如果 id > 10000，則顯示 species url 中的 id */}
	          {/* 但為了保險，我們假設 pokemon 物種資料已經正確處理。如果沒有，我們這裡做一個 fallback */}
	          #{(() => {
	             if (pokemon.id > 10000 && pokemon.species && pokemon.species.url) {
	                const parts = pokemon.species.url.split('/');
	                const speciesId = parts[parts.length - 2]; // .../species/1/
	                return speciesId.padStart(4, '0');
	             }
	             return pokemon.id.toString().padStart(4, '0');
	          })()} {language === 'zh' ? (() => {
            // 強制修正特定寶可夢的顯示名稱
            // 優先檢查英文名稱，因為 ID 可能被標準化為 Species ID (555)
            const enName = pokemon.enName || pokemon.name;
            
            // 達摩狒狒特殊處理：使用屬性判斷形態
            if (enName.includes('Darmanitan') || enName.includes('darmanitan') || pokemon.id === 555) {
              const types = pokemon.types.map(t => t.type.name);
              const hasIce = types.includes('ice');
              const hasFire = types.includes('fire');
              const hasPsychic = types.includes('psychic');
              
              if (hasIce && hasFire) return '達摩狒狒（伽勒爾達摩模式）';
              if (hasIce) return '達摩狒狒（伽勒爾的樣子）';
              if (hasFire && hasPsychic) return '達摩狒狒（達摩模式）';
              if (hasFire) return '達摩狒狒';
            }
            
            if (enName.includes('Darmanitan (Galar Zen)') || enName.includes('galar-zen')) return '達摩狒狒（伽勒爾達摩模式）';
            if (enName.includes('Darmanitan (Galarian)') || enName.includes('galar-standard')) return '達摩狒狒（伽勒爾的樣子）';
            if (enName.includes('Darmanitan (Zen)') || enName.includes('zen-mode')) return '達摩狒狒（達摩模式）';
            if (enName.includes('Darmanitan') || enName.includes('darmanitan')) return '達摩狒狒';
            
            // 如果英文名檢查失敗，再嘗試 ID 檢查（作為備用）
            if (pokemon.id === 10178) return '達摩狒狒（伽勒爾達摩模式）';
            if (pokemon.id === 10177) return '達摩狒狒（伽勒爾的樣子）';
            if (pokemon.id === 10017) return '達摩狒狒（達摩模式）';
            if (pokemon.id === 555) return '達摩狒狒';

            return pokemon.zhName || pokemon.name;
          })() : (() => {
            const name = (pokemon.enName || pokemon.name).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            // 達摩狒狒英文名特殊處理：使用屬性判斷形態
            if (name.includes('Darmanitan') || pokemon.id === 555) {
              const types = pokemon.types.map(t => t.type.name);
              const hasIce = types.includes('ice');
              const hasFire = types.includes('fire');
              const hasPsychic = types.includes('psychic');
              
              if (hasIce && hasFire) return 'Darmanitan (Galar Zen)';
              if (hasIce) return 'Darmanitan (Galar)';
              if (hasFire && hasPsychic) return 'Darmanitan (Zen)';
              if (hasFire) return 'Darmanitan (Standard)';
            }
            
            // 特殊名稱處理
            if (name === 'Mr Mime' || name === 'Mr-mime') return 'Mr. Mime';
            if (name === 'Mr Rime' || name === 'Mr-rime') return 'Mr. Rime';
            if (name === 'Mime Jr' || name === 'Mime-jr') return 'Mime Jr.';
            if (name === 'Type Null' || name === 'Type-null') return 'Type: Null';
            if (name === 'Tapu Koko' || name === 'Tapu-koko') return 'Tapu Koko';
            if (name === 'Tapu Lele' || name === 'Tapu-lele') return 'Tapu Lele';
            if (name === 'Tapu Bulu' || name === 'Tapu-bulu') return 'Tapu Bulu';
            if (name === 'Tapu Fini' || name === 'Tapu-fini') return 'Tapu Fini';
            if (name === 'Great Tusk' || name === 'Great-tusk') return 'Great Tusk';
            if (name === 'Scream Tail' || name === 'Scream-tail') return 'Scream Tail';
            if (name === 'Brute Bonnet' || name === 'Brute-bonnet') return 'Brute Bonnet';
            if (name === 'Flutter Mane' || name === 'Flutter-mane') return 'Flutter Mane';
            if (name === 'Slither Wing' || name === 'Slither-wing') return 'Slither Wing';
            if (name === 'Sandy Shocks' || name === 'Sandy-shocks') return 'Sandy Shocks';
            if (name === 'Iron Treads' || name === 'Iron-treads') return 'Iron Treads';
            if (name === 'Iron Bundle' || name === 'Iron-bundle') return 'Iron Bundle';
            if (name === 'Iron Hands' || name === 'Iron-hands') return 'Iron Hands';
            if (name === 'Iron Jugulis' || name === 'Iron-jugulis') return 'Iron Jugulis';
            if (name === 'Iron Moth' || name === 'Iron-moth') return 'Iron Moth';
            if (name === 'Iron Thorns' || name === 'Iron-thorns') return 'Iron Thorns';
            if (name === 'Roaring Moon' || name === 'Roaring-moon') return 'Roaring Moon';
            if (name === 'Iron Valiant' || name === 'Iron-valiant') return 'Iron Valiant';
            if (name === 'Walking Wake' || name === 'Walking-wake') return 'Walking Wake';
            if (name === 'Iron Leaves' || name === 'Iron-leaves') return 'Iron Leaves';
            
            return name;
          })()}
	        </CardTitle>
	      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* 桌面版：圖片和特性並排 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full justify-center">
            <img
              src={spriteUrl}
              alt={pokemon.name}
              className="w-48 h-48 object-contain flex-shrink-0"
            />
            
            {/* 桌面版特性顯示 */}
            <div className="hidden md:block w-auto max-w-xs">
              <h3 className="text-lg font-semibold mb-2">{language === 'zh' ? '特性' : 'Abilities'}</h3>
              {isLoadingAbilities ? (
                <p className="text-sm text-gray-500">載入中...</p>
              ) : (
                <div className="space-y-2">
                  {abilities.map((ability, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 px-3 py-2 rounded-lg"
                    >
                      <span className="font-medium text-purple-900">
                        {language === 'zh' 
                          ? ability.zhName 
                          : ability.name
                              .split('-')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')
                        }
                      </span>
                      {ability.isHidden && (
                        <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">{language === 'zh' ? '隱藏特性' : 'Hidden Ability'}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {pokemon.types.map((type) => (
              <span
                key={type.slot}
                className={`px-4 py-1 rounded-full text-white font-medium ${TYPE_COLORS[type.type.name] || 'bg-gray-400'}`}
              >
                {language === 'zh' ? (TYPE_NAMES[type.type.name] || type.type.name) : (TYPE_NAMES_EN[type.type.name] || type.type.name)}
              </span>
            ))}
          </div>

          {/* 手機版特性顯示（可摺疊） */}
          <div className="md:hidden w-full">
            <button
              onClick={() => setIsAbilitiesOpen(!isAbilitiesOpen)}
              className="w-full bg-purple-100 hover:bg-purple-200 transition-colors px-4 py-3 rounded-lg flex items-center justify-between"
            >
              <span className="font-semibold text-purple-900">{language === 'zh' ? '特性' : 'Abilities'}</span>
              {isAbilitiesOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {isAbilitiesOpen && (
              <div className="mt-2 space-y-2">
                {isLoadingAbilities ? (
                  <p className="text-sm text-gray-500 text-center py-2">載入中...</p>
                ) : (
                  abilities.map((ability, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 px-3 py-2 rounded-lg"
                    >
                      <span className="font-medium text-purple-900">
                        {language === 'zh' 
                          ? ability.zhName 
                          : ability.name
                              .split('-')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')
                        }
                      </span>
                      {ability.isHidden && (
                        <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">{language === 'zh' ? '隱藏特性' : 'Hidden Ability'}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {showEVYield && (
            <div className="w-full mt-4">
              <h3 className="text-lg font-semibold mb-3 text-center">{language === 'zh' ? '擊敗可獲得的努力值' : 'EV Yield'}</h3>
              <div className="space-y-2">
                {pokemon.stats.map((stat) => {
                  if (stat.effort === 0) return null;
                  return (
                    <div
                      key={stat.stat.name}
                      className="flex justify-between items-center bg-blue-50 px-4 py-2 rounded-lg"
                    >
                      <span className="font-medium">{language === 'zh' ? STAT_NAMES[stat.stat.name] : STAT_NAMES_EN[stat.stat.name]}</span>
                      <span className="text-blue-600 font-bold">+{stat.effort}</span>
                    </div>
                  );
                })}
                {pokemon.stats.every((stat) => stat.effort === 0) && (
                  <p className="text-center text-gray-500">{language === 'zh' ? '此寶可夢不提供努力值' : 'No EV yield'}</p>
                )}
              </div>
            </div>
          )}

          <div className="w-full mt-4">
            <h3 className="text-lg font-semibold mb-3 text-center">{language === 'zh' ? '種族值' : 'Base Stats'}</h3>
            <div className="space-y-2">
              {pokemon.stats.map((stat) => (
                <div
                  key={stat.stat.name}
                  className="flex justify-between items-center"
                >
                  <span className="font-medium">{language === 'zh' ? STAT_NAMES[stat.stat.name] : STAT_NAMES_EN[stat.stat.name]}</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{stat.base_stat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
