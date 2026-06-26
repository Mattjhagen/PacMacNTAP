-- PacMac Mobile Lifeline / NTAP helper lead capture.
-- This table stores safe contact info only. Do not store SSNs, documents,
-- benefit cards, uploads, or sensitive eligibility proof here.

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
