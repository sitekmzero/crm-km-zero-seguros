DO $$
BEGIN
  -- Update Replica Identity to FULL for accurate Realtime payloads (especially for DELETE events)
  ALTER TABLE public.leads REPLICA IDENTITY FULL;
  ALTER TABLE public.messages REPLICA IDENTITY FULL;
  ALTER TABLE public.contacts REPLICA IDENTITY FULL;
  ALTER TABLE public.app_notifications REPLICA IDENTITY FULL;

  -- Create supabase_realtime publication if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Add tables to supabase_realtime publication to enable WebSocket streaming
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'leads') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'contacts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'app_notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_notifications;
  END IF;

  -- Ensure Row Level Security allows authenticated frontend users to interact with these tables
  DROP POLICY IF EXISTS "authenticated_all_leads" ON public.leads;
  CREATE POLICY "authenticated_all_leads" ON public.leads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_all_messages" ON public.messages;
  CREATE POLICY "authenticated_all_messages" ON public.messages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_all_contacts" ON public.contacts;
  CREATE POLICY "authenticated_all_contacts" ON public.contacts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;
