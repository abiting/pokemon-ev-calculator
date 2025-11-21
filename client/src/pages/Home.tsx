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
            className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.reload()}
          >
            歡迎使用阿比丁的寶可夢能力值計算器！
          </h1>
          <p className="text-white/90 text-lg drop-shadow">
            輸入寶可夢的名稱或圖鑑編號，即可查看該寶可夢的種族值，並透過個體值（IV）、努力值（EV）計算能力值。
          </p>
        </div>

        {/* 搜尋區 */}
        <div className="mb-8">
          <PokemonSearch onSearch={handleSearch} isLoading={isLoading} />
          
          {/* Manus CTA */}
          <div className="flex justify-center mt-4">
            <a
              href="https://manus.im/invitation/TWNEAQT6C9EW6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 hover:bg-white text-gray-800 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-dashed border-cyan-300"
            >
              <span>🚀</span>
              <span>用 Manus 免費打造你的網站</span>
            </a>
          </div>
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
              <h2 className="text-2xl font-bold mb-4">歡迎使用努力值計算器！</h2>
              <p className="text-gray-700 mb-4">
                在上方搜尋框輸入寶可夢的名稱或圖鑑編號，即可查看該寶可夢的努力值資料。
              </p>
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
          <p className="mt-2">Copyright © <a href="https://abiting.cc" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">阿比丁的第二個家</a></p>
        </footer>
      </div>
    </div>
  );
}
