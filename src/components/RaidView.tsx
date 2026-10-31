import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Zap, Flame, Trophy, AlertTriangle, RotateCcw } from 'lucide-react';
import { BOSS_LIST, formatNumber } from '../data/initialState';
import { BossEnemy, Language } from '../types/game';
import { sound } from '../utils/audio';
import { triggerHaptic, triggerSuccessHaptic } from '../utils/telegram';

interface RaidViewProps {
  language: Language;
  bossDefeatedCount: number;
  onBossDefeated: (coinsReward: number, gemsReward: number) => void;
}

export const RaidView: React.FC<RaidViewProps> = ({
  language,
  bossDefeatedCount,
  onBossDefeated,
}) => {
  const isUk = language === 'uk';
  const bossIndex = bossDefeatedCount % BOSS_LIST.length;
  const currentBossTemplate = BOSS_LIST[bossIndex];

  // Game state
  const [inBattle, setInBattle] = useState(false);
  const [bossHp, setBossHp] = useState(currentBossTemplate.maxHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [timeLeft, setTimeLeft] = useState(40);
  const [isShielding, setIsShielding] = useState(false);
  const [bossCharging, setBossCharging] = useState(false);
  const [bossChargeProgress, setBossChargeProgress] = useState(0);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [hitEffect, setHitEffect] = useState(false);
  const [specialCharged, setSpecialCharged] = useState(false);
  const [specialProgress, setSpecialProgress] = useState(0);

  const battleLoopRef = useRef<NodeJS.Timeout | null>(null);
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start Battle
  const handleStartBattle = () => {
    setInBattle(true);
    setBossHp(currentBossTemplate.maxHp);
    setPlayerHp(100);
    setTimeLeft(40);
    setBattleResult(null);
    setIsShielding(false);
    setBossCharging(false);
    setBossChargeProgress(0);
    setSpecialProgress(0);
    setSpecialCharged(false);
    sound.playBoost();
    triggerHaptic('medium');
  };

  // Timer & Boss attack AI loop
  useEffect(() => {
    if (!inBattle || battleResult) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleDefeat(isUk ? 'Час вичерпано!' : 'Time ran out!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inBattle, battleResult]);

  // Boss charging attack cycle
  useEffect(() => {
    if (!inBattle || battleResult) return;

    const attackTimer = setInterval(() => {
      if (!bossCharging) {
        // Start charge
        setBossCharging(true);
        setBossChargeProgress(0);

        let progress = 0;
        chargeIntervalRef.current = setInterval(() => {
          progress += 20;
          setBossChargeProgress(progress);

          if (progress >= 100) {
            clearInterval(chargeIntervalRef.current!);
            executeBossAttack();
          }
        }, 300);
      }
    }, currentBossTemplate.attackIntervalMs + 2000);

    return () => {
      clearInterval(attackTimer);
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    };
  }, [inBattle, battleResult, bossCharging, isShielding]);

  const executeBossAttack = () => {
    setBossCharging(false);
    setBossChargeProgress(0);

    if (isShielding) {
      sound.playShield();
      triggerHaptic('light');
      // Counter-attack damage to boss
      const counterDmg = 80;
      setBossHp(prev => {
        const next = Math.max(0, prev - counterDmg);
        if (next === 0) handleVictory();
        return next;
      });
    } else {
      sound.playBossAttack();
      triggerHaptic('heavy');
      setPlayerHp(prev => {
        const next = Math.max(0, prev - currentBossTemplate.damage);
        if (next === 0) {
          handleDefeat(isUk ? 'Вас знищено!' : 'You were eliminated!');
        }
        return next;
      });
    }
  };

  const handleVictory = () => {
    setBattleResult('victory');
    setInBattle(false);
    sound.playLevelUp();
    triggerSuccessHaptic();
    onBossDefeated(currentBossTemplate.rewardCoins, currentBossTemplate.rewardGems);
  };

  const handleDefeat = (reason: string) => {
    setBattleResult('defeat');
    setInBattle(false);
    sound.playBossAttack();
    triggerHaptic('heavy');
  };

  // Player manual attack
  const handlePlayerAttack = () => {
    if (!inBattle || battleResult) return;

    sound.playTap(true);
    triggerHaptic('light');
    setHitEffect(true);
    setTimeout(() => setHitEffect(false), 80);

    // Charge special
    setSpecialProgress(prev => {
      const next = prev + 5;
      if (next >= 100) setSpecialCharged(true);
      return Math.min(100, next);
    });

    // Damage to boss
    const dmg = Math.floor(25 + Math.random() * 15);
    setBossHp(prev => {
      const next = Math.max(0, prev - dmg);
      if (next === 0) {
        handleVictory();
      }
      return next;
    });
  };

  // Special Cyber Overload attack
  const handleSpecialAttack = () => {
    if (!specialCharged || !inBattle || battleResult) return;

    sound.playBoost();
    triggerSuccessHaptic();
    setSpecialCharged(false);
    setSpecialProgress(0);

    const burstDmg = 280;
    setBossHp(prev => {
      const next = Math.max(0, prev - burstDmg);
      if (next === 0) handleVictory();
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto flex-1 px-4 py-2 select-none pb-20">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white font-display">
              {isUk ? 'Кібер-Рейд на Боса' : 'Cyber Boss Raid'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {isUk ? 'Перемагай бойових мехів за тонни монет та кристали' : 'Defeat war mechs for massive coin & gem bounty'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {isUk ? 'Рейдів' : 'Raids'}
          </span>
          <span className="text-sm font-black text-amber-400 tabular-nums">#{bossDefeatedCount + 1}</span>
        </div>
      </div>

      {!inBattle && !battleResult && (
        <div className="flex flex-col items-center justify-center my-auto p-5 rounded-3xl bg-slate-900/90 border border-slate-800 text-center shadow-xl">
          <div className="relative w-48 h-48 rounded-2xl overflow-hidden mb-4 border border-rose-500/40 shadow-lg shadow-rose-950/40">
            <img
              src="/src/assets/images/cyber_boss_avatar_1793464154532.jpg"
              alt="Boss"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[11px] font-bold text-white px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs">
              <span>{isUk ? currentBossTemplate.nameUk : currentBossTemplate.nameEn}</span>
              <span className="text-rose-400 tabular-nums">{currentBossTemplate.maxHp} HP</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {isUk ? 'Готовий до битви?' : 'Ready for battle?'}
          </h3>
          <p className="text-xs text-slate-400 mb-4 max-w-xs">
            {isUk
              ? 'Атакуй кліками, активуй Щит перед ударом боса та застосовуй кібер-перевантаження!'
              : 'Tap to strike, use Shield when boss charges laser, and unleash Cyber Overload!'}
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-300 mb-5 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-amber-400">+{formatNumber(currentBossTemplate.rewardCoins)} 🪙</span>
            <span className="text-cyan-400">+{currentBossTemplate.rewardGems} 💎</span>
          </div>

          <button
            onClick={handleStartBattle}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-sm uppercase tracking-wide shadow-lg shadow-rose-950/50 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Swords className="w-5 h-5" />
            <span>{isUk ? 'Почати Бій!' : 'Start Battle!'}</span>
          </button>
        </div>
      )}

      {inBattle && (
        <div className="flex flex-col flex-1 justify-between">
          {/* Top HUD: Boss HP & Timer */}
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-2 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-rose-400 truncate font-display">
                {isUk ? currentBossTemplate.nameUk : currentBossTemplate.nameEn}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono tabular-nums">{timeLeft}s</span>
                <span className="text-white font-mono tabular-nums">{bossHp} / {currentBossTemplate.maxHp} HP</span>
              </div>
            </div>
            {/* Boss HP Bar */}
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 transition-all duration-150"
                style={{ width: `${(bossHp / currentBossTemplate.maxHp) * 100}%` }}
              />
            </div>

            {/* Boss Warning Alert */}
            {bossCharging && (
              <div className="mt-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold animate-pulse">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isUk ? 'УВАГА: ПОСТРІЛ ЛАЗЕРА!' : 'WARNING: LASER CHARGE!'}</span>
                </div>
                <span className="tabular-nums font-mono">{bossChargeProgress}%</span>
              </div>
            )}
          </div>

          {/* Central Battle Arena */}
          <div className="relative flex-1 flex items-center justify-center my-2">
            <motion.div
              animate={{
                scale: hitEffect ? 0.95 : 1,
                filter: hitEffect ? 'brightness(1.4) contrast(1.2)' : 'brightness(1)',
              }}
              transition={{ duration: 0.08 }}
              className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-2 transition-all ${
                bossCharging
                  ? 'border-rose-500 shadow-2xl shadow-rose-600/50'
                  : 'border-slate-700 shadow-xl'
              }`}
            >
              <img
                src="/src/assets/images/cyber_boss_avatar_1793464154532.jpg"
                alt="Boss Arena"
                className="w-full h-full object-cover"
              />
              {/* Laser overlay flash */}
              {bossCharging && (
                <div className="absolute inset-0 bg-rose-600/30 animate-pulse pointer-events-none" />
              )}
              {isShielding && (
                <div className="absolute inset-0 bg-cyan-400/30 flex items-center justify-center pointer-events-none">
                  <Shield className="w-20 h-20 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Player HUD & Controls */}
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg">
            {/* Player HP */}
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-cyan-400">{isUk ? 'Ваша броня' : 'Your Armor'}</span>
              <span className="text-white font-mono tabular-nums">{playerHp} / 100 HP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800 mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                style={{ width: `${playerHp}%` }}
              />
            </div>

            {/* Combat Actions */}
            <div className="grid grid-cols-3 gap-2">
              {/* Tap Attack */}
              <button
                onPointerDown={handlePlayerAttack}
                className="col-span-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 active:scale-95 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md shadow-rose-950/40"
              >
                <Swords className="w-4 h-4" />
                <span>{isUk ? 'АТАКА' : 'ATTACK'}</span>
              </button>

              {/* Shield Toggle */}
              <button
                onPointerDown={() => {
                  setIsShielding(true);
                  sound.playShield();
                  triggerHaptic('medium');
                }}
                onPointerUp={() => setIsShielding(false)}
                onPointerLeave={() => setIsShielding(false)}
                className={`col-span-1 py-3 rounded-xl active:scale-95 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  isShielding
                    ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/50'
                    : 'bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:bg-slate-750'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{isUk ? 'ЩИТ (ТРИМАЙ)' : 'SHIELD (HOLD)'}</span>
              </button>

              {/* Cyber Overload Burst */}
              <button
                onClick={handleSpecialAttack}
                disabled={!specialCharged}
                className={`col-span-1 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  specialCharged
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {specialCharged
                    ? isUk
                      ? 'ВИБУХ!'
                      : 'BURST!'
                    : `${specialProgress}%`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Battle Results Screen */}
      {battleResult && (
        <div className="flex flex-col items-center justify-center my-auto p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl">
          {battleResult === 'victory' ? (
            <>
              <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 mb-3 border border-amber-500/30">
                <Trophy className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-black text-white font-display mb-1">
                {isUk ? 'БЛИСКАВИЧНА ПЕРЕМОГА!' : 'EPIC VICTORY!'}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {isUk ? 'Бойового меха знищено! Отримано нагороду:' : 'Mech destroyed! You earned rewards:'}
              </p>
              <div className="flex items-center gap-4 text-base font-bold text-white mb-5 bg-slate-950 px-5 py-2.5 rounded-2xl border border-slate-800">
                <span className="text-amber-400">+{formatNumber(currentBossTemplate.rewardCoins)} 🪙</span>
                <span className="text-cyan-400">+{currentBossTemplate.rewardGems} 💎</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 mb-3 border border-rose-500/30">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-black text-white font-display mb-1">
                {isUk ? 'ВАС ЗНИЩЕНО' : 'MISSION FAILED'}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {isUk
                  ? 'Використовуйте Щит, коли бос заряджає лазерний залп!'
                  : 'Make sure to hold Shield when the boss charges its laser!'}
              </p>
            </>
          )}

          <button
            onClick={handleStartBattle}
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wide shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isUk ? 'Грати знову' : 'Battle Again'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
