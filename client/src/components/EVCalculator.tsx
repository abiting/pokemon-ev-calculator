import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { calculateStatIncrease, getTotalEV } from '@/lib/pokeapi';
import type { EVDistribution } from '@/types/pokemon';
import { STAT_NAMES } from '@/types/pokemon';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';

const MAX_TOTAL_EV = 510;
const MAX_SINGLE_EV = 252;

const COMMON_SPREADS = [
  { name: '物攻速攻', evs: { hp: 4, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 252 } },
  { name: '特攻速攻', evs: { hp: 4, attack: 0, defense: 0, 'special-attack': 252, 'special-defense': 0, speed: 252 } },
  { name: '物耐特耐', evs: { hp: 252, attack: 0, defense: 128, 'special-attack': 0, 'special-defense': 128, speed: 0 } },
  { name: '高血物攻', evs: { hp: 252, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 4, speed: 0 } },
  { name: '高血特攻', evs: { hp: 252, attack: 0, defense: 0, 'special-attack': 252, 'special-defense': 0, speed: 4 } },
];

export default function EVCalculator() {
  const [evs, setEvs] = useState<EVDistribution>({
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0,
  });

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

  const handleReset = () => {
    setEvs({
      hp: 0,
      attack: 0,
      defense: 0,
      'special-attack': 0,
      'special-defense': 0,
      speed: 0,
    });
  };

  const applySpread = (spread: EVDistribution) => {
    setEvs(spread);
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-dashed border-cyan-300 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">努力值分配計算器</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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

          {/* 能力值輸入 */}
          <div className="space-y-3">
            {(Object.keys(evs) as Array<keyof EVDistribution>).map((stat) => (
              <div key={stat} className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">{STAT_NAMES[stat]}</label>
                  <span className="text-xs text-gray-500">Lv.100 增加：+{calculateStatIncrease(evs[stat])}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    max={MAX_SINGLE_EV}
                    value={evs[stat]}
                    onChange={(e) => handleEVChange(stat, e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-16">/ {MAX_SINGLE_EV}</span>
                </div>
                {evs[stat] > MAX_SINGLE_EV && (
                  <p className="text-xs text-red-600">單項最多 {MAX_SINGLE_EV} 點</p>
                )}
              </div>
            ))}
          </div>

          {/* 重置按鈕 */}
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>

          {/* 常見配置 */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 text-center">常見努力值配置</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_SPREADS.map((spread) => (
                <Button
                  key={spread.name}
                  onClick={() => applySpread(spread.evs)}
                  variant="outline"
                  className="text-sm"
                >
                  {spread.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 說明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <p className="font-semibold mb-1">💡 努力值說明</p>
            <ul className="space-y-1 text-gray-700">
              <li>• 每隻寶可夢最多可獲得 510 點努力值</li>
              <li>• 單項能力最多可分配 252 點</li>
              <li>• 每 4 點努力值 = Lv.100 時增加 1 點能力值</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
