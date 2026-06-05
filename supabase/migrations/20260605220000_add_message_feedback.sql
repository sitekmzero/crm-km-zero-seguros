DO $$
BEGIN
  -- Add feedback column to messages
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS feedback TEXT CHECK (feedback IN ('positive', 'negative'));

  -- Seed configs
  INSERT INTO public.configs (key, value) VALUES
    ('sdr_system_prompt', 'Você é um SDR virtual da KM Zero Seguros, Consórcios e Financiamentos. Seja conciso, educado e busque qualificar o lead entendendo sua real necessidade antes de transferir para um consultor.'),
    ('learning_mode_active', 'false')
  ON CONFLICT (key) DO NOTHING;

  -- Seed Auth User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adriana.araujo@kmzero.com.br') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'adriana.araujo@kmzero.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adriana Araújo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;
