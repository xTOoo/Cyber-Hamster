import React from 'react';
import { TelegramUser, Language } from '../types/game';
import { Volume2, VolumeX, Sparkles, Globe, Gem } from 'lucide-react';
import { formatNumber } from '../data/initialState';
import { sound } from '../utils/audio';
import { triggerHaptic } from '../utils/telegram';

interface HeaderProps {
  user: TelegramUser;
  gems: number;
  profitPerHour: number;
  language: Language;
  soundEnabled: boolean;
  activeSkin: 'hamster' | 'coin';
  onToggleSound: () => void;
  onToggleLanguage: () => void;
  onToggleSkin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  gems,
  profitPerHour,
  language,
  soundEnabled,
  activeSkin,
  onToggleSound,
  onToggleLanguage,
  onToggleSkin,
}) => {
  const isUk = language === 'uk';

  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-3 pb-2 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shrink-0 shadow-sm">
            <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center font-bold text-cyan-400 text-sm">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
            {user.isPremium && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-slate-950 font-black shadow">
                ★
              </span>
            )}
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="text-xs font-bold text-slate-100 truncate">
              {user.username ? `@${user.username}` : user.firstName}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="tabular-nums">+{formatNumber(profitPerHour)}</span>
              <span className="text-slate-400 font-normal">/{isUk ? 'год' : 'hr'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Gems */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Gems Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-xs">
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tabular-nums">{gems}</span>
          </div>

          {/* Skin Toggle */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleSkin();
            }}
            title={isUk ? 'Змінити скін' : 'Change skin'}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 active:scale-95 transition-transform"
          >
            <Sparkles className={`w-4 h-4 ${activeSkin === 'hamster' ? 'text-amber-400' : 'text-cyan-400'}`} />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleLanguage();
            }}
            title={isUk ? 'Змінити мову' : 'Change language'}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-bold active:scale-95 transition-transform"
          >
            <span className="text-slate-200">{language.toUpperCase()}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              triggerHaptic('light');
              sound.playTap();
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute' : 'Unmute'}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 active:scale-95 transition-transform"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
