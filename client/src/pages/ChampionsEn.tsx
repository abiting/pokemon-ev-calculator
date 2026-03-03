import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { NATURES, type Nature } from '@/data/natures';
import { fetchPokemon } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PokemonCard from '@/components/PokemonCard';
import PokemonSearch from '@/components/PokemonSearch';

const MAX_TOTAL_SP = 66;
const MAX_SINGLE_SP = 32;
const DEFAULT_IV = 31;
const LEVEL = 50;

// Pokémon Champions Stat Calculation Formula
// Base = floor(((2 * Base + IV) * Level) / 100) + Level + 10 (HP)
// Base = floor(((2 * Base + IV) * Level) / 100) + 5 (Others)
// Final = (Base + SP) * Nature Modifier

interface SPDistribution {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

const STAT_NAMES_EN: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export default function ChampionsEn() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sps, setSps] = useState<SPDistribution>({
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0,
  });
  const [selectedNature, setSelectedNature] = useState<Nature>(NATURES[0]);

  useEffect(() => {
    document.title = 'Champions Stat Calculator';
  }, []);

  const totalSP = Object.values(sps).reduce((a, b) => a + b, 0);
  const remainingSP = MAX_TOTAL_SP - totalSP;

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const data = await fetchPokemon(query);
      setPokemon(data);
      toast.success(`Loaded ${data.name} successfully!`);
      handleReset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Search failed, please try again later');
      setPokemon(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSPChange = (stat: keyof SPDistribution, value: number) => {
    // Check if exceeds single stat limit
    if (value > MAX_SINGLE_SP) return;
    
    // Check if exceeds total limit (if increasing)
    const diff = value - sps[stat];
    if (diff > 0 && totalSP + diff > MAX_TOTAL_SP) return;

    setSps((prev) => ({
      ...prev,
      [stat]: value,
    }));
  };

  const handleReset = () => {
    setSps({
      hp: 0,
      attack: 0,
      defense: 0,
      'special-attack': 0,
      'special-defense': 0,
      speed: 0,
    });
    setSelectedNature(NATURES[0]);
  };

  const getBaseStat = (statName: string): number => {
    if (!pokemon) return 0;
    const statData = pokemon.stats.find((s) => s.stat.name === statName);
    return statData?.base_stat || 0;
  };

  const calculateChampionStat = (statName: keyof SPDistribution): number => {
    if (!pokemon) return 0;
    
    const base = getBaseStat(statName);
    const sp = sps[statName];
    
    // Shedinja special case
    if (pokemon.id === 292 && statName === 'hp') return 1;

    // 1. Calculate Base Value (Lv.50, IV=31, EV=0)
    let val = 0;
    if (statName === 'hp') {
      val = Math.floor(((2 * base + DEFAULT_IV) * LEVEL) / 100) + LEVEL + 10;
    } else {
      val = Math.floor(((2 * base + DEFAULT_IV) * LEVEL) / 100) + 5;
    }

    // 2. Add SP
    val += sp;

    // 3. Nature Modifier (does not affect HP)
    if (statName !== 'hp') {
      if (selectedNature.increased === statName) {
        val = Math.floor(val * 1.1);
      } else if (selectedNature.decreased === statName) {
        val = Math.floor(val * 0.9);
      }
    }

    return val;
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-50">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Champions Stat Calculator
          </h1>
          <p className="text-slate-600">
            66 SP Allocation Tool designed for Pokémon Champions
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <PokemonSearch 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            placeholder="Enter Pokémon name or ID (e.g., Pikachu or 25)" 
            buttonText="Search" 
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-600"></div>
            <p className="text-slate-600 mt-4">Loading...</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && pokemon && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <PokemonCard pokemon={pokemon} showEVYield={false} language="en" />
            </div>
            
            {/* Calculator */}
            <div>
              <Card className="bg-white shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-center">Stat Points (SP) Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Nature Selection */}
                    <div className="space-y-2">
                      <label className="font-semibold text-sm text-slate-700">Nature</label>
                      <Select
                        value={selectedNature.name}
                        onValueChange={(value) => {
                          const nature = NATURES.find((n) => n.name === value);
                          if (nature) setSelectedNature(nature);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {NATURES.map((nature) => (
                            <SelectItem key={nature.name} value={nature.name}>
                              {nature.name}
                              {nature.increased && nature.decreased && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (↑{STAT_NAMES_EN[nature.increased]} ↓{STAT_NAMES_EN[nature.decreased]})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Total SP */}
                    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-slate-700">Total SP</span>
                        <span className={`text-xl font-bold ${totalSP > MAX_TOTAL_SP ? 'text-red-600' : 'text-blue-600'}`}>
                          {totalSP} / {MAX_TOTAL_SP}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            totalSP > MAX_TOTAL_SP ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min((totalSP / MAX_TOTAL_SP) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-slate-500">Remaining: {Math.max(0, remainingSP)}</span>
                        <span className="text-slate-500">Max per stat: {MAX_SINGLE_SP}</span>
                      </div>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-6">
                      {(Object.keys(sps) as Array<keyof SPDistribution>).map((stat) => (
                        <div key={stat} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="font-medium text-sm w-16 md:w-24">{STAT_NAMES_EN[stat]}</label>
                            <div className="flex-1 mx-2 md:mx-4 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => handleSPChange(stat, Math.max(0, sps[stat] - 1))}
                                disabled={sps[stat] <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Slider
                                value={[sps[stat]]}
                                max={MAX_SINGLE_SP}
                                step={1}
                                onValueChange={(vals) => handleSPChange(stat, vals[0])}
                                className="py-2 flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => handleSPChange(stat, Math.min(MAX_SINGLE_SP, sps[stat] + 1))}
                                disabled={sps[stat] >= MAX_SINGLE_SP || (remainingSP <= 0 && sps[stat] < MAX_SINGLE_SP)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="w-8 md:w-12 text-right font-mono text-sm">
                              {sps[stat]}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded text-sm">
                            <span className="text-slate-500 text-xs">Base: {getBaseStat(stat)}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-xs">Stat:</span>
                              <span className="font-bold text-slate-800 text-base">
                                {calculateChampionStat(stat)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reset Button */}
                    <Button onClick={handleReset} variant="outline" className="w-full mt-4">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Allocation
                    </Button>

                    {/* Instructions */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm mt-4">
                      <p className="font-semibold mb-1 text-yellow-800">💡 SP Calculation Guide</p>
                      <ul className="space-y-1 text-yellow-800/80">
                        <li>• Total 66 Stat Points (SP) available for allocation</li>
                        <li>• Max 32 SP per stat</li>
                        <li>• Default IV is 31</li>
                        <li>• Level fixed at Lv.50</li>
                        <li>• 1 SP = 1 Actual Stat Point</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!isLoading && !pokemon && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 max-w-2xl mx-auto border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Welcome to Champions Stat Calculator!</h2>
              <div className="text-left bg-slate-50 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2 text-slate-700">Examples:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• Enter "Pikachu"</li>
                  <li>• Enter ID "25"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Source: <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">PokéAPI</a></p>
          <p className="mt-2">Copyright © <a href="https://scrabby.abiting.cc" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">Scrabby</a></p>
        </footer>
      </div>
    </div>
  );
}
