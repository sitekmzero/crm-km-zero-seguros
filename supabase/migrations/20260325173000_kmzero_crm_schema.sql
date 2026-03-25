-- Role ENUM or text check
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'vendedor';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    cpf TEXT,
    cep TEXT,
    produto_interesse TEXT,
    modelo_captura TEXT,
    observacoes TEXT,
    status TEXT NOT NULL DEFAULT 'subscriber',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    proprietario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.crm_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    descricao TEXT,
    data TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    tipo_produto TEXT,
    dados_cotacao JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pendente',
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contacts All" ON public.contacts;
CREATE POLICY "Contacts All" ON public.contacts FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
    OR proprietario_id = auth.uid()
) WITH CHECK (true);

DROP POLICY IF EXISTS "Interactions All" ON public.crm_interactions;
CREATE POLICY "Interactions All" ON public.crm_interactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Quotations All" ON public.quotations;
CREATE POLICY "Quotations All" ON public.quotations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed User
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
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adriana Araujo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, email, full_name, is_admin, role)
    VALUES (new_user_id, 'adriana.araujo@kmzero.com.br', 'Adriana Araujo', true, 'admin')
    ON CONFLICT (id) DO UPDATE SET is_admin = true, role = 'admin', email = 'adriana.araujo@kmzero.com.br';
  END IF;
END $$;
