DO $do$
BEGIN
  -- 1. Ensure `supabase_realtime` publication exists
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Add CRM tables to realtime publication (handle if they are already added)
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE crm.contacts; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE crm.app_notifications; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE crm.crm_interactions; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE crm.quotations; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE crm.internal_messages; EXCEPTION WHEN OTHERS THEN END;

  -- 2. Configure RLS Policies for CRM schema tables
  -- Grant usage
  GRANT USAGE ON SCHEMA crm TO anon, authenticated;
  GRANT ALL ON ALL TABLES IN SCHEMA crm TO anon, authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA crm TO anon, authenticated;

  -- crm.contacts
  ALTER TABLE crm.contacts ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "crm_contacts_select" ON crm.contacts;
  CREATE POLICY "crm_contacts_select" ON crm.contacts FOR SELECT TO authenticated USING (true);
  
  DROP POLICY IF EXISTS "crm_contacts_insert" ON crm.contacts;
  CREATE POLICY "crm_contacts_insert" ON crm.contacts FOR INSERT TO authenticated WITH CHECK (true);
  
  DROP POLICY IF EXISTS "crm_contacts_update" ON crm.contacts;
  CREATE POLICY "crm_contacts_update" ON crm.contacts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "crm_contacts_delete" ON crm.contacts;
  CREATE POLICY "crm_contacts_delete" ON crm.contacts FOR DELETE TO authenticated USING (true);

  -- crm.app_notifications
  ALTER TABLE crm.app_notifications ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "crm_notifications_select" ON crm.app_notifications;
  CREATE POLICY "crm_notifications_select" ON crm.app_notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true));
  
  DROP POLICY IF EXISTS "crm_notifications_update" ON crm.app_notifications;
  CREATE POLICY "crm_notifications_update" ON crm.app_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true));
  
  DROP POLICY IF EXISTS "crm_notifications_insert" ON crm.app_notifications;
  CREATE POLICY "crm_notifications_insert" ON crm.app_notifications FOR INSERT TO authenticated WITH CHECK (true);

  -- crm.crm_interactions
  ALTER TABLE crm.crm_interactions ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "crm_interactions_select" ON crm.crm_interactions;
  CREATE POLICY "crm_interactions_select" ON crm.crm_interactions FOR SELECT TO authenticated USING (true);
  
  DROP POLICY IF EXISTS "crm_interactions_insert" ON crm.crm_interactions;
  CREATE POLICY "crm_interactions_insert" ON crm.crm_interactions FOR INSERT TO authenticated WITH CHECK (true);

  -- crm.quotations
  ALTER TABLE crm.quotations ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "crm_quotations_select" ON crm.quotations;
  CREATE POLICY "crm_quotations_select" ON crm.quotations FOR SELECT TO authenticated USING (true);
  
  DROP POLICY IF EXISTS "crm_quotations_insert" ON crm.quotations;
  CREATE POLICY "crm_quotations_insert" ON crm.quotations FOR INSERT TO authenticated WITH CHECK (true);
  
  DROP POLICY IF EXISTS "crm_quotations_update" ON crm.quotations;
  CREATE POLICY "crm_quotations_update" ON crm.quotations FOR UPDATE TO authenticated USING (true);

  -- crm.vendor_config
  ALTER TABLE crm.vendor_config ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "crm_vendor_config_select" ON crm.vendor_config;
  CREATE POLICY "crm_vendor_config_select" ON crm.vendor_config FOR SELECT TO authenticated USING (true);
  
  DROP POLICY IF EXISTS "crm_vendor_config_insert" ON crm.vendor_config;
  CREATE POLICY "crm_vendor_config_insert" ON crm.vendor_config FOR INSERT TO authenticated WITH CHECK (true);
  
  DROP POLICY IF EXISTS "crm_vendor_config_update" ON crm.vendor_config;
  CREATE POLICY "crm_vendor_config_update" ON crm.vendor_config FOR UPDATE TO authenticated USING (true);

  -- crm.audit_log
  ALTER TABLE crm.audit_log ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "crm_audit_log_select" ON crm.audit_log;
  CREATE POLICY "crm_audit_log_select" ON crm.audit_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true));
  
  DROP POLICY IF EXISTS "crm_audit_log_insert" ON crm.audit_log;
  CREATE POLICY "crm_audit_log_insert" ON crm.audit_log FOR INSERT TO authenticated WITH CHECK (true);

END $do$;
