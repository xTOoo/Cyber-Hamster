import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Flame, ShieldAlert, ChevronRight } from 'lucide-react';
import { formatNumber, LEAGUES } from '../data/initialState';
import { FloatingText, Language } from '../types/game';
import { sound } from '../utils/audio';
import { triggerHaptic } from '../utils/telegram';

interface TapViewProps {
  coins: number;
  energy: number;
  maxEnergy: number;
  tapPower: number;
  turboEndTime: number;
  activeSkin: 'hamster' | 'coin';
  language: Language;
  onTap: (amount: number, isCrit: boolean) => void;
  onOpenLeagues: () => void;
}

export const TapView: React.FC<TapViewProps> = ({
  coins,
  energy,
  maxEnergy,
  tapPower,
  turboEndTime,
  activeSkin,
  language,
  onTap,
  onOpenLeagues,
}) => {
  const isUk = language === 'uk';
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isTurbo = Date.now() < turboEndTime;
  const effectiveTapPower = isTurbo ? tapPower * 10 : tapPower;

  // Determine current league
  const currentLeagueIndex = LEAGUES.reduce((acc, league, idx) => {
    if (coins >= league.minCoins) return idx;
    return acc;
  }, 0);
  const currentLeague = LEAGUES[currentLeagueIndex];
  const nextLeague = LEAGUES[currentLeagueIndex + 1];

  const leagueProgress = nextLeague
    ? Math.min(100, Math.max(0, ((coins - currentLeague.minCoins) / (nextLeague.minCoins - currentLeague.minCoins)) * 100))
    : 100;

  // Combo decay
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastTapTime > 1200 && comboCount > 0) {
        setComboCount(prev => Math.max(0, prev - 1));
      }
    }, 300);
    return () => clearInterval(interval);
  }, [lastTapTime, comboCount]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (energy <= 0 && !isTurbo) {
      sound.playBossAttack();
      triggerHaptic('heavy');
      return;
    }

    const now = Date.now();
    setLastTapTime(now);

    // Build combo
    const newCombo = Math.min(25, comboCount + 1);
    setComboCount(newCombo);

    // Critical hit chance 15%
    const isCrit = Math.random() < 0.15;
    const comboMultiplier = newCombo >= 15 ? 2.5 : newCombo >= 8 ? 1.5 : 1;
    const finalAmount = Math.ceil(effectiveTapPower * (isCrit ? 3 : 1) * comboMultiplier);

    sound.playTap(isCrit);
    triggerHaptic(isCrit ? 'heavy' : 'light');

    // Spawn floating number
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 30 - 15);
    const y = e.clientY - rect.top - 20;

    const id = Date.now() + Math.random();
    const textLabel = isCrit ? `+${finalAmount} CRIT!` : `+${finalAmount}`;
    setFloatingTexts(prev => [...prev.slice(-12), { id, x, y, text: textLabel, isCrit }]);

    onTap(finalAmount, isCrit);
  };

  const cleanUpFloatingText = (id: number) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  };

  const imageSrc =
    activeSkin === 'hamster'
      ? '/src/assets/images/cyber_mascot_hero_1793464151895.jpg'
      : '/src/assets/images/ton_crypto_coin_1793464152516.jpg';

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-md mx-auto flex-1 px-4 py-2 select-none">
      {/* Top Balance & League Indicator */}
      <div className="w-full flex flex-col items-center">
        {/* League Selector Pill */}
        <button
          onClick={onOpenLeagues}
          className="flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 active:scale-95 transition-all shadow-xs"
        >
          <span>{currentLeague.badge}</span>
          <span className="font-semibold text-slate-200">
            {isUk ? currentLeague.nameUk : currentLeague.nameEn}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Big Balance */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-xs border border-cyan-400/30">
            <img src="/src/assets/images/ton_crypto_coin_1793464152516.jpg" alt="Coin" className="w-full h-full object-cover" />
          </div>
          <motion.span
            key={coins}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-white font-display tabular-nums"
          >
            {formatNumber(coins)}
          </motion.span>
        </div>

        {/* League Progress Bar */}
        <div className="w-full max-w-xs mt-1 mb-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-1">
            <span>{isUk ? 'Рівень ліги' : 'League Level'}</span>
            <span className="tabular-nums">
              {nextLeague ? `${formatNumber(coins)} / ${formatNumber(nextLeague.minCoins)}` : 'MAX'}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${leagueProgress}%` }}
            />
          </div>
        </div>

        {/* Turbo Mode Indicator */}
        {isTurbo && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold animate-pulse"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{isUk ? 'ТУРБО 10x АКТИВНЕ!' : 'TURBO 10x ACTIVE!'}</span>
          </motion.div>
        )}
      </div>

      {/* Main Interactive Mascot / Coin with Tilt & Particles */}
      <div className="relative my-auto flex items-center justify-center w-full py-4">
        {/* Glow halo */}
        <div
          className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${
            comboCount >= 10
              ? 'bg-amber-500/20'
              : 'bg-cyan-500/15'
          }`}
        />

        {/* Floating Numbers Container */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <AnimatePresence>
            {floatingTexts.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, y: item.y, x: item.x, scale: 0.8 }}
                animate={{ opacity: 0, y: item.y - 90, scale: 1.25 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                onAnimationComplete={() => cleanUpFloatingText(item.id)}
                className={`absolute font-black tracking-tight ${
                  item.isCrit
                    ? 'text-amber-400 text-2xl drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]'
                    : 'text-cyan-300 text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                }`}
              >
                {item.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Interactive Tap Button */}
        <motion.div
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          onPointerDown={handlePointerDown}
          className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full cursor-pointer select-none touch-none p-2.5 bg-gradient-to-b from-cyan-400/30 via-slate-800 to-slate-950 border-2 border-cyan-400/40 shadow-2xl shadow-cyan-950/60 active:border-cyan-300 transition-colors"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900 border border-slate-700/60 shadow-inner">
            <img
              src={imageSrc}
              alt="Mascot"
              className="w-full h-full object-cover pointer-events-none transform active:scale-105 transition-transform duration-75"
              loading="eager"
            />
            {/* Gloss reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none rounded-full" />
          </div>

          {/* Combo badge if rapid tapping */}
          {comboCount >= 3 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-lg"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>x{comboCount >= 15 ? '2.5' : comboCount >= 8 ? '1.5' : '1.2'}</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom Energy Meter */}
      <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 backdrop-blur-sm shadow-md">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>{isUk ? 'Енергія' : 'Energy'}</span>
          </div>
          <div className="tabular-nums">
            <span className="text-white font-black">{energy}</span>
            <span className="text-slate-500 font-normal"> / {maxEnergy}</span>
          </div>
        </div>

        {/* Energy bar */}
        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              energy < maxEnergy * 0.2
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, (energy / maxEnergy) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
