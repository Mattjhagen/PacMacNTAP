-- BYOP device identification uses TAC lookup and stores only TAC + IMEI last four.

ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS tac TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS imei_last4 TEXT;
ALTER TABLE public.devices ALTER COLUMN imei DROP NOT NULL;
ALTER TABLE public.devices DROP CONSTRAINT IF EXISTS devices_compatibility_status_check;
ALTER TABLE public.devices ADD CONSTRAINT devices_compatibility_status_check
  CHECK (compatibility_status IN ('compatible', 'unsupported', 'locked', 'likely_compatible', 'needs_manual_review', 'not_supported'));

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
