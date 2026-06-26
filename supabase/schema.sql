-- PacMac Mobile - Database Schema Schema (Supabase / Postgres)
-- This file acts as our operational source-of-truth for backend database tables.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles (User Account Metadata tied to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  device TEXT DEFAULT 'Unlocked Phone',
  status TEXT DEFAULT 'pending_activation' CHECK (status IN ('active', 'pending_activation', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Subscriptions (eSIM / Physical SIM lines linked to accounts)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sim_type TEXT DEFAULT 'eSIM' CHECK (sim_type IN ('eSIM', 'Physical SIM')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled')),
  activation_date DATE DEFAULT CURRENT_DATE,
  icc_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Allow users to insert their own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- 3. Usage Logs (Daily telemetry logs separating Cellular from Wi-Fi traffic)
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recorded_date DATE DEFAULT CURRENT_DATE NOT NULL,
  cellular_gb NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  wifi_gb NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (profile_id, recorded_date)
);

-- RLS Policies for Usage Logs
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = profile_id);

-- 4. PackieAI Intercept logs (Spam & Fraud caller blocks and transcripts)
CREATE TABLE IF NOT EXISTS public.packie_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  caller_number TEXT NOT NULL,
  caller_tag TEXT, -- e.g. "IRS Agent", "Robocall"
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  dialogue_json JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of {speaker: 'caller'|'packie', text: string}
  is_blocked BOOLEAN DEFAULT TRUE NOT NULL
);

-- RLS Policies for Packie Logs
ALTER TABLE public.packie_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own block logs" ON public.packie_logs
  FOR SELECT USING (auth.uid() = profile_id);

-- 5. Support Tickets (Assisted diagnostic queries and action requests)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'processing', 'resolved')),
  ticket_type TEXT CHECK (ticket_type IN ('billing', 'signal_refresh', 'sim_swap', 'esim_transfer', 'other')),
  messages_json JSONB DEFAULT '[]'::jsonb NOT NULL, -- Support transcript history
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Support Tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own support tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Allow users to create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- 6. Waitlist Registrations (Early access tracking)
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  source TEXT DEFAULT 'pacmacmobile.com',
  status TEXT DEFAULT 'pending',
  position INTEGER,
  referral_code TEXT UNIQUE,
  referred_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waitlist' AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waitlist' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.waitlist RENAME COLUMN name TO full_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waitlist' AND column_name = 'waitlist_number'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'waitlist' AND column_name = 'position'
  ) THEN
    ALTER TABLE public.waitlist RENAME COLUMN waitlist_number TO position;
  END IF;
END $$;

ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'pacmacmobile.com';
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS position INTEGER;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS referred_by UUID;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.waitlist ALTER COLUMN source SET DEFAULT 'pacmacmobile.com';
ALTER TABLE public.waitlist ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.waitlist ALTER COLUMN email SET NOT NULL;

-- RLS Policies for Waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous waitlist signups" ON public.waitlist;
DROP POLICY IF EXISTS "Allow select views on admin queries" ON public.waitlist;

-- 7. Devices (Checked/Registered user handsets)
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Nullable until checkout/login
  imei TEXT,
  tac TEXT,
  imei_last4 TEXT,
  brand TEXT,
  model TEXT,
  compatibility_status TEXT CHECK (compatibility_status IN ('compatible', 'unsupported', 'locked', 'likely_compatible', 'needs_manual_review', 'not_supported')),
  sim_type TEXT DEFAULT 'eSIM' CHECK (sim_type IN ('eSIM', 'Physical SIM')),
  is_esim_capable BOOLEAN DEFAULT TRUE,
  activation_readiness TEXT, -- e.g., 'Ready', 'Requires Unlock', 'Not Eligible'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS tac TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS imei_last4 TEXT;
ALTER TABLE public.devices ALTER COLUMN imei DROP NOT NULL;
ALTER TABLE public.devices DROP CONSTRAINT IF EXISTS devices_compatibility_status_check;
ALTER TABLE public.devices ADD CONSTRAINT devices_compatibility_status_check
  CHECK (compatibility_status IN ('compatible', 'unsupported', 'locked', 'likely_compatible', 'needs_manual_review', 'not_supported'));

-- RLS Policies for Devices
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous device inserts during onboarding" ON public.devices
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow users to view their own devices" ON public.devices
  FOR SELECT USING (auth.uid() = profile_id OR profile_id IS NULL);
CREATE POLICY "Allow users to update their own devices" ON public.devices
  FOR UPDATE USING (auth.uid() = profile_id);

-- 7a. BYOP TAC lookup data and privacy-safe lookup audit.
CREATE TABLE IF NOT EXISTS public.device_tac_database (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tac TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  device_type TEXT DEFAULT 'smartphone' NOT NULL,
  esim_capable BOOLEAN,
  five_g_capable BOOLEAN,
  source TEXT DEFAULT 'local_seed' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.byop_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT,
  imei_last4 TEXT,
  tac TEXT NOT NULL,
  detected_brand TEXT,
  detected_model TEXT,
  compatibility_status TEXT NOT NULL CHECK (compatibility_status IN ('likely_compatible', 'needs_manual_review', 'not_supported')),
  manual_review_required BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.device_tac_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.byop_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Block public TAC reads" ON public.device_tac_database;
DROP POLICY IF EXISTS "Block public BYOP check reads" ON public.byop_checks;

-- 7b. Lifeline / NTAP helper lead capture. Do not store SSNs, documents,
-- benefit cards, uploads, or sensitive eligibility proof in this table.
CREATE TABLE IF NOT EXISTS public.lifeline_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  eligibility_status TEXT,
  consent BOOLEAN DEFAULT FALSE NOT NULL,
  source TEXT DEFAULT 'lifeline_page' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lifeline_leads ENABLE ROW LEVEL SECURITY;

INSERT INTO public.device_tac_database (tac, brand, model, device_type, esim_capable, five_g_capable, source)
VALUES
  ('35304110', 'Apple', 'iPhone 14', 'smartphone', TRUE, TRUE, 'local_seed'),
  ('35693835', 'Apple', 'iPhone 13', 'smartphone', TRUE, TRUE, 'local_seed'),
  ('35925406', 'Samsung', 'Galaxy S23', 'smartphone', TRUE, TRUE, 'local_seed'),
  ('35672511', 'Samsung', 'Galaxy S22', 'smartphone', TRUE, TRUE, 'local_seed'),
  ('35824005', 'Google', 'Pixel 7', 'smartphone', TRUE, TRUE, 'local_seed'),
  ('35850012', 'Google', 'Pixel 8', 'smartphone', TRUE, TRUE, 'local_seed'),
  ('35682811', 'Motorola', 'Moto G Power 5G', 'smartphone', FALSE, TRUE, 'local_seed'),
  ('35766010', 'OnePlus', 'OnePlus 11', 'smartphone', TRUE, TRUE, 'local_seed')
ON CONFLICT (tac) DO UPDATE SET
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  device_type = EXCLUDED.device_type,
  esim_capable = EXCLUDED.esim_capable,
  five_g_capable = EXCLUDED.five_g_capable,
  source = EXCLUDED.source,
  updated_at = timezone('utc'::text, now());

-- PacMac backend-auth users.
-- These are used by the Node/Express JWT session layer, not Supabase Auth.
-- Passwords are PBKDF2 hashes and salts generated by server/pacmacBackend.ts.
CREATE TABLE IF NOT EXISTS public.pacmac_app_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  customer_id UUID,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pacmac_app_users ENABLE ROW LEVEL SECURITY;

-- 8. PacMac Wireless OS roles and customer profiles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  account_status TEXT DEFAULT 'pending_activation' CHECK (account_status IN ('active', 'pending_activation', 'suspended', 'deactivated')),
  sim_status TEXT DEFAULT 'unassigned' CHECK (sim_status IN ('unassigned', 'provisioned', 'active', 'suspended', 'deactivated')),
  monthly_data_usage_gb NUMERIC(8, 2) DEFAULT 0 NOT NULL,
  fraud_protection_status TEXT DEFAULT 'enabled' CHECK (fraud_protection_status IN ('enabled', 'disabled')),
  auto_block_medium_risk BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pacmac_app_users_customer_id_fkey'
  ) THEN
    ALTER TABLE public.pacmac_app_users
      ADD CONSTRAINT pacmac_app_users_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES public.customer_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.wireless_lines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'provisioned', 'active', 'suspended', 'deactivated')),
  activated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sim_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
  line_id UUID REFERENCES public.wireless_lines(id) ON DELETE SET NULL,
  iccid TEXT UNIQUE NOT NULL,
  eid TEXT,
  sim_type TEXT DEFAULT 'eSIM' CHECK (sim_type IN ('SIM', 'eSIM')),
  status TEXT DEFAULT 'provisioned' CHECK (status IN ('unassigned', 'provisioned', 'active', 'suspended', 'deactivated')),
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  line_id UUID REFERENCES public.wireless_lines(id) ON DELETE CASCADE NOT NULL,
  gb_used NUMERIC(8, 2) NOT NULL,
  source TEXT DEFAULT 'carrier_mock' CHECK (source IN ('carrier_mock', 'admin_simulator', 'webhook')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.billing_cycles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invoice_estimates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  billing_cycle_id UUID REFERENCES public.billing_cycles(id) ON DELETE CASCADE NOT NULL,
  usage_gb NUMERIC(8, 2) NOT NULL,
  price_per_gb NUMERIC(8, 2) NOT NULL,
  monthly_cap NUMERIC(8, 2) NOT NULL,
  minimum_charge NUMERIC(8, 2) DEFAULT 0 NOT NULL,
  estimated_charge NUMERIC(8, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.blocked_numbers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(customer_id, phone_number)
);

CREATE TABLE IF NOT EXISTS public.fraud_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  caller_number TEXT NOT NULL,
  called_number TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  action TEXT NOT NULL CHECK (action IN ('allowed', 'warned', 'blocked')),
  transcript_url TEXT,
  audio_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.carrier_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  line_id UUID REFERENCES public.wireless_lines(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
