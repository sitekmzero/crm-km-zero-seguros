DO $$
BEGIN
  -- Normalize existing phones to digits only
  UPDATE public.leads
  SET phone = regexp_replace(phone, '\D', '', 'g')
  WHERE phone ~ '\D';

  -- Set Replica Identity Full for Realtime reliability
  ALTER TABLE public.leads REPLICA IDENTITY FULL;
  ALTER TABLE public.messages REPLICA IDENTITY FULL;

  -- Ensure publication is setup correctly
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Safely add tables to publication if not already present
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'leads') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
  
  -- Create robust RLS policies for realtime explicit SELECT
  DROP POLICY IF EXISTS "authenticated_select_leads" ON public.leads;
  CREATE POLICY "authenticated_select_leads" ON public.leads FOR SELECT TO authenticated USING (true);
  
  DROP POLICY IF EXISTS "authenticated_select_messages" ON public.messages;
  CREATE POLICY "authenticated_select_messages" ON public.messages FOR SELECT TO authenticated USING (true);
END $$;
