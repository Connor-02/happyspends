import type { FinancialHabit, HabitStats, HabitType } from '@/types/premium';
import type { AppStore } from '@/lib/types';
import { getHabitCompletions } from '@/lib/premiumStorage';

// ─── Default Habits ───────────────────────────────────────────────────────────

export const DEFAULT_HABITS: FinancialHabit[] = [
  {
    id: 'log-daily-spending',
    type: 'log-daily-spending',
    label: 'Log daily spending',
    description: 'Add at least one transaction per day to stay on top of your budget.',
    icon: '📝',
    frequency: 'daily',
    enabled: true,
  },
  {
    id: 'review-weekly-budget',
    type: 'review-weekly-budget',
    label: 'Review budget weekly',
    description: 'Check your budget overview every week to catch any surprises.',
    icon: '📊',
    frequency: 'weekly',
    enabled: true,
  },
  {
    id: 'pay-bills-on-time',
    type: 'pay-bills-on-time',
    label: 'Pay bills on time',
    description: 'Log bill payments before or on their due date.',
    icon: '✅',
    frequency: 'monthly',
    enabled: true,
  },
  {
    id: 'add-to-savings',
    type: 'add-to-savings',
    label: 'Add to savings',
    description: 'Make at least one contribution to a savings goal each week.',
    icon: '🐷',
    frequency: 'weekly',
    enabled: true,
  },
  {
    id: 'reduce-spending',
    type: 'reduce-spending',
    label: 'Reduce one category',
    description: 'Spend less in at least one category compared to last period.',
    icon: '📉',
    frequency: 'monthly',
    enabled: true,
  },
  {
    id: 'review-subscriptions',
    type: 'review-subscriptions',
    label: 'Review subscriptions',
    description: 'Check your subscription costs monthly — cancel what you don\'t use.',
    icon: '🔄',
    frequency: 'monthly',
    enabled: true,
  },
];

// ─── Encouragement messages ────────────────────────────────────────────────────

const ENCOURAGE: Record<HabitType, { active: string; inactive: string }> = {
  'log-daily-spending': {
    active: "You're building a great tracking habit! 🔥",
    inactive: 'Start small — just log one purchase today!',
  },
  'review-weekly-budget': {
    active: "Weekly reviews are the secret to staying on track. Keep it up! 📈",
    inactive: 'A quick 2-minute review can save you a lot this month.',
  },
  'pay-bills-on-time': {
    active: 'On-time payments save you fees and stress. Well done! ✅',
    inactive: "Check your upcoming bills — staying ahead feels great.",
  },
  'add-to-savings': {
    active: 'Every contribution brings your goal closer! 🐷',
    inactive: "Even $10 a week adds up fast. Start your saving habit!",
  },
  'reduce-spending': {
    active: "You're finding ways to spend less. That's real progress! 📉",
    inactive: 'Look for one category to trim — coffee, takeaway, subscriptions?',
  },
  'review-subscriptions': {
    active: 'Staying on top of subscriptions keeps your costs lean. 🙌',
    inactive: 'When did you last check if you need all your subscriptions?',
  },
};

// ─── Compute stats for a single habit ─────────────────────────────────────────

export function computeHabitStats(
  habit: FinancialHabit,
  appStore: AppStore
): HabitStats {
  const completions = getHabitCompletions().filter((c) => c.habitId === habit.id);
  const today = new Date().toISOString().split('T')[0];

  // Streak calculation
  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const done = completions.some((c) => c.completedAt === dateStr);
    // For daily: check every day; for weekly: check each week period; for monthly: current month
    if (habit.frequency === 'daily') {
      if (!done) break;
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else if (habit.frequency === 'weekly') {
      // Check if completed in this week block
      const weekStart = getWeekStart(checkDate);
      const weekEnd = getWeekEnd(checkDate);
      const doneThisWeek = completions.some((c) => c.completedAt >= weekStart && c.completedAt <= weekEnd);
      if (!doneThisWeek) break;
      streak++;
      checkDate = new Date(checkDate.getTime() - 7 * 86400000);
    } else {
      // monthly
      const monthStr = checkDate.toISOString().substring(0, 7);
      const doneThisMonth = completions.some((c) => c.completedAt.startsWith(monthStr));
      if (!doneThisMonth) break;
      streak++;
      checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth() - 1, 1);
    }
    if (streak > 365) break;
  }

  // Completion rate last 30 days
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000);
    return d.toISOString().split('T')[0];
  });
  const completedDays = last30.filter((d) => completions.some((c) => c.completedAt === d)).length;
  const targetDays = habit.frequency === 'daily' ? 30 : habit.frequency === 'weekly' ? 4 : 1;
  const completionRate = Math.min(1, completedDays / targetDays);

  // Completed this period
  let completedThisPeriod = false;
  if (habit.frequency === 'daily') {
    completedThisPeriod = completions.some((c) => c.completedAt === today);
  } else if (habit.frequency === 'weekly') {
    const ws = getWeekStart(new Date());
    completedThisPeriod = completions.some((c) => c.completedAt >= ws);
  } else {
    const ms = today.substring(0, 7);
    completedThisPeriod = completions.some((c) => c.completedAt.startsWith(ms));
  }

  const lastCompleted = completions.length > 0
    ? completions.sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0].completedAt
    : undefined;

  // Next action
  const nextActions: Record<HabitType, string> = {
    'log-daily-spending': completedThisPeriod ? 'Come back tomorrow to continue your streak' : 'Log a transaction today',
    'review-weekly-budget': completedThisPeriod ? 'Great work! Review again next week' : 'Open the budget page and review categories',
    'pay-bills-on-time': completedThisPeriod ? 'All bills tracked this month!' : 'Log your bill payments',
    'add-to-savings': completedThisPeriod ? 'Keep saving! Add more next week' : 'Make a savings contribution today',
    'reduce-spending': completedThisPeriod ? 'Great restraint this month!' : 'Find one category to spend less in',
    'review-subscriptions': completedThisPeriod ? 'Subscriptions reviewed — well done!' : 'Check your subscription list',
  };

  const enc = ENCOURAGE[habit.type];
  const encouragement = completedThisPeriod || streak > 0 ? enc.active : enc.inactive;

  return {
    habit,
    currentStreak: streak,
    completionRate,
    lastCompleted,
    completedThisPeriod,
    nextAction: nextActions[habit.type],
    encouragement,
  };
}

// ─── Compute all habit stats ──────────────────────────────────────────────────

export function computeAllHabitStats(appStore: AppStore): HabitStats[] {
  return DEFAULT_HABITS.filter((h) => h.enabled).map((h) =>
    computeHabitStats(h, appStore)
  );
}

// ─── Spending streak (days with at least 1 transaction) ──────────────────────

export function computeSpendingStreak(
  transactions: AppStore['transactions']
): { streak: number; daysThisMonth: number } {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Days this month with at least one transaction
  const monthStart = `${todayStr.substring(0, 7)}-01`;
  const txDays = new Set(
    transactions
      .filter((t) => t.date >= monthStart && t.date <= todayStr)
      .map((t) => t.date)
  );
  const daysThisMonth = txDays.size;

  // Streak: consecutive days backwards from today with at least 1 tx
  let streak = 0;
  let checkDate = new Date(today);
  while (streak < 365) {
    const ds = checkDate.toISOString().split('T')[0];
    const hasTx = transactions.some((t) => t.date === ds);
    if (!hasTx) break;
    streak++;
    checkDate = new Date(checkDate.getTime() - 86400000);
  }

  return { streak, daysThisMonth };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().split('T')[0];
}

function getWeekEnd(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  return d.toISOString().split('T')[0];
}
