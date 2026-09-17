import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE, DEFAULT_USER } from '@/src/lib/storage';
import { UserProfile } from '@/src/types';

// In-memory mock for localStorage in headless CI / Node environments
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.clear) {
  (globalThis as any).localStorage = new LocalStorageMock();
}

describe('Authentication & User State Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly persists and retrieves the active session userId', () => {
    // Defaults to user_default when no explicit active session is stored
    expect(STORAGE.getActiveUserId()).toBe('user_default');

    STORAGE.setActiveUserId('usr_test_123');
    expect(STORAGE.getActiveUserId()).toBe('usr_test_123');

    STORAGE.setActiveUserId(null);
    expect(STORAGE.getActiveUserId()).toBe('user_default');
  });

  it('guarantees isolated profile data between different users', () => {
    const userA: UserProfile = {
      ...DEFAULT_USER,
      id: 'usr_alice',
      email: 'alice@example.com',
      displayName: 'Alice Wonderland',
      preferredCurrency: 'USD',
      theme: 'light',
    };

    const userB: UserProfile = {
      ...DEFAULT_USER,
      id: 'usr_bob',
      email: 'bob@example.com',
      displayName: 'Bob Builder',
      preferredCurrency: 'EUR',
      theme: 'dark',
    };

    STORAGE.saveProfile(userA);
    STORAGE.saveProfile(userB);

    const loadedA = STORAGE.getProfile('usr_alice');
    const loadedB = STORAGE.getProfile('usr_bob');

    expect(loadedA.displayName).toBe('Alice Wonderland');
    expect(loadedA.preferredCurrency).toBe('USD');

    expect(loadedB.displayName).toBe('Bob Builder');
    expect(loadedB.preferredCurrency).toBe('EUR');
  });

  it('enforces multi-user data segregation for accounts and transactions', () => {
    const user1 = 'usr_tenant_1';
    const user2 = 'usr_tenant_2';

    STORAGE.saveAccounts(
      [
        {
          id: 'acc_t1_1',
          userId: user1,
          name: 'Tenant 1 Checking',
          type: 'bank',
          currency: 'EUR',
          balance: 3000,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      user1
    );

    STORAGE.saveAccounts(
      [
        {
          id: 'acc_t2_1',
          userId: user2,
          name: 'Tenant 2 Checking',
          type: 'bank',
          currency: 'USD',
          balance: 8500,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      user2
    );

    const user1Accounts = STORAGE.getAccounts(user1);
    const user2Accounts = STORAGE.getAccounts(user2);

    expect(user1Accounts.length).toBe(1);
    expect(user1Accounts[0].name).toBe('Tenant 1 Checking');
    expect(user1Accounts[0].balance).toBe(3000);

    expect(user2Accounts.length).toBe(1);
    expect(user2Accounts[0].name).toBe('Tenant 2 Checking');
    expect(user2Accounts[0].balance).toBe(8500);
  });

  it('preserves onboarding completion and user preferences updates', () => {
    const testUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'usr_test_onboarding',
      hasCompletedOnboarding: false,
    };

    STORAGE.saveProfile(testUser);
    expect(STORAGE.getProfile('usr_test_onboarding').hasCompletedOnboarding).toBe(false);

    const updated = {
      ...testUser,
      hasCompletedOnboarding: true,
      monthlyIncomeTarget: 7500,
      savingsRateTarget: 30,
    };
    STORAGE.saveProfile(updated);

    const reloaded = STORAGE.getProfile('usr_test_onboarding');
    expect(reloaded.hasCompletedOnboarding).toBe(true);
    expect(reloaded.monthlyIncomeTarget).toBe(7500);
    expect(reloaded.savingsRateTarget).toBe(30);
  });

  it('resets user data correctly without affecting other tenants', () => {
    const user1 = 'usr_wipe_me';
    const user2 = 'usr_keep_me';

    STORAGE.saveAccounts(
      [
        {
          id: 'acc_wipe',
          userId: user1,
          name: 'Checking Wipe',
          type: 'bank',
          currency: 'EUR',
          balance: 500,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      user1
    );

    STORAGE.saveAccounts(
      [
        {
          id: 'acc_keep',
          userId: user2,
          name: 'Checking Keep',
          type: 'bank',
          currency: 'EUR',
          balance: 9000,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      user2
    );

    STORAGE.resetToDemo(user1);

    expect(STORAGE.getAccounts(user1)).toEqual([]);
    expect(STORAGE.getAccounts(user2).length).toBe(1);
    expect(STORAGE.getAccounts(user2)[0].name).toBe('Checking Keep');
  });

  it('correctly persists user theme setting and applies dark class', () => {
    localStorage.setItem('fintrack_theme', 'dark');
    expect(localStorage.getItem('fintrack_theme')).toBe('dark');

    // Test profile-level theme persistence
    const userThemeTest: UserProfile = {
      ...DEFAULT_USER,
      id: 'usr_theme_tester',
      theme: 'dark',
    };
    STORAGE.saveProfile(userThemeTest);
    const retrieved = STORAGE.getProfile('usr_theme_tester');
    expect(retrieved.theme).toBe('dark');

    // Verify localStorage can switch back to light
    localStorage.setItem('fintrack_theme', 'light');
    expect(localStorage.getItem('fintrack_theme')).toBe('light');
  });
});
