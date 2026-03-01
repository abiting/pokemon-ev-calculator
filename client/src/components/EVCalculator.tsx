import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTotalEV } from '@/lib/pokeapi';
import { calculateStat } from '@/lib/statCalculator';
import { NATURES, type Nature } from '@/data/natures';
import type { EVDistribution, Pokemon } from '@/types/pokemon';
import { STAT_NAMES } from '@/types/pokemon';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';

const MAX_TOTAL_EV = 510;
const MAX_SINGLE_EV = 252;
const MAX_IV = 31;

interface EVCalculatorProps {
  pokemon?: Pokemon;
}

export default function EVCalculator({ pokemon }: EVCalculatorProps) {
  const [evs, setEvs] = useState<EVDistribution>({
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0,
  });

  const [ivs, setIvs] = useState<EVDistribution>({
    hp: 31,
    attack: 31,
    defense: 31,
    'special-attack': 31,
    'special-defense': 31,
    speed: 31,
  });

  const [selectedNature, setSelectedNature] = useState<Nature>(NATURES[0]);

  const totalEV = getTotalEV(evs);
  const remainingEV = MAX_TOTAL_EV - totalEV;

  const handleEVChange = (stat: keyof EVDistribution, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(MAX_SINGLE_EV, numValue));
    
    setEvs((prev) => ({
      ...prev,
      [stat]: clampedValue,
    }));
  };

  const handleIVChange = (stat: keyof EVDistribution, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(MAX_IV, numValue));
    
    setIvs((prev) => ({
      ...prev,
      [stat]: clampedValue,
    }));
  };

  const handleReset = () => {
    setEvs({
      hp: 0,
      attack: 0,
      defense: 0,
      'special-attack': 0,
      'special-defense': 0,
      speed: 0,
    });
    setIvs({
      hp: 31,
      attack: 31,
      defense: 31,
      'special-attack': 31,
      'special-defense': 31,
      speed: 31,
    });
    setSelectedNature(NATURES[0]);
  };

  const setMaxIVs = () => {
    setIvs({
      hp: 31,
      attack: 31,
      defense: 31,
      'special-attack': 31,
      'special-defense': 31,
      speed: 31,
    });
  };

  const getBaseStat = (stat: keyof EVDistribution): number => {
    if (!pokemon) return 0;
    const statData = pokemon.stats.find((s) => s.stat.name === stat);
    return statData?.base_stat || 0;
  };

  const calculateFinalStat = (stat: keyof EVDistribution, level: number): number => {
    if (!pokemon) return 0;
    
    return calculateStat({
      baseStat: getBaseStat(stat),
      iv: ivs[stat],
      ev: evs[stat],
      level,
      nature: selectedNature,
      statName: stat as string,
      isHP: stat === 'hp',
      pokemonId: pokemon.id,
    }) as number;
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-dashed border-cyan-300 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">努力值分配計算器</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 性格選擇 */}
          <div className="space-y-2">
            <label className="font-semibold text-sm">性格</label>
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
                        (↑{STAT_NAMES[nature.increased]} ↓{STAT_NAMES[nature.decreased]})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedNature.increased && selectedNature.decreased && (
              <p className="text-xs text-gray-600">
                {STAT_NAMES[selectedNature.increased]} ×1.1，{STAT_NAMES[selectedNature.decreased]} ×0.9
              </p>
            )}
          </div>

          {/* 總計資訊 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-lg">總努力值</span>
              <span className={`text-2xl font-bold ${totalEV > MAX_TOTAL_EV ? 'text-red-600' : 'text-blue-600'}`}>
                {totalEV} / {MAX_TOTAL_EV}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  totalEV > MAX_TOTAL_EV ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
                style={{ width: `${Math.min((totalEV / MAX_TOTAL_EV) * 100, 100)}%` }}
              />
            </div>
            {totalEV > MAX_TOTAL_EV && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>超過努力值上限！請調整分配</span>
              </div>
            )}
            {remainingEV > 0 && totalEV <= MAX_TOTAL_EV && (
              <p className="text-sm text-gray-600 mt-2">剩餘可分配：{remainingEV} 點</p>
            )}
          </div>

          {/* 能力值輸入與計算結果 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">能力值設定</h3>
              <Button onClick={setMaxIVs} variant="outline" size="sm">
                設為最大 IV
              </Button>
            </div>
            
            {(Object.keys(evs) as Array<keyof EVDistribution>).map((stat) => (
              <div key={stat} className="border rounded-lg p-3 space-y-2">
                <div className="font-medium">{STAT_NAMES[stat]}</div>
                
                {/* IV 輸入 */}
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 w-12">IV:</span>
                  <Input
                    type="number"
                    min="0"
                    max={MAX_IV}
                    value={ivs[stat]}
                    onChange={(e) => handleIVChange(stat, e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">/ {MAX_IV}</span>
                </div>

                {/* EV 輸入 */}
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 w-12">EV:</span>
                  <Input
                    type="number"
                    min="0"
                    max={MAX_SINGLE_EV}
                    value={evs[stat]}
                    onChange={(e) => handleEVChange(stat, e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">/ {MAX_SINGLE_EV}</span>
                </div>

                {/* 最終能力值顯示 */}
                {pokemon && (
                  <div className="bg-gray-50 rounded p-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lv.50:</span>
                      <span className="font-semibold">{calculateFinalStat(stat, 50)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lv.100:</span>
                      <span className="font-semibold">{calculateFinalStat(stat, 100)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 重置按鈕 */}
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            重置所有設定
          </Button>

          {/* 說明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <p className="font-semibold mb-1">💡 能力值計算說明</p>
            <ul className="space-y-1 text-gray-700">
              <li>• IV（個體值）：0-31，代表寶可夢的天賦</li>
              <li>• EV（努力值）：透過戰鬥獲得，最多 510 點</li>
              <li>• 性格會影響特定能力值（×1.1 或 ×0.9）</li>
              <li>• 最終能力值 = 種族值 + IV + EV + 性格修正</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
