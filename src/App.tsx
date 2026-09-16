import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/src/features/auth/AuthContext';
import { DataProvider } from '@/src/features/data/DataContext';
import { Navbar, NavTab } from '@/src/components/layout/Navbar';
import { DashboardView } from '@/src/features/dashboard/DashboardView';
import { TransactionsView } from '@/src/features/transactions/TransactionsView';
import { AccountsView } from '@/src/features/accounts/AccountsView';
import { BudgetsView } from '@/src/features/budgets/BudgetsView';
import { GoalsView } from '@/src/features/goals/GoalsView';
import { SubscriptionsView } from '@/src/features/subscriptions/SubscriptionsView';
import { AnalyticsView } from '@/src/features/analytics/AnalyticsView';
import { AiAssistantView } from '@/src/features/ai-assistant/AiAssistantView';
import { AuthModal } from '@/src/features/auth/AuthModal';
import { OnboardingWizard } from '@/src/features/onboarding/OnboardingWizard';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Wallet, Sparkles } from 'lucide-react';

function AppContent() {
  const { isLoading, isAuthenticated, user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse mb-4">
          <Wallet className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Loading FinTrack...
        </div>
        <p className="text-xs text-slate-400 mt-1">Verifying encrypted local session</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                FinTrack Finance Workspace
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Sign in to access your isolated multi-currency accounts, deterministic ledger calculations, and AI financial advisor.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="landing-signin-btn"
                onClick={() => openAuthModal('login')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-600/20"
              >
                Sign In to Account
              </button>
              <button
                id="landing-register-btn"
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all"
              >
                Create New Account
              </button>
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Per-User Isolation
                </span>
                <span className="text-[11px] text-slate-400">
                  Data strictly sequestered by tenant ID
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Deterministic Logic
                </span>
                <span className="text-[11px] text-slate-400">
                  Verified math for balances & budgets
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
            {activeTab === 'transactions' && <TransactionsView />}
            {activeTab === 'accounts' && <AccountsView />}
            {activeTab === 'budgets' && <BudgetsView />}
            {activeTab === 'goals' && <GoalsView />}
            {activeTab === 'subscriptions' && <SubscriptionsView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'ai' && <AiAssistantView />}
          </>
        )}
      </main>

      {/* Global Auth Modal & Onboarding Wizard */}
      <AuthModal />
      <OnboardingWizard />

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">FinTrack</span>
            <span>•</span>
            <span>AI-Powered Personal Finance SaaS</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic Ledger Calculations
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Tenant Isolated & Injection Hardened
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
