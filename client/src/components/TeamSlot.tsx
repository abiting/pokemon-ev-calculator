import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { searchPokemon, fetchPokemon, getHighQualitySprite, fetchPokemonVarieties, type SearchResult } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { TYPE_COLORS, TYPE_NAMES } from '@/types/pokemon';
import { Combobox } from '@/components/ui/combobox';
import itemsData from '@/data/items.json';

const itemOptions = itemsData.map(item => ({
  value: item,
  label: item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}));

interface TeamSlotProps {
  slotIndex: number;
}

export default function TeamSlot({ slotIndex }: TeamSlotProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [varieties, setVarieties] = useState<SearchResult[]>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  
  // Customization state
  const [ability, setAbility] = useState('');
  const [item, setItem] = useState('');
  const [moves, setMoves] = useState<string[]>(['', '', '', '']);
  const [evs, setEvs] = useState({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchPokemon(searchQuery);
      if (results.length > 0) {
        const data = await fetchPokemon(results[0].name);
        setPokemon(data);
        setAbility('');
        setMoves(['', '', '', '']);
        
        if (data.species && data.species.url) {
          const vars = await fetchPokemonVarieties(data.species.url);
          setVarieties(vars);
        } else {
          setVarieties([]);
        }
      }
    } catch (error) {
      console.error('Failed to search pokemon:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormChange = async (formName: string) => {
    if (!formName || formName === pokemon?.name) return;
    
    setIsLoadingForm(true);
    try {
      const data = await fetchPokemon(formName);
      setPokemon(data);
      setAbility('');
      setMoves(['', '', '', '']);
    } catch (error) {
      console.error('Failed to fetch form:', error);
    } finally {
      setIsLoadingForm(false);
    }
  };

  const clearSlot = () => {
    setPokemon(null);
    setSearchQuery('');
    setAbility('');
    setItem('');
    setMoves(['', '', '', '']);
    setEvs({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
    setVarieties([]);
  };

  if (!pokemon) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-dashed border-cyan-300 shadow-lg h-[500px] flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col justify-center items-center">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 border-2 border-dashed border-slate-300">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <form onSubmit={handleSearch} className="w-full max-w-[240px]">
            <div className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-slate-300 text-slate-900 text-center"
              />
              <Button 
                type="submit" 
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? 'Searching...' : 'Add to Team'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  const spriteUrl = getHighQualitySprite(pokemon);
  
  const formattedId = (() => {
    if (pokemon.id > 10000 && pokemon.species && pokemon.species.url) {
      const parts = pokemon.species.url.split('/');
      const speciesId = parts[parts.length - 2];
      return speciesId.padStart(4, '0');
    }
    return pokemon.id.toString().padStart(4, '0');
  })();

  const displayName = pokemon.enName || pokemon.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50/90 backdrop-blur-sm border-2 border-dashed border-cyan-300 shadow-lg relative flex flex-col h-full">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-red-50 z-10"
        onClick={clearSlot}
      >
        <X className="w-5 h-5" />
      </Button>
      
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xl font-bold text-center text-slate-800">
          #{formattedId} {displayName}
        </CardTitle>
        {varieties.length > 1 && (
          <div className="mt-2">
            <select
              className="w-full bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
              value={pokemon.name}
              onChange={(e) => handleFormChange(e.target.value)}
              disabled={isLoadingForm}
            >
              {varieties.map(v => (
                <option key={v.apiName || v.name} value={v.apiName || v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="relative w-36 h-36 flex-shrink-0 flex flex-col items-center">
            <img src={spriteUrl} alt={pokemon.name} className="w-full h-full object-contain drop-shadow-md" />
            
            {/* Item Input & Icon */}
            <div className="absolute -bottom-4 w-full px-1 z-20">
              <div className="relative flex items-center justify-center">
                {item && (
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.toLowerCase().replace(/\s+/g, '-')}.png`}
                    alt={item}
                    className="absolute -left-2 w-6 h-6 z-10 drop-shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                  />
                )}
                <div className="pl-6 w-[110%] -ml-[5%]">
                  <Combobox
                    options={itemOptions}
                    value={item}
                    onChange={setItem}
                    placeholder="Item..."
                    emptyText="No item found."
                    className="h-7 text-xs bg-white border-slate-300 text-slate-800 shadow-sm w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex flex-wrap gap-1 justify-end">
              {pokemon.types.map((t) => (
                <span 
                  key={t.type.name} 
                  className={`px-2 py-0.5 rounded-full text-white text-[10px] font-medium ${TYPE_COLORS[t.type.name] || 'bg-gray-400'}`}
                >
                  {t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)}
                </span>
              ))}
            </div>

            {/* Ability */}
            <div className="bg-purple-50 p-1.5 rounded-lg border border-purple-100">
              <select 
                className="w-full bg-transparent text-xs text-purple-900 font-medium focus:outline-none cursor-pointer"
                value={ability}
                onChange={(e) => setAbility(e.target.value)}
              >
                <option value="">Select Ability...</option>
                {pokemon.abilities.map((a) => (
                  <option key={a.ability.name} value={a.ability.name}>
                    {a.ability.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    {a.is_hidden ? ' (Hidden)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4 flex-1 flex flex-col justify-end">
          {/* Moves */}
          <div className="grid grid-cols-1 gap-2">
            {[0, 1, 2, 3].map((moveIndex) => (
              <div key={moveIndex} className="bg-slate-50 border border-slate-200 rounded-md p-1.5 shadow-sm">
                <Combobox
                  options={(pokemon.moves || [])
                    .map(m => m.move.name)
                    .sort()
                    .map(moveName => ({
                      value: moveName,
                      label: moveName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                    }))
                  }
                  value={moves[moveIndex]}
                  onChange={(val) => {
                    const newMoves = [...moves];
                    newMoves[moveIndex] = val;
                    setMoves(newMoves);
                  }}
                  placeholder="- Select Move -"
                  emptyText="No move found."
                  className="w-full h-8 bg-transparent text-sm text-slate-700 border-none shadow-none justify-between px-2"
                />
              </div>
            ))}
          </div>

          {/* EVs */}
          <div className="grid grid-cols-6 gap-1 bg-slate-100 p-2 rounded-lg border border-slate-200">
            {[
              { key: 'hp', label: 'HP' },
              { key: 'atk', label: 'Atk' },
              { key: 'def', label: 'Def' },
              { key: 'spa', label: 'SpA' },
              { key: 'spd', label: 'SpD' },
              { key: 'spe', label: 'Spe' }
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 mb-1">{label}</span>
                <input
                  type="number"
                  min="0"
                  max="252"
                  step="4"
                  value={evs[key as keyof typeof evs]}
                  onChange={(e) => setEvs({ ...evs, [key]: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 text-center text-xs py-1 text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
