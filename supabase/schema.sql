-- PacMac Mobile - Database Schema Schema (Supabase / Postgres)
-- This file acts as our operational source-of-truth for backend database tables.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  waitlist_number INT NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous waitlist signups" ON public.waitlist
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow select views on admin queries" ON public.waitlist
  FOR SELECT USING (TRUE); -- Managed via admin role restrictions in real scenarios

-- 7. Devices (Checked/Registered user handsets)
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Nullable until checkout/login
  imei TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  compatibility_status TEXT CHECK (compatibility_status IN ('compatible', 'unsupported', 'locked')),
  sim_type TEXT DEFAULT 'eSIM' CHECK (sim_type IN ('eSIM', 'Physical SIM')),
  is_esim_capable BOOLEAN DEFAULT TRUE,
  activation_readiness TEXT, -- e.g., 'Ready', 'Requires Unlock', 'Not Eligible'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Devices
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous device inserts during onboarding" ON public.devices
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow users to view their own devices" ON public.devices
  FOR SELECT USING (auth.uid() = profile_id OR profile_id IS NULL);
CREATE POLICY "Allow users to update their own devices" ON public.devices
  FOR UPDATE USING (auth.uid() = profile_id);

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
