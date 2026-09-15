import React, { useState } from 'react';
import { AuthProvider } from '@/src/features/auth/AuthContext';
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
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'budgets' && <BudgetsView />}
        {activeTab === 'goals' && <GoalsView />}
        {activeTab === 'subscriptions' && <SubscriptionsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'ai' && <AiAssistantView />}
      </main>

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
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Prompt-Injection Hardened
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
