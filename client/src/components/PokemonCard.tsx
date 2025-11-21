import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getHighQualitySprite } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { STAT_NAMES, TYPE_COLORS, TYPE_NAMES } from '@/types/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const spriteUrl = getHighQualitySprite(pokemon);

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-dashed border-cyan-300 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          #{pokemon.id.toString().padStart(3, '0')} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <img
            src={spriteUrl}
            alt={pokemon.name}
            className="w-48 h-48 object-contain"
          />
          
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
