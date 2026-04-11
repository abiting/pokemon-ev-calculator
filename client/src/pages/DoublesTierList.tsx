import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// List of top 61 Pokemon in Double Battles based on user provided image
// Using their PokeAPI names to fetch sprites
const TOP_POKEMON = [
  { rank: 1, name: 'incineroar', usage: '48.2%' },
  { rank: 2, name: 'sneasler', usage: '36.2%' },
  { rank: 3, name: 'sinistcha', usage: '35.0%' },
  { rank: 4, name: 'garchomp', usage: '34.0%' },
  { rank: 5, name: 'whimsicott', usage: '23.0%' },
  { rank: 6, name: 'kingambit', usage: '22.0%' },
  { rank: 7, name: 'tyranitar', usage: '16.7%' },
  { rank: 8, name: 'charizard', usage: '16.7%' },
  { rank: 9, name: 'basculegion-male', usage: '15.9%' },
  { rank: 10, name: 'pelipper', usage: '15.5%' },
  { rank: 11, name: 'rotom-wash', usage: '15.5%' },
  { rank: 12, name: 'farigiraf', usage: '14.7%' },
  { rank: 13, name: 'archaludon', usage: '13.1%' },
  { rank: 14, name: 'iron-valiant', usage: '11.7%' },
  { rank: 15, name: 'dragonite', usage: '11.6%' },
  { rank: 16, name: 'venusaur', usage: '10.4%' },
  { rank: 17, name: 'gengar', usage: '10.3%' },
  { rank: 18, name: 'milotic', usage: '9.8%' },
  { rank: 19, name: 'maushold-family-of-four', usage: '9.6%' },
  { rank: 20, name: 'excadrill', usage: '9.2%' },
  { rank: 21, name: 'talonflame', usage: '8.9%' },
  { rank: 22, name: 'gardevoir', usage: '7.9%' },
  { rank: 23, name: 'corviknight', usage: '7.8%' },
  { rank: 24, name: 'froslass', usage: '7.5%' },
  { rank: 25, name: 'torkoal', usage: '7.2%' },
  { rank: 26, name: 'primarina', usage: '7.2%' },
  { rank: 27, name: 'gyarados', usage: '6.5%' },
  { rank: 28, name: 'politoed', usage: '5.6%' },
  { rank: 29, name: 'dragapult', usage: '5.3%' },
  { rank: 30, name: 'clefairy', usage: '5.3%' },
  { rank: 31, name: 'aegislash-shield', usage: '4.8%' },
  { rank: 32, name: 'infernape', usage: '4.8%' },
  { rank: 33, name: 'aerodactyl', usage: '4.5%' },
  { rank: 34, name: 'glimmora', usage: '4.3%' },
  { rank: 35, name: 'ninetales-alola', usage: '4.3%' },
  { rank: 36, name: 'kommo-o', usage: '4.3%' },
  { rank: 37, name: 'palafin', usage: '3.9%' },
  { rank: 38, name: 'arcanine-hisui', usage: '3.8%' },
  { rank: 39, name: 'meganium', usage: '3.7%' },
  { rank: 40, name: 'sableye', usage: '3.3%' },
  { rank: 41, name: 'hawlucha', usage: '2.9%' },
  { rank: 42, name: 'golurk', usage: '2.9%' },
  { rank: 43, name: 'volcarona', usage: '2.8%' },
  { rank: 44, name: 'kangaskhan', usage: '2.6%' },
  { rank: 45, name: 'starmie', usage: '2.6%' },
  { rank: 46, name: 'rotom-heat', usage: '2.6%' },
  { rank: 47, name: 'hydreigon', usage: '2.6%' },
  { rank: 48, name: 'sylveon', usage: '2.5%' },
  { rank: 49, name: 'raichu', usage: '2.5%' },
  { rank: 50, name: 'lucario', usage: '2.3%' },
  { rank: 51, name: 'ninetales', usage: '2.3%' },
  { rank: 52, name: 'typhlosion', usage: '2.3%' },
  { rank: 53, name: 'scizor', usage: '2.2%' },
  { rank: 54, name: 'meowscarada', usage: '2.2%' },
  { rank: 55, name: 'oranguru', usage: '2.2%' },
  { rank: 56, name: 'gastrodon', usage: '2.2%' },
  { rank: 57, name: 'gallade', usage: '1.9%' },
  { rank: 58, name: 'mimikyu-disguised', usage: '1.9%' },
  { rank: 59, name: 'zoroark-hisui', usage: '1.8%' },
  { rank: 60, name: 'floette-eternal', usage: '1.8%' },
  { rank: 61, name: 'amoonguss', usage: '1.6%' },
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
