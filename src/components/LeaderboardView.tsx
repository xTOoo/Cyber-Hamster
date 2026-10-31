import React, { useState } from 'react';
import { Trophy, Medal, Crown, ChevronRight, User } from 'lucide-react';
import { LEAGUES, formatNumber } from '../data/initialState';
import { Language, TelegramUser } from '../types/game';
import { triggerHaptic } from '../utils/telegram';

interface LeaderboardViewProps {
  coins: number;
  user: TelegramUser;
  language: Language;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  coins: number;
  badge?: string;
  isCurrentUser?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  coins,
  user,
  language,
}) => {
  const isUk = language === 'uk';
  const [activeTab, setActiveTab] = useState<'leagues' | 'top'>('top');

  // Determine user league
  const userLeague = LEAGUES.reduce((acc, league) => {
    if (coins >= league.minCoins) return league;
    return acc;
  }, LEAGUES[0]);

  // Simulated live Telegram leaderboard
  const topPlayers: LeaderboardEntry[] = [
    { rank: 1, name: 'Pavel Durov', handle: '@durov', coins: 148_920_000, badge: '👑' },
    { rank: 2, name: 'TON Crypto Whale', handle: '@ton_whale', coins: 92_450_000, badge: '💎' },
    { rank: 3, name: 'Kyiv Cyber Dev', handle: '@kyiv_coder', coins: 64_120_000, badge: '💎' },
    { rank: 4, name: 'SatoshiUA', handle: '@satoshi_ua', coins: 41_800_000, badge: '💠' },
    { rank: 5, name: 'Elena Crypto', handle: '@elena_tg', coins: 28_300_000, badge: '💠' },
    { rank: 6, name: 'Alex Miner', handle: '@alex_block', coins: 18_900_000, badge: '💠' },
    { rank: 7, name: 'Crypto Hamster', handle: '@hamster_lord', coins: 12_400_000, badge: '💠' },
  ];

  // Calculate user rank based on coins
  let userRank = 482;
  if (coins >= 100_000_000) userRank = 2;
  else if (coins >= 50_000_000) userRank = 4;
  else if (coins >= 10_000_000) userRank = 8;
  else if (coins >= 1_000_000) userRank = 45;
  else if (coins >= 100_000) userRank = 184;

  const currentUserEntry: LeaderboardEntry = {
    rank: userRank,
    name: user.firstName + (user.lastName ? ` ${user.lastName}` : ''),
    handle: user.username ? `@${user.username}` : '@player',
    coins: coins,
    badge: userLeague.badge,
    isCurrentUser: true,
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto flex-1 px-4 py-3 select-none pb-20 overflow-y-auto">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-4">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('top');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'top'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isUk ? 'Топ Гравців Telegram' : 'Top Telegram Players'}
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('leagues');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'leagues'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isUk ? 'Всі Ліги' : 'All Leagues'}
        </button>
      </div>

      {activeTab === 'top' ? (
        <div className="flex flex-col gap-2">
          {/* User Sticky Rank Card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/40 mb-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs tabular-nums border border-cyan-500/30">
                #{currentUserEntry.rank}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{currentUserEntry.name}</span>
                  <span className="text-xs">{currentUserEntry.badge}</span>
                </div>
                <div className="text-[11px] text-cyan-400 font-mono">
                  {currentUserEntry.handle} ({isUk ? 'Ви' : 'You'})
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-amber-400 tabular-nums">
                {formatNumber(currentUserEntry.coins)} 🪙
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {isUk ? userLeague.nameUk : userLeague.nameEn}
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {isUk ? 'Глобальний рейтинг' : 'Global Ranking'}
          </h3>

          {/* Top Players List */}
          {topPlayers.map(player => (
            <div
              key={player.rank}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs tabular-nums ${
                    player.rank === 1
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : player.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : player.rank === 3
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {player.rank}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{player.name}</span>
                    <span className="text-xs">{player.badge}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{player.handle}</div>
                </div>
              </div>

              <div className="text-xs font-bold text-amber-400 tabular-nums">
                {formatNumber(player.coins)} 🪙
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Leagues Overview */
        <div className="flex flex-col gap-2.5">
          {LEAGUES.map((league, idx) => {
            const isUnlocked = coins >= league.minCoins;
            const isCurrent = league.id === userLeague.id;

            return (
              <div
                key={league.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-950/30'
                    : isUnlocked
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-slate-950/60 border-slate-800/40 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{league.badge}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {isUk ? league.nameUk : league.nameEn}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950">
                          {isUk ? 'Поточна' : 'Current'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {isUk ? 'Поріг входу:' : 'Entry threshold:'}{' '}
                      <span className="text-amber-400 font-bold tabular-nums">
                        {formatNumber(league.minCoins)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold">
                  {isUnlocked ? (
                    <span className="text-emerald-400">{isUk ? 'Відкрито' : 'Unlocked'}</span>
                  ) : (
                    <span className="text-slate-500">{isUk ? 'Закрито' : 'Locked'}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
