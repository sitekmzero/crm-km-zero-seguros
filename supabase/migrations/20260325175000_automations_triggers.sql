-- Set up HTTP extension if available, or just call edge function
-- Since pg_net might not be enabled by default, we'll use a webhook logic if possible,
-- but the safest generic way in Supabase is using the pg_net extension. 
-- We will wrap it in DO block to handle safely.

DO $$
BEGIN
  -- Check if pg_net is available
  CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_net extension not available. Webhook triggers skipped.';
END $$;

CREATE OR REPLACE FUNCTION public.trigger_process_automations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'type', TG_OP,
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE null END
  );
  
  BEGIN
    -- We assume the edge function is deployed at the default path
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/process-automations',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
      body := payload
    );
  EXCEPTION WHEN OTHERS THEN
    -- Fallback silently if pg_net fails or not configured
  END;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_contact_automations ON public.contacts;
CREATE TRIGGER on_contact_automations
  AFTER INSERT OR UPDATE OF status
  ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.trigger_process_automations();
