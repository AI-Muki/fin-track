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
  hasCompletedOnboarding: true,
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

export interface StoredUserCredential {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  preferredCurrency: Currency;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

const DEMO_USER_IDS = ['user_default', 'user_founder', 'user_freelancer', 'user_student'];

export const STORAGE = {
  getActiveUserId(): string | null {
    try {
      return localStorage.getItem('fintrack_active_user_id') || 'user_default';
    } catch {
      return 'user_default';
    }
  },

  setActiveUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem('fintrack_active_user_id', userId);
    } else {
      localStorage.removeItem('fintrack_active_user_id');
    }
  },

  getRegisteredUsers(): StoredUserCredential[] {
    try {
      const data = localStorage.getItem('fintrack_registered_users');
      if (data) {
        return JSON.parse(data);
      }
      // Seed default demo user credentials if missing
      const initialUsers: StoredUserCredential[] = [
        {
          id: 'user_default',
          email: 'mkaramujic80@gmail.com',
          passwordHash: 'demo1234',
          displayName: 'FinTrack Member',
          preferredCurrency: 'EUR',
          hasCompletedOnboarding: true,
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'user_founder',
          email: 'founder@fintrack.app',
          passwordHash: 'founder123',
          displayName: 'Alex Rivers',
          preferredCurrency: 'EUR',
          hasCompletedOnboarding: true,
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'user_freelancer',
          email: 'freelancer@fintrack.app',
          passwordHash: 'freelance123',
          displayName: 'Sara Vance',
          preferredCurrency: 'BAM',
          hasCompletedOnboarding: true,
          createdAt: '2026-02-15T00:00:00Z',
        },
        {
          id: 'user_student',
          email: 'student@fintrack.app',
          passwordHash: 'student123',
          displayName: 'Leo Miller',
          preferredCurrency: 'USD',
          hasCompletedOnboarding: true,
          createdAt: '2026-03-01T00:00:00Z',
        },
      ];
      localStorage.setItem('fintrack_registered_users', JSON.stringify(initialUsers));
      return initialUsers;
    } catch {
      return [];
    }
  },

  findUserByEmail(email: string): StoredUserCredential | undefined {
    const users = this.getRegisteredUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  registerUser(
    name: string,
    email: string,
    passwordHash: string,
    preferredCurrency: Currency
  ): { user: UserProfile; success: boolean; message?: string } {
    const existing = this.findUserByEmail(email);
    if (existing) {
      return {
        user: DEFAULT_USER,
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      };
    }

    const newId = `user_${Date.now()}`;
    const newUserRecord: StoredUserCredential = {
      id: newId,
      email: email.toLowerCase(),
      passwordHash,
      displayName: name,
      preferredCurrency,
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
    };

    const currentUsers = this.getRegisteredUsers();
    currentUsers.push(newUserRecord);
    localStorage.setItem('fintrack_registered_users', JSON.stringify(currentUsers));

    const userProfile: UserProfile = {
      id: newId,
      email: newUserRecord.email,
      displayName: newUserRecord.displayName,
      preferredCurrency: newUserRecord.preferredCurrency,
      theme: 'light',
      monthlyIncomeTarget: 4000,
      savingsRateTarget: 20,
      notificationsEnabled: true,
      hasCompletedOnboarding: false,
      createdAt: newUserRecord.createdAt,
    };

    this.saveProfile(userProfile);
    this.setActiveUserId(newId);

    // Initialize clean isolated stores for the newly registered user (NO cross-account leakage)
    this.saveAccounts([], newId);
    this.saveTransactions([], newId);
    this.saveBudgets([], newId);
    this.saveGoals([], newId);
    this.saveSubscriptions([], newId);

    return { user: userProfile, success: true };
  },

  authenticateUser(email: string, passwordHash: string): { user: UserProfile | null; error?: string } {
    const user = this.findUserByEmail(email);
    if (!user) {
      return { user: null, error: 'No account found with this email address.' };
    }
    if (user.passwordHash !== passwordHash) {
      return { user: null, error: 'Incorrect password. Please try again.' };
    }

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      preferredCurrency: user.preferredCurrency,
      theme: 'light',
      monthlyIncomeTarget: 5000,
      savingsRateTarget: 25,
      notificationsEnabled: true,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      createdAt: user.createdAt,
    };

    this.saveProfile(profile);
    this.setActiveUserId(user.id);
    return { user: profile };
  },

  resetUserPassword(email: string): { success: boolean; message: string } {
    const user = this.findUserByEmail(email);
    if (!user) {
      return {
        success: false,
        message: 'If an account exists with this email, reset instructions will be sent.',
      };
    }
    // Simulation token dispatch
    return {
      success: true,
      message: `Password reset link has been dispatched to ${email}.`,
    };
  },

  getProfile(userId?: string): UserProfile {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    try {
      const data = localStorage.getItem(`fintrack_${targetId}_profile`);
      if (data) return JSON.parse(data);
      // Fallback to registered users record
      const reg = this.getRegisteredUsers().find((u) => u.id === targetId);
      if (reg) {
        return {
          id: reg.id,
          email: reg.email,
          displayName: reg.displayName,
          preferredCurrency: reg.preferredCurrency,
          theme: 'light',
          notificationsEnabled: true,
          hasCompletedOnboarding: reg.hasCompletedOnboarding,
          createdAt: reg.createdAt,
        };
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(`fintrack_${profile.id}_profile`, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));

      // Also update in registered users list
      const users = this.getRegisteredUsers();
      const idx = users.findIndex((u) => u.id === profile.id);
      if (idx !== -1) {
        users[idx].displayName = profile.displayName;
        users[idx].preferredCurrency = profile.preferredCurrency;
        users[idx].hasCompletedOnboarding = profile.hasCompletedOnboarding ?? true;
        localStorage.setItem('fintrack_registered_users', JSON.stringify(users));
      }
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getAccounts(userId?: string): Account[] {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    try {
      const key = `fintrack_${targetId}_accounts`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      // If it's a demo user, initialize demo accounts
      if (DEMO_USER_IDS.includes(targetId)) {
        const seeded = INITIAL_ACCOUNTS.map((a) => ({ ...a, userId: targetId }));
        localStorage.setItem(key, JSON.stringify(seeded));
        return seeded;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveAccounts(accounts: Account[], userId?: string): void {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    localStorage.setItem(`fintrack_${targetId}_accounts`, JSON.stringify(accounts));
  },

  getTransactions(userId?: string): Transaction[] {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    try {
      const key = `fintrack_${targetId}_transactions`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      if (DEMO_USER_IDS.includes(targetId)) {
        const seeded = INITIAL_TRANSACTIONS.map((t) => ({ ...t, userId: targetId }));
        localStorage.setItem(key, JSON.stringify(seeded));
        return seeded;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveTransactions(transactions: Transaction[], userId?: string): void {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    localStorage.setItem(`fintrack_${targetId}_transactions`, JSON.stringify(transactions));
  },

  getBudgets(userId?: string): Budget[] {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    try {
      const key = `fintrack_${targetId}_budgets`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      if (DEMO_USER_IDS.includes(targetId)) {
        const seeded = INITIAL_BUDGETS.map((b) => ({ ...b, userId: targetId }));
        localStorage.setItem(key, JSON.stringify(seeded));
        return seeded;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveBudgets(budgets: Budget[], userId?: string): void {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    localStorage.setItem(`fintrack_${targetId}_budgets`, JSON.stringify(budgets));
  },

  getGoals(userId?: string): SavingsGoal[] {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    try {
      const key = `fintrack_${targetId}_goals`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      if (DEMO_USER_IDS.includes(targetId)) {
        const seeded = INITIAL_GOALS.map((g) => ({ ...g, userId: targetId }));
        localStorage.setItem(key, JSON.stringify(seeded));
        return seeded;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveGoals(goals: SavingsGoal[], userId?: string): void {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    localStorage.setItem(`fintrack_${targetId}_goals`, JSON.stringify(goals));
  },

  getSubscriptions(userId?: string): Subscription[] {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    try {
      const key = `fintrack_${targetId}_subscriptions`;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      if (DEMO_USER_IDS.includes(targetId)) {
        const seeded = INITIAL_SUBSCRIPTIONS.map((s) => ({ ...s, userId: targetId }));
        localStorage.setItem(key, JSON.stringify(seeded));
        return seeded;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveSubscriptions(subscriptions: Subscription[], userId?: string): void {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    localStorage.setItem(`fintrack_${targetId}_subscriptions`, JSON.stringify(subscriptions));
  },

  resetToDemo(userId?: string): void {
    const targetId = userId || this.getActiveUserId() || 'user_default';
    localStorage.removeItem(`fintrack_${targetId}_profile`);
    localStorage.removeItem(`fintrack_${targetId}_accounts`);
    localStorage.removeItem(`fintrack_${targetId}_transactions`);
    localStorage.removeItem(`fintrack_${targetId}_budgets`);
    localStorage.removeItem(`fintrack_${targetId}_goals`);
    localStorage.removeItem(`fintrack_${targetId}_subscriptions`);
  },
};
