DO $$
BEGIN
  CREATE SCHEMA IF NOT EXISTS crm;
END $$;

-- Ensure contacts table exists with required structure
CREATE TABLE IF NOT EXISTS crm.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  meta_uid TEXT,
  proprietario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add columns if the table already existed without them
ALTER TABLE crm.contacts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE crm.contacts ADD COLUMN IF NOT EXISTS meta_uid TEXT;

-- Create whatsapp_messages table
CREATE TABLE IF NOT EXISTS crm.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES crm.contacts(id) ON DELETE CASCADE,
  message_body TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE crm.whatsapp_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- RLS Policies for whatsapp_messages
  DROP POLICY IF EXISTS "authenticated_select_whatsapp_messages" ON crm.whatsapp_messages;
  CREATE POLICY "authenticated_select_whatsapp_messages" ON crm.whatsapp_messages
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "authenticated_insert_whatsapp_messages" ON crm.whatsapp_messages;
  CREATE POLICY "authenticated_insert_whatsapp_messages" ON crm.whatsapp_messages
    FOR INSERT TO authenticated WITH CHECK (true);
END $$;

-- Configure Realtime for whatsapp_messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'crm' AND tablename = 'whatsapp_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE crm.whatsapp_messages;
  END IF;
END $$;
