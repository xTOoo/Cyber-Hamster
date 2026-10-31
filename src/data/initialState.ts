import { UpgradeItem, TaskItem, League, BossEnemy, GameState } from '../types/game';

export const LEAGUES: League[] = [
  {
    id: 'bronze',
    nameUk: 'Бронзова Ліга',
    nameEn: 'Bronze League',
    minCoins: 0,
    iconColor: '#CD7F32',
    badge: '🥉',
  },
  {
    id: 'silver',
    nameUk: 'Срібна Ліга',
    nameEn: 'Silver League',
    minCoins: 10_000,
    iconColor: '#C0C0C0',
    badge: '🥈',
  },
  {
    id: 'gold',
    nameUk: 'Золота Ліга',
    nameEn: 'Gold League',
    minCoins: 100_000,
    iconColor: '#FFD700',
    badge: '🥇',
  },
  {
    id: 'platinum',
    nameUk: 'Платинова Ліга',
    nameEn: 'Platinum League',
    minCoins: 1_000_000,
    iconColor: '#E5E4E2',
    badge: '💠',
  },
  {
    id: 'diamond',
    nameUk: 'Діамантова Ліга',
    nameEn: 'Diamond League',
    minCoins: 10_000_000,
    iconColor: '#00F0FF',
    badge: '💎',
  },
  {
    id: 'legend',
    nameUk: 'Легенда Telegram',
    nameEn: 'Telegram Legend',
    minCoins: 50_000_000,
    iconColor: '#A855F7',
    badge: '👑',
  },
];

export const INITIAL_UPGRADES: UpgradeItem[] = [
  {
    id: 'tg_bot',
    titleUk: 'Telegram Скрипт-Бот',
    titleEn: 'Telegram Script Bot',
    descUk: 'Автоматичний фоновий збір монет через Telegram API.',
    descEn: 'Automated background coin collection via Telegram API.',
    category: 'team',
    baseCost: 150,
    costMultiplier: 1.15,
    baseProfitPerHour: 80,
    profitMultiplier: 1.12,
    level: 0,
    icon: 'Bot',
  },
  {
    id: 'gpu_rig',
    titleUk: 'GPU Ферма RTX 5090',
    titleEn: 'RTX 5090 GPU Rig',
    descUk: 'Потужний графічний стек для обчислення крипто-хешів.',
    descEn: 'High-performance graphics cluster for crypto hash mining.',
    category: 'hardware',
    baseCost: 1_200,
    costMultiplier: 1.18,
    baseProfitPerHour: 450,
    profitMultiplier: 1.15,
    level: 0,
    icon: 'Cpu',
  },
  {
    id: 'ai_neural',
    titleUk: 'AI Нейромережа Аналітики',
    titleEn: 'AI Trading Neural Net',
    descUk: 'Штучний інтелект прогнозує максимальні піки видобутку.',
    descEn: 'Artificial intelligence predicting peak yields and arbitrage.',
    category: 'hardware',
    baseCost: 8_500,
    costMultiplier: 1.22,
    baseProfitPerHour: 2_400,
    profitMultiplier: 1.16,
    level: 0,
    icon: 'Brain',
  },
  {
    id: 'quantum_server',
    titleUk: 'Квантовий Серверний Стек',
    titleEn: 'Quantum Server Stack',
    descUk: 'Надшвидкі обчислення на кубітах у криптографічній мережі.',
    descEn: 'Ultra-fast qubit computations in the cryptographic network.',
    category: 'special',
    baseCost: 45_000,
    costMultiplier: 1.25,
    baseProfitPerHour: 11_500,
    profitMultiplier: 1.18,
    level: 0,
    icon: 'Server',
    requiredLeagueIndex: 1,
  },
  {
    id: 'ton_validator',
    titleUk: 'TON Валідатор Нода',
    titleEn: 'TON Validator Node',
    descUk: 'Забезпечує консенсус блокчейну з максимальними комісіями.',
    descEn: 'Powers blockchain consensus with top tier validator yields.',
    category: 'special',
    baseCost: 250_000,
    costMultiplier: 1.28,
    baseProfitPerHour: 65_000,
    profitMultiplier: 1.2,
    level: 0,
    icon: 'ShieldCheck',
    requiredLeagueIndex: 2,
  },
  {
    id: 'orbital_satellite',
    titleUk: 'Орбітальний Супутник Зв\'язку',
    titleEn: 'Orbital Mesh Satellite',
    descUk: 'Глобальне покриття без затримок для домінування у топах.',
    descEn: 'Zero-latency global mesh network for leaderboard domination.',
    category: 'special',
    baseCost: 1_200_000,
    costMultiplier: 1.32,
    baseProfitPerHour: 280_000,
    profitMultiplier: 1.22,
    level: 0,
    icon: 'Satellite',
    requiredLeagueIndex: 3,
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'daily_checkin',
    titleUk: 'Щоденна винагорода за вхід',
    titleEn: 'Daily Login Reward',
    descUk: 'Заходь щодня та отримуй серію бонусів!',
    descEn: 'Log in daily to claim your streak reward!',
    reward: 2500,
    icon: 'Calendar',
    completed: true,
    claimed: false,
    category: 'daily',
  },
  {
    id: 'join_tg_channel',
    titleUk: 'Підписатися на Telegram Канал',
    titleEn: 'Join Official Telegram Channel',
    descUk: 'Будь у курсі всіх аірдропів, оновлень та турнірів.',
    descEn: 'Stay informed on all airdrops, updates and tournament events.',
    reward: 10000,
    icon: 'Send',
    actionUrl: 'https://t.me/telegram',
    completed: false,
    claimed: false,
    category: 'telegram',
  },
  {
    id: 'invite_friends',
    titleUk: 'Запросити 3 друзів у команду',
    titleEn: 'Invite 3 Friends to Squad',
    descUk: 'Отримай +25,000 монет та 10% від їхнього прибутку!',
    descEn: 'Get +25,000 coins and 10% bonus from their mining!',
    reward: 25000,
    icon: 'Users',
    completed: false,
    claimed: false,
    category: 'telegram',
  },
  {
    id: 'reach_1000_taps',
    titleUk: 'Зробити 500 кліків',
    titleEn: 'Complete 500 Taps',
    descUk: 'Перевір швидкість своїх пальців та залізне терпіння.',
    descEn: 'Test your tapping speed and persistence.',
    reward: 5000,
    icon: 'Zap',
    completed: false,
    claimed: false,
    category: 'game',
  },
  {
    id: 'reach_silver_league',
    titleUk: 'Досягти Срібної Ліги (10,000)',
    titleEn: 'Reach Silver League (10,000)',
    descUk: 'Увійди до елітного кола кібер-шахтарів.',
    descEn: 'Enter the elite rank of cyber miners.',
    reward: 15000,
    icon: 'Award',
    completed: false,
    claimed: false,
    category: 'game',
  },
  {
    id: 'defeat_boss',
    titleUk: 'Перемогти Боса Crimson Vulcan',
    titleEn: 'Defeat Crimson Vulcan Boss',
    descUk: 'Знищити бойового меха у розділі Рейди!',
    descEn: 'Destroy the war mech in Boss Raids mode!',
    reward: 35000,
    icon: 'Swords',
    completed: false,
    claimed: false,
    category: 'game',
  },
];

export const BOSS_LIST: BossEnemy[] = [
  {
    id: 'crimson_vulcan',
    nameUk: 'Crimson Vulcan CV-01',
    nameEn: 'Crimson Vulcan CV-01',
    maxHp: 2500,
    currentHp: 2500,
    rewardCoins: 30000,
    rewardGems: 15,
    attackIntervalMs: 2500,
    damage: 35,
    image: '/src/assets/images/cyber_boss_avatar_1793464154532.jpg',
  },
  {
    id: 'quantum_overlord',
    nameUk: 'Quantum Overlord MK-IV',
    nameEn: 'Quantum Overlord MK-IV',
    maxHp: 8000,
    currentHp: 8000,
    rewardCoins: 120000,
    rewardGems: 45,
    attackIntervalMs: 2000,
    damage: 60,
    image: '/src/assets/images/cyber_boss_avatar_1793464154532.jpg',
  },
];

export const INITIAL_GAME_STATE: GameState = {
  coins: 500,
  gems: 10,
  totalEarned: 500,
  totalTaps: 0,
  energy: 1000,
  maxEnergy: 1000,
  tapPower: 1,
  energyRegenPerSec: 3,
  profitPerHour: 0,
  lastActiveTimestamp: Date.now(),
  activeCharacterSkin: 'hamster',
  dailyStreak: 1,
  lastDailyClaimDate: '',
  language: 'uk',
  soundEnabled: true,
  hapticEnabled: true,
  turboEndTime: 0,
  freeEnergyUsesToday: 3,
  lastEnergyResetDate: new Date().toDateString(),
  upgrades: {},
  tasks: {},
  bossDefeatedCount: 0,
};

const STORAGE_KEY = 'cyber_hamster_tg_game_v1';

export function loadSavedGameState(): { state: GameState; offlineProfit: number } {
  let offlineProfit = 0;
  let state = { ...INITIAL_GAME_STATE };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };

      // Calculate offline profit
      const now = Date.now();
      const last = parsed.lastActiveTimestamp || now;
      const secondsOffline = Math.max(0, Math.floor((now - last) / 1000));

      // Calculate passive income
      let calculatedPerHour = 0;
      INITIAL_UPGRADES.forEach(upg => {
        const lvl = state.upgrades[upg.id] || 0;
        if (lvl > 0) {
          calculatedPerHour += Math.floor(upg.baseProfitPerHour * Math.pow(upg.profitMultiplier, lvl - 1) * lvl);
        }
      });

      state.profitPerHour = calculatedPerHour;

      // Cap offline earnings at 4 hours max (standard Telegram game rule)
      const maxOfflineSeconds = 4 * 3600;
      const effectiveSeconds = Math.min(secondsOffline, maxOfflineSeconds);

      if (effectiveSeconds > 10 && calculatedPerHour > 0) {
        offlineProfit = Math.floor((calculatedPerHour / 3600) * effectiveSeconds);
        state.coins += offlineProfit;
        state.totalEarned += offlineProfit;
      }

      // Energy recovery offline
      const energyGained = secondsOffline * state.energyRegenPerSec;
      state.energy = Math.min(state.maxEnergy, state.energy + energyGained);

      // Check daily reset for free energy
      const todayStr = new Date().toDateString();
      if (state.lastEnergyResetDate !== todayStr) {
        state.freeEnergyUsesToday = 3;
        state.lastEnergyResetDate = todayStr;
      }
    }
  } catch (err) {
    console.error('Failed to load save state:', err);
  }

  state.lastActiveTimestamp = Date.now();
  return { state, offlineProfit };
}

export function saveGameState(state: GameState) {
  try {
    const toSave = {
      ...state,
      lastActiveTimestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error('Failed to save state:', err);
  }
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return Math.floor(num).toLocaleString('uk-UA');
}
