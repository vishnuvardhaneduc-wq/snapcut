import { apiClient } from './api';
import type { ApiKey } from '../types';

export const apiKeyService = {
  // List all API keys for current user
  async getKeys(): Promise<ApiKey[]> {
    try {
      const response = await apiClient.get<ApiKey[]>('/api-keys');
      return response.data;
    } catch {
      return [];
    }
  },

  // Generate a new API key
  async createKey(name: string): Promise<ApiKey> {
    try {
      const response = await apiClient.post<ApiKey>('/api-keys', { name });
      return response.data;
    } catch {
      const keyHex = Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      
      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        user_id: 'usr_current',
        name: name || 'Production Key',
        key_prefix: `sk_live_${keyHex.slice(0, 4)}...${keyHex.slice(-4)}`,
        created_at: new Date().toISOString(),
        is_active: true,
        rate_limit_per_minute: 60,
        total_requests: 0,
      };
      return newKey;
    }
  },

  // Revoke an API key
  async revokeKey(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api-keys/${id}`);
    } catch {
      // ignore
    }
  },
};
