import type { AppStore, BudgetSummary, CategorySummary } from '@/lib/types';
import type { InsightCard } from '@/types/premium';
import { formatCurrency, computeBudgetSummary, computeCategorySummaries } from '@/lib/calculations';
import { getCheckInStatus, getDismissedInsights, getHealthSnapshots } from '@/lib/premiumStorage';
import { computeSpendingStreak } from '@/lib/habitEngine';

// ─── Generate premium insights ────────────────────────────────────────────────

export function generatePremiumInsights(
  store: AppStore,
  summary: BudgetSummary,
  categorySummaries: CategorySummary[]
): InsightCard[] {
  const sym = store.settings.currencySymbol;
  const today = new Date().toISOString().split('T')[0];
  const dismissed = getDismissedInsights();
  const insights: InsightCard[] = [];

  const push = (card: Omit<InsightCard, 'createdAt' | 'dismissed'>) => {
    if (!dismissed.includes(card.id)) {
      insights.push({ ...card, createdAt: new Date().toISOString(), dismissed: false });
    }
  };

  // ── Check-in nudge
  const { checkedInToday, streak } = getCheckInStatus();
  if (!checkedInToday) {
    push({
      id: 'checkin-nudge',
      type: 'reminder',
      icon: '📝',
      title: "Haven't logged anything today",
      body: `You're on a ${streak}-day streak! Don't break it — log something today.`,
      actionLink: '/transactions',
    });
  }

  // ── Spending streak achievement
  const { streak: spendStreak } = computeSpendingStreak(store.transactions);
  if (spendStreak >= 7) {
    push({
      id: `streak-${spendStreak}`,
      type: 'achievement',
      icon: '🔥',
      title: `${spendStreak}-day tracking streak!`,
      body: "You've been logging every day. That consistency adds up!",
      actionLink: '/tracking',
    });
  }

  // ── Subscription total
  const subCats = store.categories.filter((c) => c.type === 'bill');
  const subTotal = subCats.reduce((s, c) => s + c.planned, 0);
  if (subTotal > 0) {
    push({
      id: 'subscription-total',
      type: 'info',
      icon: '📱',
      title: `Subscriptions & bills: ${formatCurrency(subTotal, sym)}/period`,
      body: `That's ${formatCurrency(subTotal * 12, sym)} per year. Review if all are worth it.`,
      actionLink: '/budget',
    });
  }

  // ── Weekend spending pattern (if more than 4 weekend transactions in recent history)
  const recentTxs = store.transactions.slice(-60);
  const weekendTxs = recentTxs.filter((t) => {
    const day = new Date(t.date).getDay();
    return (day === 0 || day === 6) && t.type === 'expense';
  });
  const weekdayTxs = recentTxs.filter((t) => {
    const day = new Date(t.date).getDay();
    return day !== 0 && day !== 6 && t.type === 'expense';
  });
  const weekendAvg = weekendTxs.length > 0 ? weekendTxs.reduce((s, t) => s + t.amount, 0) / weekendTxs.length : 0;
  const weekdayAvg = weekdayTxs.length > 0 ? weekdayTxs.reduce((s, t) => s + t.amount, 0) / weekdayTxs.length : 0;
  if (weekendAvg > weekdayAvg * 1.3 && weekendTxs.length >= 4) {
    push({
      id: 'weekend-spending',
      type: 'trend',
      icon: '📅',
      title: 'You tend to spend more on weekends',
      body: `Weekend average ${formatCurrency(weekendAvg, sym)} vs ${formatCurrency(weekdayAvg, sym)} on weekdays. Plan ahead!`,
    });
  }

  // ── Savings goal on track
  store.goals.filter((g) => g.type === 'savings' && g.targetAmount > 0).forEach((g) => {
    const progress = g.currentAmount / g.targetAmount;
    if (progress >= 0.5 && progress < 1) {
      push({
        id: `goal-progress-${g.id}`,
        type: 'achievement',
        icon: '🎯',
        title: `${Math.round(progress * 100)}% towards ${g.name}`,
        body: `${formatCurrency(g.targetAmount - g.currentAmount, sym)} to go. You're making great progress!`,
        actionLink: '/goals',
      });
    }
    // Target date estimate
    if (g.targetAmount > 0 && g.currentAmount > 0) {
      const monthlyContribs = store.goalTransactions
        .filter((gt) => gt.goalId === g.id)
        .reduce((s, gt) => s + gt.amount, 0);
      const monthsRunning = Math.max(
        1,
        Math.round(
          (Date.now() - new Date(g.createdAt).getTime()) / (30 * 86400000)
        )
      );
      const monthlyRate = monthlyContribs / monthsRunning;
      if (monthlyRate > 0 && progress < 1) {
        const monthsLeft = Math.ceil((g.targetAmount - g.currentAmount) / monthlyRate);
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + monthsLeft);
        push({
          id: `goal-eta-${g.id}`,
          type: 'info',
          icon: '🏁',
          title: `On track to hit ${g.name} by ${targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
          body: `At your current rate of ${formatCurrency(monthlyRate, sym)}/month, you'll reach your goal.`,
          actionLink: '/goals',
        });
      }
    }
  });

  // ── Groceries trending higher
  const groceryCat = categorySummaries.find(
    (cs) => cs.category.name.toLowerCase().includes('grocer') || cs.category.name.toLowerCase().includes('food')
  );
  if (groceryCat && groceryCat.progress > 0.9 && groceryCat.category.planned > 0) {
    push({
      id: 'groceries-high',
      type: 'warning',
      icon: '🛒',
      title: 'Groceries trending higher than planned',
      body: `You've used ${Math.round(groceryCat.progress * 100)}% of your grocery budget this period.`,
      actionLink: '/budget',
    });
  }

  // ── Unlogged for 3+ days
  const txDates = store.transactions.map((t) => t.date).sort((a, b) => b.localeCompare(a));
  if (txDates.length > 0) {
    const lastTxDate = new Date(txDates[0]);
    const daysSince = Math.floor((Date.now() - lastTxDate.getTime()) / 86400000);
    if (daysSince >= 3) {
      push({
        id: 'unlogged-3days',
        type: 'reminder',
        icon: '👀',
        title: `No spending logged in ${daysSince} days`,
        body: "Have you been spending? Add your recent transactions to stay accurate.",
        actionLink: '/transactions',
      });
    }
  }

  // ── Health snapshot trend
  const snapshots = getHealthSnapshots();
  if (snapshots.length >= 2) {
    const sorted = [...snapshots].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0];
    const prev = sorted[1];
    if (latest.healthScore > prev.healthScore + 10) {
      push({
        id: 'health-improving',
        type: 'achievement',
        icon: '📈',
        title: 'Budget health is improving!',
        body: `Your score went from ${prev.healthScore} to ${latest.healthScore}. Great progress!`,
        actionLink: '/tracking',
      });
    } else if (latest.healthScore < prev.healthScore - 10) {
      push({
        id: 'health-declining',
        type: 'warning',
        icon: '📉',
        title: 'Budget health dropped this period',
        body: `Score went from ${prev.healthScore} to ${latest.healthScore}. Review your spending.`,
        actionLink: '/budget',
      });
    }
  }

  // ── Positive cash flow
  if (summary.cashFlow > 200) {
    push({
      id: 'positive-cashflow',
      type: 'achievement',
      icon: '💚',
      title: `${formatCurrency(summary.cashFlow, sym)} positive cash flow!`,
      body: "You're spending less than you earn. Consider putting the surplus into savings.",
      actionLink: '/goals',
    });
  }

  // ── Debt payoff progress
  store.goals.filter((g) => g.type === 'debt' && g.startingAmount > 0).forEach((g) => {
    const paid = g.startingAmount - g.currentAmount;
    const pct = Math.round((paid / g.startingAmount) * 100);
    if (pct >= 25 && pct % 25 === 0) {
      push({
        id: `debt-${g.id}-${pct}`,
        type: 'achievement',
        icon: '💪',
        title: `${pct}% of ${g.name} paid off!`,
        body: `You've paid down ${formatCurrency(paid, sym)} so far. Keep chipping away!`,
        actionLink: '/goals',
      });
    }
  });

  return insights.slice(0, 8);
}
