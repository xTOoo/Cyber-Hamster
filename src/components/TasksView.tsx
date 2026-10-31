import React, { useState } from 'react';
import { TaskItem, Language } from '../types/game';
import { INITIAL_TASKS, formatNumber } from '../data/initialState';
import { Calendar, CheckCircle2, ChevronRight, Copy, Check, Send, Users, Zap, Award, Swords } from 'lucide-react';
import { sound } from '../utils/audio';
import { triggerSuccessHaptic, triggerHaptic, openExternalTelegramLink } from '../utils/telegram';

interface TasksViewProps {
  tasks: Record<string, { completed: boolean; claimed: boolean }>;
  dailyStreak: number;
  lastDailyClaimDate: string;
  language: Language;
  onClaimDailyStreak: (coins: number, gems: number) => void;
  onClaimTask: (taskId: string, rewardCoins: number) => void;
}

const STREAK_REWARDS = [
  { day: 1, coins: 1000, gems: 1 },
  { day: 2, coins: 2500, gems: 2 },
  { day: 3, coins: 5000, gems: 3 },
  { day: 4, coins: 10000, gems: 5 },
  { day: 5, coins: 20000, gems: 8 },
  { day: 6, coins: 35000, gems: 10 },
  { day: 7, coins: 75000, gems: 25 },
];

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  dailyStreak,
  lastDailyClaimDate,
  language,
  onClaimDailyStreak,
  onClaimTask,
}) => {
  const isUk = language === 'uk';
  const [copied, setCopied] = useState(false);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);

  const todayStr = new Date().toDateString();
  const canClaimDaily = lastDailyClaimDate !== todayStr;
  const currentStreakReward = STREAK_REWARDS[(dailyStreak - 1) % STREAK_REWARDS.length];

  const handleClaimDaily = () => {
    if (!canClaimDaily) return;
    sound.playLevelUp();
    triggerSuccessHaptic();
    onClaimDailyStreak(currentStreakReward.coins, currentStreakReward.gems);
  };

  const handleExecuteTask = (task: TaskItem) => {
    const status = tasks[task.id];
    if (status?.claimed) return;

    if (status?.completed && !status?.claimed) {
      // Claim reward
      sound.playCoin();
      triggerSuccessHaptic();
      onClaimTask(task.id, task.reward);
      return;
    }

    // If it's a telegram channel link or referral share
    if (task.id === 'join_tg_channel') {
      openExternalTelegramLink('https://t.me/telegram');
      setVerifyingTaskId(task.id);
      setTimeout(() => {
        setVerifyingTaskId(null);
        sound.playCoin();
        triggerSuccessHaptic();
        onClaimTask(task.id, task.reward);
      }, 1500);
      return;
    }

    if (task.id === 'invite_friends') {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
        'https://t.me/CyberHamsterBot?start=ref_squad'
      )}&text=${encodeURIComponent(
        isUk
          ? '🚀 Приєднуйся до моєї кібер-команди в Telegram Mini App! Отримай +10,000 монет на старті!'
          : '🚀 Join my cyber squad in Telegram Mini App! Get +10,000 coins starter gift!'
      )}`;
      openExternalTelegramLink(shareUrl);
      setVerifyingTaskId(task.id);
      setTimeout(() => {
        setVerifyingTaskId(null);
        sound.playCoin();
        triggerSuccessHaptic();
        onClaimTask(task.id, task.reward);
      }, 1500);
      return;
    }
  };

  const handleCopyReferral = () => {
    triggerHaptic('light');
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://t.me/CyberHamsterBot?start=ref_my_squad');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTaskIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'Send':
        return <Send className="w-5 h-5 text-blue-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Award':
        return <Award className="w-5 h-5 text-purple-400" />;
      case 'Swords':
        return <Swords className="w-5 h-5 text-rose-400" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto flex-1 px-4 py-3 select-none pb-20 overflow-y-auto">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-base font-black text-white font-display">
          {isUk ? 'Завдання та Місії' : 'Tasks & Missions'}
        </h2>
        <p className="text-[11px] text-slate-400">
          {isUk ? 'Виконуй місії Telegram та щодня забирай кристали' : 'Complete Telegram quests and claim daily streak rewards'}
        </p>
      </div>

      {/* Daily Streak Section */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 mb-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isUk ? 'Щоденна серія входів' : 'Daily Login Streak'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isUk ? `День ${dailyStreak} з 7` : `Day ${dailyStreak} of 7`}
              </div>
            </div>
          </div>

          <button
            onClick={handleClaimDaily}
            disabled={!canClaimDaily}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              canClaimDaily
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {canClaimDaily ? (isUk ? 'Забрати' : 'Claim') : (isUk ? 'Отримано' : 'Claimed')}
          </button>
        </div>

        {/* 7-Day Streak Badges */}
        <div className="grid grid-cols-7 gap-1.5">
          {STREAK_REWARDS.map(item => {
            const isCompleted = item.day < dailyStreak || (!canClaimDaily && item.day === dailyStreak);
            const isCurrent = item.day === dailyStreak && canClaimDaily;

            return (
              <div
                key={item.day}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500/60 ring-1 ring-amber-500'
                    : isCompleted
                    ? 'bg-slate-900 border-slate-800 text-slate-400 opacity-70'
                    : 'bg-slate-950/60 border-slate-800/40 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 block">D{item.day}</span>
                <span className="text-[11px] font-black text-amber-400 block tabular-nums">
                  {formatNumber(item.coins)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">
              {isUk ? 'Твоє реферальне посилання' : 'Your Referral Link'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">+10% бонус</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <input
            type="text"
            readOnly
            value="https://t.me/CyberHamsterBot?start=ref_my_squad"
            className="w-full bg-transparent text-[11px] text-slate-300 font-mono px-2 outline-none"
          />
          <button
            onClick={handleCopyReferral}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shrink-0 flex items-center gap-1 active:scale-95 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isUk ? 'Скопійовано!' : 'Copied!') : (isUk ? 'Копіювати' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          {isUk ? 'Список місій' : 'Mission List'}
        </h3>
        {INITIAL_TASKS.map(task => {
          const taskState = tasks[task.id] || { completed: task.completed, claimed: task.claimed };
          const isVerifying = verifyingTaskId === task.id;

          return (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/50 shrink-0">
                  {getTaskIcon(task.icon)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {isUk ? task.titleUk : task.titleEn}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {isUk ? task.descUk : task.descEn}
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold mt-0.5 tabular-nums">
                    +{formatNumber(task.reward)} 🪙
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleExecuteTask(task)}
                disabled={taskState.claimed || isVerifying}
                className={`ml-3 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all active:scale-95 flex items-center justify-center min-w-[75px] ${
                  taskState.claimed
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isVerifying
                    ? 'bg-cyan-500/50 text-slate-900'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm'
                }`}
              >
                {taskState.claimed ? (
                  <div className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{isUk ? 'Готово' : 'Done'}</span>
                  </div>
                ) : isVerifying ? (
                  <span>{isUk ? 'Перевірка...' : 'Checking...'}</span>
                ) : (
                  <span>{isUk ? 'Виконати' : 'Start'}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
