import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPokemon } from '@/lib/pokeapi';
import type { Pokemon, PokemonMove, PokemonHeldItem } from '@/types/pokemon';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PokemonCard from '@/components/PokemonCard';
import PokemonSearch from '@/components/PokemonSearch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchCandidate {
  name: string;
  id: number;
}

const TARGET_VERSIONS = ['sword-shield', 'scarlet-violet'];

const VERSION_NAMES: Record<string, string> = {
  'sword-shield': 'Champions',
  'scarlet-violet': 'Scarlet & Violet'
};

const LEARN_METHODS: Record<string, string> = {
  'level-up': 'Level-Up',
  'machine': 'TM',
  'tutor': 'Tutor',
  'egg': 'Egg'
};

export default function MovesEn() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState<SearchCandidate[]>([]);
  const [showCandidates, setShowCandidates] = useState(false);
  const [varieties, setVarieties] = useState<any[]>([]);
  const [showVarieties, setShowVarieties] = useState(false);

  useEffect(() => {
    document.title = 'Moves & Items - Pokémon Calculator';
  }, []);

  const handleSearch = async (query: string, isVarietySelection = false) => {
    setIsLoading(true);
    setCandidates([]);
    setShowCandidates(false);
    setShowVarieties(false);
    if (!isVarietySelection) {
       setVarieties([]);
    }

    try {
      const data = await fetchPokemon(query);
      
      if (!isVarietySelection && data.varieties && data.varieties.length > 1) {
         setVarieties(data.varieties);
         setShowVarieties(true);
      }

      setPokemon(data);
      toast.success(`Loaded ${data.enName || data.name} successfully!`);
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

  const formatName = (name: string) => {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getFilteredMoves = (moves: PokemonMove[] | undefined, versionGroup: string) => {
    if (!moves) return [];
    
    const filtered = moves.map(m => {
      const versionDetails = m.version_group_details.filter(v => v.version_group.name === versionGroup);
      if (versionDetails.length === 0) return null;
      
      return {
        name: formatName(m.move.name),
        details: versionDetails[0]
      };
    }).filter(Boolean) as Array<{name: string, details: any}>;

    // Sort by learn method, then by level
    return filtered.sort((a, b) => {
      if (a.details.move_learn_method.name === 'level-up' && b.details.move_learn_method.name === 'level-up') {
        return a.details.level_learned_at - b.details.level_learned_at;
      }
      if (a.details.move_learn_method.name === 'level-up') return -1;
      if (b.details.move_learn_method.name === 'level-up') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const getLatestItems = (items: PokemonHeldItem[] | undefined) => {
    if (!items || items.length === 0) return [];
    
    return items.map(item => {
      // Get the latest version details (usually the last one in the array)
      const latestDetail = item.version_details[item.version_details.length - 1];
      return {
        name: formatName(item.item.name),
        rarity: latestDetail.rarity,
        version: formatName(latestDetail.version.name)
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-10 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => window.location.href = '/'}>
            Pokémon Moves & Items
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Search for a Pokémon to see its learnable moves in recent generations and possible held items in the wild.
          </p>
        </header>

        <div className="mb-10 max-w-xl mx-auto">
          <PokemonSearch onSearch={(q) => handleSearch(q, false)} isLoading={isLoading} placeholder="Enter Pokémon name or ID" />
        </div>

        {pokemon && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              <PokemonCard pokemon={pokemon} showEVYield={false} language="en" />
            </div>

            <div className="lg:col-span-8">
              <Card className="border-slate-200 shadow-sm overflow-hidden bg-white/80 backdrop-blur h-full">
                <CardHeader className="bg-slate-100/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    List of Moves
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="scarlet-violet" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-auto p-1 bg-slate-100">
                      {TARGET_VERSIONS.map(version => (
                        <TabsTrigger 
                          key={version} 
                          value={version}
                          className="py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                        >
                          {VERSION_NAMES[version]}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {TARGET_VERSIONS.map(version => {
                      const moves = getFilteredMoves(pokemon.moves, version);
                      
                      // Group moves by method
                      const groupedMoves = moves.reduce((acc, move) => {
                        const method = move.details.move_learn_method.name;
                        if (!acc[method]) acc[method] = [];
                        acc[method].push(move);
                        return acc;
                      }, {} as Record<string, typeof moves>);

                      const methodOrder = ['level-up', 'machine', 'egg', 'tutor'];
                      const sortedMethods = Object.keys(groupedMoves).sort((a, b) => {
                        const indexA = methodOrder.indexOf(a);
                        const indexB = methodOrder.indexOf(b);
                        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;
                        return indexA - indexB;
                      });

                      return (
                        <TabsContent key={version} value={version} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                          {moves.length > 0 ? (
                            <div className="space-y-8">
                              {sortedMethods.map(method => (
                                <div key={method} className="space-y-3">
                                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                                    {LEARN_METHODS[method] || formatName(method)} Moves
                                  </h3>
                                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full text-sm text-left">
                                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                          <th className="px-4 py-3 font-semibold w-2/3">Move</th>
                                          <th className="px-4 py-3 font-semibold w-1/3">Level</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {groupedMoves[method].map((move, idx) => (
                                          <tr key={idx} className="bg-white hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-800">{move.name}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                              {move.details.move_learn_method.name === 'level-up' ? (
                                                <span className="font-semibold text-blue-600">Lv.{move.details.level_learned_at}</span>
                                              ) : (
                                                <span className="text-slate-400">-</span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                              <p className="text-slate-500">No moves found for this version.</p>
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Candidates Dialog */}
        <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Multiple Pokémon Found</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              {candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handleSearch(candidate.id.toString(), false)}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                >
                  <span className="font-medium text-slate-800">{candidate.name}</span>
                  <span className="text-sm text-slate-500">#{candidate.id.toString().padStart(4, '0')}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Varieties Dialog */}
        <Dialog open={showVarieties} onOpenChange={setShowVarieties}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Form</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {varieties.map((variety) => {
                const id = variety.pokemon.url.split('/').filter(Boolean).pop();
                return (
                  <button
                    key={id}
                    onClick={() => handleSearch(id, true)}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                  >
                    <span className="font-medium text-slate-800">
                      {variety.pokemon.displayName === 'default-form-placeholder' || variety.pokemon.name === 'default-form-placeholder'
                        ? 'Default Form' 
                        : (variety.pokemon.displayName || formatName(variety.pokemon.name))}
                    </span>
                    {variety.is_default && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">Default</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        <footer className="mt-16 text-center text-slate-500 text-sm pb-8">
          <p>Data provided by PokéAPI</p>
        </footer>
      </div>
    </div>
  );
}
