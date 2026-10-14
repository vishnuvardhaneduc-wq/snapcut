-- SnapCut AI Complete Supabase Database Schema
-- Includes Profiles, User Credits, Subscriptions, Image Processing History,
-- Transactions / Billing Records, Developer API Keys, and Row Level Security (RLS).

-- ============================================================================
-- 1. PROFILES TABLE (Linked to auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public read-access to profiles') THEN
    CREATE POLICY "Allow public read-access to profiles"
      ON public.profiles FOR SELECT
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;


-- ============================================================================
-- 2. USER CREDITS TABLE (Daily Limits & Balances)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER DEFAULT 0 NOT NULL,
  daily_free_remaining INTEGER DEFAULT 5 NOT NULL,
  last_daily_reset DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credits' AND policyname = 'Users can view their own credits') THEN
    CREATE POLICY "Users can view their own credits"
      ON public.user_credits FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credits' AND policyname = 'Users can insert their own credits') THEN
    CREATE POLICY "Users can insert their own credits"
      ON public.user_credits FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credits' AND policyname = 'Users can update their own credits') THEN
    CREATE POLICY "Users can update their own credits"
      ON public.user_credits FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT DEFAULT 'free' NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  current_period_start TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  current_period_end TIMESTAMPTZ DEFAULT timezone('utc'::text, (now() + interval '30 days')) NOT NULL,
  razorpay_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view their own subscriptions') THEN
    CREATE POLICY "Users can view their own subscriptions"
      ON public.subscriptions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can insert their own subscriptions') THEN
    CREATE POLICY "Users can insert their own subscriptions"
      ON public.subscriptions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can update their own subscriptions') THEN
    CREATE POLICY "Users can update their own subscriptions"
      ON public.subscriptions FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================================
-- 4. IMAGE PROCESSING HISTORY TABLE (Uploads & Cutouts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.image_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  original_url TEXT NOT NULL,
  processed_url TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processing_time_ms INTEGER,
  cloudinary_public_id TEXT,
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'api')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.image_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_image_history_user_id ON public.image_history(user_id);
CREATE INDEX IF NOT EXISTS idx_image_history_created_at ON public.image_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_history_expires_at ON public.image_history(expires_at);

-- Server-side cleanup function to purge expired records
CREATE OR REPLACE FUNCTION public.cleanup_expired_images()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.image_history
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'image_history' AND policyname = 'Users can view their own image history') THEN
    CREATE POLICY "Users can view their own image history"
      ON public.image_history FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'image_history' AND policyname = 'Users can insert their own image history') THEN
    CREATE POLICY "Users can insert their own image history"
      ON public.image_history FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'image_history' AND policyname = 'Users can update their own image history') THEN
    CREATE POLICY "Users can update their own image history"
      ON public.image_history FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'image_history' AND policyname = 'Users can delete their own image history') THEN
    CREATE POLICY "Users can delete their own image history"
      ON public.image_history FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================================
-- 5. TRANSACTIONS & PAYMENT RECORDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'credit_pack')),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'completed', 'failed', 'refunded')),
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  credits_added INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view their own transactions') THEN
    CREATE POLICY "Users can view their own transactions"
      ON public.transactions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert their own transactions') THEN
    CREATE POLICY "Users can insert their own transactions"
      ON public.transactions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can update their own transactions') THEN
    CREATE POLICY "Users can update their own transactions"
      ON public.transactions FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================================
-- 6. DEVELOPER API KEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Production Key',
  key_prefix TEXT NOT NULL,
  key_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  total_requests BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can view their own api keys') THEN
    CREATE POLICY "Users can view their own api keys"
      ON public.api_keys FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can insert their own api keys') THEN
    CREATE POLICY "Users can insert their own api keys"
      ON public.api_keys FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can update their own api keys') THEN
    CREATE POLICY "Users can update their own api keys"
      ON public.api_keys FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can delete their own api keys') THEN
    CREATE POLICY "Users can delete their own api keys"
      ON public.api_keys FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================================
-- 7. AUTOMATIC NEW USER INITIALIZATION TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    'user',
    'free'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_credits (user_id, balance, daily_free_remaining, last_daily_reset)
  VALUES (
    NEW.id,
    0,
    5,
    CURRENT_DATE
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
