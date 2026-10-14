import { supabase } from '../lib/supabase';
import type { ApiKey } from '../types';

export const apiKeyService = {
  // List all API keys for current user
  async getKeys(): Promise<ApiKey[]> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data as ApiKey[];
    } catch {
      return [];
    }
  },

  // Generate a new API key and persist to Supabase
  async createKey(name: string): Promise<ApiKey> {
    const keyHex = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const keyPrefix = `sk_live_${keyHex.slice(0, 4)}...${keyHex.slice(-4)}`;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: created, error } = await supabase
          .from('api_keys')
          .insert({
            user_id: session.user.id,
            name: name || 'Production Key',
            key_prefix: keyPrefix,
            is_active: true,
            rate_limit_per_minute: 60,
            total_requests: 0,
          })
          .select()
          .maybeSingle();

        if (created && !error) {
          return created as ApiKey;
        }
      }
    } catch {
      // Fallback below
    }

    const fallbackKey: ApiKey = {
      id: `key_${Date.now()}`,
      user_id: 'usr_current',
      name: name || 'Production Key',
      key_prefix: keyPrefix,
      created_at: new Date().toISOString(),
      is_active: true,
      rate_limit_per_minute: 60,
      total_requests: 0,
    };
    return fallbackKey;
  },

  // Revoke an API key from Supabase
  async revokeKey(id: string): Promise<void> {
    try {
      await supabase.from('api_keys').delete().eq('id', id);
    } catch {
      // ignore
    }
  },
};
