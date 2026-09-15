import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Currency } from '@/src/types';
import { STORAGE, DEFAULT_USER } from '@/src/lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  currency: Currency;
  theme: 'light' | 'dark';
  setCurrency: (currency: Currency) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  login: (email: string, displayName?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  switchDemoUser: (role: 'founder' | 'freelancer' | 'student') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => STORAGE.getProfile());
  const [currency, setCurrencyState] = useState<Currency>(() => user?.preferredCurrency || 'EUR');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('fintrack_theme') as 'light' | 'dark';
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

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

  const login = (email: string, displayName?: string) => {
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      email,
      displayName: displayName || email.split('@')[0],
      preferredCurrency: currency,
    };
    setUser(newUser);
    STORAGE.saveProfile(newUser);
  };

  const logout = () => {
    setUser(null);
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
    // Simulated secure password reset workflow
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${email}.`,
    };
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
        createdAt: '2026-03-01T00:00:00Z',
      },
    };

    const targetProfile = profiles[role];
    setUser(targetProfile);
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
        setCurrency,
        setTheme,
        login,
        logout,
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
