DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_phone_key'
  ) THEN
    ALTER TABLE public.leads ADD CONSTRAINT leads_phone_key UNIQUE (phone);
  END IF;
END $$;
