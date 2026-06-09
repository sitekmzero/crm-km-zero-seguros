-- Add gclid to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS gclid TEXT;

-- Create google_conversions
CREATE TABLE IF NOT EXISTS public.google_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  gclid TEXT NOT NULL,
  converted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.google_conversions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_all_google_conversions" ON public.google_conversions;
CREATE POLICY "authenticated_all_google_conversions" ON public.google_conversions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable pg_net
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_lead_status_change()
RETURNS trigger AS $$
DECLARE
  edge_function_url text;
  request_body json;
BEGIN
  IF NEW.status IN ('seguro_qualificado', 'consorcio_qualificado', 'financiamento_qualificado') AND OLD.status = 'novo' THEN
    edge_function_url := 'https://rlxvvykuouuppatrbrwo.supabase.co/functions/v1/offline-conversions';
    
    request_body := json_build_object(
      'type', 'UPDATE',
      'table', 'leads',
      'schema', 'public',
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    );
    
    PERFORM net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := request_body::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_lead_status_changed ON public.leads;
CREATE TRIGGER on_lead_status_changed
  AFTER UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_lead_status_change();

-- Create chat_attachments bucket if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('chat_attachments', 'chat_attachments', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'chat_attachments');
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat_attachments');
DROP POLICY IF EXISTS "Service Role All" ON storage.objects;
CREATE POLICY "Service Role All" ON storage.objects FOR ALL USING (bucket_id = 'chat_attachments');
