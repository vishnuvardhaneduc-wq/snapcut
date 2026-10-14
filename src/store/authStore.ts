import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  deductCredit: () => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
  upgradePlan: (plan: 'pro' | 'enterprise') => Promise<void>;
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const initialCredits: UserCredits = {
  id: '',
  user_id: '',
  balance: 0,
  daily_free_remaining: 5,
  last_daily_reset: new Date().toISOString().split('T')[0],
};

let authSubscriptionInitialized = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  credits: initialCredits,
  subscription: null,
  isLoading: true,
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

  deductCredit: async () => {
    const { user, credits } = get();

    if (credits.daily_free_remaining > 0) {
      set({
        credits: {
          ...credits,
          daily_free_remaining: credits.daily_free_remaining - 1,
        },
      });
      if (user?.id) {
        authService.deductCredit(user.id).catch(console.error);
      }
      return true;
    } else if (credits.balance > 0) {
      set({
        credits: {
          ...credits,
          balance: credits.balance - 1,
        },
      });
      if (user?.id) {
        authService.deductCredit(user.id).catch(console.error);
      }
      return true;
    }
    return false;
  },

  addCredits: async (amount: number) => {
    const { user, credits } = get();
    set({
      credits: {
        ...credits,
        balance: credits.balance + amount,
      },
    });
    if (user?.id) {
      await authService.addCredits(user.id, amount);
    }
  },

  upgradePlan: async (plan: 'pro' | 'enterprise') => {
    const { user, credits } = get();
    if (!user) return;

    const newCreditsBalance = credits.balance + (plan === 'pro' ? 200 : 1000);
    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      user_id: user.id,
      plan_id: `${plan}_monthly`,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    set({
      user: { ...user, plan },
      subscription: newSub,
      credits: {
        ...credits,
        balance: newCreditsBalance,
      },
    });

    try {
      await supabase
        .from('profiles')
        .update({ plan, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      await supabase
        .from('user_credits')
        .update({ balance: newCreditsBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: `${plan}_monthly`,
          status: 'active',
        });
    } catch (err) {
      console.warn('Error syncing upgraded plan with Supabase:', err);
    }
  },

  initializeAuth: async () => {
    try {
      if (!isSupabaseConfigured) {
        set({ user: null, isLoading: false });
        return;
      }

      // 1. Initial session check
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const [userCredits, subResult] = await Promise.all([
          authService.getUserCredits(currentUser.id),
          supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        set({
          user: currentUser,
          credits: userCredits || { ...initialCredits, user_id: currentUser.id },
          subscription: subResult.data || null,
          isAdmin: currentUser.role === 'admin' || currentUser.email.endsWith('@snapcut.ai'),
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isLoading: false,
        });
      }

      // 2. Setup real-time auth state listener once
      if (!authSubscriptionInitialized) {
        authSubscriptionInitialized = true;
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              const profile = await authService.getCurrentUser();
              if (profile) {
                const [userCredits, subResult] = await Promise.all([
                  authService.getUserCredits(profile.id),
                  supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', profile.id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                ]);

                set({
                  user: profile,
                  credits: userCredits || { ...initialCredits, user_id: profile.id },
                  subscription: subResult.data || null,
                  isAdmin: profile.role === 'admin' || profile.email.endsWith('@snapcut.ai'),
                  isLoading: false,
                });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            set({
              user: null,
              credits: initialCredits,
              subscription: null,
              isAdmin: false,
              isLoading: false,
            });
          }
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        credits: initialCredits,
        subscription: null,
        isAdmin: false,
      });
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) return;

    const updated = await authService.updateProfile(data);
    set({ user: updated });
  },
}));
