import type { RiskLevel } from '../flood/types';

const KEY = 'flood-alert.notification-state.v1';
const COOLDOWN_MS = 6 * 60 * 60 * 1000;
const RANK: Record<RiskLevel, number> = { normal: 0, watch: 1, warning: 2, danger: 3 };

type State = Record<string, { level: RiskLevel; at: number }>;

function readState(): State {
  if (typeof window === 'undefined') return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    if (!parsed || typeof parsed !== 'object') return {};
    const result: State = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (value && typeof value === 'object') {
        const item = value as Record<string, unknown>;
        if ((item.level === 'normal' || item.level === 'watch' || item.level === 'warning' || item.level === 'danger') &&
            typeof item.at === 'number') result[id] = { level: item.level, at: item.at };
      }
    }
    return result;
  } catch {
    return {};
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted' || Notification.permission === 'denied') return Notification.permission;
  return Notification.requestPermission();
}

export async function notifyRisk(locationId: string, name: string, level: RiskLevel): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return false;

  const state = readState();
  const now = Date.now();
  const previous = state[locationId];
  const escalated = previous ? RANK[level] > RANK[previous.level] : true;
  if (previous && !escalated && now - previous.at < COOLDOWN_MS) return false;

  state[locationId] = { level, at: now };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Notification can still be shown when storage is unavailable.
  }

  const title = `Cập nhật rủi ro: ${name}`;
  const body = `Mức ước tính hiện tại: ${level}. Đây không phải cảnh báo chính thức.`;
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png' });
      return true;
    }
    new Notification(title, { body });
    return true;
  } catch {
    return false;
  }
}

export const NOTIFICATION_COOLDOWN_MS = COOLDOWN_MS;
