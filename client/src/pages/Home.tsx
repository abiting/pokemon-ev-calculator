import EVCalculator from '@/components/EVCalculator';
import PokemonCard from '@/components/PokemonCard';
import PokemonSearch from '@/components/PokemonSearch';
import { APP_TITLE } from '@/const';
import { fetchPokemon, formatPokemonName } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SearchCandidate {
  name: string;
  id: number;
}

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState<SearchCandidate[]>([]);
  const [showCandidates, setShowCandidates] = useState(false);
  const [varieties, setVarieties] = useState<any[]>([]);
  const [showVarieties, setShowVarieties] = useState(false);

  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

  const handleSearch = async (query: string, isVarietySelection = false) => {
    setIsLoading(true);
    setCandidates([]);
    setShowCandidates(false);
    if (!isVarietySelection) {
       setVarieties([]);
       setShowVarieties(false);
    }

      try {
      // 檢查是否為直接搜尋建議 (id === 0)
      // 這裡我們不需要特別檢查，因為 PokemonSearch 組件會傳遞 query 字串
      // 但如果我們是從 candidates 列表點擊過來的，query 可能是英文名稱
      
      const data = await fetchPokemon(query);
      
      // Check for varieties if it's a base form and not already selecting a variety
      if (!isVarietySelection && data.varieties && data.varieties.length > 1) {
         setVarieties(data.varieties);
         setShowVarieties(true);
      }

      setPokemon(data);
      toast.success(`成功載入 ${data.zhName || data.name}！`);
    } catch (error: any) {
      if (error.isAmbiguous) {
        setCandidates(error.candidates);
        setShowCandidates(true);
        toast.info('找到多個結果，請選擇一個');
      } else {
        // 如果是直接搜尋建議 (id === 0)，我們應該嘗試直接 fetchPokemon
        // 但 fetchPokemon 已經在 try block 裡呼叫了
        // 所以這裡的 error 真的是 fetch 失敗
        toast.error(error instanceof Error ? error.message : '搜尋失敗，請稍後再試');
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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-6xl">
        {/* 標題區 */}
        <div className="text-center mb-8">
          <h1 
            className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.reload()}
          >
            寶可夢能力值計算器
          </h1>
          <p className="text-white/90 text-lg drop-shadow">
            專為舊時代「寶可夢對戰」設計的 IV、EV 計算工具
          </p>
        </div>

        {/* 搜尋區 */}
        <div className="mb-8">
          <PokemonSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* 多重結果選擇對話框 */}
        <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>請選擇寶可夢</DialogTitle>
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
                  {candidate.id === 0 ? `直接搜尋 "${candidate.name}"` : candidate.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* 變體選擇對話框 (當搜尋結果有多種型態時顯示，例如妙蛙花) */}
        {/* 注意：這裡我們選擇直接在卡片上方顯示切換按鈕，或者用 Dialog */}
        {/* 為了簡化，我們先用 Dialog 讓使用者知道有其他型態 */}
        <Dialog open={showVarieties} onOpenChange={setShowVarieties}>
           <DialogContent className="sm:max-w-md">
              <DialogHeader>
                 <DialogTitle>發現多種型態</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4 max-h-[60vh] overflow-y-auto">
                 <p className="text-sm text-muted-foreground mb-2">此寶可夢有多種型態，請選擇：</p>
		                 {varieties.map((v) => {
		                    let displayName = v.pokemon.name;
                        // 使用 pokemon 物件中的資訊來格式化名稱
                        if (pokemon) {
                           // 獲取基礎中文名稱 (移除括號和前綴)
                           const baseZhName = pokemon.zhName?.split('（')[0].replace('超級', '').replace('超極巨', '').replace('極巨化', '') || pokemon.name;
                           
                           if (v.is_default) {
                              // 如果是預設型態，直接顯示基礎名稱 (例如 "妙蛙花")
                              displayName = baseZhName;
                              
                              // 特殊處理：莫魯貝可預設型態也需要顯示完整名稱
                              if (pokemon.species.name === 'morpeko') {
                                 const formatted = formatPokemonName('morpeko-full-belly', baseZhName, pokemon.species.name);
                                 displayName = formatted.zhName || formatted.enName;
                              }
                              
                              // 如果是英文環境，且名稱是 Mr Mime 等，需要修正
                              if (displayName === 'Mr Mime' || displayName === 'Mr-mime') displayName = 'Mr. Mime';
                              if (displayName === 'Mr Rime' || displayName === 'Mr-rime') displayName = 'Mr. Rime';
                              if (displayName === 'Mime Jr' || displayName === 'Mime-jr') displayName = 'Mime Jr.';
                              if (displayName === 'Type Null' || displayName === 'Type-null') displayName = 'Type: Null';
                              if (displayName === 'Tapu Koko' || displayName === 'Tapu-koko') displayName = 'Tapu Koko';
                              if (displayName === 'Tapu Lele' || displayName === 'Tapu-lele') displayName = 'Tapu Lele';
                              if (displayName === 'Tapu Bulu' || displayName === 'Tapu-bulu') displayName = 'Tapu Bulu';
                              if (displayName === 'Tapu Fini' || displayName === 'Tapu-fini') displayName = 'Tapu Fini';
                              if (displayName === 'Great Tusk' || displayName === 'Great-tusk') displayName = 'Great Tusk';
                              if (displayName === 'Scream Tail' || displayName === 'Scream-tail') displayName = 'Scream Tail';
                              if (displayName === 'Brute Bonnet' || displayName === 'Brute-bonnet') displayName = 'Brute Bonnet';
                              if (displayName === 'Flutter Mane' || displayName === 'Flutter-mane') displayName = 'Flutter Mane';
                              if (displayName === 'Slither Wing' || displayName === 'Slither-wing') displayName = 'Slither Wing';
                              if (displayName === 'Sandy Shocks' || displayName === 'Sandy-shocks') displayName = 'Sandy Shocks';
                              if (displayName === 'Iron Treads' || displayName === 'Iron-treads') displayName = 'Iron Treads';
                              if (displayName === 'Iron Bundle' || displayName === 'Iron-bundle') displayName = 'Iron Bundle';
                              if (displayName === 'Iron Hands' || displayName === 'Iron-hands') displayName = 'Iron Hands';
                              if (displayName === 'Iron Jugulis' || displayName === 'Iron-jugulis') displayName = 'Iron Jugulis';
                              if (displayName === 'Iron Moth' || displayName === 'Iron-moth') displayName = 'Iron Moth';
                              if (displayName === 'Iron Thorns' || displayName === 'Iron-thorns') displayName = 'Iron Thorns';
                              if (displayName === 'Roaring Moon' || displayName === 'Roaring-moon') displayName = 'Roaring Moon';
                              if (displayName === 'Iron Valiant' || displayName === 'Iron-valiant') displayName = 'Iron Valiant';
                              if (displayName === 'Walking Wake' || displayName === 'Walking-wake') displayName = 'Walking Wake';
                              if (displayName === 'Iron Leaves' || displayName === 'Iron-leaves') displayName = 'Iron Leaves';
                           } else {
                              // 如果是特殊型態，格式化名稱 (例如 "超級妙蛙花")
                              const formatted = formatPokemonName(v.pokemon.name, baseZhName, pokemon.species.name);
                              displayName = formatted.zhName || formatted.enName;
                           }
                           
                           // Final fix for special names in variety list
                           if (displayName === 'Mr Mime' || displayName === 'Mr-mime') displayName = 'Mr. Mime';
                           if (displayName === 'Mr Rime' || displayName === 'Mr-rime') displayName = 'Mr. Rime';
                           if (displayName === 'Mime Jr' || displayName === 'Mime-jr') displayName = 'Mime Jr.';
                           if (displayName === 'Type Null' || displayName === 'Type-null') displayName = 'Type: Null';
                           if (displayName === 'Tapu Koko' || displayName === 'Tapu-koko') displayName = 'Tapu Koko';
                           if (displayName === 'Tapu Lele' || displayName === 'Tapu-lele') displayName = 'Tapu Lele';
                           if (displayName === 'Tapu Bulu' || displayName === 'Tapu-bulu') displayName = 'Tapu Bulu';
                           if (displayName === 'Tapu Fini' || displayName === 'Tapu-fini') displayName = 'Tapu Fini';
                           if (displayName === 'Great Tusk' || displayName === 'Great-tusk') displayName = 'Great Tusk';
                           if (displayName === 'Scream Tail' || displayName === 'Scream-tail') displayName = 'Scream Tail';
                           if (displayName === 'Brute Bonnet' || displayName === 'Brute-bonnet') displayName = 'Brute Bonnet';
                           if (displayName === 'Flutter Mane' || displayName === 'Flutter-mane') displayName = 'Flutter Mane';
                           if (displayName === 'Slither Wing' || displayName === 'Slither-wing') displayName = 'Slither Wing';
                           if (displayName === 'Sandy Shocks' || displayName === 'Sandy-shocks') displayName = 'Sandy Shocks';
                           if (displayName === 'Iron Treads' || displayName === 'Iron-treads') displayName = 'Iron Treads';
                           if (displayName === 'Iron Bundle' || displayName === 'Iron-bundle') displayName = 'Iron Bundle';
                           if (displayName === 'Iron Hands' || displayName === 'Iron-hands') displayName = 'Iron Hands';
                           if (displayName === 'Iron Jugulis' || displayName === 'Iron-jugulis') displayName = 'Iron Jugulis';
                           if (displayName === 'Iron Moth' || displayName === 'Iron-moth') displayName = 'Iron Moth';
                           if (displayName === 'Iron Thorns' || displayName === 'Iron-thorns') displayName = 'Iron Thorns';
                           if (displayName === 'Roaring Moon' || displayName === 'Roaring-moon') displayName = 'Roaring Moon';
                           if (displayName === 'Iron Valiant' || displayName === 'Iron-valiant') displayName = 'Iron Valiant';
                           if (displayName === 'Walking Wake' || displayName === 'Walking-wake') displayName = 'Walking Wake';
                           if (displayName === 'Iron Leaves' || displayName === 'Iron-leaves') displayName = 'Iron Leaves';
                        } else if (v.is_default) {
                           // Fallback if pokemon is not yet set (shouldn't happen in this flow)
                           displayName = "Base Form";
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

        {/* 載入中 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            <p className="text-white mt-4">載入中...</p>
          </div>
        )}

        {/* 內容區 */}
        {!isLoading && pokemon && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <PokemonCard pokemon={pokemon} />
            </div>
            <div>
              <EVCalculator pokemon={pokemon} />
            </div>
          </div>
        )}

        {/* 初始提示 */}
        {!isLoading && !pokemon && (
          <div className="text-center py-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto border-2 border-dashed border-cyan-300">
              <h2 className="text-2xl font-bold mb-4">歡迎使用寶可夢能力值計算器！</h2>
              <div className="text-left bg-blue-50 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">使用範例：</p>
                <ul className="space-y-1 text-gray-700">
                  <li>• 輸入「皮卡丘」或「pikachu」</li>
                  <li>• 輸入圖鑑編號「25」</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 頁尾 */}
        <footer className="mt-12 text-center text-white/80 text-sm">
          <p>資料來源：<a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">PokéAPI</a></p>
          <p className="mt-2">Copyright © <a href="https://scrabby.abiting.cc" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Scrabby</a></p>
        </footer>
      </div>
    </div>
  );
}
