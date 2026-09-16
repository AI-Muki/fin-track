import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Currency } from '@/src/types';
import { loginSchema, registerSchema, passwordResetSchema } from '@/src/lib/validations';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnian Convertible Mark' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
    login,
    register,
    resetPassword,
    switchDemoUser,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>('EUR');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setFormErrors({});
    setServerError(null);
    setServerSuccess(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setServerError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const err of validation.error.issues) {
        errors[err.path[0] as string] = err.message;
      }
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setServerError(res.error || 'Invalid credentials');
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setServerError(null);

    const validation = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword: password,
      preferredCurrency,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const err of validation.error.issues) {
        errors[err.path[0] as string] = err.message;
      }
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(name, email, password, preferredCurrency);
      if (!res.success) {
        setServerError(res.error || 'Failed to register account');
      }
    } catch {
      setServerError('Failed to register account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setServerError(null);
    setServerSuccess(null);

    const validation = passwordResetSchema.safeParse({ email });
    if (!validation.success) {
      setFormErrors({ email: validation.error.issues[0]?.message || 'Invalid email' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(email);
      setServerSuccess(res.message);
    } catch {
      setServerError('Unable to dispatch reset instructions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              FT
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                {authMode === 'login' && 'Sign in to FinTrack'}
                {authMode === 'register' && 'Create your Account'}
                {authMode === 'forgot_password' && 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deterministic, verified personal finance
              </p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        {authMode !== 'forgot_password' && (
          <div className="flex border-b border-slate-100 dark:border-slate-800 text-sm font-medium">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setAuthMode('login');
                setServerError(null);
                setFormErrors({});
              }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                authMode === 'login'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => {
                setAuthMode('register');
                setServerError(null);
                setFormErrors({});
              }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                authMode === 'register'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Status Banners */}
          {serverError && (
            <div
              id="auth-error-banner"
              className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {serverSuccess && (
            <div
              id="auth-success-banner"
              className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{serverSuccess}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      formErrors.email
                        ? 'border-rose-300 dark:border-rose-700'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    id="btn-forgot-password"
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      setServerError(null);
                      setFormErrors({});
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="login-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      formErrors.password
                        ? 'border-rose-300 dark:border-rose-700'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.password}</p>
                )}
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin mr-2">⟳</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Quick Logins */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 text-center mb-2.5 font-medium">
                  Or test with instant demo profiles:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoUser('founder');
                      handleClose();
                    }}
                    className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors text-center"
                  >
                    Tech Founder
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoUser('freelancer');
                      handleClose();
                    }}
                    className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors text-center"
                  >
                    Freelancer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoUser('student');
                      handleClose();
                    }}
                    className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors text-center"
                  >
                    Student
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="register-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {formErrors.name && <p className="mt-1 text-xs text-rose-500">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="register-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="register-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Base Currency
                </label>
                <select
                  id="register-currency-select"
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value as Currency)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin mr-2">⟳</span>
                  ) : (
                    <>
                      <span>Create Account & Start Onboarding</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Isolated private database storage per account</span>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot_password' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your account email and we will dispatch a secure recovery link.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="reset-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.email}</p>
                )}
              </div>

              <button
                id="btn-submit-reset"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin mr-2">⟳</span>
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setServerError(null);
                    setServerSuccess(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
