DO $$
BEGIN
  -- Add channel to leads
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS channel text DEFAULT 'whatsapp';
  
  -- Add channel to contacts
  ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS channel text DEFAULT 'whatsapp';
  
  -- Ensure replica identity full is set for Realtime on both tables
  ALTER TABLE public.leads REPLICA IDENTITY FULL;
  ALTER TABLE public.contacts REPLICA IDENTITY FULL;
END $$;

-- Seed user adriana.araujo@kmzero.com.br
DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adriana Araújo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, role, is_admin)
    VALUES (new_user_id, 'admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Update some existing leads and contacts to have different channels for UI testing
DO $$
BEGIN
  UPDATE public.leads SET channel = 'instagram' WHERE id IN (SELECT id FROM public.leads LIMIT 2);
  UPDATE public.leads SET channel = 'facebook' WHERE id IN (SELECT id FROM public.leads OFFSET 2 LIMIT 2);
  
  UPDATE public.contacts SET channel = 'instagram' WHERE id IN (SELECT id FROM public.contacts LIMIT 2);
  UPDATE public.contacts SET channel = 'facebook' WHERE id IN (SELECT id FROM public.contacts OFFSET 2 LIMIT 2);
END $$;
