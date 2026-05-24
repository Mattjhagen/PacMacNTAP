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
