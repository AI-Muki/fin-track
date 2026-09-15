export type Currency = 'EUR' | 'BAM' | 'USD' | 'GBP' | 'CHF';

export type AccountType = 'bank' | 'cash' | 'savings' | 'credit_card';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
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
  period: 'monthly' | 'yearly';
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
  color?: string;
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
  createdAt: string;
}

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
