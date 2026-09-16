export type Currency = 'EUR' | 'BAM' | 'USD' | 'GBP' | 'CHF' | 'CAD';

export type AccountType = 'bank' | 'cash' | 'savings' | 'credit_card' | 'other';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  initialBalance?: number;
  description?: string;
  accountNumber?: string;
  institution?: string;
  color?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  amount: number; // Stored in the account's currency
  currency: Currency;
  type: TransactionType;
  category: string;
  merchant: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  currency: Currency;
  period: 'monthly' | 'yearly' | 'custom';
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  month?: string; // YYYY-MM
  alertThresholds?: number[]; // e.g. [75, 90, 100]
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline: string; // YYYY-MM-DD
  category?: string;
  linkedAccountId?: string;
  color?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  category: string;
  accountId?: string;
  nextPaymentDate: string; // YYYY-MM-DD
  status: 'active' | 'paused' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  preferredCurrency: Currency;
  theme: 'light' | 'dark' | 'system';
  avatarUrl?: string;
  monthlyIncomeTarget?: number;
  savingsRateTarget?: number;
  notificationsEnabled: boolean;
  hasCompletedOnboarding?: boolean;
  createdAt: string;
}

export type DashboardPeriod =
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'custom';

export interface VerifiedFinancialMetrics {
  totalNetWorth: number; // Converted to user preferred currency
  totalIncomeThisMonth: number;
  totalExpensesThisMonth: number;
  netSavingsThisMonth: number;
  savingsRateThisMonth: number; // percentage 0-100
  previousMonthIncome: number;
  previousMonthExpenses: number;
  incomeMonthOverMonthChangePct: number;
  expensesMonthOverMonthChangePct: number;
  totalRecurringMonthlyCost: number;
  totalRecurringYearlyCost: number;
  emergencyFundRunwayMonths: number;
  financialHealthScore: number; // 0 - 100
  topSpendingCategories: {
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
  budgetAdherence: {
    budgetId: string;
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    status: 'safe' | 'warning' | 'critical' | 'exceeded';
  }[];
  activeGoalsProgress: {
    goalId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    percentAchieved: number;
    percentComplete?: number;
    monthsRemaining: number;
    requiredMonthlySaving: number;
    deadline?: string;
  }[];
  goalsProgress?: {
    goalId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    percentAchieved: number;
    percentComplete?: number;
    monthsRemaining: number;
    requiredMonthlySaving: number;
    deadline?: string;
  }[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
  }[];
}

export interface DuplicateDetectionResult {
  transaction: Transaction;
  isDuplicate: boolean;
  confidence: number;
  matchedTransactionId?: string;
  reason?: string;
}

export const EXPENSE_CATEGORIES = [
  'Housing & Rent',
  'Food & Dining',
  'Groceries',
  'Transportation & Fuel',
  'Utilities & Bills',
  'Entertainment & Leisure',
  'Healthcare & Medical',
  'Shopping & Retail',
  'Education & Training',
  'Travel & Vacation',
  'Debt & Loans',
  'Subscriptions',
  'Other Expense',
] as const;

export const INCOME_CATEGORIES = [
  'Salary & Wages',
  'Freelance & Consulting',
  'Investments & Dividends',
  'Business Profit',
  'Gifts & Grants',
  'Refunds',
  'Other Income',
] as const;

export const DEFAULT_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, 'Transfer'] as const;

