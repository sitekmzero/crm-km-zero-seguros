DO $$
BEGIN
    ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
    ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 0;
    ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS stage_updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION
    WHEN OTHERS THEN RAISE NOTICE 'Columns already exist';
END $$;

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    stage TEXT,
    delay_hours INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internal_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendor_config (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    specialties TEXT[],
    n8n_webhook_url TEXT,
    pipedrive_api_key TEXT,
    google_calendar_token JSONB
);

CREATE TABLE IF NOT EXISTS public.app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    priority TEXT DEFAULT 'normal',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Templates All" ON public.email_templates;
CREATE POLICY "Templates All" ON public.email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Messages All" ON public.internal_messages;
CREATE POLICY "Messages All" ON public.internal_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Vendor Config All" ON public.vendor_config;
CREATE POLICY "Vendor Config All" ON public.vendor_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications All" ON public.app_notifications;
CREATE POLICY "Notifications All" ON public.app_notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_stage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   IF NEW.status IS DISTINCT FROM OLD.status THEN
      NEW.stage_updated_at = NOW();
   END IF;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_contact_status_change ON public.contacts;
CREATE TRIGGER on_contact_status_change
BEFORE UPDATE ON public.contacts
FOR EACH ROW EXECUTE FUNCTION public.update_stage_updated_at();
