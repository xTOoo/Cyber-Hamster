import React from 'react';
import { TabType, Language } from '../types/game';
import { CircleDot, Pickaxe, Swords, Zap, CheckSquare, Trophy } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface BottomNavProps {
  activeTab: TabType;
  language: Language;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  language,
  onSelectTab,
}) => {
  const isUk = language === 'uk';

  const tabs: { id: TabType; labelUk: string; labelEn: string; icon: React.ReactNode; isNew?: boolean }[] = [
    {
      id: 'tap',
      labelUk: 'Тап',
      labelEn: 'Tap',
      icon: <CircleDot className="w-5 h-5" />,
    },
    {
      id: 'mine',
      labelUk: 'Шахта',
      labelEn: 'Mine',
      icon: <Pickaxe className="w-5 h-5" />,
    },
    {
      id: 'raid',
      labelUk: 'Рейд',
      labelEn: 'Raid',
      icon: <Swords className="w-5 h-5" />,
      isNew: true,
    },
    {
      id: 'boost',
      labelUk: 'Бусти',
      labelEn: 'Boosts',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      labelUk: 'Місії',
      labelEn: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      id: 'top',
      labelUk: 'Топ',
      labelEn: 'Top',
      icon: <Trophy className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 pb-safe max-w-md mx-auto">
      <div className="grid grid-cols-6 items-center h-16">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center h-full min-w-[44px] min-h-[44px] transition-colors ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active ambient glow pill */}
              {isActive && (
                <div className="absolute top-1.5 w-7 h-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              )}

              <div className="relative">
                {tab.icon}
                {tab.isNew && !isActive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-1 truncate">
                {isUk ? tab.labelUk : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
