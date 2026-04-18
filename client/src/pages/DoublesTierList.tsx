import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// List of top 61 Pokemon in Double Battles based on user provided image
// Using their PokeAPI names to fetch sprites
const TOP_POKEMON = [
  { rank: 1, name: 'sneasler', usage: '53.5%' },
  { rank: 2, name: 'incineroar', usage: '42.1%' },
  { rank: 3, name: 'garchomp', usage: '37.1%' },
  { rank: 4, name: 'kingambit', usage: '34.6%' },
  { rank: 5, name: 'sinistcha', usage: '24.4%' },
  { rank: 6, name: 'basculegion-male', usage: '23.0%' },
  { rank: 7, name: 'charizard', usage: '20.9%' },
  { rank: 8, name: 'aerodactyl', usage: '20.9%' },
  { rank: 9, name: 'whimsicott', usage: '18.7%' },
  { rank: 10, name: 'rotom-wash', usage: '17.5%' },
  { rank: 11, name: 'floette-eternal', usage: '16.3%' },
  { rank: 12, name: 'pelipper', usage: '16.1%' },
  { rank: 13, name: 'tyranitar', usage: '13.2%' },
  { rank: 14, name: 'archaludon', usage: '13.1%' },
  { rank: 15, name: 'farigiraf', usage: '13.0%' },
  { rank: 16, name: 'milotic', usage: '11.3%' },
  { rank: 17, name: 'dragonite', usage: '10.9%' },
  { rank: 18, name: 'venusaur', usage: '10.0%' },
  { rank: 19, name: 'froslass', usage: '9.6%' },
  { rank: 20, name: 'talonflame', usage: '9.5%' },
  { rank: 21, name: 'corviknight', usage: '9.5%' },
  { rank: 22, name: 'gengar', usage: '9.1%' },
  { rank: 23, name: 'delphox', usage: '6.8%' },
  { rank: 24, name: 'meganium', usage: '6.5%' },
  { rank: 25, name: 'maushold-family-of-four', usage: '6.4%' },
  { rank: 26, name: 'excadrill', usage: '6.0%' },
  { rank: 27, name: 'gardevoir', usage: '6.0%' },
  { rank: 28, name: 'aegislash-shield', usage: '5.8%' },
  { rank: 29, name: 'torkoal', usage: '5.2%' },
  { rank: 30, name: 'primarina', usage: '5.1%' },
  { rank: 31, name: 'sylveon', usage: '4.6%' },
  { rank: 32, name: 'blastoise', usage: '4.4%' },
  { rank: 33, name: 'scizor', usage: '4.2%' },
  { rank: 34, name: 'kommoo', usage: '4.1%' },
  { rank: 35, name: 'glimmora', usage: '4.1%' },
  { rank: 36, name: 'dragapult', usage: '3.9%' },
  { rank: 37, name: 'kangaskhan', usage: '3.7%' },
  { rank: 38, name: 'politoed', usage: '3.6%' },
  { rank: 39, name: 'gyarados', usage: '3.4%' },
  { rank: 40, name: 'sableye', usage: '3.0%' },
  { rank: 41, name: 'ninetales-alola', usage: '2.8%' },
  { rank: 42, name: 'typhlosion-hisui', usage: '2.6%' },
  { rank: 43, name: 'clefable', usage: '2.4%' },
  { rank: 44, name: 'golurk', usage: '2.4%' },
  { rank: 45, name: 'starmie', usage: '2.4%' },
  { rank: 46, name: 'arcanine-hisui', usage: '2.4%' },
  { rank: 47, name: 'rotom-heat', usage: '2.4%' },
  { rank: 48, name: 'hydreigon', usage: '2.3%' },
  { rank: 49, name: 'zoroark-hisui', usage: '2.2%' },
  { rank: 50, name: 'palafin', usage: '2.0%' },
  { rank: 51, name: 'drampa', usage: '2.0%' },
  { rank: 52, name: 'volcarona', usage: '1.7%' },
  { rank: 53, name: 'crabominable', usage: '1.7%' },
  { rank: 54, name: 'meowscarada', usage: '1.7%' },
  { rank: 55, name: 'aggron', usage: '1.7%' },
  { rank: 56, name: 'lucario', usage: '1.7%' },
  { rank: 57, name: 'hatterene', usage: '1.6%' },
  { rank: 58, name: 'orthworm', usage: '1.5%' },
  { rank: 59, name: 'oranguru', usage: '1.5%' },
  { rank: 60, name: 'mimikyu-disguised', usage: '1.5%' },
  { rank: 61, name: 'gallade', usage: '1.5%' },
  { rank: 62, name: 'rotom-frost', usage: '1.5%' },
  { rank: 63, name: 'scovillain', usage: '1.5%' },
  { rank: 64, name: 'basculegion-female', usage: '1.5%' },
  { rank: 65, name: 'mamoswine', usage: '1.5%' },
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
