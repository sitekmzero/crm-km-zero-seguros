DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent)
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
      new_user_id, '00000000-0000-0000-0000-000000000000', 'adriana.araujo@kmzero.com.br', crypt('Skip@Pass', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Adriana Araujo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.user_profiles (id, is_admin, role)
    VALUES (new_user_id, true, 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.channel_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text UNIQUE NOT NULL,
  target_count integer NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT 'monthly',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.channel_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_channel_goals" ON public.channel_goals;
CREATE POLICY "authenticated_all_channel_goals" ON public.channel_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);
