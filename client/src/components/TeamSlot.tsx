import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Download, Loader2 } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import { searchPokemon, fetchPokemon, getHighQualitySprite, fetchPokemonVarieties, type SearchResult } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { TYPE_COLORS } from '@/types/pokemon';
import { Combobox } from '@/components/ui/combobox';
import itemsData from '@/data/items.json';
import movesData from '@/data/moves.json';

const itemOptions = itemsData.map(item => ({
  value: item,
  label: item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}));

const moveOptions = movesData.map(move => ({
  value: move,
  label: move.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
})).sort((a, b) => a.label.localeCompare(b.label));

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
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || !pokemon) return;
    
    try {
      setIsDownloading(true);
      setIsCapturing(true);
      
      // Wait a bit to ensure any pending renders are complete and buttons are hidden
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const dataUrl = await domToPng(cardRef.current, {
        backgroundColor: '#ffffff', // Solid background for the individual card
        scale: 2, // Higher quality
      });
      
      const link = document.createElement('a');
      link.download = `${pokemon.name}-build.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download slot image:', error);
      alert('下載圖片失敗，請稍後再試。');
    } finally {
      setIsCapturing(false);
      setIsDownloading(false);
    }
  };

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
    if (!formName || formName === pokemon?.apiName || formName === pokemon?.name) return;
    
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
      <Card className="bg-white/40 backdrop-blur-md border-2 border-dashed border-purple-300 shadow-lg h-[500px] flex flex-col hover:bg-white/50 transition-colors">
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
                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md"
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
    <div ref={cardRef} className="h-full">
      <Card className="bg-gradient-to-br from-white/95 to-purple-50/90 backdrop-blur-md border-2 border-purple-200 shadow-xl relative flex flex-col h-full">
        {!isCapturing && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <Button 
            variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
          onClick={handleDownload}
          disabled={isDownloading}
          title="下載單隻寶可夢圖片"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
          onClick={clearSlot}
          title="清空欄位"
        >
          <X className="w-5 h-5" />
          </Button>
        </div>
        )}
      
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between pr-8 gap-2">
            <CardTitle className="text-xl font-bold text-slate-800 leading-tight">
              #{formattedId} {displayName}
            </CardTitle>
            <div className="flex flex-wrap gap-1 justify-end shrink-0 mt-0.5">
              {pokemon.types.map((t) => (
                <span 
                  key={t.type.name} 
                  className={`px-2 py-0.5 rounded-full text-white text-[10px] font-medium ${TYPE_COLORS[t.type.name] || 'bg-gray-400'}`}
                >
                  {t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)}
                </span>
              ))}
            </div>
          </div>
          
          {varieties.length > 1 && (
            <select
              className="w-full bg-white/80 border border-purple-200 text-purple-900 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
              value={pokemon.apiName || pokemon.name}
              onChange={(e) => handleFormChange(e.target.value)}
              disabled={isLoadingForm}
            >
              {varieties.map(v => (
                <option key={v.apiName || v.name} value={v.apiName || v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col gap-4">
        {/* Middle Section: Image and Settings */}
        <div className="flex gap-4 items-center">
          {/* Left: Image */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0 flex items-center justify-center bg-white/50 rounded-xl border border-purple-100 shadow-inner p-1">
            <img src={spriteUrl} alt={pokemon.name} className="w-full h-full object-contain drop-shadow-md scale-105" crossOrigin="anonymous" />
          </div>

          {/* Right: Item and Ability */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Item</label>
              <Combobox
                options={itemOptions}
                value={item}
                onChange={setItem}
                placeholder="Select Item..."
                emptyText="No item found."
                className="h-9 text-sm bg-white border-slate-200 text-slate-800 shadow-sm w-full px-3"
                icon={item ? (
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.toLowerCase().replace(/\s+/g, '-')}.png`}
                    alt={item}
                    className="w-5 h-5 drop-shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                  />
                ) : undefined}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Ability</label>
              <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                <select 
                  className="w-full h-9 bg-transparent text-sm text-slate-800 font-medium focus:outline-none cursor-pointer px-3"
                  value={ability}
                  onChange={(e) => setAbility(e.target.value)}
                >
                  <option value="">Select Ability...</option>
                  {pokemon.abilities.map((a) => (
                    <option key={a.ability.name} value={a.ability.name}>
                      {a.ability.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Moves and EVs */}
        <div className="mt-auto pt-4 space-y-3">
          {/* Moves */}
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((moveIndex) => (
                <div key={moveIndex} className="bg-white border border-slate-200 rounded-md shadow-sm">
                  <Combobox
                    options={moveOptions}
                    value={moves[moveIndex]}
                    onChange={(val) => {
                      const newMoves = [...moves];
                      newMoves[moveIndex] = val;
                      setMoves(newMoves);
                    }}
                    placeholder={`Move ${moveIndex + 1}`}
                    emptyText="No move found."
                    className="w-full h-8 bg-transparent text-sm text-slate-700 border-none shadow-none justify-between px-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* EVs */}
          <div className="bg-slate-100/80 p-2 rounded-xl border border-slate-200">
            <div className="grid grid-cols-6 gap-1">
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
                    className="w-full bg-white border border-slate-300 text-center text-xs py-1 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded shadow-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}
