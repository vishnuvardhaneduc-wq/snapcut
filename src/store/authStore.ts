import { create } from 'zustand';
import { authService } from '../services/authService';
import type { UserProfile, UserCredits, Subscription } from '../types';

interface AuthState {
  user: UserProfile | null;
  credits: UserCredits;
  subscription: Subscription | null;
  isLoading: boolean;
  isAdmin: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setCredits: (credits: Partial<UserCredits>) => void;
  deductCredit: () => boolean;
  addCredits: (amount: number) => void;
  upgradePlan: (plan: 'pro' | 'enterprise') => void;
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// Default mock guest / initial state for smooth local experience
const defaultUser: UserProfile = {
  id: 'usr_demo_7829',
  email: 'creator@snapcut.ai',
  full_name: 'Alex Rivera',
  role: 'user',
  plan: 'free',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString(),
};

const defaultCredits: UserCredits = {
  id: 'crd_1',
  user_id: 'usr_demo_7829',
  balance: 10,
  daily_free_remaining: 5,
  last_daily_reset: new Date().toISOString().split('T')[0],
};

const defaultSub: Subscription = {
  id: 'sub_1',
  user_id: 'usr_demo_7829',
  plan_id: 'free',
  status: 'active',
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: defaultUser,
  credits: defaultCredits,
  subscription: defaultSub,
  isLoading: false,
  isAdmin: false,

  setUser: (user) => {
    set({
      user,
      isAdmin: user?.role === 'admin' || user?.email.endsWith('@snapcut.ai') || false,
    });
  },

  setCredits: (newCredits) => {
    set((state) => ({
      credits: { ...state.credits, ...newCredits },
    }));
  },

  deductCredit: () => {
    const { credits } = get();
    if (credits.daily_free_remaining > 0) {
      set({
        credits: {
          ...credits,
          daily_free_remaining: credits.daily_free_remaining - 1,
        },
      });
      return true;
    } else if (credits.balance > 0) {
      set({
        credits: {
          ...credits,
          balance: credits.balance - 1,
        },
      });
      return true;
    }
    return false;
  },

  addCredits: (amount: number) => {
    set((state) => ({
      credits: {
        ...state.credits,
        balance: state.credits.balance + amount,
      },
    }));
  },

  upgradePlan: (plan: 'pro' | 'enterprise') => {
    set((state) => ({
      user: state.user ? { ...state.user, plan } : null,
      subscription: {
        id: `sub_${Date.now()}`,
        user_id: state.user?.id || 'usr_1',
        plan_id: `${plan}_monthly`,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      credits: {
        ...state.credits,
        balance: state.credits.balance + (plan === 'pro' ? 200 : 1000),
      }
    }));
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const user = await authService.getCurrentUser();
      if (user) {
        set({
          user,
          isAdmin: user.role === 'admin' || user.email.endsWith('@snapcut.ai'),
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await authService.logout();
    set({
      user: null,
      isAdmin: false,
    });
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) return;

    const updated = await authService.updateProfile(data);
    set({ user: updated });
  },
}));
