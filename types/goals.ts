// ─── Goal Savings Recommendation ─────────────────────────────────────────────

export type GoalSustainabilityStatus = 'on-track' | 'tight' | 'needs-adjusting' | 'no-date' | 'already-reached';

export interface GoalSavingsRecommendation {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentSavedAmount: number;
  remainingGoalAmount: number;
  weeksRemaining: number | null;
  requiredWeeklySavings: number | null;
  weeklyAvailableAfterCommitments: number;
  safeSavingsCapacity: number;
  suggestedWeeklySavings: number;
  shortfallPerWeek: number;
  projectedSavedByTargetDate: number | null;
  suggestedNewTargetDate: string | null;
  progressPercent: number;
  status: GoalSustainabilityStatus;
  statusMessage: string;
  // Math breakdown
  weeklyIncome: number;
  weeklyBills: number;
  weeklySubscriptions: number;
  weeklyDebtPayments: number;
  weeklyEssentialSpending: number;
}

export interface GoalSavingsInput {
  goalId: string;
  goalName: string;
  weeklyIncome: number;
  weeklyBills: number;
  weeklySubscriptions: number;
  weeklyDebtPayments: number;
  weeklyEssentialSpending: number;
  weeklyPlannedSavings: number;
  currentSavedAmount: number;
  targetAmount: number;
  targetDate: string | null;
}
