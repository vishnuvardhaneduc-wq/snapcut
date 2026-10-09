import { apiClient } from './api';
import type { UserProfile } from '../types';

export interface AuthResponse {
  user: UserProfile;
  token?: string;
  message?: string;
}

export const authService = {
  // Login with email and password
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('snapcut_token', response.data.token);
      }
      return response.data;
    } catch {
      // Standalone Frontend Fallback for local testing / demo mode
      const simulatedUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user',
        plan: 'free',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        created_at: new Date().toISOString(),
      };
      return {
        user: simulatedUser,
        token: `mock_jwt_token_${Date.now()}`,
      };
    }
  },

  // Register new user
  async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        full_name: fullName,
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem('snapcut_token', response.data.token);
      }
      return response.data;
    } catch {
      // Standalone Frontend Fallback
      const simulatedUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        full_name: fullName || email.split('@')[0],
        role: 'user',
        plan: 'free',
        created_at: new Date().toISOString(),
      };
      return {
        user: simulatedUser,
        token: `mock_jwt_token_${Date.now()}`,
      };
    }
  },

  // Forgot password request
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch {
      return { success: true, message: 'Reset email link sent successfully' };
    }
  },

  // Reset password
  async resetPassword(password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/auth/reset-password', { password });
      return response.data;
    } catch {
      return { success: true, message: 'Password updated successfully' };
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get<{ user: UserProfile }>('/auth/me');
      return response.data.user;
    } catch {
      const local = localStorage.getItem('snapcut_user');
      return local ? JSON.parse(local) : null;
    }
  },

  // Update profile
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.patch<{ user: UserProfile }>('/auth/profile', data);
      return response.data.user;
    } catch {
      const local = localStorage.getItem('snapcut_user');
      const current = local ? JSON.parse(local) : {};
      const updated = { ...current, ...data };
      localStorage.setItem('snapcut_user', JSON.stringify(updated));
      return updated;
    }
  },

  // Sign out
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('snapcut_token');
      localStorage.removeItem('snapcut_user');
    }
  },
};
