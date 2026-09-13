import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notifyRisk, requestNotificationPermission } from '../features/notifications/notifications';

class FakeNotification {
  static permission: NotificationPermission = 'default';
  static requestPermission = vi.fn(async () => FakeNotification.permission);
  constructor(public readonly title: string, public readonly options?: NotificationOptions) {}
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  Object.defineProperty(window, 'Notification', { value: FakeNotification, configurable: true, writable: true });
  FakeNotification.permission = 'default';
});

describe('notifications', () => {
  it('requests permission only when explicitly called', async () => {
    FakeNotification.permission = 'granted';
    expect(await requestNotificationPermission()).toBe('granted');
    expect(FakeNotification.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('does not notify when permission is denied', async () => {
    FakeNotification.permission = 'denied';
    expect(await notifyRisk('x', 'A', 'warning')).toBe(false);
  });

  it('notifies once, suppresses same-level cooldown and allows escalation', async () => {
    FakeNotification.permission = 'granted';
    const first = await notifyRisk('x', 'A', 'watch');
    const second = await notifyRisk('x', 'A', 'watch');
    const escalated = await notifyRisk('x', 'A', 'warning');
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(escalated).toBe(true);
  });
});
