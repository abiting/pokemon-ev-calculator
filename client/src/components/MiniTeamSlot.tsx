import { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
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
    ? (pokemon.zhName || pokemon.name)
    : (pokemon.enName || pokemon.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

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
      <Card className="bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-md border-2 border-slate-200 shadow-md overflow-hidden">
        {!isCapturing && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
              onClick={() => window.open(`https://pokedex.abiting.cc/pokemon/${pokemon.id}`, '_blank')}
              title={lang === 'zh' ? '在圖鑑中查看' : 'View in Pokédex'}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
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

        <CardContent className="p-4 flex flex-col gap-4">
          {/* Top Section: Image and Name */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-inner p-1">
              <img src={spriteUrl} alt={pokemon.name} className="w-full h-full object-contain drop-shadow-sm" crossOrigin="anonymous" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-500 font-medium mb-0.5">#{formattedId}</div>
              <div className="text-xl font-bold text-slate-800 leading-tight">{displayName}</div>
            </div>
          </div>

          {/* Bottom Section: Stats */}
          <div className="grid grid-cols-6 gap-1 bg-slate-100/50 p-2 rounded-lg border border-slate-200/50">
            {(Object.keys(sps) as Array<keyof SPDistribution>).map((stat) => (
              <div key={stat} className="flex flex-col items-center justify-center bg-white rounded shadow-sm py-1.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">
                  {statLabels[stat]}
                </span>
                <span className={`text-sm font-bold ${sps[stat] > 0 ? 'text-blue-600' : 'text-slate-700'}`}>
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
