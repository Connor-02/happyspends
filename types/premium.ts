// ─── Reminder ────────────────────────────────────────────────────────────────

export type ReminderType =
  | 'daily-spending'
  | 'weekly-review'
  | 'upcoming-bill'
  | 'upcoming-subscription'
  | 'savings-checkin'
  | 'debt-reminder'
  | 'month-end-review'
  | 'low-balance'
  | 'overspending';

export type ReminderFrequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly';
export type ReminderTone = 'gentle' | 'direct' | 'motivational';

export interface Reminder {
  id: string;
  type: ReminderType;
  label: string;
  enabled: boolean;
  frequency: ReminderFrequency;
  time: string; // HH:MM
  snoozedUntil?: string; // ISO date
  lastTriggered?: string; // ISO date
  completedDates: string[]; // ISO dates YYYY-MM-DD
}

// ─── Notification Preferences ────────────────────────────────────────────────

export interface NotificationPreference {
  pushEnabled: boolean;
  dailyCheckin: boolean;
  weeklyReview: boolean;
  billReminders: boolean;
  subscriptionReminders: boolean;
  goalReminders: boolean;
  overspendingAlerts: boolean;
  quietHoursStart: string; // HH:MM
  quietHoursEnd: string; // HH:MM
  tone: ReminderTone;
  checkInTime: string; // HH:MM
}

// ─── App Notification ─────────────────────────────────────────────────────────

export type AppNotificationType =
  | 'reminder'
  | 'bill'
  | 'subscription'
  | 'goal'
  | 'warning'
  | 'insight'
  | 'achievement';

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string; // ISO
  read: boolean;
  actionLink?: string;
  dismissed: boolean;
}

// ─── Financial Habits ────────────────────────────────────────────────────────

export type HabitType =
  | 'log-daily-spending'
  | 'review-weekly-budget'
  | 'pay-bills-on-time'
  | 'add-to-savings'
  | 'reduce-spending'
  | 'review-subscriptions';

export interface FinancialHabit {
  id: string;
  type: HabitType;
  label: string;
  description: string;
  icon: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string; // ISO date YYYY-MM-DD
  note?: string;
}

export interface HabitStats {
  habit: FinancialHabit;
  currentStreak: number;
  completionRate: number; // 0-1 over last 30 days
  lastCompleted?: string; // ISO date
  completedThisPeriod: boolean;
  nextAction: string;
  encouragement: string;
}

// ─── Budget Health Snapshot ───────────────────────────────────────────────────

export interface BudgetHealthSnapshot {
  id: string;
  date: string; // YYYY-MM
  healthScore: number;
  cashFlow: number;
  totalExpenses: number;
  totalIncome: number;
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

export interface InsightCard {
  id: string;
  type: 'tip' | 'warning' | 'achievement' | 'trend' | 'reminder' | 'info';
  title: string;
  body: string;
  icon: string;
  actionLink?: string;
  createdAt: string;
  dismissed: boolean;
}

// ─── Premium Store ────────────────────────────────────────────────────────────

export interface PremiumStore {
  notifications: AppNotification[];
  notificationPreferences: NotificationPreference;
  reminders: Reminder[];
  habitCompletions: HabitCompletion[];
  healthSnapshots: BudgetHealthSnapshot[];
  lastCheckIn: string | null; // ISO date YYYY-MM-DD
  checkInStreak: number;
  insightsDismissed: string[];
  installPromptDismissed: boolean;
  notificationPermissionAsked: boolean;
}
