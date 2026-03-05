import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Calculator, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { fetchPokemon, searchPokemon, type SearchResult } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { toast } from "sonner";

export default function Home() {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [varieties, setVarieties] = useState<SearchResult[]>([]);
  const [showVarietyDialog, setShowVarietyDialog] = useState(false);
  const [showAmbiguousDialog, setShowAmbiguousDialog] = useState(false);
  const [ambiguousCandidates, setAmbiguousCandidates] = useState<{name: string, id: number}[]>([]);

  // EV Calculation State
  const [targetStat, setTargetStat] = useState<keyof Pokemon['stats']>('speed');
  const [targetValue, setTargetValue] = useState<number | ''>('');
  const [natureModifier, setNatureModifier] = useState<0.9 | 1.0 | 1.1>(1.0);
  const [iv, setIv] = useState<number>(31);
  const [ev, setEv] = useState<number>(0);
  const [level, setLevel] = useState<number>(50);
  const [calculationResult, setCalculationResult] = useState<number | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setPokemon(null);
    setVarieties([]);
    setShowVarietyDialog(false);
    setShowAmbiguousDialog(false);

    try {
      // 先嘗試搜尋
      const searchResults = await searchPokemon(query.trim());
      
      if (searchResults.length === 0) {
        // 如果沒有直接匹配，嘗試 fetchPokemon (它內部有模糊搜尋邏輯)
        try {
          const data = await fetchPokemon(query.trim());
          handlePokemonLoaded(data);
        } catch (err: any) {
          if (err.isAmbiguous) {
            setAmbiguousCandidates(err.candidates);
            setShowAmbiguousDialog(true);
          } else {
            setError(err.message || '找不到該寶可夢');
          }
        }
      } else if (searchResults.length === 1 && searchResults[0].id !== 0) {
        // 單一精確匹配
        const data = await fetchPokemon(searchResults[0].id);
        handlePokemonLoaded(data);
      } else {
        // 多個結果或建議，這裡簡化處理，直接 fetch 第一個或讓 fetchPokemon 處理
        try {
          const data = await fetchPokemon(query.trim());
          handlePokemonLoaded(data);
        } catch (err: any) {
           if (err.isAmbiguous) {
            setAmbiguousCandidates(err.candidates);
            setShowAmbiguousDialog(true);
          } else {
            setError(err.message || '找不到該寶可夢');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || '發生未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonLoaded = (data: Pokemon) => {
    // 檢查是否有變體
    if (data.varieties && data.varieties.length > 1) {
      setVarieties(data.varieties);
      setShowVarietyDialog(true);
      // 暫存這個寶可夢資料，等使用者選擇變體後再顯示
      // 但為了背景能顯示，我們先設定它
      setPokemon(data);
    } else {
      setPokemon(data);
      toast.success(`成功載入 ${data.name}！`);
    }
  };

  const handleSelectVariety = async (variety: SearchResult) => {
    setShowVarietyDialog(false);
    setLoading(true);
    try {
      // 使用變體的 URL 或 ID 來獲取詳細資料
      // 這裡我們需要從 URL 解析 ID，或者直接用 ID
      const data = await fetchPokemon(variety.id);
      setPokemon(data);
      toast.success(`已切換至 ${variety.zhName}`);
    } catch (err: any) {
      setError(err.message || '無法載入變體資料');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = async (candidate: {name: string, id: number}) => {
    setShowAmbiguousDialog(false);
    setLoading(true);
    try {
      const data = await fetchPokemon(candidate.id);
      handlePokemonLoaded(data);
    } catch (err: any) {
      setError(err.message || '無法載入資料');
    } finally {
      setLoading(false);
    }
  };

  // Calculation Logic
  useEffect(() => {
    if (!pokemon) return;

    const baseStat = pokemon.stats[targetStat];
    
    // Formula: ((Base * 2 + IV + (EV/4)) * Level / 100 + 5) * Nature
    // We want to find EV needed to reach Target Value
    // Target = ((Base * 2 + IV + (EV/4)) * Level / 100 + 5) * Nature
    // Target / Nature = (Base * 2 + IV + (EV/4)) * Level / 100 + 5
    // (Target / Nature - 5) * 100 / Level = Base * 2 + IV + EV/4
    // EV/4 = (Target / Nature - 5) * 100 / Level - Base * 2 - IV
    // EV = ((Target / Nature - 5) * 100 / Level - Base * 2 - IV) * 4

    if (targetValue === '') {
      setCalculationResult(null);
      return;
    }

    const t = Number(targetValue);
    
    // Reverse calculation
    // Stat = floor((floor((2 * B + I + floor(E / 4)) * L / 100) + 5) * N)
    
    // 簡單反推 (不考慮 HP 公式差異，暫時統一用非 HP 公式，HP 公式略有不同)
    // HP: ((2 * Base + IV + (EV/4)) * Level / 100) + Level + 10
    
    let neededEv = 0;
    
    if (targetStat === 'hp') {
       // HP Formula: Stat = ((2 * Base + IV + (EV/4)) * Level / 100) + Level + 10
       // Stat - Level - 10 = (2 * Base + IV + (EV/4)) * Level / 100
       // (Stat - Level - 10) * 100 / Level = 2 * Base + IV + EV/4
       // EV/4 = (Stat - Level - 10) * 100 / Level - 2 * Base - IV
       const step1 = (t - level - 10) * 100 / level;
       const step2 = step1 - 2 * baseStat - iv;
       neededEv = step2 * 4;
    } else {
       // Other Stats: Stat = (((2 * Base + IV + (EV/4)) * Level / 100) + 5) * Nature
       // Stat / Nature = ((2 * Base + IV + (EV/4)) * Level / 100) + 5
       // (Stat / Nature - 5) * 100 / Level = 2 * Base + IV + EV/4
       // EV/4 = (Stat / Nature - 5) * 100 / Level - 2 * Base - IV
       const step1 = (t / natureModifier - 5) * 100 / level;
       const step2 = step1 - 2 * baseStat - iv;
       neededEv = step2 * 4;
    }

    // 修正為 4 的倍數並無條件進位
    neededEv = Math.ceil(neededEv);
    if (neededEv < 0) neededEv = 0;
    // 確保是 4 的倍數 (因為 EV/4 才會生效)
    // 其實上面的公式算出來的是 "需要的 EV 點數"，但遊戲中是每 4 點換 1 點能力
    // 所以我們算出來的如果是小數，代表需要更多的 EV
    // 這裡直接取整數即可，但為了保險，我們可以用迴圈微調驗證
    
    // 驗證並微調
    let found = false;
    for (let e = Math.max(0, Math.floor(neededEv)); e <= 252; e++) {
       let calculatedStat = 0;
       if (targetStat === 'hp') {
          calculatedStat = Math.floor((2 * baseStat + iv + Math.floor(e / 4)) * level / 100) + level + 10;
       } else {
          calculatedStat = Math.floor((Math.floor((2 * baseStat + iv + Math.floor(e / 4)) * level / 100) + 5) * natureModifier);
       }
       
       if (calculatedStat >= t) {
         setCalculationResult(e);
         found = true;
         break;
       }
    }
    
    if (!found) {
      setCalculationResult(null); // 無法達成
    }

  }, [pokemon, targetStat, targetValue, natureModifier, iv, level]);

  // Helper to get stat name in Chinese
  const getStatName = (stat: string) => {
    const map: Record<string, string> = {
      hp: 'HP',
      attack: '攻擊',
      defense: '防禦',
      spAttack: '特攻',
      spDefense: '特防',
      speed: '速度'
    };
    return map[stat] || stat;
  };

  // Helper to get type color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      '一般': 'bg-gray-400',
      '火': 'bg-red-500',
      '水': 'bg-blue-500',
      '電': 'bg-yellow-400',
      '草': 'bg-green-500',
      '冰': 'bg-cyan-300',
      '格鬥': 'bg-red-700',
      '毒': 'bg-purple-500',
      '地面': 'bg-yellow-600',
      '飛行': 'bg-indigo-400',
      '超能力': 'bg-pink-500',
      '蟲': 'bg-lime-500',
      '岩石': 'bg-yellow-700',
      '幽靈': 'bg-purple-700',
      '龍': 'bg-indigo-700',
      '鋼': 'bg-gray-500',
      '惡': 'bg-gray-800',
      '妖精': 'bg-pink-300'
    };
    return colors[type] || 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
            寶可夢能力值計算器
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            專為舊時代「寶可夢對戰」設計的 IV、EV 計算工具
          </p>
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input 
                  placeholder="輸入寶可夢名稱（如：皮卡丘、Pikachu）或編號" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 text-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="h-12 px-8 font-bold text-base shadow-md transition-all hover:scale-105 active:scale-95">
                {loading ? <RefreshCw className="animate-spin mr-2" /> : <Search className="mr-2 h-5 w-5" />}
                搜尋
              </Button>
            </form>
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pokemon Display */}
        {pokemon && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Info Card */}
            <Card className="border-0 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
              <CardHeader className="relative z-10 text-center pb-2">
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
                  <span className="text-slate-400 font-mono text-2xl">#{pokemon.id.toString().padStart(4, '0')}</span>
                  <span>{pokemon.name}</span>
                </CardTitle>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{pokemon.enName}</p>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-col items-center gap-6 p-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
                  <img 
                    src={pokemon.imageUrl} 
                    alt={pokemon.name} 
                    className="w-56 h-56 object-contain relative z-10 drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                <div className="flex gap-2">
                  {pokemon.types.map(type => (
                    <Badge key={type} className={`${getTypeColor(type)} text-white px-4 py-1 text-base border-0 shadow-sm`}>
                      {type}
                    </Badge>
                  ))}
                </div>

                <div className="w-full space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                    <span className="w-1 h-6 bg-primary rounded-full mr-2"></span>
                    種族值
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    {Object.entries(pokemon.stats).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between group">
                        <span className="text-slate-500 dark:text-slate-400 font-medium group-hover:text-primary transition-colors">{getStatName(key)}</span>
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${(value / 255) * 100}%` }}
                            />
                          </div>
                          <span className="font-bold w-8 text-right">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full">
                   <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                    <span className="w-1 h-6 bg-purple-500 rounded-full mr-2"></span>
                    特性
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((ability, idx) => (
                      <Badge key={idx} variant={ability.isHidden ? "outline" : "secondary"} className="text-sm py-1 px-3">
                        {ability.name}
                        {ability.isHidden && <span className="ml-1 text-xs opacity-70">(隱藏)</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculator Card */}
            <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 flex flex-col">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calculator className="h-6 w-6 text-primary" />
                  努力值反推計算
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex-1">
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">目標能力項</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.keys(pokemon.stats).map((stat) => (
                        <Button
                          key={stat}
                          variant={targetStat === stat ? "default" : "outline"}
                          onClick={() => setTargetStat(stat as keyof Pokemon['stats'])}
                          className={`w-full ${targetStat === stat ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        >
                          {getStatName(stat)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">目標數值</label>
                      <Input 
                        type="number" 
                        value={targetValue} 
                        onChange={(e) => setTargetValue(e.target.value ? Number(e.target.value) : '')}
                        placeholder="例如: 200"
                        className="font-mono text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">等級</label>
                      <Input 
                        type="number" 
                        value={level} 
                        onChange={(e) => setLevel(Number(e.target.value))}
                        className="font-mono text-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">個體值 (IV)</label>
                      <Input 
                        type="number" 
                        value={iv} 
                        onChange={(e) => setIv(Number(e.target.value))}
                        max={31} min={0}
                        className="font-mono text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">性格修正</label>
                      <div className="flex rounded-md shadow-sm">
                        <Button 
                          variant={natureModifier === 0.9 ? "default" : "outline"}
                          className="flex-1 rounded-r-none border-r-0"
                          onClick={() => setNatureModifier(0.9)}
                        >
                          -
                        </Button>
                        <Button 
                          variant={natureModifier === 1.0 ? "default" : "outline"}
                          className="flex-1 rounded-none"
                          onClick={() => setNatureModifier(1.0)}
                        >
                          無
                        </Button>
                        <Button 
                          variant={natureModifier === 1.1 ? "default" : "outline"}
                          className="flex-1 rounded-l-none border-l-0"
                          onClick={() => setNatureModifier(1.1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">所需努力值 (EV)</p>
                  {calculationResult !== null ? (
                    <div className="space-y-2">
                      <span className="text-5xl font-black text-primary tracking-tighter">
                        {calculationResult}
                      </span>
                      {calculationResult > 252 && (
                        <p className="text-red-500 text-sm font-medium flex items-center justify-center gap-1">
                          <AlertCircle className="h-4 w-4" /> 超出單項上限 (252)
                        </p>
                      )}
                      {calculationResult < 0 && (
                        <p className="text-red-500 text-sm font-medium flex items-center justify-center gap-1">
                          <AlertCircle className="h-4 w-4" /> 數值過低，無法達成
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-slate-300 dark:text-slate-600">---</span>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Variety Selection Dialog */}
        <Dialog open={showVarietyDialog} onOpenChange={setShowVarietyDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>發現多種形態</DialogTitle>
              <DialogDescription>
                此寶可夢擁有多種形態，請選擇您要計算的形態：
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              {varieties.map((v) => (
                <Button
                  key={v.id}
                  variant="outline"
                  className="justify-between h-auto py-3 px-4"
                  onClick={() => handleSelectVariety(v)}
                >
                  <span className="font-medium">{v.zhName}</span>
                  <span className="text-xs text-slate-400 font-mono">#{v.id}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Ambiguous Search Dialog */}
        <Dialog open={showAmbiguousDialog} onOpenChange={setShowAmbiguousDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>請選擇寶可夢</DialogTitle>
              <DialogDescription>
                找到多個符合的寶可夢，請選擇：
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4 max-h-[60vh] overflow-y-auto">
              {ambiguousCandidates.map((c) => (
                <Button
                  key={c.id}
                  variant="ghost"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => handleSelectCandidate(c)}
                >
                  <span className="font-medium">{c.name}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
