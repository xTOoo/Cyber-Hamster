import React, { useState } from 'react';
import { UpgradeItem, Language } from '../types/game';
import { formatNumber, INITIAL_UPGRADES } from '../data/initialState';
import { Bot, Cpu, Brain, Server, ShieldCheck, Satellite, TrendingUp, Lock } from 'lucide-react';
import { sound } from '../utils/audio';
import { triggerSuccessHaptic, triggerHaptic } from '../utils/telegram';

interface MineViewProps {
  coins: number;
  upgrades: Record<string, number>;
  profitPerHour: number;
  language: Language;
  onBuyUpgrade: (upgradeId: string, cost: number, profitGained: number) => void;
}

export const MineView: React.FC<MineViewProps> = ({
  coins,
  upgrades,
  profitPerHour,
  language,
  onBuyUpgrade,
}) => {
  const isUk = language === 'uk';
  const [filter, setFilter] = useState<'all' | 'hardware' | 'team' | 'special'>('all');

  const getUpgradeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot':
        return <Bot className="w-6 h-6 text-cyan-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-purple-400" />;
      case 'Brain':
        return <Brain className="w-6 h-6 text-pink-400" />;
      case 'Server':
        return <Server className="w-6 h-6 text-blue-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'Satellite':
        return <Satellite className="w-6 h-6 text-amber-400" />;
      default:
        return <Cpu className="w-6 h-6 text-cyan-400" />;
    }
  };

  const filteredUpgrades = INITIAL_UPGRADES.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const handleBuy = (item: UpgradeItem) => {
    const currentLvl = upgrades[item.id] || 0;
    const cost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, currentLvl));

    if (coins < cost) {
      sound.playBossAttack();
      triggerHaptic('heavy');
      return;
    }

    const nextProfit = Math.floor(
      item.baseProfitPerHour * Math.pow(item.profitMultiplier, currentLvl)
    );

    sound.playLevelUp();
    triggerSuccessHaptic();
    onBuyUpgrade(item.id, cost, nextProfit);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto flex-1 px-4 py-3 select-none pb-20">
      {/* Top Passive Income Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4 mb-4 shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">
                {isUk ? 'Пасивний дохід шахти' : 'Mining Passive Income'}
              </div>
              <div className="text-2xl font-black text-white font-display tabular-nums">
                +{formatNumber(profitPerHour)}{' '}
                <span className="text-xs font-normal text-slate-400">/{isUk ? 'год' : 'hr'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">{isUk ? 'Баланс' : 'Balance'}</span>
            <span className="text-sm font-bold text-amber-400 tabular-nums">{formatNumber(coins)}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-4 overflow-x-auto">
        <button
          onClick={() => {
            triggerHaptic('light');
            setFilter('all');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isUk ? 'Всі апгрейди' : 'All Upgrades'}
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setFilter('hardware');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'hardware'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isUk ? 'Залізо' : 'Hardware'}
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setFilter('team');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'team'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isUk ? 'Боти' : 'Bots'}
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setFilter('special');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'special'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isUk ? 'Спецпроекти' : 'Special'}
        </button>
      </div>

      {/* Upgrade List */}
      <div className="flex flex-col gap-2.5 overflow-y-auto">
        {filteredUpgrades.map(item => {
          const currentLvl = upgrades[item.id] || 0;
          const cost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, currentLvl));
          const canAfford = coins >= cost;
          const nextProfitAddition = Math.floor(
            item.baseProfitPerHour * Math.pow(item.profitMultiplier, currentLvl)
          );

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
                  {getUpgradeIcon(item.icon)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {isUk ? item.titleUk : item.titleEn}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-cyan-300">
                      lvl {currentLvl}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {isUk ? item.descUk : item.descEn}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                    +{formatNumber(nextProfitAddition)}/{isUk ? 'год' : 'hr'}
                  </div>
                </div>
              </div>

              {/* Upgrade Button */}
              <button
                onClick={() => handleBuy(item)}
                disabled={!canAfford}
                className={`ml-3 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 flex flex-col items-center justify-center min-w-[80px] ${
                  canAfford
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold">
                  {currentLvl === 0 ? (isUk ? 'Купити' : 'Buy') : (isUk ? 'Прокачати' : 'Upgrade')}
                </span>
                <span className="tabular-nums font-black">{formatNumber(cost)}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
