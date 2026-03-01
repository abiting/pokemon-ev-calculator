import EVCalculator from '@/components/EVCalculator';
import PokemonCard from '@/components/PokemonCard';
import PokemonSearch from '@/components/PokemonSearch';
import { APP_TITLE } from '@/const';
import { fetchPokemon } from '@/lib/pokeapi';
import type { Pokemon } from '@/types/pokemon';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const data = await fetchPokemon(query);
      setPokemon(data);
      toast.success(`成功載入 ${data.name}！`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '搜尋失敗，請稍後再試');
      setPokemon(null);
    } finally {
      setIsLoading(false);
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
