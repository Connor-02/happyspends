import type { AppNotificationType } from '@/types/premium';
import { addNotification, loadPremiumStore, saveHealthSnapshot, getCheckInStatus } from '@/lib/premiumStorage';
import type { AppStore } from '@/lib/types';
import { computeBudgetSummary, computeCategorySummaries, formatCurrency } from '@/lib/calculations';

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  return Notification.permission;
}

export function canSendNotifications(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

// ─── Send browser notification ────────────────────────────────────────────────

export function sendBrowserNotification(
  title: string,
  body: string,
  options?: { tag?: string; icon?: string; url?: string }
): void {
  if (!canSendNotifications()) return;
  try {
    const n = new Notification(title, {
      body,
      icon: options?.icon ?? '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: options?.tag,
    });
    n.onclick = () => {
      window.focus();
      if (options?.url) window.location.href = options.url;
      n.close();
    };
  } catch {
    // Silently fail if notifications are blocked
  }
}

// ─── Is in quiet hours ────────────────────────────────────────────────────────

function isQuietHours(start: string, end: string): boolean {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const nowMin = h * 60 + m;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (startMin <= endMin) return nowMin >= startMin && nowMin < endMin;
  // Overnight quiet hours (e.g. 22:00 to 08:00)
  return nowMin >= startMin || nowMin < endMin;
}

// ─── Run reminder checks ──────────────────────────────────────────────────────

export function runReminderChecks(appStore: AppStore): void {
  if (typeof window === 'undefined') return;

  const premium = loadPremiumStore();
  const prefs = premium.notificationPreferences;
  const today = new Date().toISOString().split('T')[0];
  const quiet = isQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd);
  if (quiet) return;

  const summary = computeBudgetSummary(appStore);
  const categorySummaries = computeCategorySummaries(appStore);
  const sym = appStore.settings.currencySymbol;

  // ── Check-in reminder
  if (prefs.dailyCheckin) {
    const { checkedInToday } = getCheckInStatus();
    if (!checkedInToday) {
      const lastCheckKey = `hs_checkin_notify_${today}`;
      if (!sessionStorage.getItem(lastCheckKey)) {
        sessionStorage.setItem(lastCheckKey, '1');
        const msgs: Record<string, string[]> = {
          gentle: ["How did today's spending go? Take a moment to log it 😊", "Quick check-in: any spending to add today?"],
          direct: ["Log your spending now. Takes 10 seconds.", "Don't forget to track today's spending."],
          motivational: ["Every transaction logged is a step toward your goals! 🚀", "Champion budgeters track every day. You've got this! 💪"],
        };
        const arr = msgs[prefs.tone] ?? msgs.gentle;
        const msg = arr[Math.floor(Math.random() * arr.length)];
        addNotification({
          type: 'reminder',
          title: 'Daily check-in',
          message: msg,
          priority: 'medium',
          actionLink: '/transactions',
        });
        sendBrowserNotification('HappySpends Check-in', msg, { url: '/transactions', tag: 'checkin' });
      }
    }
  }

  // ── Low balance warning
  if (prefs.overspendingAlerts && summary.amountLeftToSpend > 0 && summary.amountLeftToSpend < 50) {
    const key = `hs_lowbal_notify_${today}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      const msg = `You have ${formatCurrency(summary.amountLeftToSpend, sym)} left to spend this period. Take it easy!`;
      addNotification({ type: 'warning', title: 'Low remaining budget', message: msg, priority: 'high', actionLink: '/budget' });
      sendBrowserNotification('⚠️ Low Budget', msg, { url: '/budget', tag: 'lowbal' });
    }
  }

  // ── Overspending category
  if (prefs.overspendingAlerts) {
    const over = categorySummaries.filter(
      (cs) => cs.status === 'over' && cs.category.type === 'expense'
    );
    over.slice(0, 2).forEach((cs) => {
      const key = `hs_over_${cs.category.id}_${today}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        const msg = `${cs.category.name} is over budget — ${formatCurrency(cs.actual, sym)} of ${formatCurrency(cs.category.planned, sym)} planned.`;
        addNotification({ type: 'warning', title: `Over budget: ${cs.category.name}`, message: msg, priority: 'medium', actionLink: '/budget' });
        sendBrowserNotification('⚠️ Over Budget', msg, { url: '/budget', tag: `over-${cs.category.id}` });
      }
    });
  }

  // ── Goal progress
  if (prefs.goalReminders) {
    appStore.goals.filter((g) => g.type === 'savings').forEach((g) => {
      const progress = g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 0;
      const milestones = [0.25, 0.5, 0.75, 1.0];
      milestones.forEach((m) => {
        if (progress >= m) {
          const key = `hs_goal_${g.id}_${Math.round(m * 100)}`;
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, '1');
            const pct = Math.round(m * 100);
            const msg = m >= 1
              ? `🎉 You've reached your goal: ${g.name}!`
              : `You're ${pct}% of the way to your ${g.name} goal. Keep going!`;
            addNotification({ type: m >= 1 ? 'achievement' : 'goal', title: m >= 1 ? `Goal complete: ${g.name} 🎉` : `${pct}% towards ${g.name}`, message: msg, priority: m >= 1 ? 'high' : 'low', actionLink: '/goals' });
            if (m >= 1 || m === 0.5) {
              sendBrowserNotification('🎯 Goal Progress', msg, { url: '/goals', tag: `goal-${g.id}-${pct}` });
            }
          }
        }
      });
    });
  }

  // ── Save health snapshot monthly
  const month = today.substring(0, 7);
  const snapKey = `hs_snap_${month}`;
  if (!sessionStorage.getItem(snapKey)) {
    sessionStorage.setItem(snapKey, '1');
    saveHealthSnapshot({
      date: month,
      healthScore: summary.budgetHealthScore,
      cashFlow: summary.cashFlow,
      totalExpenses: summary.totalExpenses + summary.totalBills,
      totalIncome: summary.totalIncome,
    });
  }
}
