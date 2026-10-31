/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameState, TabType, TelegramUser } from './types/game';
import {
  loadSavedGameState,
  saveGameState,
  INITIAL_UPGRADES,
  LEAGUES,
} from './data/initialState';
import { initTelegramApp, getTelegramUser, triggerHaptic } from './utils/telegram';
import { sound } from './utils/audio';

// Components
import { Header } from './components/Header';
import { TapView } from './components/TapView';
import { MineView } from './components/MineView';
import { RaidView } from './components/RaidView';
import { BoostView } from './components/BoostView';
import { TasksView } from './components/TasksView';
import { LeaderboardView } from './components/LeaderboardView';
import { BottomNav } from './components/BottomNav';
import { OfflineEarningsModal } from './components/OfflineEarningsModal';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const { state } = loadSavedGameState();
    return state;
  });

  const [offlineProfitNotice, setOfflineProfitNotice] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<TabType>('tap');
  const [telegramUser, setTelegramUser] = useState<TelegramUser>(() => getTelegramUser());

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Initialize Telegram Mini App SDK & Offline modal check on mount
  useEffect(() => {
    initTelegramApp();
    const user = getTelegramUser();
    setTelegramUser(user);

    const { offlineProfit } = loadSavedGameState();
    if (offlineProfit > 0) {
      setOfflineProfitNotice(offlineProfit);
    }
  }, []);

  // Configure sound engine state
  useEffect(() => {
    sound.setEnabled(gameState.soundEnabled);
  }, [gameState.soundEnabled]);

  // Periodic Auto-save & Live Passive Income / Energy Regen Loop
  useEffect(() => {
    const ticker = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        // Passive coins generated per second
        const passiveIncomePerSec = prev.profitPerHour > 0 ? prev.profitPerHour / 3600 : 0;
        const newCoins = prev.coins + passiveIncomePerSec;
        const newTotalEarned = prev.totalEarned + passiveIncomePerSec;

        // Energy regen
        const newEnergy = Math.min(prev.maxEnergy, prev.energy + prev.energyRegenPerSec);

        // Check if turbo expired
        const updated = {
          ...prev,
          coins: newCoins,
          totalEarned: newTotalEarned,
          energy: newEnergy,
          lastActiveTimestamp: now,
        };

        return updated;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  // Save to local storage on unload & every 3s
  useEffect(() => {
    const saveTimer = setInterval(() => {
      saveGameState(stateRef.current);
    }, 3000);

    const handleBeforeUnload = () => {
      saveGameState(stateRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      clearInterval(saveTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Handle Main Tap
  const handleTap = (amount: number, isCrit: boolean) => {
    setGameState(prev => {
      const isTurbo = Date.now() < prev.turboEndTime;
      const energyConsumed = isTurbo ? 0 : 1;
      const updatedEnergy = Math.max(0, prev.energy - energyConsumed);
      const newCoins = prev.coins + amount;
      const newTotalTaps = prev.totalTaps + 1;
      const newTotalEarned = prev.totalEarned + amount;

      // Check tap mission progress (e.g. 500 taps)
      const tasks = { ...prev.tasks };
      if (newTotalTaps >= 500 && !tasks['reach_1000_taps']?.completed) {
        tasks['reach_1000_taps'] = { completed: true, claimed: false };
      }
      if (newCoins >= 10000 && !tasks['reach_silver_league']?.completed) {
        tasks['reach_silver_league'] = { completed: true, claimed: false };
      }

      return {
        ...prev,
        coins: newCoins,
        energy: updatedEnergy,
        totalTaps: newTotalTaps,
        totalEarned: newTotalEarned,
        tasks,
      };
    });
  };

  // Handle Buy Passive Upgrade
  const handleBuyUpgrade = (upgradeId: string, cost: number, profitGained: number) => {
    setGameState(prev => {
      const nextLvl = (prev.upgrades[upgradeId] || 0) + 1;
      const newUpgrades = {
        ...prev.upgrades,
        [upgradeId]: nextLvl,
      };

      // Recalculate profit per hour
      let totalProfit = 0;
      INITIAL_UPGRADES.forEach(item => {
        const lvl = newUpgrades[item.id] || 0;
        if (lvl > 0) {
          totalProfit += Math.floor(
            item.baseProfitPerHour * Math.pow(item.profitMultiplier, lvl - 1) * lvl
          );
        }
      });

      return {
        ...prev,
        coins: Math.max(0, prev.coins - cost),
        profitPerHour: totalProfit,
        upgrades: newUpgrades,
      };
    });
  };

  // Handle Boss Defeated
  const handleBossDefeated = (rewardCoins: number, rewardGems: number) => {
    setGameState(prev => {
      const tasks = { ...prev.tasks };
      tasks['defeat_boss'] = { completed: true, claimed: false };

      return {
        ...prev,
        coins: prev.coins + rewardCoins,
        gems: prev.gems + rewardGems,
        totalEarned: prev.totalEarned + rewardCoins,
        bossDefeatedCount: prev.bossDefeatedCount + 1,
        tasks,
      };
    });
  };

  // Boost actions
  const handleUseFreeEnergy = () => {
    setGameState(prev => ({
      ...prev,
      energy: prev.maxEnergy,
      freeEnergyUsesToday: Math.max(0, prev.freeEnergyUsesToday - 1),
    }));
  };

  const handleActivateTurbo = () => {
    setGameState(prev => ({
      ...prev,
      turboEndTime: Date.now() + 20_000, // 20 seconds of 10x tap
    }));
  };

  const handleUpgradeMultitap = (cost: number) => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      tapPower: prev.tapPower + 1,
    }));
  };

  const handleUpgradeEnergyLimit = (cost: number) => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      maxEnergy: prev.maxEnergy + 500,
      energy: prev.energy + 500,
    }));
  };

  const handleUpgradeEnergyRegen = (cost: number) => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      energyRegenPerSec: prev.energyRegenPerSec + 1,
    }));
  };

  // Task actions
  const handleClaimDailyStreak = (coinsReward: number, gemsReward: number) => {
    setGameState(prev => {
      const todayStr = new Date().toDateString();
      return {
        ...prev,
        coins: prev.coins + coinsReward,
        gems: prev.gems + gemsReward,
        dailyStreak: prev.dailyStreak + 1,
        lastDailyClaimDate: todayStr,
      };
    });
  };

  const handleClaimTask = (taskId: string, rewardCoins: number) => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + rewardCoins,
      tasks: {
        ...prev.tasks,
        [taskId]: { completed: true, claimed: true },
      },
    }));
  };

  // Offline earnings claim
  const handleClaimOfflineEarnings = (multiplier: number) => {
    if (multiplier > 1) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins + offlineProfitNotice, // add the bonus doubled portion
        gems: Math.max(0, prev.gems - 2),
      }));
    }
    setOfflineProfitNotice(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Telegram Mini App Wrapper Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-slate-950 relative border-x border-slate-900 shadow-2xl">
        {/* Telegram Header */}
        <Header
          user={telegramUser}
          gems={gameState.gems}
          profitPerHour={gameState.profitPerHour}
          language={gameState.language}
          soundEnabled={gameState.soundEnabled}
          activeSkin={gameState.activeCharacterSkin}
          onToggleSound={() =>
            setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))
          }
          onToggleLanguage={() =>
            setGameState(prev => ({
              ...prev,
              language: prev.language === 'uk' ? 'en' : 'uk',
            }))
          }
          onToggleSkin={() =>
            setGameState(prev => ({
              ...prev,
              activeCharacterSkin: prev.activeCharacterSkin === 'hamster' ? 'coin' : 'hamster',
            }))
          }
        />

        {/* Tab Views */}
        <main className="flex-1 flex flex-col w-full relative">
          {activeTab === 'tap' && (
            <TapView
              coins={gameState.coins}
              energy={gameState.energy}
              maxEnergy={gameState.maxEnergy}
              tapPower={gameState.tapPower}
              turboEndTime={gameState.turboEndTime}
              activeSkin={gameState.activeCharacterSkin}
              language={gameState.language}
              onTap={handleTap}
              onOpenLeagues={() => setActiveTab('top')}
            />
          )}

          {activeTab === 'mine' && (
            <MineView
              coins={gameState.coins}
              upgrades={gameState.upgrades}
              profitPerHour={gameState.profitPerHour}
              language={gameState.language}
              onBuyUpgrade={handleBuyUpgrade}
            />
          )}

          {activeTab === 'raid' && (
            <RaidView
              language={gameState.language}
              bossDefeatedCount={gameState.bossDefeatedCount}
              onBossDefeated={handleBossDefeated}
            />
          )}

          {activeTab === 'boost' && (
            <BoostView
              coins={gameState.coins}
              energy={gameState.energy}
              maxEnergy={gameState.maxEnergy}
              tapPower={gameState.tapPower}
              energyRegenPerSec={gameState.energyRegenPerSec}
              freeEnergyUsesToday={gameState.freeEnergyUsesToday}
              turboEndTime={gameState.turboEndTime}
              language={gameState.language}
              onUseFreeEnergy={handleUseFreeEnergy}
              onActivateTurbo={handleActivateTurbo}
              onUpgradeMultitap={handleUpgradeMultitap}
              onUpgradeEnergyLimit={handleUpgradeEnergyLimit}
              onUpgradeEnergyRegen={handleUpgradeEnergyRegen}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={gameState.tasks}
              dailyStreak={gameState.dailyStreak}
              lastDailyClaimDate={gameState.lastDailyClaimDate}
              language={gameState.language}
              onClaimDailyStreak={handleClaimDailyStreak}
              onClaimTask={handleClaimTask}
            />
          )}

          {activeTab === 'top' && (
            <LeaderboardView
              coins={gameState.coins}
              user={telegramUser}
              language={gameState.language}
            />
          )}
        </main>

        {/* Telegram Mini App Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          language={gameState.language}
          onSelectTab={setActiveTab}
        />

        {/* Offline Passive Income Modal */}
        {offlineProfitNotice > 0 && (
          <OfflineEarningsModal
            profit={offlineProfitNotice}
            gems={gameState.gems}
            language={gameState.language}
            onClaim={handleClaimOfflineEarnings}
          />
        )}
      </div>
    </div>
  );
}
