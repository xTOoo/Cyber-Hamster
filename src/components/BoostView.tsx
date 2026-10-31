import React from 'react';
import { Zap, Flame, BatteryCharging, ArrowUpCircle } from 'lucide-react';
import { formatNumber } from '../data/initialState';
import { Language } from '../types/game';
import { sound } from '../utils/audio';
import { triggerSuccessHaptic, triggerHaptic } from '../utils/telegram';

interface BoostViewProps {
  coins: number;
  energy: number;
  maxEnergy: number;
  tapPower: number;
  energyRegenPerSec: number;
  freeEnergyUsesToday: number;
  turboEndTime: number;
  language: Language;
  onUseFreeEnergy: () => void;
  onActivateTurbo: () => void;
  onUpgradeMultitap: (cost: number) => void;
  onUpgradeEnergyLimit: (cost: number) => void;
  onUpgradeEnergyRegen: (cost: number) => void;
}

export const BoostView: React.FC<BoostViewProps> = ({
  coins,
  maxEnergy,
  tapPower,
  energyRegenPerSec,
  freeEnergyUsesToday,
  turboEndTime,
  language,
  onUseFreeEnergy,
  onActivateTurbo,
  onUpgradeMultitap,
  onUpgradeEnergyLimit,
  onUpgradeEnergyRegen,
}) => {
  const isUk = language === 'uk';
  const isTurboActive = Date.now() < turboEndTime;

  // Upgrade costs
  const multitapCost = Math.floor(100 * Math.pow(2, tapPower - 1));
  const energyLimitCost = Math.floor(150 * Math.pow(1.8, Math.floor((maxEnergy - 1000) / 500)));
  const energyRegenCost = Math.floor(300 * Math.pow(2.2, energyRegenPerSec - 3));

  const handleFreeEnergy = () => {
    if (freeEnergyUsesToday <= 0) {
      sound.playBossAttack();
      return;
    }
    sound.playBoost();
    triggerSuccessHaptic();
    onUseFreeEnergy();
  };

  const handleTurbo = () => {
    if (isTurboActive) return;
    sound.playBoost();
    triggerSuccessHaptic();
    onActivateTurbo();
  };

  const handleMultitap = () => {
    if (coins < multitapCost) {
      sound.playBossAttack();
      triggerHaptic('heavy');
      return;
    }
    sound.playLevelUp();
    triggerSuccessHaptic();
    onUpgradeMultitap(multitapCost);
  };

  const handleEnergyLimit = () => {
    if (coins < energyLimitCost) {
      sound.playBossAttack();
      triggerHaptic('heavy');
      return;
    }
    sound.playLevelUp();
    triggerSuccessHaptic();
    onUpgradeEnergyLimit(energyLimitCost);
  };

  const handleEnergyRegen = () => {
    if (coins < energyRegenCost) {
      sound.playBossAttack();
      triggerHaptic('heavy');
      return;
    }
    sound.playLevelUp();
    triggerSuccessHaptic();
    onUpgradeEnergyRegen(energyRegenCost);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto flex-1 px-4 py-3 select-none pb-20 overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-black text-white font-display">
            {isUk ? 'Бусти та Підсилювачі' : 'Boosts & Power-ups'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {isUk ? 'Миттєве відновлення енергії та покращення тапу' : 'Instant energy recovery and tapping upgrades'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">{isUk ? 'Баланс' : 'Balance'}</span>
          <span className="text-sm font-bold text-amber-400 tabular-nums">{formatNumber(coins)}</span>
        </div>
      </div>

      {/* Free Daily Boosters Section */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {isUk ? 'Безкоштовні щоденні бусти' : 'Free Daily Boosts'}
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Full Energy */}
          <button
            onClick={handleFreeEnergy}
            disabled={freeEnergyUsesToday <= 0}
            className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
              freeEnergyUsesToday > 0
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-slate-900/50 border-slate-800/40 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Zap className="w-5 h-5 fill-amber-400" />
              </div>
              <span className="text-xs font-bold text-slate-300 tabular-nums">
                {freeEnergyUsesToday}/3
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isUk ? 'Повна енергія' : 'Full Energy'}
              </div>
              <div className="text-[10px] text-slate-400">
                {freeEnergyUsesToday > 0
                  ? isUk ? 'Миттєвий 100% заряд' : 'Instant 100% refill'
                  : isUk ? 'Використано на сьогодні' : 'Used up for today'}
              </div>
            </div>
          </button>

          {/* Turbo Overdrive */}
          <button
            onClick={handleTurbo}
            disabled={isTurboActive}
            className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
              !isTurboActive
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-400">
                {isTurboActive ? (isUk ? 'АКТИВНЕ' : 'ACTIVE') : 'FREE'}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isUk ? 'Турбо-режим' : 'Turbo Overdrive'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isUk ? '10x сила тапу на 20 сек' : '10x tap strength for 20s'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Permanent Boosters */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {isUk ? 'Постійні прокачки' : 'Permanent Boosters'}
        </h3>
        <div className="flex flex-col gap-2.5">
          {/* Multitap */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Multitap</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-cyan-300">
                    lvl {tapPower}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isUk ? `+${tapPower + 1} монет за кожен клік` : `+${tapPower + 1} coins per tap`}
                </div>
              </div>
            </div>

            <button
              onClick={handleMultitap}
              disabled={coins < multitapCost}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex flex-col items-center justify-center min-w-[75px] ${
                coins >= multitapCost
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-semibold">{isUk ? 'Прокачати' : 'Upgrade'}</span>
              <span className="tabular-nums font-black">{formatNumber(multitapCost)}</span>
            </button>
          </div>

          {/* Energy Limit */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    {isUk ? 'Ліміт Енергії' : 'Energy Limit'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-amber-300">
                    {maxEnergy}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isUk ? '+500 до максимальної енергії' : '+500 to maximum energy'}
                </div>
              </div>
            </div>

            <button
              onClick={handleEnergyLimit}
              disabled={coins < energyLimitCost}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex flex-col items-center justify-center min-w-[75px] ${
                coins >= energyLimitCost
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-semibold">{isUk ? 'Прокачати' : 'Upgrade'}</span>
              <span className="tabular-nums font-black">{formatNumber(energyLimitCost)}</span>
            </button>
          </div>

          {/* Energy Regen Speed */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    {isUk ? 'Швидкість заряду' : 'Recharge Speed'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-300">
                    +{energyRegenPerSec}/s
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isUk ? '+1 енергії за секунду' : '+1 energy per second'}
                </div>
              </div>
            </div>

            <button
              onClick={handleEnergyRegen}
              disabled={coins < energyRegenCost}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex flex-col items-center justify-center min-w-[75px] ${
                coins >= energyRegenCost
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-semibold">{isUk ? 'Прокачати' : 'Upgrade'}</span>
              <span className="tabular-nums font-black">{formatNumber(energyRegenCost)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
