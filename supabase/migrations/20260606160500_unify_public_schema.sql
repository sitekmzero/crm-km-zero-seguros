-- Fix app_notifications and contacts in public schema
DO $$
BEGIN
  -- Create contacts table in public schema
  CREATE TABLE IF NOT EXISTS public.contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      company_name TEXT,
      status TEXT DEFAULT 'subscriber',
      cpf TEXT,
      cep TEXT,
      produto_interesse TEXT,
      modelo_captura TEXT,
      observacoes TEXT,
      proprietario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      lead_score INTEGER DEFAULT 0,
      probability INTEGER DEFAULT 0,
      stage_updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_activity_date TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

DO $$
BEGIN
  -- Try migrating data from crm.contacts to public.contacts if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'crm' AND table_name = 'contacts') THEN
    INSERT INTO public.contacts (id, first_name, email, phone, proprietario_id, created_at, updated_at)
    SELECT id, name, email, phone, proprietario_id, created_at, updated_at
    FROM crm.contacts
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_contacts" ON public.contacts;
CREATE POLICY "authenticated_all_contacts" ON public.contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'contacts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
  END IF;
END $$;

DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.app_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      priority TEXT NOT NULL DEFAULT 'normal',
      read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END $$;

ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_notifications" ON public.app_notifications;
CREATE POLICY "authenticated_all_notifications" ON public.app_notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'app_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_notifications;
  END IF;
END $$;

DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      is_admin BOOLEAN DEFAULT false,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END $$;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_profiles" ON public.user_profiles;
CREATE POLICY "authenticated_read_profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

-- Reload schema cache to fix PGRST205 / PGRST106
NOTIFY pgrst, 'reload schema';
