import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// List of top 27 Pokemon in Double Battles based on user provided image
// Using their PokeAPI names to fetch sprites
const TOP_POKEMON = [
  { rank: 1, name: 'incineroar', usage: '67.6%' },
  { rank: 2, name: 'sneasler', usage: '42.6%' },
  { rank: 3, name: 'garchomp', usage: '39.7%' },
  { rank: 4, name: 'kingambit', usage: '32.4%' },
  { rank: 5, name: 'sinistcha', usage: '32.4%' },
  { rank: 6, name: 'charizard', usage: '26.5%' },
  { rank: 7, name: 'whimsicott', usage: '26.5%' },
  { rank: 8, name: 'basculegion-male', usage: '25%' }, // Assuming male form is default
  { rank: 9, name: 'archaludon', usage: '23.5%' },
  { rank: 10, name: 'pelipper', usage: '22.1%' },
  { rank: 11, name: 'rotom-wash', usage: '17.6%' },
  { rank: 12, name: 'gardevoir', usage: '16.2%' },
  { rank: 13, name: 'maushold-family-of-four', usage: '13.2%' }, // Assuming family of four is default
  { rank: 14, name: 'tyranitar', usage: '13.2%' },
  { rank: 15, name: 'excadrill', usage: '10.3%' },
  { rank: 16, name: 'froslass', usage: '10.3%' },
  { rank: 17, name: 'gengar', usage: '10.3%' },
  { rank: 18, name: 'dragonite', usage: '8.8%' },
  { rank: 19, name: 'arcanine-hisui', usage: '7.4%' },
  { rank: 20, name: 'floette-eternal', usage: '7.4%' },
  { rank: 21, name: 'hydreigon', usage: '7.4%' },
  { rank: 22, name: 'primarina', usage: '7.4%' },
  { rank: 23, name: 'farigiraf', usage: '5.9%' },
  { rank: 24, name: 'kommoo', usage: '5.9%' },
  { rank: 25, name: 'meganium', usage: '5.9%' },
  { rank: 26, name: 'sylveon', usage: '5.9%' },
  { rank: 27, name: 'torkoal', usage: '5.9%' },
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
    <div className="w-full h-full min-h-screen p-2 sm:p-4 bg-slate-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Usage Rate</h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-4">
          {TOP_POKEMON.map((pokemon) => (
            <Card key={pokemon.rank} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-3 flex flex-col items-center justify-center relative aspect-square">
                {/* Rank Badge */}
                <div className="absolute top-1 left-1 bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded-sm z-10">
                  #{pokemon.rank}
                </div>
                
                {/* Pokemon Sprite */}
                <div className="w-full h-full flex items-center justify-center mt-2 mb-4">
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
                
                {/* Usage Rate */}
                <div className="absolute bottom-1 w-full text-center">
                  <span className="text-xs font-bold text-slate-700">{pokemon.usage}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
