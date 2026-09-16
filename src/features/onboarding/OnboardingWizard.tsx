import React, { useState } from 'react';
import { useAuth } from '@/src/features/auth/AuthContext';
import { useData } from '@/src/features/data/DataContext';
import { Currency, AccountType, EXPENSE_CATEGORIES } from '@/src/types';
import {
  Wallet,
  Landmark,
  CreditCard,
  PiggyBank,
  CircleDollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Target,
  DollarSign,
} from 'lucide-react';

const SUPPORTED_CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: 'EUR', symbol: '€', label: 'EUR - European Euro' },
  { code: 'USD', symbol: '$', label: 'USD - United States Dollar' },
  { code: 'BAM', symbol: 'KM', label: 'BAM - Bosnian Convertible Mark' },
  { code: 'GBP', symbol: '£', label: 'GBP - British Pound' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF - Swiss Franc' },
  { code: 'CAD', symbol: 'C$', label: 'CAD - Canadian Dollar' },
];

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: any; desc: string }[] = [
  {
    type: 'bank',
    label: 'Bank Account',
    icon: Landmark,
    desc: 'Primary checking or operating checking account',
  },
  {
    type: 'cash',
    label: 'Physical Cash',
    icon: Wallet,
    desc: 'Physical wallet, cash in hand, or petty cash',
  },
  {
    type: 'credit_card',
    label: 'Credit Card',
    icon: CreditCard,
    desc: 'Credit card liability / revolving credit balance',
  },
  {
    type: 'savings',
    label: 'Savings Account',
    icon: PiggyBank,
    desc: 'Emergency reserve or interest-bearing savings',
  },
  {
    type: 'other',
    label: 'Other Asset',
    icon: CircleDollarSign,
    desc: 'Brokerage, voucher, or miscellaneous account',
  },
];

export const OnboardingWizard: React.FC = () => {
  const { user, currency, setCurrency, completeOnboarding } = useAuth();
  const { addAccount, addBudget, addGoal } = useData();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Currency
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency || 'EUR');

  // Step 2: First Account
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [accountName, setAccountName] = useState('Main Checking Account');
  const [initialBalance, setInitialBalance] = useState<number>(2500);

  // Step 3: Optional Setup (Budget & Goal)
  const [enableBudget, setEnableBudget] = useState(true);
  const [budgetCategory, setBudgetCategory] = useState<string>('Food & Dining');
  const [budgetAmount, setBudgetAmount] = useState<number>(450);

  const [enableGoal, setEnableGoal] = useState(true);
  const [goalName, setGoalName] = useState('Emergency Reserve');
  const [goalTarget, setGoalTarget] = useState<number>(5000);
  const [goalInitial, setGoalInitial] = useState<number>(500);

  // Only show if user is logged in and hasn't finished onboarding
  if (!user || user.hasCompletedOnboarding) return null;

  const handleStep1Next = () => {
    setCurrency(selectedCurrency);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!accountName.trim()) return;
    setStep(3);
  };

  const handleFinishOnboarding = () => {
    // 1. Create first account with initial balance
    addAccount({
      name: accountName.trim() || 'Main Account',
      type: accountType,
      currency: selectedCurrency,
      initialBalance: Number(initialBalance) || 0,
      balance: Number(initialBalance) || 0,
      description: 'Created during onboarding setup',
    });

    // 2. Create budget if requested
    if (enableBudget && budgetAmount > 0) {
      addBudget({
        category: budgetCategory,
        amount: Number(budgetAmount),
        currency: selectedCurrency,
        period: 'monthly',
      });
    }

    // 3. Create savings goal if requested
    if (enableGoal && goalTarget > 0) {
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + 12);
      addGoal({
        name: goalName,
        targetAmount: Number(goalTarget),
        currentAmount: Number(goalInitial) || 0,
        currency: selectedCurrency,
        deadline: deadline.toISOString().split('T')[0],
        category: 'Savings',
        description: 'Starter savings goal configured during setup',
      });
    }

    // 4. Mark onboarding as complete and open dashboard
    completeOnboarding();
  };

  return (
    <div
      id="onboarding-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        id="onboarding-modal-card"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Progress Bar */}
        <div className="bg-slate-100 dark:bg-slate-800 h-1.5 w-full">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-2 text-center border-b border-slate-100 dark:border-slate-800">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            Step {step} of 3: Fast Onboarding
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {step === 1 && `Welcome to FinTrack, ${user.displayName || 'there'}!`}
            {step === 2 && 'Set up your first financial account'}
            {step === 3 && 'Tailor your initial budget & goals'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {step === 1 &&
              'Choose your primary reporting currency. All multi-currency transactions will convert automatically.'}
            {step === 2 &&
              'Balances are computed deterministically from your initial balance plus all ledger transactions.'}
            {step === 3 &&
              'Optional: configure a monthly spending ceiling and a savings target to begin monitoring immediately.'}
          </p>
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: CURRENCY */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Base Currency
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUPPORTED_CURRENCIES.map((cur) => {
                  const isSelected = selectedCurrency === cur.code;
                  return (
                    <button
                      key={cur.code}
                      id={`onboarding-currency-${cur.code.toLowerCase()}`}
                      type="button"
                      onClick={() => setSelectedCurrency(cur.code)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-900 dark:text-white">
                          {cur.symbol}
                        </span>
                        <div>
                          <div className="font-semibold text-sm">{cur.code}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{cur.label}</div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: FIRST ACCOUNT */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACCOUNT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = accountType === t.type;
                    return (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => {
                          setAccountType(t.type);
                          if (t.type === 'credit_card') {
                            setAccountName('Primary Credit Card');
                          } else if (t.type === 'cash') {
                            setAccountName('Physical Wallet');
                          } else if (t.type === 'savings') {
                            setAccountName('High Yield Savings');
                          } else {
                            setAccountName('Main Checking Account');
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mt-0.5 shrink-0 ${
                            isSelected ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <div className="font-semibold text-xs">{t.label}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                            {t.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Label / Name
                </label>
                <input
                  id="onboarding-account-name"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g., UniCredit Checking"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Starting Balance ({selectedCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium text-sm">
                    {selectedCurrency}
                  </span>
                  <input
                    id="onboarding-account-balance"
                    type="number"
                    step="any"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {accountType === 'credit_card'
                    ? 'Note: For credit cards, enter current outstanding balance (amount owed).'
                    : 'Future transactions will mathematically adjust this balance deterministically.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: OPTIONAL BUDGET & GOAL */}
          {step === 3 && (
            <div className="space-y-4">
              {/* First Budget */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      Initial Monthly Category Budget
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableBudget}
                      onChange={(e) => setEnableBudget(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {enableBudget && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={budgetCategory}
                        onChange={(e) => setBudgetCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                        Monthly Limit ({selectedCurrency})
                      </label>
                      <input
                        type="number"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Savings Goal */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <PiggyBank className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      Initial Savings Goal
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGoal}
                      onChange={(e) => setEnableGoal(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {enableGoal && (
                  <div className="space-y-2.5 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                        Goal Name
                      </label>
                      <input
                        type="text"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                          Target Amount
                        </label>
                        <input
                          type="number"
                          value={goalTarget}
                          onChange={(e) => setGoalTarget(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                          Current Saved
                        </label>
                        <input
                          type="number"
                          value={goalInitial}
                          onChange={(e) => setGoalInitial(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          {step > 1 ? (
            <button
              id="onboarding-back-btn"
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              id="onboarding-step1-next"
              type="button"
              onClick={handleStep1Next}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
            >
              <span>Continue to Account Setup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 2 && (
            <button
              id="onboarding-step2-next"
              type="button"
              onClick={handleStep2Next}
              disabled={!accountName.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm disabled:opacity-50"
            >
              <span>Continue to Goals & Budget</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 3 && (
            <button
              id="onboarding-complete-btn"
              type="button"
              onClick={handleFinishOnboarding}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
            >
              <span>Complete Setup & Launch Dashboard</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
