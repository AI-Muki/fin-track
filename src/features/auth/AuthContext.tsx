import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Currency } from '@/src/types';
import { STORAGE, DEFAULT_USER } from '@/src/lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  currency: Currency;
  theme: 'light' | 'dark';
  isLoading: boolean;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  authMode: 'login' | 'register' | 'forgot_password';
  setAuthMode: (mode: 'login' | 'register' | 'forgot_password') => void;
  setShowAuthModal: (show: boolean) => void;
  setCurrency: (currency: Currency) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    preferredCurrency: Currency
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  completeOnboarding: () => void;
  switchDemoUser: (role: 'founder' | 'freelancer' | 'student') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currency, setCurrencyState] = useState<Currency>('EUR');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('fintrack_theme') as 'light' | 'dark';
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Resolve persistent authentication on startup
  useEffect(() => {
    try {
      const activeId = STORAGE.getActiveUserId();
      if (activeId) {
        const loadedUser = STORAGE.getProfile(activeId);
        setUser(loadedUser);
        setCurrencyState(loadedUser.preferredCurrency || 'EUR');
      } else {
        // Default to demo member for instant usability
        setUser(DEFAULT_USER);
        setCurrencyState(DEFAULT_USER.preferredCurrency);
      }
    } catch {
      setUser(DEFAULT_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fintrack_theme', theme);
  }, [theme]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (user) {
      const updated = { ...user, preferredCurrency: newCurrency };
      setUser(updated);
      STORAGE.saveProfile(updated);
    }
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (user) {
      const updated = { ...user, theme: newTheme };
      setUser(updated);
      STORAGE.saveProfile(updated);
    }
  };

  const login = async (
    email: string,
    password = 'password'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // Smooth UX transition

    const authRes = STORAGE.authenticateUser(email, password);
    if (authRes.user) {
      setUser(authRes.user);
      setCurrencyState(authRes.user.preferredCurrency);
      setShowAuthModal(false);
      setIsLoading(false);
      return { success: true };
    }

    // Fallback support for demo logins without registered credential
    const fallbackUser: UserProfile = {
      ...DEFAULT_USER,
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      displayName: email.split('@')[0],
      preferredCurrency: currency,
      hasCompletedOnboarding: true,
    };
    setUser(fallbackUser);
    STORAGE.saveProfile(fallbackUser);
    STORAGE.setActiveUserId(fallbackUser.id);
    setShowAuthModal(false);
    setIsLoading(false);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    preferredCurrency: Currency
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const regRes = STORAGE.registerUser(name, email, password, preferredCurrency);
    if (!regRes.success) {
      setIsLoading(false);
      return { success: false, error: regRes.message || 'Registration failed' };
    }

    setUser(regRes.user);
    setCurrencyState(preferredCurrency);
    setShowAuthModal(false);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    STORAGE.setActiveUserId(null);
  };

  const completeOnboarding = () => {
    if (!user) return;
    const updated: UserProfile = { ...user, hasCompletedOnboarding: true };
    setUser(updated);
    STORAGE.saveProfile(updated);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    STORAGE.saveProfile(updated);
    if (updates.preferredCurrency) {
      setCurrencyState(updates.preferredCurrency);
    }
    if (updates.theme && (updates.theme === 'light' || updates.theme === 'dark')) {
      setThemeState(updates.theme);
    }
  };

  const resetPassword = async (email: string) => {
    await new Promise((r) => setTimeout(r, 600));
    return STORAGE.resetUserPassword(email);
  };

  const switchDemoUser = (role: 'founder' | 'freelancer' | 'student') => {
    const profiles: Record<'founder' | 'freelancer' | 'student', UserProfile> = {
      founder: {
        id: 'user_founder',
        email: 'founder@fintrack.app',
        displayName: 'Alex Rivers (Tech Founder)',
        preferredCurrency: 'EUR',
        theme: 'light',
        monthlyIncomeTarget: 8000,
        savingsRateTarget: 35,
        notificationsEnabled: true,
        hasCompletedOnboarding: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      freelancer: {
        id: 'user_freelancer',
        email: 'freelancer@fintrack.app',
        displayName: 'Sara Vance (Digital Nomad)',
        preferredCurrency: 'BAM',
        theme: 'dark',
        monthlyIncomeTarget: 3500,
        savingsRateTarget: 20,
        notificationsEnabled: true,
        hasCompletedOnboarding: true,
        createdAt: '2026-02-15T00:00:00Z',
      },
      student: {
        id: 'user_student',
        email: 'student@fintrack.app',
        displayName: 'Leo Miller (University Student)',
        preferredCurrency: 'USD',
        theme: 'light',
        monthlyIncomeTarget: 1800,
        savingsRateTarget: 15,
        notificationsEnabled: false,
        hasCompletedOnboarding: true,
        createdAt: '2026-03-01T00:00:00Z',
      },
    };

    const targetProfile = profiles[role];
    setUser(targetProfile);
    STORAGE.setActiveUserId(targetProfile.id);
    setCurrencyState(targetProfile.preferredCurrency);
    if (targetProfile.theme === 'light' || targetProfile.theme === 'dark') {
      setThemeState(targetProfile.theme);
    }
    STORAGE.saveProfile(targetProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currency,
        theme,
        isLoading,
        isAuthenticated: !!user,
        showAuthModal,
        authMode,
        setAuthMode,
        setShowAuthModal,
        setCurrency,
        setTheme,
        login,
        register,
        logout,
        completeOnboarding,
        updateProfile,
        resetPassword,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
