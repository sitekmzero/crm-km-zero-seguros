DO $$ 
BEGIN
  -- Criação da tabela de apólices para alertas de vencimento
  CREATE TABLE IF NOT EXISTS public.policies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
      policy_number TEXT,
      product_type TEXT,
      issue_date DATE,
      expiration_date DATE,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Atualização da tabela documents para usar contact_id e suportar o CRM
  ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_client_id_fkey;
  ALTER TABLE public.documents ALTER COLUMN client_id DROP NOT NULL;
  ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE;

  -- Tabela de feedback para o manual do usuário
  CREATE TABLE IF NOT EXISTS public.manual_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      pagina TEXT,
      mensagem TEXT,
      data TIMESTAMPTZ DEFAULT NOW()
  );

  -- Configuração da corretora para Round Robin
  ALTER TABLE public.corretora_config ADD COLUMN IF NOT EXISTS round_robin_enabled BOOLEAN DEFAULT false;

  -- Bucket de armazenamento para documentos
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('documents', 'documents', false) 
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Configuração de RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Policies All" ON public.policies;
CREATE POLICY "Policies All" ON public.policies FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Feedback All" ON public.manual_feedback;
CREATE POLICY "Feedback All" ON public.manual_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Documents Storage All" ON storage.objects;
CREATE POLICY "Documents Storage All" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');
