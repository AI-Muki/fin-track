import {
  Account,
  Transaction,
  Budget,
  SavingsGoal,
  Subscription,
  UserProfile,
  Currency,
} from '@/src/types';

const STORAGE_KEYS = {
  PROFILE: 'fintrack_profile',
  ACCOUNTS: 'fintrack_accounts',
  TRANSACTIONS: 'fintrack_transactions',
  BUDGETS: 'fintrack_budgets',
  GOALS: 'fintrack_goals',
  SUBSCRIPTIONS: 'fintrack_subscriptions',
};

export const DEFAULT_USER: UserProfile = {
  id: 'user_default',
  email: 'mkaramujic80@gmail.com',
  displayName: 'FinTrack Member',
  preferredCurrency: 'EUR',
  theme: 'light',
  monthlyIncomeTarget: 5000,
  savingsRateTarget: 25,
  notificationsEnabled: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Generate dates dynamically relative to current date so charts and month comparisons are always populated
function getRecentDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getMonthString(monthOffset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_1',
    userId: 'user_default',
    name: 'Main Checking Account',
    type: 'bank',
    currency: 'EUR',
    balance: 4850.5,
    accountNumber: 'DE89 3704 0044 0532 0130 00',
    institution: 'Deutsche Bank',
    color: '#0284c7', // Sky
    isDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'acc_2',
    userId: 'user_default',
    name: 'High Yield Savings',
    type: 'savings',
    currency: 'EUR',
    balance: 14200.0,
    accountNumber: 'DE44 5007 0010 0987 6543 21',
    institution: 'ING Diba',
    color: '#10b981', // Emerald
    isDefault: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'acc_3',
    userId: 'user_default',
    name: 'Cash Wallet (Sarajevo)',
    type: 'cash',
    currency: 'BAM',
    balance: 780.0,
    institution: 'Physical Cash',
    color: '#f59e0b', // Amber
    isDefault: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'acc_4',
    userId: 'user_default',
    name: 'Tech & Travel Credit Card',
    type: 'credit_card',
    currency: 'USD',
    balance: 380.25,
    accountNumber: '•••• 4819',
    institution: 'Chase Bank',
    color: '#8b5cf6', // Violet
    isDefault: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'acc_5',
    userId: 'user_default',
    name: 'UK Brokerage Reserve',
    type: 'savings',
    currency: 'GBP',
    balance: 3150.0,
    accountNumber: '•••• 9021',
    institution: 'Barclays UK',
    color: '#06b6d4', // Cyan
    isDefault: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Current month income
  {
    id: 'tx_1',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 4200.0,
    currency: 'EUR',
    type: 'income',
    category: 'Salary',
    merchant: 'Anthropic Technologies / Acquired',
    date: getRecentDate(2),
    notes: 'Monthly engineering retainer',
    tags: ['salary', 'tech'],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'tx_2',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 650.0,
    currency: 'EUR',
    type: 'income',
    category: 'Freelance & Consulting',
    merchant: 'Fintech Advisory GmbH',
    date: getRecentDate(6),
    notes: 'Architecture audit consultation',
    tags: ['consulting'],
    createdAt: '2026-09-03T00:00:00Z',
    updatedAt: '2026-09-03T00:00:00Z',
  },
  // Current month expenses
  {
    id: 'tx_3',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 1150.0,
    currency: 'EUR',
    type: 'expense',
    category: 'Housing & Rent',
    merchant: 'City Real Estate Property',
    date: getRecentDate(12),
    notes: 'Apartment monthly rent',
    tags: ['rent', 'fixed'],
    createdAt: '2026-09-03T00:00:00Z',
    updatedAt: '2026-09-03T00:00:00Z',
  },
  {
    id: 'tx_4',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 184.2,
    currency: 'EUR',
    type: 'expense',
    category: 'Groceries',
    merchant: 'Bio Supermarkt Organic',
    date: getRecentDate(1),
    notes: 'Weekly fresh groceries',
    tags: ['groceries', 'food'],
    createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
  },
  {
    id: 'tx_5',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 92.5,
    currency: 'EUR',
    type: 'expense',
    category: 'Dining & Restaurants',
    merchant: 'Trattoria Bella Vista',
    date: getRecentDate(3),
    notes: 'Dinner with colleagues',
    tags: ['dining'],
    createdAt: '2026-09-08T00:00:00Z',
    updatedAt: '2026-09-08T00:00:00Z',
  },
  {
    id: 'tx_6',
    userId: 'user_default',
    accountId: 'acc_3',
    amount: 140.0,
    currency: 'BAM',
    type: 'expense',
    category: 'Groceries',
    merchant: 'Konzum Supermarket',
    date: getRecentDate(4),
    notes: 'Local produce & goods',
    tags: ['groceries'],
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-07T00:00:00Z',
  },
  {
    id: 'tx_7',
    userId: 'user_default',
    accountId: 'acc_4',
    amount: 120.0,
    currency: 'USD',
    type: 'expense',
    category: 'Software & Tech',
    merchant: 'GitHub & Cloud Services',
    date: getRecentDate(5),
    notes: 'Developer subscriptions',
    tags: ['saas', 'cloud'],
    createdAt: '2026-09-06T00:00:00Z',
    updatedAt: '2026-09-06T00:00:00Z',
  },
  {
    id: 'tx_8',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 68.0,
    currency: 'EUR',
    type: 'expense',
    category: 'Transportation',
    merchant: 'Public Transit Monthly Pass',
    date: getRecentDate(14),
    notes: 'Subway & train commuter pass',
    tags: ['transit'],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'tx_9',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 85.0,
    currency: 'EUR',
    type: 'expense',
    category: 'Health & Fitness',
    merchant: 'Boulder & Fitness Club',
    date: getRecentDate(9),
    notes: 'Gym & climbing gym membership',
    tags: ['fitness'],
    createdAt: '2026-09-05T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  // Previous month data for MoM comparison
  {
    id: 'tx_prev_1',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 4200.0,
    currency: 'EUR',
    type: 'income',
    category: 'Salary',
    merchant: 'Anthropic Technologies / Acquired',
    date: getRecentDate(35),
    notes: 'Previous month engineering retainer',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'tx_prev_2',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 1150.0,
    currency: 'EUR',
    type: 'expense',
    category: 'Housing & Rent',
    merchant: 'City Real Estate Property',
    date: getRecentDate(38),
    notes: 'Previous month rent',
    createdAt: '2026-08-03T00:00:00Z',
    updatedAt: '2026-08-03T00:00:00Z',
  },
  {
    id: 'tx_prev_3',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 420.0,
    currency: 'EUR',
    type: 'expense',
    category: 'Groceries',
    merchant: 'Bio Supermarkt Organic',
    date: getRecentDate(40),
    notes: 'Previous month groceries',
    createdAt: '2026-08-10T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'tx_prev_4',
    userId: 'user_default',
    accountId: 'acc_1',
    amount: 210.0,
    currency: 'EUR',
    type: 'expense',
    category: 'Dining & Restaurants',
    merchant: 'Trattoria Bella Vista',
    date: getRecentDate(42),
    notes: 'Previous month dining',
    createdAt: '2026-08-14T00:00:00Z',
    updatedAt: '2026-08-14T00:00:00Z',
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'bud_1',
    userId: 'user_default',
    category: 'Groceries',
    amount: 450.0,
    currency: 'EUR',
    period: 'monthly',
    alertThresholds: [75, 90, 100],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'bud_2',
    userId: 'user_default',
    category: 'Dining & Restaurants',
    amount: 200.0,
    currency: 'EUR',
    period: 'monthly',
    alertThresholds: [75, 90, 100],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'bud_3',
    userId: 'user_default',
    category: 'Housing & Rent',
    amount: 1200.0,
    currency: 'EUR',
    period: 'monthly',
    alertThresholds: [75, 90, 100],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'bud_4',
    userId: 'user_default',
    category: 'Software & Tech',
    amount: 150.0,
    currency: 'EUR',
    period: 'monthly',
    alertThresholds: [75, 90, 100],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'bud_5',
    userId: 'user_default',
    category: 'Transportation',
    amount: 100.0,
    currency: 'EUR',
    period: 'monthly',
    alertThresholds: [75, 90, 100],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal_1',
    userId: 'user_default',
    name: 'Emergency Fund (6 Months)',
    targetAmount: 15000.0,
    currentAmount: 14200.0,
    currency: 'EUR',
    deadline: '2026-12-31',
    category: 'Emergency',
    color: '#10b981',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'goal_2',
    userId: 'user_default',
    name: 'Electric Vehicle Down Payment',
    targetAmount: 8000.0,
    currentAmount: 4300.0,
    currency: 'EUR',
    deadline: '2027-06-30',
    category: 'Vehicle',
    color: '#3b82f6',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'goal_3',
    userId: 'user_default',
    name: 'Tokyo Autumn Trip',
    targetAmount: 3500.0,
    currentAmount: 1850.0,
    currency: 'EUR',
    deadline: '2026-10-31',
    category: 'Travel',
    color: '#ec4899',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_1',
    userId: 'user_default',
    name: 'Netflix 4K Premium',
    amount: 17.99,
    currency: 'EUR',
    billingCycle: 'monthly',
    category: 'Entertainment',
    nextPaymentDate: getRecentDate(-12),
    status: 'active',
    notes: 'Family streaming profile',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub_2',
    userId: 'user_default',
    name: 'Spotify Duo',
    amount: 14.99,
    currency: 'EUR',
    billingCycle: 'monthly',
    category: 'Entertainment',
    nextPaymentDate: getRecentDate(-5),
    status: 'active',
    notes: 'Music streaming',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub_3',
    userId: 'user_default',
    name: 'GitHub Copilot Enterprise',
    amount: 21.0,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Software & Tech',
    nextPaymentDate: getRecentDate(-18),
    status: 'active',
    notes: 'AI code assistant tool',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub_4',
    userId: 'user_default',
    name: 'Google Workspace & One Storage (2TB)',
    amount: 99.99,
    currency: 'EUR',
    billingCycle: 'yearly',
    category: 'Software & Tech',
    nextPaymentDate: '2026-11-15',
    status: 'active',
    notes: 'Annual cloud backup & domain email',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const STORAGE = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },
  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getAccounts(): Account[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) return INITIAL_ACCOUNTS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  },
  saveAccounts(accounts: Account[]): void {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) return INITIAL_TRANSACTIONS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },
  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getBudgets(): Budget[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) return INITIAL_BUDGETS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  },
  saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  getGoals(): SavingsGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!data) return INITIAL_GOALS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  },
  saveGoals(goals: SavingsGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  getSubscriptions(): Subscription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      if (!data) return INITIAL_SUBSCRIPTIONS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  },
  saveSubscriptions(subscriptions: Subscription[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  },

  resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
  },
};
