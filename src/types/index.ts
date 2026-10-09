export type UserRole = 'user' | 'admin';
export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  plan: PlanTier;
  created_at: string;
  updated_at?: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  balance: number; // Purchased extra credits
  daily_free_remaining: number; // Out of 5 daily
  last_daily_reset: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  razorpay_subscription_id?: string;
}

export interface UploadItem {
  id: string;
  user_id: string;
  original_filename: string;
  file_size_bytes: number;
  width?: number;
  height?: number;
  original_url: string;
  processed_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  processing_time_ms?: number;
  source: 'web' | 'api';
  expires_at: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'subscription' | 'credit_pack';
  amount: number;
  currency: string;
  status: 'created' | 'completed' | 'failed' | 'refunded';
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  credits_added: number;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash?: string;
  is_active: boolean;
  last_used_at?: string;
  rate_limit_per_minute: number;
  total_requests: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  type: 'subscription' | 'credit_pack';
  credits?: number;
}
