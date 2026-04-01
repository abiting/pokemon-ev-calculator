import { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import type { Pokemon } from '@/types/pokemon';
import { getHighQualitySprite } from '@/lib/pokeapi';

interface SPDistribution {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

interface MiniTeamSlotProps {
  pokemon: Pokemon | null;
  sps: SPDistribution;
  lang?: 'zh' | 'en';
}

const STAT_LABELS_ZH = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  speed: 'Spe',
};

const STAT_LABELS_EN = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  speed: 'Spe',
};

export default function MiniTeamSlot({ pokemon, sps, lang = 'zh' }: MiniTeamSlotProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const statLabels = lang === 'zh' ? STAT_LABELS_ZH : STAT_LABELS_EN;

  const handleDownload = async () => {
    if (!cardRef.current || !pokemon) return;
    
    try {
      setIsDownloading(true);
      setIsCapturing(true);
      
      // Wait a bit to ensure any pending renders are complete and buttons are hidden
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const rect = cardRef.current.getBoundingClientRect();
      
      const dataUrl = await domToPng(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: rect.width,
        height: rect.height,
        style: {
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        }
      });
      
      const link = document.createElement('a');
      link.download = `${pokemon.name}-champions-build.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download slot image:', error);
      alert(lang === 'zh' ? '下載圖片失敗，請稍後再試。' : 'Failed to download image, please try again later.');
    } finally {
      setIsCapturing(false);
      setIsDownloading(false);
    }
  };

  if (!pokemon) {
    return (
      <Card className="bg-white/40 backdrop-blur-md border-2 border-dashed border-slate-300 shadow-sm h-[200px] flex items-center justify-center">
        <p className="text-slate-400 text-sm">
          {lang === 'zh' ? '請先選擇寶可夢' : 'Please select a Pokémon first'}
        </p>
      </Card>
    );
  }

  const spriteUrl = getHighQualitySprite(pokemon);
  const displayName = lang === 'zh' 
    ? (() => {
        const enName = pokemon.enName || pokemon.name;
        if (pokemon.name === 'darmanitan-galar-zen') return '達摩狒狒（伽勒爾達摩模式）';
        if (pokemon.name === 'darmanitan-galar-standard') return '達摩狒狒（伽勒爾的樣子）';
        if (pokemon.name === 'darmanitan-zen') return '達摩狒狒（達摩模式）';
        if (pokemon.name === 'darmanitan-standard') return '達摩狒狒';
        if (pokemon.name.includes('zygarde-10')) return '基格爾德（10%形態）';
        if (pokemon.name === 'zygarde-50' || pokemon.name === 'zygarde') return '基格爾德（50%形態）';
        if (pokemon.name === 'zygarde-complete') return '基格爾德（完全體形態）';
        if (pokemon.name === 'minior-red' || pokemon.name === 'minior-red-core') return '小隕星（紅色核心）';
        if (pokemon.name === 'minior-red-meteor') return '小隕星（流星的樣子）';
        if (enName.includes('Darmanitan') || enName.includes('darmanitan') || pokemon.id === 555) {
          const types = pokemon.types.map(t => t.type.name);
          const hasIce = types.includes('ice');
          const hasFire = types.includes('fire');
          const hasPsychic = types.includes('psychic');
          if (hasIce && hasFire) return '達摩狒狒（伽勒爾達摩模式）';
          if (hasIce) return '達摩狒狒（伽勒爾的樣子）';
          if (hasFire && hasPsychic) return '達摩狒狒（達摩模式）';
          if (hasFire) return '達摩狒狒';
        }
        return pokemon.zhName || pokemon.name;
      })()
    : (() => {
        const lowerName = (pokemon.enName || pokemon.name).toLowerCase();
        if (lowerName === 'wo-chien' || lowerName === 'wo chien') return 'Wo-Chien';
        if (lowerName === 'chien-pao' || lowerName === 'chien pao') return 'Chien-Pao';
        if (lowerName === 'ting-lu' || lowerName === 'ting lu') return 'Ting-Lu';
        if (lowerName === 'chi-yu' || lowerName === 'chi yu') return 'Chi-Yu';
        let name = pokemon.enName;
        if (!name) {
           name = pokemon.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
        if (pokemon.name === 'darmanitan-galar-zen') return 'Darmanitan (Galarian Zen)';
        if (pokemon.name === 'darmanitan-galar-standard') return 'Darmanitan (Galarian)';
        if (pokemon.name === 'darmanitan-zen') return 'Darmanitan (Zen)';
        if (pokemon.name === 'darmanitan-standard') return 'Darmanitan';
        if (pokemon.name.includes('zygarde-10')) return 'Zygarde (10% Forme)';
        if (pokemon.name === 'zygarde-50' || pokemon.name === 'zygarde') return 'Zygarde (50% Forme)';
        if (pokemon.name === 'zygarde-complete') return 'Zygarde (Complete Forme)';
        if (pokemon.name === 'minior-red' || pokemon.name === 'minior-red-core') return 'Minior (Red Core)';
        if (pokemon.name === 'minior-red-meteor') return 'Minior (Meteor)';
        if (name.includes('Darmanitan') || pokemon.id === 555) {
          const types = pokemon.types.map(t => t.type.name);
          const hasIce = types.includes('ice');
          const hasFire = types.includes('fire');
          const hasPsychic = types.includes('psychic');
          if (hasIce && hasFire) return 'Darmanitan (Galarian Zen)';
          if (hasIce) return 'Darmanitan (Galarian)';
          if (hasFire && hasPsychic) return 'Darmanitan (Zen)';
          if (hasFire) return 'Darmanitan';
        }
        if (name === 'Mr Mime' || name === 'Mr-mime') return 'Mr. Mime';
        if (name === 'Mr Rime' || name === 'Mr-rime') return 'Mr. Rime';
        if (name === 'Mime Jr' || name === 'Mime-jr') return 'Mime Jr.';
        if (name === 'Type Null' || name === 'Type-null') return 'Type: Null';
        if (name === 'Tapu Koko' || name === 'Tapu-koko') return 'Tapu Koko';
        if (name === 'Tapu Lele' || name === 'Tapu-lele') return 'Tapu Lele';
        if (name === 'Tapu Bulu' || name === 'Tapu-bulu') return 'Tapu Bulu';
        if (name === 'Tapu Fini' || name === 'Tapu-fini') return 'Tapu Fini';
        if (name === 'Great Tusk' || name === 'Great-tusk') return 'Great Tusk';
        if (name === 'Scream Tail' || name === 'Scream-tail') return 'Scream Tail';
        if (name === 'Brute Bonnet' || name === 'Brute-bonnet') return 'Brute Bonnet';
        if (name === 'Flutter Mane' || name === 'Flutter-mane') return 'Flutter Mane';
        if (name === 'Slither Wing' || name === 'Slither-wing') return 'Slither Wing';
        if (name === 'Sandy Shocks' || name === 'Sandy-shocks') return 'Sandy Shocks';
        if (name === 'Iron Treads' || name === 'Iron-treads') return 'Iron Treads';
        if (name === 'Iron Bundle' || name === 'Iron-bundle') return 'Iron Bundle';
        if (name === 'Iron Hands' || name === 'Iron-hands') return 'Iron Hands';
        if (name === 'Iron Jugulis' || name === 'Iron-jugulis') return 'Iron Jugulis';
        if (name === 'Iron Moth' || name === 'Iron-moth') return 'Iron Moth';
        if (name === 'Iron Thorns' || name === 'Iron-thorns') return 'Iron Thorns';
        if (name === 'Roaring Moon' || name === 'Roaring-moon') return 'Roaring Moon';
        if (name === 'Iron Valiant' || name === 'Iron-valiant') return 'Iron Valiant';
        if (name === 'Walking Wake' || name === 'Walking-wake') return 'Walking Wake';
        if (name === 'Iron Leaves' || name === 'Iron-leaves') return 'Iron Leaves';
        return name;
      })();

  const formattedId = (() => {
    if (pokemon.id > 10000 && pokemon.species && pokemon.species.url) {
      const parts = pokemon.species.url.split('/');
      const speciesId = parts[parts.length - 2];
      return speciesId.padStart(4, '0');
    }
    return pokemon.id.toString().padStart(4, '0');
  })();

  return (
    <div ref={cardRef} className="relative">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-md border-2 border-slate-700 shadow-xl overflow-hidden">
        {!isCapturing && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:text-green-600 hover:bg-green-50 h-8 w-8"
              onClick={handleDownload}
              disabled={isDownloading}
              title={lang === 'zh' ? '下載截圖' : 'Download Screenshot'}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        <CardContent className="p-4 lg:p-6 flex flex-col gap-4 lg:gap-6">
          {/* Top Section: Image, Name, and URL */}
          <div className="flex items-center gap-4 lg:gap-6 relative">
            <div className="w-20 h-20 lg:w-28 lg:h-28 flex-shrink-0 flex items-center justify-center bg-white/10 rounded-full border border-slate-600 shadow-inner p-1 lg:p-2 lg:ml-8">
              <img src={spriteUrl} alt={pokemon.name} className="w-full h-full object-contain drop-shadow-md" crossOrigin="anonymous" />
            </div>
            <div className="flex-1 min-w-0 lg:ml-6 lg:mr-8">
              <div className="text-sm lg:text-lg text-slate-400 font-medium mb-0.5 lg:mb-1">#{formattedId}</div>
              <div className="text-xl lg:text-3xl font-bold text-slate-100 leading-tight">{displayName}</div>
            </div>
          </div>

          {/* Bottom Section: Stats */}
          <div className="grid grid-cols-6 gap-1 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 mx-0 lg:mx-4">
            {(Object.keys(sps) as Array<keyof SPDistribution>).map((stat) => (
              <div key={stat} className="flex flex-col items-center justify-center bg-slate-800 rounded shadow-sm py-1.5 border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                  {statLabels[stat]}
                </span>
                <span className={`text-sm font-bold ${sps[stat] > 0 ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {sps[stat]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
