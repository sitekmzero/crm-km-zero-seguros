DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user contato@kmzero.com.br
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'contato@kmzero.com.br') THEN
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
      'contato@kmzero.com.br',
      crypt('Luga9400@@', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Contato"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
    
    -- Ensure user profile gets created/updated with admin privileges
    BEGIN
      INSERT INTO public.user_profiles (id, email, role, is_admin)
      VALUES (new_user_id, 'contato@kmzero.com.br', 'admin', true)
      ON CONFLICT (id) DO UPDATE SET role = 'admin', is_admin = true;
    EXCEPTION WHEN OTHERS THEN
      BEGIN
        UPDATE public.user_profiles SET role = 'admin', is_admin = true WHERE id = new_user_id;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END;
  END IF;

  -- Seed user adriana.araujo@kmzero.com.br
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adriana Araujo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
    
    -- Ensure user profile gets created/updated with admin privileges
    BEGIN
      INSERT INTO public.user_profiles (id, email, role, is_admin)
      VALUES (new_user_id, 'adriana.araujo@kmzero.com.br', 'admin', true)
      ON CONFLICT (id) DO UPDATE SET role = 'admin', is_admin = true;
    EXCEPTION WHEN OTHERS THEN
      BEGIN
        UPDATE public.user_profiles SET role = 'admin', is_admin = true WHERE id = new_user_id;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END;
  END IF;
END $$;

-- Fix any potentially existing users with NULLs in token columns to prevent 500 errors in GoTrue
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;
