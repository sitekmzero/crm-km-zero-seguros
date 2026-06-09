CREATE TABLE IF NOT EXISTS public.success_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type text NOT NULL CHECK (product_type IN ('seguro', 'consorcio', 'financiamento')),
  customer_objection text NOT NULL,
  successful_response text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.success_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_success_patterns" ON public.success_patterns;
CREATE POLICY "authenticated_all_success_patterns" ON public.success_patterns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed adriana
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
      new_user_id, '00000000-0000-0000-0000-000000000000', 'adriana.araujo@kmzero.com.br',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Adriana Araújo"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.user_profiles (id, is_admin, role)
    VALUES (new_user_id, true, 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Seed meta test
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'meta_test@kmzero.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'meta_test@kmzero.com.br',
      crypt('kmzero123', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Meta Test"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.user_profiles (id, is_admin, role)
    VALUES (new_user_id, false, 'user')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
