DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Add fields to leads table for Lifecycle Campaigns
  ALTER TABLE public.leads 
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS policy_expires_at DATE,
    ADD COLUMN IF NOT EXISTS closed_won_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_campaign_sent_at TIMESTAMPTZ;

  -- 2. Seed Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adriana.araujo@kmzero.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'adriana.araujo@kmzero.com.br',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adriana Araujo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, role, is_admin)
    VALUES (new_user_id, 'admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
