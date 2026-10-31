/**
 * Telegram Mini App WebApp SDK Integration Helper
 */

import { TelegramUser } from '../types/game';

interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
    start_param?: string;
  };
  version?: string;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  themeParams?: Record<string, string>;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  headerColor?: string;
  backgroundColor?: string;
  BackButton?: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  openTelegramLink: (url: string) => void;
  openLink: (url: string) => void;
  showConfirm?: (message: string, callback?: (confirmed: boolean) => void) => void;
  showAlert?: (message: string, callback?: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function initTelegramApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.ready();
      tg.expand();
    } catch {
      // safe fallback
    }
  }
}

export function getTelegramUser(): TelegramUser {
  const tg = getTelegramWebApp();
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const u = tg.initDataUnsafe.user;
    return {
      id: u.id,
      firstName: u.first_name || 'Operative',
      lastName: u.last_name,
      username: u.username,
      isPremium: u.is_premium,
    };
  }

  // Fallback profile for browser sandbox
  return {
    id: 742189012,
    firstName: 'Alex',
    lastName: 'Kyiv',
    username: 'cyber_miner',
    isPremium: true,
  };
}

export function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  const tg = getTelegramWebApp();
  if (tg && tg.HapticFeedback) {
    try {
      tg.HapticFeedback.impactOccurred(style);
    } catch {
      // safe
    }
  } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(style === 'heavy' ? 30 : style === 'medium' ? 20 : 10);
    } catch {
      // safe
    }
  }
}

export function triggerSuccessHaptic() {
  const tg = getTelegramWebApp();
  if (tg && tg.HapticFeedback) {
    try {
      tg.HapticFeedback.notificationOccurred('success');
    } catch {}
  } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([15, 30, 20]);
    } catch {}
  }
}

export function openExternalTelegramLink(url: string) {
  const tg = getTelegramWebApp();
  if (tg && tg.openTelegramLink) {
    try {
      tg.openTelegramLink(url);
      return;
    } catch {}
  }
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
