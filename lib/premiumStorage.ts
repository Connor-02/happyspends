import type {
  PremiumStore,
  AppNotification,
  AppNotificationType,
  NotificationPreference,
  Reminder,
  ReminderType,
  HabitCompletion,
  BudgetHealthSnapshot,
} from '@/types/premium';
import { generateId } from '@/lib/utils';

const PREMIUM_KEY = 'happyspends_premium';

function isServer(): boolean {
  return typeof window === 'undefined';
}

// ─── Default Notification Preferences ────────────────────────────────────────

export function defaultNotificationPreferences(): NotificationPreference {
  return {
    pushEnabled: false,
    dailyCheckin: true,
    weeklyReview: true,
    billReminders: true,
    subscriptionReminders: true,
    goalReminders: true,
    overspendingAlerts: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    tone: 'gentle',
    checkInTime: '20:00',
  };
}

// ─── Default Reminders ────────────────────────────────────────────────────────

export function defaultReminders(): Reminder[] {
  const defs: { type: ReminderType; label: string; frequency: Reminder['frequency']; time: string }[] = [
    { type: 'daily-spending', label: 'Daily spending check-in', frequency: 'daily', time: '20:00' },
    { type: 'weekly-review', label: 'Weekly budget review', frequency: 'weekly', time: '09:00' },
    { type: 'upcoming-bill', label: 'Upcoming bill reminder', frequency: 'weekly', time: '08:00' },
    { type: 'upcoming-subscription', label: 'Subscription renewal alert', frequency: 'weekly', time: '08:00' },
    { type: 'savings-checkin', label: 'Savings goal check-in', frequency: 'weekly', time: '10:00' },
    { type: 'debt-reminder', label: 'Debt repayment reminder', frequency: 'monthly', time: '09:00' },
    { type: 'month-end-review', label: 'End-of-month review', frequency: 'monthly', time: '18:00' },
    { type: 'low-balance', label: 'Low remaining spend alert', frequency: 'daily', time: '12:00' },
    { type: 'overspending', label: 'Overspending category warning', frequency: 'daily', time: '18:00' },
  ];
  return defs.map((d) => ({
    id: `reminder-${d.type}`,
    type: d.type,
    label: d.label,
    enabled: ['daily-spending', 'upcoming-bill', 'low-balance'].includes(d.type),
    frequency: d.frequency,
    time: d.time,
    completedDates: [],
  }));
}

// ─── Default Premium Store ────────────────────────────────────────────────────

export function getDefaultPremiumStore(): PremiumStore {
  return {
    notifications: [],
    notificationPreferences: defaultNotificationPreferences(),
    reminders: defaultReminders(),
    habitCompletions: [],
    healthSnapshots: [],
    lastCheckIn: null,
    checkInStreak: 0,
    insightsDismissed: [],
    installPromptDismissed: false,
    notificationPermissionAsked: false,
  };
}

// ─── Load / Save ──────────────────────────────────────────────────────────────

export function loadPremiumStore(): PremiumStore {
  if (isServer()) return getDefaultPremiumStore();
  try {
    const raw = localStorage.getItem(PREMIUM_KEY);
    if (!raw) return getDefaultPremiumStore();
    const parsed = JSON.parse(raw) as Partial<PremiumStore>;
    const defaults = getDefaultPremiumStore();
    // Merge to handle schema additions
    return {
      ...defaults,
      ...parsed,
      notificationPreferences: {
        ...defaults.notificationPreferences,
        ...(parsed.notificationPreferences ?? {}),
      },
      reminders: parsed.reminders?.length ? parsed.reminders : defaults.reminders,
    };
  } catch {
    return getDefaultPremiumStore();
  }
}

export function savePremiumStore(store: PremiumStore): void {
  if (isServer()) return;
  try {
    localStorage.setItem(PREMIUM_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save premium store', e);
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function getNotifications(): AppNotification[] {
  return loadPremiumStore().notifications.filter((n) => !n.dismissed);
}

export function addNotification(
  n: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'dismissed'>
): AppNotification {
  const store = loadPremiumStore();
  const notification: AppNotification = {
    ...n,
    id: generateId(),
    createdAt: new Date().toISOString(),
    read: false,
    dismissed: false,
  };
  store.notifications = [notification, ...store.notifications].slice(0, 100);
  savePremiumStore(store);
  return notification;
}

export function markNotificationRead(id: string): void {
  const store = loadPremiumStore();
  const n = store.notifications.find((n) => n.id === id);
  if (n) n.read = true;
  savePremiumStore(store);
}

export function markAllNotificationsRead(): void {
  const store = loadPremiumStore();
  store.notifications.forEach((n) => (n.read = true));
  savePremiumStore(store);
}

export function dismissNotification(id: string): void {
  const store = loadPremiumStore();
  const n = store.notifications.find((n) => n.id === id);
  if (n) n.dismissed = true;
  savePremiumStore(store);
}

export function getUnreadCount(): number {
  if (isServer()) return 0;
  return loadPremiumStore().notifications.filter((n) => !n.read && !n.dismissed).length;
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export function updateReminder(reminder: Reminder): void {
  const store = loadPremiumStore();
  const idx = store.reminders.findIndex((r) => r.id === reminder.id);
  if (idx >= 0) store.reminders[idx] = reminder;
  savePremiumStore(store);
}

export function snoozeReminder(id: string, hours: number): void {
  const store = loadPremiumStore();
  const r = store.reminders.find((r) => r.id === id);
  if (r) {
    const until = new Date();
    until.setHours(until.getHours() + hours);
    r.snoozedUntil = until.toISOString();
  }
  savePremiumStore(store);
}

export function completeReminder(id: string): void {
  const store = loadPremiumStore();
  const r = store.reminders.find((r) => r.id === id);
  if (r) {
    const today = new Date().toISOString().split('T')[0];
    if (!r.completedDates.includes(today)) {
      r.completedDates = [...r.completedDates.slice(-30), today];
    }
    r.lastTriggered = new Date().toISOString();
  }
  savePremiumStore(store);
}

// ─── Notification Preferences ────────────────────────────────────────────────

export function getNotificationPreferences(): NotificationPreference {
  return loadPremiumStore().notificationPreferences;
}

export function saveNotificationPreferences(prefs: NotificationPreference): void {
  const store = loadPremiumStore();
  store.notificationPreferences = prefs;
  savePremiumStore(store);
}

// ─── Habit Completions ────────────────────────────────────────────────────────

export function getHabitCompletions(): HabitCompletion[] {
  return loadPremiumStore().habitCompletions;
}

export function addHabitCompletion(habitId: string, note?: string): void {
  const store = loadPremiumStore();
  const today = new Date().toISOString().split('T')[0];
  // Prevent duplicate for same day
  const existing = store.habitCompletions.find(
    (c) => c.habitId === habitId && c.completedAt === today
  );
  if (!existing) {
    store.habitCompletions = [
      ...store.habitCompletions,
      { id: generateId(), habitId, completedAt: today, note },
    ].slice(-365);
  }
  savePremiumStore(store);
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export function performCheckIn(): { streak: number; isFirstToday: boolean } {
  const store = loadPremiumStore();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (store.lastCheckIn === today) {
    return { streak: store.checkInStreak, isFirstToday: false };
  }

  let streak = store.checkInStreak;
  if (store.lastCheckIn === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  store.lastCheckIn = today;
  store.checkInStreak = streak;
  savePremiumStore(store);

  // Also mark the daily-spending habit as complete
  addHabitCompletion('log-daily-spending', 'Daily check-in');

  return { streak, isFirstToday: true };
}

export function getCheckInStatus(): { streak: number; checkedInToday: boolean } {
  if (isServer()) return { streak: 0, checkedInToday: false };
  const store = loadPremiumStore();
  const today = new Date().toISOString().split('T')[0];
  return {
    streak: store.checkInStreak,
    checkedInToday: store.lastCheckIn === today,
  };
}

// ─── Health Snapshots ─────────────────────────────────────────────────────────

export function saveHealthSnapshot(snap: Omit<BudgetHealthSnapshot, 'id'>): void {
  const store = loadPremiumStore();
  const existing = store.healthSnapshots.findIndex((s) => s.date === snap.date);
  const full: BudgetHealthSnapshot = { id: generateId(), ...snap };
  if (existing >= 0) store.healthSnapshots[existing] = full;
  else store.healthSnapshots = [...store.healthSnapshots, full].slice(-24);
  savePremiumStore(store);
}

export function getHealthSnapshots(): BudgetHealthSnapshot[] {
  return loadPremiumStore().healthSnapshots;
}

// ─── Dismissed Insights ──────────────────────────────────────────────────────

export function dismissInsight(id: string): void {
  const store = loadPremiumStore();
  if (!store.insightsDismissed.includes(id)) {
    store.insightsDismissed = [...store.insightsDismissed, id].slice(-200);
  }
  savePremiumStore(store);
}

export function getDismissedInsights(): string[] {
  return loadPremiumStore().insightsDismissed;
}

// ─── Install Prompt ───────────────────────────────────────────────────────────

export function dismissInstallPrompt(): void {
  const store = loadPremiumStore();
  store.installPromptDismissed = true;
  savePremiumStore(store);
}

export function isInstallPromptDismissed(): boolean {
  if (isServer()) return true;
  return loadPremiumStore().installPromptDismissed;
}

export function markNotificationPermissionAsked(): void {
  const store = loadPremiumStore();
  store.notificationPermissionAsked = true;
  savePremiumStore(store);
}

export function hasAskedNotificationPermission(): boolean {
  if (isServer()) return false;
  return loadPremiumStore().notificationPermissionAsked;
}

// ─── Notification type icons ─────────────────────────────────────────────────

export function notifTypeIcon(type: AppNotificationType): string {
  const map: Record<AppNotificationType, string> = {
    reminder: '🔔',
    bill: '🧾',
    subscription: '📱',
    goal: '🎯',
    warning: '⚠️',
    insight: '💡',
    achievement: '🏆',
  };
  return map[type] ?? '🔔';
}
