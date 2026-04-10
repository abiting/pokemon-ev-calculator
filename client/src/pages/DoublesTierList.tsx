import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// List of top 27 Pokemon in Double Battles based on user provided image
// Using their PokeAPI names to fetch sprites
const TOP_POKEMON = [
  { rank: 1, name: 'incineroar' },
  { rank: 2, name: 'sneasler' },
  { rank: 3, name: 'garchomp' },
  { rank: 4, name: 'kingambit' },
  { rank: 5, name: 'poltchageist' },
  { rank: 6, name: 'charizard' },
  { rank: 7, name: 'whimsicott' },
  { rank: 8, name: 'basculegion-male' }, // Assuming male form is default
  { rank: 9, name: 'archaludon' },
  { rank: 10, name: 'pelipper' },
  { rank: 11, name: 'rotom-wash' },
  { rank: 12, name: 'gardevoir' },
  { rank: 13, name: 'maushold-family-of-four' }, // Assuming family of four is default
  { rank: 14, name: 'tyranitar' },
  { rank: 15, name: 'excadrill' },
  { rank: 16, name: 'froslass' },
  { rank: 17, name: 'gengar' },
  { rank: 18, name: 'dragonite' },
  { rank: 19, name: 'arcanine-hisui' },
  { rank: 20, name: 'floette' },
  { rank: 21, name: 'hydreigon' },
  { rank: 22, name: 'primarina' },
  { rank: 23, name: 'farigiraf' },
  { rank: 24, name: 'kommo-o' },
  { rank: 25, name: 'gastrodon' }, // Assuming default form
  { rank: 26, name: 'sylveon' },
  { rank: 27, name: 'torkoal' },
];

export default function DoublesTierList() {
  useEffect(() => {
    document.title = 'VGC Doubles Usage Ranking - Pokémon Champions';
  }, []);

  // Helper function to get the sprite URL
  const getSpriteUrl = (pokemonName: string) => {
    // We use the official artwork for better quality, similar to the rest of the app
    // But since we don't have the exact ID without fetching, we can use the Pokemon Showdown sprites
    // or the PokeAPI sprites by name.
    // For consistency with the app, let's use the same sprite source if possible.
    // The app usually uses: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    // Since we only have names here, we can use the showdown sprites which support names directly,
    // or we can map names to IDs. Let's use the showdown sprites for simplicity and reliability with forms.
    return `https://play.pokemonshowdown.com/sprites/gen5/${pokemonName}.png`;
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-50">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            VGC Doubles Usage Ranking
          </h1>
          <p className="text-slate-600">
            Top 27 Most Used Pokémon in Double Battles
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
          {TOP_POKEMON.map((pokemon) => (
            <Card key={pokemon.rank} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-3 flex flex-col items-center justify-center relative aspect-square">
                {/* Rank Badge */}
                <div className="absolute top-1 left-1 bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded-sm z-10">
                  #{pokemon.rank}
                </div>
                
                {/* Pokemon Sprite */}
                <div className="w-full h-full flex items-center justify-center mt-2">
                  <img 
                    src={getSpriteUrl(pokemon.name)} 
                    alt={`Rank ${pokemon.rank} Pokemon`}
                    className="max-w-full max-h-full object-contain pixelated"
                    onError={(e) => {
                      // Fallback if the specific form sprite fails
                      const target = e.target as HTMLImageElement;
                      if (pokemon.name.includes('-')) {
                        target.src = `https://play.pokemonshowdown.com/sprites/gen5/${pokemon.name.split('-')[0]}.png`;
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
