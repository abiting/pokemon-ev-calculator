import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// List of top 61 Pokemon in Double Battles based on user provided image
// Using their PokeAPI names to fetch sprites
const TOP_POKEMON = [
  { rank: 1, name: 'sneasler', usage: '' },
  { rank: 2, name: 'incineroar', usage: '' },
  { rank: 3, name: 'garchomp', usage: '' },
  { rank: 4, name: 'kingambit', usage: '' },
  { rank: 5, name: 'sinistcha', usage: '' },
  { rank: 6, name: 'basculegion-male', usage: '' },
  { rank: 7, name: 'charizard', usage: '' },
  { rank: 8, name: 'aerodactyl', usage: '' },
  { rank: 9, name: 'whimsicott', usage: '' },
  { rank: 10, name: 'rotom-wash', usage: '' },
  { rank: 11, name: 'floette-eternal', usage: '' },
  { rank: 12, name: 'pelipper', usage: '' },
  { rank: 13, name: 'tyranitar', usage: '' },
  { rank: 14, name: 'archaludon', usage: '' },
  { rank: 15, name: 'farigiraf', usage: '' },
  { rank: 16, name: 'milotic', usage: '' },
  { rank: 17, name: 'dragonite', usage: '' },
  { rank: 18, name: 'venusaur', usage: '' },
  { rank: 19, name: 'froslass', usage: '' },
  { rank: 20, name: 'talonflame', usage: '' },
  { rank: 21, name: 'corviknight', usage: '' },
  { rank: 22, name: 'gengar', usage: '' },
  { rank: 23, name: 'delphox', usage: '' },
  { rank: 24, name: 'meganium', usage: '' },
  { rank: 25, name: 'maushold-family-of-four', usage: '' },
  { rank: 26, name: 'excadrill', usage: '' },
  { rank: 27, name: 'gardevoir', usage: '' },
  { rank: 28, name: 'aegislash-shield', usage: '' },
  { rank: 29, name: 'torkoal', usage: '' },
  { rank: 30, name: 'primarina', usage: '' },
  { rank: 31, name: 'sylveon', usage: '' },
  { rank: 32, name: 'blastoise', usage: '' },
  { rank: 33, name: 'scizor', usage: '' },
  { rank: 34, name: 'kommoo', usage: '' },
  { rank: 35, name: 'glimmora', usage: '' },
  { rank: 36, name: 'dragapult', usage: '' },
  { rank: 37, name: 'kangaskhan', usage: '' },
  { rank: 38, name: 'politoed', usage: '' },
  { rank: 39, name: 'gyarados', usage: '' },
  { rank: 40, name: 'sableye', usage: '' },
  { rank: 41, name: 'ninetales-alola', usage: '' },
  { rank: 42, name: 'typhlosion-hisui', usage: '' },
  { rank: 43, name: 'clefable', usage: '' },
  { rank: 44, name: 'golurk', usage: '' },
  { rank: 45, name: 'starmie', usage: '' },
  { rank: 46, name: 'arcanine-hisui', usage: '' },
  { rank: 47, name: 'rotom-heat', usage: '' },
  { rank: 48, name: 'hydreigon', usage: '' },
  { rank: 49, name: 'zoroark-hisui', usage: '' },
  { rank: 50, name: 'palafin', usage: '' },
  { rank: 51, name: 'drampa', usage: '' },
  { rank: 52, name: 'volcarona', usage: '' },
  { rank: 53, name: 'crabominable', usage: '' },
  { rank: 54, name: 'meowscarada', usage: '' },
  { rank: 55, name: 'aggron', usage: '' },
  { rank: 56, name: 'lucario', usage: '' },
  { rank: 57, name: 'hatterene', usage: '' },
  { rank: 58, name: 'orthworm', usage: '' },
  { rank: 59, name: 'oranguru', usage: '' },
  { rank: 60, name: 'mimikyu-disguised', usage: '' },
  { rank: 61, name: 'gallade', usage: '' },
  { rank: 62, name: 'rotom-frost', usage: '' },
  { rank: 63, name: 'scovillain', usage: '' },
  { rank: 64, name: 'basculegion-female', usage: '' },
  { rank: 65, name: 'mamoswine', usage: '' },
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
