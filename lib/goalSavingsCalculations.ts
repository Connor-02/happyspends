import type { AppStore } from '@/lib/types';
import type { GoalSavingsInput, GoalSavingsRecommendation } from '@/types/goals';

// ─── Period-to-weekly multipliers ────────────────────────────────────────────
function toWeeklyMultiplier(period: 'weekly' | 'fortnightly' | 'monthly'): number {
  if (period === 'weekly') return 1;
  if (period === 'fortnightly') return 0.5;
  return 12 / 52; // monthly
}

// ─── Weeks between today and a future date ───────────────────────────────────
function weeksUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.max(0, (target.getTime() - now.getTime()) / msPerWeek);
}

// ─── Add weeks to a date and return ISO string ───────────────────────────────
function addWeeksToToday(weeks: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.round(weeks * 7));
  return d.toISOString().split('T')[0];
}

// ─── Core calculation ─────────────────────────────────────────────────────────
export function calculateGoalSavingsRecommendation(
  input: GoalSavingsInput,
): GoalSavingsRecommendation {
  const {
    goalId,
    goalName,
    weeklyIncome,
    weeklyBills,
    weeklySubscriptions,
    weeklyDebtPayments,
    weeklyEssentialSpending,
    weeklyPlannedSavings,
    currentSavedAmount,
    targetAmount,
    targetDate,
  } = input;

  const remainingGoalAmount = Math.max(0, targetAmount - currentSavedAmount);
  const progressPercent =
    targetAmount > 0 ? Math.min(100, Math.round((currentSavedAmount / targetAmount) * 100)) : 0;

  // Already reached the goal
  if (remainingGoalAmount <= 0) {
    return {
      goalId,
      goalName,
      targetAmount,
      currentSavedAmount,
      remainingGoalAmount: 0,
      weeksRemaining: null,
      requiredWeeklySavings: null,
      weeklyAvailableAfterCommitments: 0,
      safeSavingsCapacity: 0,
      suggestedWeeklySavings: 0,
      shortfallPerWeek: 0,
      projectedSavedByTargetDate: null,
      suggestedNewTargetDate: null,
      progressPercent: 100,
      status: 'already-reached',
      statusMessage: "You've already reached this goal. Amazing work!",
      weeklyIncome,
      weeklyBills,
      weeklySubscriptions,
      weeklyDebtPayments,
      weeklyEssentialSpending,
    };
  }

  const weeklyAvailableAfterCommitments =
    weeklyIncome - weeklyBills - weeklySubscriptions - weeklyDebtPayments - weeklyEssentialSpending;

  const safeSavingsCapacity = Math.max(0, weeklyAvailableAfterCommitments * 0.7);
  const suggestedWeeklySavings = Math.min(
    targetDate ? remainingGoalAmount / Math.max(1, weeksUntil(targetDate)) : safeSavingsCapacity,
    safeSavingsCapacity,
  );

  // No target date
  if (!targetDate) {
    const weeksNeeded = safeSavingsCapacity > 0 ? remainingGoalAmount / safeSavingsCapacity : null;
    const suggestedDate = weeksNeeded != null ? addWeeksToToday(weeksNeeded) : null;
    return {
      goalId,
      goalName,
      targetAmount,
      currentSavedAmount,
      remainingGoalAmount,
      weeksRemaining: null,
      requiredWeeklySavings: null,
      weeklyAvailableAfterCommitments,
      safeSavingsCapacity,
      suggestedWeeklySavings: safeSavingsCapacity,
      shortfallPerWeek: 0,
      projectedSavedByTargetDate: null,
      suggestedNewTargetDate: suggestedDate,
      progressPercent,
      status: 'no-date',
      statusMessage:
        safeSavingsCapacity > 0
          ? `No target date set. Saving ${formatWeekly(safeSavingsCapacity)} per week, you could reach this goal ${suggestedDate ? 'by ' + formatDate(suggestedDate) : 'eventually'}.`
          : 'No target date set and your budget is fully committed. Consider reviewing your spending.',
      weeklyIncome,
      weeklyBills,
      weeklySubscriptions,
      weeklyDebtPayments,
      weeklyEssentialSpending,
    };
  }

  const weeksRemaining = weeksUntil(targetDate);
  const requiredWeeklySavings = weeksRemaining > 0 ? remainingGoalAmount / weeksRemaining : remainingGoalAmount;
  const shortfallPerWeek = Math.max(0, requiredWeeklySavings - safeSavingsCapacity);
  const projectedSavedByTargetDate = currentSavedAmount + suggestedWeeklySavings * weeksRemaining;

  // Suggested new target date if goal is too aggressive
  const suggestedNewTargetDate =
    requiredWeeklySavings > weeklyAvailableAfterCommitments && safeSavingsCapacity > 0
      ? addWeeksToToday(remainingGoalAmount / safeSavingsCapacity)
      : null;

  let status: GoalSavingsRecommendation['status'];
  let statusMessage: string;

  if (requiredWeeklySavings <= safeSavingsCapacity) {
    status = 'on-track';
    statusMessage =
      'This goal looks achievable without putting too much pressure on your weekly budget.';
  } else if (requiredWeeklySavings <= weeklyAvailableAfterCommitments) {
    status = 'tight';
    statusMessage =
      'This is possible, but it may leave very little room for unexpected spending.';
  } else {
    status = 'needs-adjusting';
    statusMessage =
      'This goal may be too aggressive. Try extending the date or lowering the target.';
  }

  return {
    goalId,
    goalName,
    targetAmount,
    currentSavedAmount,
    remainingGoalAmount,
    weeksRemaining,
    requiredWeeklySavings,
    weeklyAvailableAfterCommitments,
    safeSavingsCapacity,
    suggestedWeeklySavings,
    shortfallPerWeek,
    projectedSavedByTargetDate,
    suggestedNewTargetDate,
    progressPercent,
    status,
    statusMessage,
    weeklyIncome,
    weeklyBills,
    weeklySubscriptions,
    weeklyDebtPayments,
    weeklyEssentialSpending,
  };
}

// ─── Build inputs from the AppStore for all savings goals ────────────────────
export function buildGoalInputsFromStore(store: AppStore): GoalSavingsInput[] {
  const { categories, goals, settings } = store;
  const mult = toWeeklyMultiplier(settings.budgetPeriod);

  const planned = (type: string) =>
    categories
      .filter((c) => c.type === type)
      .reduce((s, c) => s + c.planned * mult, 0);

  const weeklyIncome = planned('income');
  const weeklyBills = planned('bill');
  const weeklySubscriptions = 0; // subscriptions are stored as 'bill' type in the main store
  const weeklyDebtPayments = planned('debt');
  const weeklyEssentialSpending = planned('expense');
  const weeklyPlannedSavings = planned('saving');

  return goals
    .filter((g) => g.type === 'savings')
    .map((g) => ({
      goalId: g.id,
      goalName: g.name,
      weeklyIncome,
      weeklyBills,
      weeklySubscriptions,
      weeklyDebtPayments,
      weeklyEssentialSpending,
      weeklyPlannedSavings,
      currentSavedAmount: g.currentAmount,
      targetAmount: g.targetAmount,
      targetDate: g.targetDate ?? null,
    }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatWeekly(amount: number): string {
  return '$' + amount.toFixed(0);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
