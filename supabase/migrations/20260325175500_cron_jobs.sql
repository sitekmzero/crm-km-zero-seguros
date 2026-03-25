-- Set up pg_cron to run edge functions on a schedule
-- Note: This requires pg_cron to be enabled on your Supabase project (which it is by default).

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron extension could not be created or is already active.';
END $$;

DO $$
BEGIN
  -- Schedule calculate-lead-score to run every day at midnight (00:00)
  PERFORM cron.schedule(
    'calculate-lead-score-daily',
    '0 0 * * *',
    'SELECT net.http_post(
        url := current_setting(''app.settings.supabase_url'', true) || ''/functions/v1/calculate-lead-score'',
        headers := (''{"Authorization": "Bearer '' || current_setting(''app.settings.service_role_key'', true) || ''"}'')::jsonb
    );'
  );

  -- Schedule daily-followup to run every day at 08:00 AM
  PERFORM cron.schedule(
    'daily-followup-alert',
    '0 8 * * *',
    'SELECT net.http_post(
        url := current_setting(''app.settings.supabase_url'', true) || ''/functions/v1/daily-followup'',
        headers := (''{"Authorization": "Bearer '' || current_setting(''app.settings.service_role_key'', true) || ''"}'')::jsonb
    );'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Failed to schedule cron jobs. Verify that pg_cron and pg_net are fully enabled.';
END $$;
