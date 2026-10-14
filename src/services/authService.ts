import { supabase } from '../lib/supabase';
import type { UserProfile, UserCredits } from '../types';

export interface AuthResponse {
  user: UserProfile | null;
  token?: string;
  message?: string;
}

function mapToUserProfile(authUser: any, profile?: any): UserProfile {
  return {
    id: authUser.id,
    email: authUser.email || '',
    full_name:
      profile?.full_name ||
      authUser.user_metadata?.full_name ||
      (authUser.email ? authUser.email.split('@')[0] : 'Creator'),
    avatar_url:
      profile?.avatar_url ||
      authUser.user_metadata?.avatar_url ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: (profile?.role || (authUser.email?.endsWith('@snapcut.ai') ? 'admin' : 'user')) as 'user' | 'admin',
    plan: (profile?.plan || 'free') as 'free' | 'pro' | 'enterprise',
    created_at: profile?.created_at || authUser.created_at || new Date().toISOString(),
    updated_at: profile?.updated_at,
  };
}

export const authService = {
  // Sign in with email and password
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('User not found. Please verify your credentials.');
    }

    // Fetch user profile from database
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    // Fallback: If profile row was not created yet, create it
    if (!profile) {
      const initialProfile = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: data.user.user_metadata?.full_name || email.split('@')[0],
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: email.endsWith('@snapcut.ai') ? 'admin' : 'user',
        plan: 'free',
      };
      const { data: insertedProfile } = await supabase
        .from('profiles')
        .upsert(initialProfile)
        .select()
        .maybeSingle();

      profile = insertedProfile || initialProfile;
    }

    const userProfile = mapToUserProfile(data.user, profile);

    return {
      user: userProfile,
      token: data.session?.access_token,
    };
  },

  // Sign up new user
  async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed. Please try again.');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    const userProfile = mapToUserProfile(data.user, profile || { full_name: fullName });
    const requiresEmailConfirmation = !data.session;

    return {
      user: userProfile,
      token: data.session?.access_token,
      message: requiresEmailConfirmation
        ? 'Account registered! A confirmation email has been sent to your inbox.'
        : 'Account created successfully!',
    };
  },

  // Sign in with Google OAuth
  async loginWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  // Forgot password request
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, message: 'Password reset link sent to your email.' };
  },

  // Reset password
  async resetPassword(password: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, message: 'Password updated successfully' };
  },

  // Get current user profile and session
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return null;
      }

      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile) {
        const fallbackProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Creator',
          avatar_url: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: session.user.email?.endsWith('@snapcut.ai') ? 'admin' : 'user',
          plan: 'free',
        };
        await supabase.from('profiles').upsert(fallbackProfile);
        profile = fallbackProfile;
      }

      return mapToUserProfile(session.user, profile);
    } catch (err) {
      console.warn('Error fetching current user:', err);
      return null;
    }
  },

  // Get user credits from Supabase
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error getting user credits:', error);
      }

      const today = new Date().toISOString().split('T')[0];

      if (data) {
        // Check if daily credits should be reset (new calendar day)
        if (data.last_daily_reset !== today) {
          const { data: updated } = await supabase
            .from('user_credits')
            .update({
              daily_free_remaining: 5,
              last_daily_reset: today,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .select()
            .single();

          return updated || data;
        }
        return data;
      }

      // If no credit record exists yet, initialize it
      const { data: created } = await supabase
        .from('user_credits')
        .upsert(
          {
            user_id: userId,
            balance: 0,
            daily_free_remaining: 5,
            last_daily_reset: today,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .maybeSingle();

      return created || null;
    } catch (err) {
      console.warn('Credits query error:', err);
      return null;
    }
  },

  // Deduct 1 credit for cutout processing
  async deductCredit(userId: string): Promise<boolean> {
    try {
      const credits = await this.getUserCredits(userId);
      if (!credits) return false;

      if (credits.daily_free_remaining > 0) {
        const { error } = await supabase
          .from('user_credits')
          .update({
            daily_free_remaining: credits.daily_free_remaining - 1,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        return !error;
      } else if (credits.balance > 0) {
        const { error } = await supabase
          .from('user_credits')
          .update({
            balance: credits.balance - 1,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        return !error;
      }
      return false;
    } catch (err) {
      console.warn('Failed to deduct credit:', err);
      return false;
    }
  },

  // Add credits to account
  async addCredits(userId: string, amount: number): Promise<void> {
    try {
      const credits = await this.getUserCredits(userId);
      if (!credits) return;

      await supabase
        .from('user_credits')
        .update({
          balance: credits.balance + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Failed to add credits:', err);
    }
  },

  // Update profile
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) {
      throw new Error(error.message);
    }

    // Also update auth user metadata
    await supabase.auth.updateUser({
      data: {
        full_name: data.full_name,
        avatar_url: data.avatar_url,
      },
    });

    return mapToUserProfile(session.user, {
      ...data,
      id: session.user.id,
      email: session.user.email,
    });
  },

  // Sign out
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },
};
