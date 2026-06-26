CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC, id ASC) AS real_position
  FROM public.waitlist
)
UPDATE public.waitlist
SET position = ordered.real_position
FROM ordered
WHERE public.waitlist.id = ordered.id;

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous waitlist signups" ON public.waitlist;
DROP POLICY IF EXISTS "Allow select views on admin queries" ON public.waitlist;
