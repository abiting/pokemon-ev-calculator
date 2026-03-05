import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { NATURES, type Nature } from '@/data/natures';
import { fetchPokemon, formatPokemonName } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PokemonCard from '@/components/PokemonCard';
import PokemonSearch from '@/components/PokemonSearch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MAX_TOTAL_SP = 66;
const MAX_SINGLE_SP = 32;
const DEFAULT_IV = 31;
const LEVEL = 50;

type StatName = "hp" | "attack" | "defense" | "special-attack" | "special-defense" | "speed";

const STAT_LABELS: Record<StatName, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

interface SPDistribution {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

interface SearchCandidate {
  name: string;
  id: number;
}

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
  const [candidates, setCandidates] = useState<SearchCandidate[]>([]);
  const [showCandidates, setShowCandidates] = useState(false);
  const [varieties, setVarieties] = useState<any[]>([]);
  const [showVarieties, setShowVarieties] = useState(false);

  useEffect(() => {
    document.title = 'Stat Points Calculator - Pokémon Champions';
  }, []);

  const totalSP = Object.values(sps).reduce((a, b) => a + b, 0);
  const remainingSP = MAX_TOTAL_SP - totalSP;

  const handleSearch = async (query: string, isVarietySelection = false) => {
    setIsLoading(true);
    setCandidates([]);
    setShowCandidates(false);
    if (!isVarietySelection) {
       setVarieties([]);
       setShowVarieties(false);
    }

      try {
      const data = await fetchPokemon(query);
      
      // Check for varieties if it's a base form and not already selecting a variety
      if (!isVarietySelection && data.varieties && data.varieties.length > 1) {
         setVarieties(data.varieties);
         setShowVarieties(true);
      }

      setPokemon(data);
      toast.success(`Loaded ${data.enName || data.name} successfully!`);
      handleReset();
    } catch (error: any) {
      if (error.isAmbiguous) {
        setCandidates(error.candidates);
        setShowCandidates(true);
        toast.info('Multiple results found, please select one');
      } else {
        toast.error('Pokemon not found. Please try again.');
        setPokemon(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectCandidate = (candidateName: string) => {
    setShowCandidates(false);
    handleSearch(candidateName);
  };

  const selectVariety = async (url: string) => {
     const id = url.split('/').filter(Boolean).pop();
     if (id) {
        setShowVarieties(false);
        await handleSearch(id, true);
     }
  };

  const handleSPChange = (stat: keyof SPDistribution, value: number) => {
    // Check single stat limit
    if (value > MAX_SINGLE_SP) return;
    
    // Check total limit (if increasing)
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

    // 1. Calculate base value (Lv.50, IV=31, EV=0)
    let val = 0;
    if (statName === 'hp') {
      val = Math.floor(((2 * base + DEFAULT_IV) * LEVEL) / 100) + LEVEL + 10;
    } else {
      val = Math.floor(((2 * base + DEFAULT_IV) * LEVEL) / 100) + 5;
    }

    // 2. Add SP
    val += sp;

    // 3. Nature modifier (not affecting HP)
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
            Stat Points Calculator
          </h1>
          <p className="text-slate-600">
            Free 66-Point SP Allocation Tool Designed for Pokémon Champions
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <PokemonSearch onSearch={handleSearch} isLoading={isLoading} placeholder="Enter Pokemon name or ID (e.g., Pikachu or 25)" buttonText="Search" />
        </div>

        {/* Multiple Results Dialog */}
        <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Pokemon</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              {candidates.map((candidate) => (
                <Button 
                  key={candidate.name} 
                  variant="outline" 
                  className="justify-start text-left h-auto py-3"
                  onClick={() => selectCandidate(candidate.name)}
                >
                  {candidate.id > 0 && <span className="font-bold mr-2">#{candidate.id}</span>}
                  {candidate.id === 0 ? `Search directly for "${candidate.name}"` : candidate.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Variety Selection Dialog */}
        <Dialog open={showVarieties} onOpenChange={setShowVarieties}>
           <DialogContent className="sm:max-w-md">
              <DialogHeader>
                 <DialogTitle>Varieties Found</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4 max-h-[60vh] overflow-y-auto">
                 <p className="text-sm text-muted-foreground mb-2">This Pokemon has multiple forms, please select:</p>
                 {varieties.map((v) => {
                    let displayName = v.pokemon.name;
	                    if (!v.is_default && pokemon) {
	                       const baseZhName = pokemon.zhName?.split('（')[0].replace('超級', '').replace('超極巨化', '').replace('極巨化', '') || '';
	                       const formatted = formatPokemonName(v.pokemon.name, baseZhName, pokemon.species.name);
	                       displayName = formatted.enName;
	                    } else if (v.is_default) {
	                       displayName = "Normal Form";
	                    }
	                    
	                    return (
	                    <Button
	                       key={v.pokemon.name}
	                       variant={pokemon?.name === v.pokemon.name ? "default" : "outline"}
	                       className="justify-start text-left h-auto py-3"
	                       onClick={() => {
	                          selectVariety(v.pokemon.url);
	                          setShowVarieties(false);
	                       }}
	                    >
	                       {displayName}
	                    </Button>
	                 );
	                 })}
              </div>
           </DialogContent>
        </Dialog>

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
            
            {/* Calculator Section */}
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
                          <SelectValue>
                            {selectedNature.enName}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {NATURES.map((nature) => (
                            <SelectItem key={nature.name} value={nature.name}>
                              {nature.enName}
                              {nature.increased && nature.decreased && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (+{STAT_LABELS[nature.increased as StatName]} -{STAT_LABELS[nature.decreased as StatName]})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Total Info */}
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
                        <div className="flex flex-col md:block">
                          <span className="text-slate-500">Remaining: {Math.max(0, remainingSP)}</span>
                          <span className="text-slate-500 md:hidden mt-1">Max per Stat: {MAX_SINGLE_SP}</span>
                        </div>
                        <span className="text-slate-500 hidden md:inline">Max per Stat: {MAX_SINGLE_SP}</span>
                      </div>
                    </div>

                    {/* Stat Sliders */}
                    <div className="space-y-6">
                      {(Object.keys(sps) as Array<keyof SPDistribution>).map((stat) => (
                        <div key={stat} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="font-medium text-sm w-16 md:w-24">{STAT_LABELS[stat as StatName]}</label>
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
                          
                          <div className="flex justify-end items-center bg-slate-50 px-3 py-1.5 rounded text-sm">
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
                        <li>• 1 SP = 1 actual Stat</li>
                        <li>• Total 66 SP available for allocation</li>
                        <li>• Max 32 SP per Stat</li>
                        <li>• Level fixed at Lv.50</li>
                        <li>• Default IV is 31</li>
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
              <h2 className="text-xl font-bold mb-4 text-slate-800">Welcome to Stat Points Calculator!</h2>
              <div className="text-left bg-slate-50 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2 text-slate-700">Examples:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• Enter "Pikachu" or "25"</li>
                  <li>• Enter "Charizard" or "6"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Data Source: <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">PokéAPI</a></p>
          <p className="mt-2">Copyright © <a href="https://scrabby.abiting.cc" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">Scrabby</a></p>
        </footer>
      </div>
    </div>
  );
}
