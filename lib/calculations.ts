import type {
  AppStore,
  BudgetSummary,
  CategorySummary,
  Transaction,
  Category,
} from './types';

// ─── Budget Summary ────────────────────────────────────────────────────────────
export function computeBudgetSummary(store: AppStore): BudgetSummary {
  const { categories, transactions, settings } = store;

  const actual = (type: Category['type']) =>
    transactions
      .filter((t) => t.type === type)
      .reduce((s, t) => s + t.amount, 0);

  const planned = (type: Category['type']) =>
    categories
      .filter((c) => c.type === type)
      .reduce((s, c) => s + c.planned, 0);

  const totalIncome = actual('income');
  const totalExpenses = actual('expense');
  const totalBills = actual('bill');
  const totalSavings = actual('saving');
  const totalDebt = actual('debt');

  const plannedIncome = planned('income');
  const plannedExpenses = planned('expense');
  const plannedBills = planned('bill');
  const plannedSavings = planned('saving');
  const plannedDebt = planned('debt');

  const rollover = settings.rollover ?? 0;

  const cashFlow =
    totalIncome + rollover - totalExpenses - totalBills - totalSavings - totalDebt;

  const amountLeftToSpend =
    totalIncome + rollover - totalExpenses - totalBills - totalSavings - totalDebt;

  // Budget health score (0-100)
  // Perfect score = actuals match or under planned for outgoings, and income at or above planned
  const outgoingPlanned = plannedExpenses + plannedBills + plannedSavings + plannedDebt;
  const outgoingActual = totalExpenses + totalBills + totalSavings + totalDebt;

  let healthScore = 100;
  if (outgoingPlanned > 0) {
    const ratio = outgoingActual / outgoingPlanned;
    if (ratio > 1) healthScore = Math.max(0, Math.round(100 - (ratio - 1) * 100));
    else healthScore = Math.min(100, Math.round(100 - Math.abs(1 - ratio) * 20));
  }
  if (plannedIncome > 0 && totalIncome < plannedIncome) {
    healthScore = Math.max(0, healthScore - 10);
  }

  return {
    totalIncome,
    totalExpenses,
    totalBills,
    totalSavings,
    totalDebt,
    cashFlow,
    amountLeftToSpend,
    budgetHealthScore: healthScore,
    plannedIncome,
    plannedExpenses,
    plannedBills,
    plannedSavings,
    plannedDebt,
  };
}

// ─── Category Summaries ───────────────────────────────────────────────────────
export function computeCategorySummaries(store: AppStore): CategorySummary[] {
  const { categories, transactions } = store;

  return categories.map((cat) => {
    const actual = transactions
      .filter((t) => t.categoryId === cat.id)
      .reduce((s, t) => s + t.amount, 0);

    const progress = cat.planned > 0 ? actual / cat.planned : actual > 0 ? 1 : 0;

    let status: CategorySummary['status'];
    if (progress >= 1) status = 'over';
    else if (progress >= 0.8) status = 'warning';
    else status = 'good';

    // For income, inverse: if actual >= planned, it's good
    if (cat.type === 'income') {
      status = actual >= cat.planned ? 'good' : progress >= 0.8 ? 'warning' : 'over';
    }

    return { category: cat, actual, progress, status };
  });
}

// ─── Monthly Cash Flow (last 6 periods) ───────────────────────────────────────
export function computeMonthlyCashFlow(
  transactions: Transaction[]
): { month: string; income: number; expenses: number; net: number }[] {
  const map = new Map<
    string,
    { income: number; expenses: number }
  >();

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = map.get(key) ?? { income: 0, expenses: 0 };
    if (t.type === 'income') entry.income += t.amount;
    else entry.expenses += t.amount;
    map.set(key, entry);
  });

  const sorted = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, { income, expenses }]) => ({
      month: new Date(month + '-01').toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      }),
      income,
      expenses,
      net: income - expenses,
    }));

  return sorted;
}

// ─── Allocation data for pie/donut chart ─────────────────────────────────────
export function computeAllocation(
  summary: BudgetSummary
): { name: string; value: number; color: string }[] {
  return [
    { name: 'Expenses', value: summary.totalExpenses, color: '#f472b6' },
    { name: 'Bills', value: summary.totalBills, color: '#a78bfa' },
    { name: 'Savings', value: summary.totalSavings, color: '#34d399' },
    { name: 'Debt', value: summary.totalDebt, color: '#fb923c' },
  ].filter((d) => d.value > 0);
}

// ─── Format currency ──────────────────────────────────────────────────────────
export function formatCurrency(
  amount: number,
  symbol = '$',
  decimals = 2
): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

// ─── Insights ─────────────────────────────────────────────────────────────────
export function generateInsights(
  store: AppStore,
  summary: BudgetSummary,
  categorySummaries: CategorySummary[]
): { id: string; type: 'warning' | 'success' | 'info'; title: string; body: string }[] {
  const insights: { id: string; type: 'warning' | 'success' | 'info'; title: string; body: string }[] = [];
  const sym = store.settings.currencySymbol;

  // Over-budget categories
  const overBudget = categorySummaries.filter(
    (cs) => cs.status === 'over' && cs.category.type !== 'income'
  );
  overBudget.forEach((cs) => {
    insights.push({
      id: `over-${cs.category.id}`,
      type: 'warning',
      title: `Over budget: ${cs.category.name}`,
      body: `You've spent ${formatCurrency(cs.actual, sym)} of your ${formatCurrency(cs.category.planned, sym)} budget.`,
    });
  });

  // Amount left to spend
  if (summary.amountLeftToSpend > 0) {
    insights.push({
      id: 'left-to-spend',
      type: 'success',
      title: `${formatCurrency(summary.amountLeftToSpend, sym)} left to spend`,
      body: "You're on track this period. Keep it up!",
    });
  } else if (summary.amountLeftToSpend < 0) {
    insights.push({
      id: 'overspent',
      type: 'warning',
      title: 'You have overspent this period',
      body: `You're ${formatCurrency(Math.abs(summary.amountLeftToSpend), sym)} over your available balance.`,
    });
  }

  // Highest spending category
  const expenseSummaries = categorySummaries.filter(
    (cs) => cs.category.type === 'expense' && cs.actual > 0
  );
  if (expenseSummaries.length > 0) {
    const top = expenseSummaries.reduce((a, b) =>
      a.actual > b.actual ? a : b
    );
    insights.push({
      id: 'top-category',
      type: 'info',
      title: `Top spending: ${top.category.name}`,
      body: `${formatCurrency(top.actual, sym)} spent — ${Math.round(top.progress * 100)}% of budget used.`,
    });
  }

  // Good savings
  if (summary.totalSavings > 0) {
    insights.push({
      id: 'savings-good',
      type: 'success',
      title: 'Great savings habit!',
      body: `You've saved ${formatCurrency(summary.totalSavings, sym)} this period.`,
    });
  }

  // Cash flow trend
  if (summary.cashFlow > 0) {
    insights.push({
      id: 'cashflow-positive',
      type: 'success',
      title: 'Positive cash flow',
      body: `Your cash flow is +${formatCurrency(summary.cashFlow, sym)} this period.`,
    });
  } else if (summary.cashFlow < 0) {
    insights.push({
      id: 'cashflow-negative',
      type: 'warning',
      title: 'Negative cash flow',
      body: `Your cash flow is ${formatCurrency(summary.cashFlow, sym)} this period.`,
    });
  }

  return insights;
}
