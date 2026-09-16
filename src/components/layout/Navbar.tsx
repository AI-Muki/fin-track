import React, { useState } from 'react';
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  PieChart,
  Target,
  Repeat,
  Sparkles,
  Sun,
  Moon,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/AuthContext';
import { NotificationCenter } from './NotificationCenter';
import { ProfileModal } from './ProfileModal';
import { CURRENCY_SYMBOLS } from '@/src/lib/currency';
import { Currency } from '@/src/types';

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'budgets'
  | 'goals'
  | 'subscriptions'
  | 'analytics'
  | 'ai';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, currency, setCurrency, theme, setTheme, isAuthenticated, openAuthModal } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'accounts', label: 'Accounts', icon: <Landmark className="w-4 h-4" /> },
    { id: 'budgets', label: 'Budgets', icon: <PieChart className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Repeat className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart className="w-4 h-4" /> },
    {
      id: 'ai',
      label: 'FinTrack AI',
      icon: <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />,
    },
  ];

  const currencies: Currency[] = ['EUR', 'BAM', 'USD', 'GBP', 'CHF', 'CAD'];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onTabChange('dashboard')}
                className="flex items-center gap-2.5 focus:outline-none cursor-pointer group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 group-hover:bg-indigo-700 transition-colors">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                    Fin<span className="text-indigo-600 dark:text-indigo-400">Track</span>
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                    AI Finance SaaS
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Actions: Currency Selector, Notification, Theme, User Profile */}
            <div className="flex items-center gap-2">
              {/* Currency Selector */}
              <div className="relative">
                <select
                  id="currency-switcher-nav"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  title="Switch Display Currency"
                >
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c} ({CURRENCY_SYMBOLS[c]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notification Center */}
              <NotificationCenter />

              {/* Theme toggle */}
              <button
                id="theme-toggle-btn"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User Profile trigger or Sign In */}
              {isAuthenticated ? (
                <button
                  id="user-profile-btn"
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Account Settings"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                    {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {user?.displayName || 'User'}
                  </span>
                </button>
              ) : (
                <button
                  id="navbar-login-btn"
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                >
                  Sign In
                </button>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 lg:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1 bg-white dark:bg-slate-900">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
