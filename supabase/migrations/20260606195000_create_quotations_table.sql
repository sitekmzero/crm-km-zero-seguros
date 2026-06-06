CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  tipo_produto TEXT NOT NULL,
  dados_cotacao JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_quotations" ON public.quotations;
CREATE POLICY "authenticated_all_quotations" ON public.quotations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
