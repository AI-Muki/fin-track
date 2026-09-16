import {
  Account,
  Transaction,
  Budget,
  SavingsGoal,
  Subscription,
  Currency,
  VerifiedFinancialMetrics,
  DashboardPeriod,
} from '@/src/types';
import { convertCurrency } from './currency';

/**
 * Calculates deterministic account balance from:
 * initial balance + income - expenses (plus transfers)
 *
 * Credit Card Semantics:
 * For standard asset accounts (bank, cash, savings, other):
 * balance = initialBalance + totalIncome - totalExpenses - transfersOut + transfersIn
 *
 * For credit card accounts:
 * Outstanding balance represents the liability / debt owed.
 * balance = initialBalance + totalExpenses - totalIncome + transfersOut - transfersIn
 * Payments towards the card reduce the outstanding balance.
 */
export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  const initial = account.initialBalance ?? account.balance ?? 0;
  const accountTxs = transactions.filter(
    (t) => t.accountId === account.id || t.toAccountId === account.id
  );

  if (account.type === 'credit_card') {
    let outstanding = initial;
    for (const tx of accountTxs) {
      if (tx.accountId === account.id) {
        if (tx.type === 'expense') outstanding += tx.amount;
        else if (tx.type === 'income') outstanding -= tx.amount;
        else if (tx.type === 'transfer') outstanding += tx.amount;
      }
      if (tx.type === 'transfer' && tx.toAccountId === account.id) {
        // Payment made to credit card reduces debt
        const originCurrency = tx.currency;
        const converted = convertCurrency(tx.amount, originCurrency, account.currency);
        outstanding -= converted;
      }
    }
    return Math.round(outstanding * 100) / 100;
  }

  // Standard asset accounts (bank, cash, savings, other)
  let balance = initial;
  for (const tx of accountTxs) {
    if (tx.accountId === account.id) {
      if (tx.type === 'income') balance += tx.amount;
      else if (tx.type === 'expense') balance -= tx.amount;
      else if (tx.type === 'transfer') balance -= tx.amount;
    }
    if (tx.type === 'transfer' && tx.toAccountId === account.id) {
      const originCurrency = tx.currency;
      const converted = convertCurrency(tx.amount, originCurrency, account.currency);
      balance += converted;
    }
  }
  return Math.round(balance * 100) / 100;
}

/**
 * Generates ISO string bounds for Dashboard time period
 */
export function getPeriodDateRange(
  period: DashboardPeriod,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === 'last_month') {
    const prevMonthDate = new Date(year, month - 1, 1);
    const lastDayPrevMonth = new Date(year, month, 0);
    return {
      startDate: prevMonthDate.toISOString().split('T')[0],
      endDate: lastDayPrevMonth.toISOString().split('T')[0],
      label: 'Last Month',
    };
  }

  if (period === 'last_3_months') {
    const start = new Date(year, month - 2, 1);
    const end = new Date(year, month + 1, 0);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      label: 'Last 3 Months',
    };
  }

  if (period === 'last_6_months') {
    const start = new Date(year, month - 5, 1);
    const end = new Date(year, month + 1, 0);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      label: 'Last 6 Months',
    };
  }

  if (period === 'this_year') {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      label: 'This Year',
    };
  }

  if (period === 'custom' && customStart && customEnd) {
    return {
      startDate: customStart,
      endDate: customEnd,
      label: `${customStart} to ${customEnd}`,
    };
  }

  // Default: this_month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0],
    label: 'This Month',
  };
}

/**
 * Filter transactions deterministically by date period
 */
export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: DashboardPeriod,
  customStart?: string,
  customEnd?: string
): Transaction[] {
  const { startDate, endDate } = getPeriodDateRange(period, customStart, customEnd);
  return transactions.filter((t) => t.date >= startDate && t.date <= endDate);
}

/**
 * Calculates verified financial metrics deterministically.
 * This ensures no AI model ever hallucinates or fabricates financial balances or totals.
 */
export function calculateVerifiedMetrics(
  accounts: Account[],
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  subscriptions: Subscription[],
  preferredCurrency: Currency = 'EUR',
  period: DashboardPeriod = 'this_month',
  customStart?: string,
  customEnd?: string
): VerifiedFinancialMetrics {
  // 1. Calculate deterministic balances for accounts
  const computedAccounts = accounts.map((acc) => ({
    ...acc,
    balance: calculateAccountBalance(acc, transactions),
  }));

  // Calculate Total Net Worth across accounts
  let totalNetWorth = 0;
  for (const acc of computedAccounts) {
    const balanceInPreferred = convertCurrency(acc.balance, acc.currency, preferredCurrency);
    if (acc.type === 'credit_card') {
      // For credit cards, positive balance is outstanding debt -> subtract from net worth
      totalNetWorth -= Math.max(0, balanceInPreferred);
    } else {
      totalNetWorth += balanceInPreferred;
    }
  }

  // 2. Dates setup for current month and previous month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1; // 1-12
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  const prevDate = new Date(currentYear, now.getMonth() - 1, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  // Period filtering bounds
  const { startDate: periodStart, endDate: periodEnd } = getPeriodDateRange(
    period,
    customStart,
    customEnd
  );

  let totalIncomeThisMonth = 0;
  let totalExpensesThisMonth = 0;
  let previousMonthIncome = 0;
  let previousMonthExpenses = 0;

  const categorySpendingMap: Record<string, { amount: number; count: number }> = {};

  for (const tx of transactions) {
    const txAmountInPref = convertCurrency(tx.amount, tx.currency, preferredCurrency);
    const txMonth = tx.date.substring(0, 7);

    // Period-filtered income/expense
    const inPeriod = tx.date >= periodStart && tx.date <= periodEnd;
    if (inPeriod) {
      if (tx.type === 'income') {
        totalIncomeThisMonth += txAmountInPref;
      } else if (tx.type === 'expense') {
        totalExpensesThisMonth += txAmountInPref;

        const cat = tx.category || 'Uncategorized';
        if (!categorySpendingMap[cat]) {
          categorySpendingMap[cat] = { amount: 0, count: 0 };
        }
        categorySpendingMap[cat].amount += txAmountInPref;
        categorySpendingMap[cat].count += 1;
      }
    }

    // Previous month comparison
    if (txMonth === prevMonthStr) {
      if (tx.type === 'income') {
        previousMonthIncome += txAmountInPref;
      } else if (tx.type === 'expense') {
        previousMonthExpenses += txAmountInPref;
      }
    }
  }

  // 3. Net Savings & Savings Rate
  const netSavingsThisMonth = Math.round((totalIncomeThisMonth - totalExpensesThisMonth) * 100) / 100;
  const savingsRateThisMonth =
    totalIncomeThisMonth > 0
      ? Math.max(0, Math.min(100, Math.round(((totalIncomeThisMonth - totalExpensesThisMonth) / totalIncomeThisMonth) * 1000) / 10))
      : 0;

  // 4. Month-over-month percentage changes
  const incomeChangePct =
    previousMonthIncome > 0
      ? Math.round(((totalIncomeThisMonth - previousMonthIncome) / previousMonthIncome) * 1000) / 10
      : totalIncomeThisMonth > 0 ? 100 : 0;

  const expensesChangePct =
    previousMonthExpenses > 0
      ? Math.round(((totalExpensesThisMonth - previousMonthExpenses) / previousMonthExpenses) * 1000) / 10
      : totalExpensesThisMonth > 0 ? 100 : 0;

  // 5. Category breakdown
  const topSpendingCategories = Object.entries(categorySpendingMap)
    .map(([category, { amount, count }]) => {
      const roundedAmount = Math.round(amount * 100) / 100;
      const percentage =
        totalExpensesThisMonth > 0
          ? Math.round((roundedAmount / totalExpensesThisMonth) * 1000) / 10
          : 0;
      return { category, amount: roundedAmount, percentage, count };
    })
    .sort((a, b) => b.amount - a.amount);

  // 6. Budget Adherence with 75%, 90%, 100% warnings
  const budgetAdherence = budgets.map((b) => {
    const budgetAmountInPref = convertCurrency(b.amount, b.currency, preferredCurrency);
    const spentInPref = categorySpendingMap[b.category]?.amount || 0;
    const remaining = Math.round((budgetAmountInPref - spentInPref) * 100) / 100;
    const percentUsed =
      budgetAmountInPref > 0
        ? Math.round((spentInPref / budgetAmountInPref) * 1000) / 10
        : 0;

    let status: 'safe' | 'warning' | 'critical' | 'exceeded' = 'safe';
    if (percentUsed >= 100) {
      status = 'exceeded';
    } else if (percentUsed >= 90) {
      status = 'critical';
    } else if (percentUsed >= 75) {
      status = 'warning';
    }

    return {
      budgetId: b.id,
      category: b.category,
      budgeted: Math.round(budgetAmountInPref * 100) / 100,
      spent: Math.round(spentInPref * 100) / 100,
      remaining,
      percentUsed,
      status,
    };
  });

  // 7. Goals progress and required monthly saving
  const activeGoalsProgress = goals.map((g) => {
    const targetInPref = convertCurrency(g.targetAmount, g.currency, preferredCurrency);
    const currentInPref = convertCurrency(g.currentAmount, g.currency, preferredCurrency);
    const percentAchieved =
      targetInPref > 0
        ? Math.min(100, Math.round((currentInPref / targetInPref) * 1000) / 10)
        : 100;

    // Calculate months remaining to deadline
    const deadlineDate = new Date(g.deadline);
    const monthsRemaining = Math.max(
      1,
      (deadlineDate.getFullYear() - now.getFullYear()) * 12 +
        (deadlineDate.getMonth() - now.getMonth())
    );

    const needed = Math.max(0, targetInPref - currentInPref);
    const requiredMonthlySaving = Math.round((needed / monthsRemaining) * 100) / 100;

    return {
      goalId: g.id,
      name: g.name,
      targetAmount: Math.round(targetInPref * 100) / 100,
      currentAmount: Math.round(currentInPref * 100) / 100,
      percentAchieved,
      percentComplete: percentAchieved,
      monthsRemaining,
      requiredMonthlySaving,
      deadline: g.deadline,
    };
  });

  // 8. Recurring Subscriptions
  let totalRecurringMonthlyCost = 0;
  for (const sub of subscriptions) {
    if (sub.status !== 'active') continue;
    const subCostInPref = convertCurrency(sub.amount, sub.currency, preferredCurrency);
    if (sub.billingCycle === 'yearly') {
      totalRecurringMonthlyCost += subCostInPref / 12;
    } else {
      totalRecurringMonthlyCost += subCostInPref;
    }
  }
  totalRecurringMonthlyCost = Math.round(totalRecurringMonthlyCost * 100) / 100;
  const totalRecurringYearlyCost = Math.round(totalRecurringMonthlyCost * 12 * 100) / 100;

  // 9. Emergency fund runway
  // Liquid cash = checking + savings + cash accounts
  const liquidCash = accounts
    .filter((a) => a.type === 'bank' || a.type === 'savings' || a.type === 'cash')
    .reduce((sum, a) => sum + convertCurrency(a.balance, a.currency, preferredCurrency), 0);

  const baselineExpense = totalExpensesThisMonth > 0 ? totalExpensesThisMonth : 1500;
  const emergencyFundRunwayMonths =
    baselineExpense > 0 ? Math.round((liquidCash / baselineExpense) * 10) / 10 : 0;

  // 10. Financial Health Score (0 to 100)
  // Components:
  // - Savings Rate: 30 pts (20% savings rate = 30 pts)
  // - Budget Discipline: 25 pts (100% of budgets in safe/warning = 25 pts, deducted for critical/exceeded)
  // - Emergency Runway: 25 pts (6+ months = 25 pts, 3 months = 15 pts, 1 month = 5 pts)
  // - Debt / Balance Ratio: 20 pts (credit card balance < 15% of liquid assets = 20 pts)

  let scoreSavings = Math.min(30, (savingsRateThisMonth / 20) * 30);
  let scoreBudget = 25;
  if (budgetAdherence.length > 0) {
    const violatedCount = budgetAdherence.filter((b) => b.status === 'exceeded').length;
    const criticalCount = budgetAdherence.filter((b) => b.status === 'critical').length;
    scoreBudget = Math.max(0, 25 - violatedCount * 10 - criticalCount * 4);
  }

  let scoreRunway = 0;
  if (emergencyFundRunwayMonths >= 6) scoreRunway = 25;
  else if (emergencyFundRunwayMonths >= 3) scoreRunway = 18;
  else if (emergencyFundRunwayMonths >= 1) scoreRunway = 10;
  else scoreRunway = Math.round((emergencyFundRunwayMonths / 1) * 10);

  const creditDebt = accounts
    .filter((a) => a.type === 'credit_card')
    .reduce((sum, a) => sum + Math.max(0, convertCurrency(a.balance, a.currency, preferredCurrency)), 0);

  let scoreDebt = 20;
  if (liquidCash > 0) {
    const debtRatio = creditDebt / liquidCash;
    if (debtRatio > 0.5) scoreDebt = 5;
    else if (debtRatio > 0.2) scoreDebt = 12;
    else scoreDebt = 20;
  } else if (creditDebt > 0) {
    scoreDebt = 5;
  }

  const financialHealthScore = Math.max(
    10,
    Math.min(100, Math.round(scoreSavings + scoreBudget + scoreRunway + scoreDebt))
  );

  return {
    totalNetWorth: Math.round(totalNetWorth * 100) / 100,
    totalIncomeThisMonth: Math.round(totalIncomeThisMonth * 100) / 100,
    totalExpensesThisMonth: Math.round(totalExpensesThisMonth * 100) / 100,
    netSavingsThisMonth,
    savingsRateThisMonth,
    previousMonthIncome: Math.round(previousMonthIncome * 100) / 100,
    previousMonthExpenses: Math.round(previousMonthExpenses * 100) / 100,
    incomeMonthOverMonthChangePct: incomeChangePct,
    expensesMonthOverMonthChangePct: expensesChangePct,
    totalRecurringMonthlyCost,
    totalRecurringYearlyCost,
    emergencyFundRunwayMonths,
    financialHealthScore,
    topSpendingCategories,
    budgetAdherence,
    activeGoalsProgress,
    goalsProgress: activeGoalsProgress,
  };
}
