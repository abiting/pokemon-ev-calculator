import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getHighQualitySprite, fetchAbilityDetails } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { STAT_NAMES, TYPE_COLORS, TYPE_NAMES } from '@/types/pokemon';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
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
          #{pokemon.id.toString().padStart(3, '0')} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* 桌面版：圖片和特性並排 */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
            <img
              src={spriteUrl}
              alt={pokemon.name}
              className="w-48 h-48 object-contain mx-auto md:mx-0"
            />
            
            {/* 桌面版特性顯示 */}
            <div className="hidden md:block flex-1">
              <h3 className="text-lg font-semibold mb-2">特性</h3>
              {isLoadingAbilities ? (
                <p className="text-sm text-gray-500">載入中...</p>
              ) : (
                <div className="space-y-2">
                  {abilities.map((ability, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 px-3 py-2 rounded-lg"
                    >
                      <span className="font-medium text-purple-900">{ability.zhName}</span>
                      {ability.isHidden && (
                        <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">隱藏特性</span>
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
                {TYPE_NAMES[type.type.name] || type.type.name}
              </span>
            ))}
          </div>

          {/* 手機版特性顯示（可摺疊） */}
          <div className="md:hidden w-full">
            <button
              onClick={() => setIsAbilitiesOpen(!isAbilitiesOpen)}
              className="w-full bg-purple-100 hover:bg-purple-200 transition-colors px-4 py-3 rounded-lg flex items-center justify-between"
            >
              <span className="font-semibold text-purple-900">特性</span>
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
                      <span className="font-medium text-purple-900">{ability.zhName}</span>
                      {ability.isHidden && (
                        <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">隱藏特性</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="w-full mt-4">
            <h3 className="text-lg font-semibold mb-3 text-center">擊敗可獲得的努力值</h3>
            <div className="space-y-2">
              {pokemon.stats.map((stat) => {
                if (stat.effort === 0) return null;
                return (
                  <div
                    key={stat.stat.name}
                    className="flex justify-between items-center bg-blue-50 px-4 py-2 rounded-lg"
                  >
                    <span className="font-medium">{STAT_NAMES[stat.stat.name]}</span>
                    <span className="text-blue-600 font-bold">+{stat.effort}</span>
                  </div>
                );
              })}
              {pokemon.stats.every((stat) => stat.effort === 0) && (
                <p className="text-center text-gray-500">此寶可夢不提供努力值</p>
              )}
            </div>
          </div>

          <div className="w-full mt-4">
            <h3 className="text-lg font-semibold mb-3 text-center">種族值</h3>
            <div className="space-y-2">
              {pokemon.stats.map((stat) => (
                <div
                  key={stat.stat.name}
                  className="flex justify-between items-center"
                >
                  <span className="font-medium">{STAT_NAMES[stat.stat.name]}</span>
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
