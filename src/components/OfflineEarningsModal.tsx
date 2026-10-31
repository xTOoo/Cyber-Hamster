import React from 'react';
import { motion } from 'motion/react';
import { Coins, Sparkles, Zap } from 'lucide-react';
import { formatNumber } from '../data/initialState';
import { Language } from '../types/game';
import { sound } from '../utils/audio';
import { triggerSuccessHaptic } from '../utils/telegram';

interface OfflineEarningsModalProps {
  profit: number;
  gems: number;
  language: Language;
  onClaim: (multiplier: number) => void;
}

export const OfflineEarningsModal: React.FC<OfflineEarningsModalProps> = ({
  profit,
  gems,
  language,
  onClaim,
}) => {
  const isUk = language === 'uk';

  const handleClaim = (multiplier: number) => {
    sound.playLevelUp();
    triggerSuccessHaptic();
    onClaim(multiplier);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 text-center shadow-2xl shadow-cyan-950/60 relative overflow-hidden"
      >
        {/* Glow halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-md">
          <Coins className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-white font-display mb-1">
          {isUk ? 'З поверненням, Шахтарю!' : 'Welcome Back, Miner!'}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          {isUk
            ? 'Поки ви були офлайн, ваші крипто-боти та сервери працювали на повну потужність:'
            : 'While you were away, your mining bots and servers were working at full capacity:'}
        </p>

        {/* Profit Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 flex flex-col items-center">
          <span className="text-3xl font-black text-amber-400 font-display tabular-nums">
            +{formatNumber(profit)}
          </span>
          <span className="text-xs text-slate-400 font-medium mt-1">
            {isUk ? 'монет видобуто' : 'coins mined'}
          </span>
        </div>

        {/* Claim Buttons */}
        <div className="flex flex-col gap-2.5">
          {gems >= 2 && (
            <button
              onClick={() => handleClaim(2)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wide shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isUk ? `Подвоїти 2x (${formatNumber(profit * 2)}) за 2 💎` : `Double 2x (${formatNumber(profit * 2)}) for 2 💎`}</span>
            </button>
          )}

          <button
            onClick={() => handleClaim(1)}
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wide border border-slate-700 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>{isUk ? 'Забрати звичайний дохід' : 'Claim Normal Earnings'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
