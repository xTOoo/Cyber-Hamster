export type TabType = 'tap' | 'mine' | 'raid' | 'boost' | 'tasks' | 'top';

export type Language = 'uk' | 'en';

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  isPremium?: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  isCrit?: boolean;
}

export interface UpgradeItem {
  id: string;
  titleUk: string;
  titleEn: string;
  descUk: string;
  descEn: string;
  category: 'hardware' | 'team' | 'special';
  baseCost: number;
  costMultiplier: number;
  baseProfitPerHour: number;
  profitMultiplier: number;
  level: number;
  icon: string;
  requiredLeagueIndex?: number;
}

export interface TaskItem {
  id: string;
  titleUk: string;
  titleEn: string;
  descUk: string;
  descEn: string;
  reward: number;
  icon: string;
  actionUrl?: string;
  completed: boolean;
  claimed: boolean;
  category: 'telegram' | 'game' | 'daily';
}

export interface League {
  id: string;
  nameUk: string;
  nameEn: string;
  minCoins: number;
  iconColor: string;
  badge: string;
}

export interface BossEnemy {
  id: string;
  nameUk: string;
  nameEn: string;
  maxHp: number;
  currentHp: number;
  rewardCoins: number;
  rewardGems: number;
  attackIntervalMs: number;
  damage: number;
  image: string;
}

export interface GameState {
  coins: number;
  gems: number;
  totalEarned: number;
  totalTaps: number;
  energy: number;
  maxEnergy: number;
  tapPower: number;
  energyRegenPerSec: number;
  profitPerHour: number;
  lastActiveTimestamp: number;
  activeCharacterSkin: 'hamster' | 'coin';
  dailyStreak: number;
  lastDailyClaimDate: string;
  language: Language;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  turboEndTime: number;
  freeEnergyUsesToday: number;
  lastEnergyResetDate: string;
  upgrades: Record<string, number>; // id -> level
  tasks: Record<string, { completed: boolean; claimed: boolean }>;
  bossDefeatedCount: number;
}
