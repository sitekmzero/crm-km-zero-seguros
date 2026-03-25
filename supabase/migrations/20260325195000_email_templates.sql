DO $$ 
BEGIN
  -- Expand email_templates table
  ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'publicado';
  ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
  ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS variables_used TEXT[];
END $$;

-- Drop existing policies if any to recreate safely
DROP POLICY IF EXISTS "Templates All" ON public.email_templates;
DROP POLICY IF EXISTS "Anyone can read templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can insert templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can update templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can delete templates" ON public.email_templates;

-- Recreate robust RLS for Email Templates
CREATE POLICY "Anyone can read templates" ON public.email_templates 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert templates" ON public.email_templates 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Admins can update templates" ON public.email_templates 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Admins can delete templates" ON public.email_templates 
  FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Seed standard templates idempotently
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Boas-vindas') THEN
      INSERT INTO public.email_templates (id, name, subject, body, status, variables_used) VALUES 
      (gen_random_uuid(), 'Boas-vindas', 'Bem-vindo à Km Zero', 'Olá {{nome_cliente}},<br><br>Seja muito bem-vindo(a) à Km Zero Seguros! Estamos muito felizes em ter você conosco.<br><br>Nossa missão é garantir a sua tranquilidade com as melhores opções do mercado.<br><br>Atenciosamente,<br>{{nome_vendedor}}', 'publicado', ARRAY['nome_cliente', 'nome_vendedor']);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Envio de Cotação - Seguros') THEN
      INSERT INTO public.email_templates (id, name, subject, body, status, variables_used) VALUES 
      (gen_random_uuid(), 'Envio de Cotação - Seguros', 'Sua cotação de seguro está pronta', 'Olá {{nome_cliente}},<br><br>Sua cotação de seguro já está disponível para análise.<br><br><strong>Produto:</strong> {{produto}}<br><strong>Valor:</strong> R$ {{valor_cotacao}}<br><br>Você pode acessar a proposta detalhada aqui: <a href="{{link_cotacao}}">Ver Cotação</a><br><br>Qualquer dúvida, estou à disposição.<br><br>Abraço,<br>{{nome_vendedor}}', 'publicado', ARRAY['nome_cliente', 'produto', 'valor_cotacao', 'link_cotacao', 'nome_vendedor']);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Envio de Cotação - Consórcio') THEN
      INSERT INTO public.email_templates (id, name, subject, body, status, variables_used) VALUES 
      (gen_random_uuid(), 'Envio de Cotação - Consórcio', 'Sua cotação de consórcio está pronta', 'Olá {{nome_cliente}},<br><br>Analisamos o seu perfil e montamos uma proposta ideal de consórcio para você.<br><br><strong>Produto:</strong> {{produto}}<br><strong>Parcela Estimada:</strong> R$ {{valor_cotacao}}<br><br>Confira os detalhes no link: <a href="{{link_cotacao}}">Acessar Proposta</a><br><br>Atenciosamente,<br>{{nome_vendedor}}', 'publicado', ARRAY['nome_cliente', 'produto', 'valor_cotacao', 'link_cotacao', 'nome_vendedor']);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Envio de Cotação - Financiamento') THEN
      INSERT INTO public.email_templates (id, name, subject, body, status, variables_used) VALUES 
      (gen_random_uuid(), 'Envio de Cotação - Financiamento', 'Sua simulação de financiamento', 'Olá {{nome_cliente}},<br><br>Sua simulação de financiamento para {{produto}} foi concluída.<br><br><strong>Valor da Parcela:</strong> R$ {{valor_cotacao}}<br><br>Acesse as condições completas aqui: <a href="{{link_cotacao}}">Ver Condições</a><br><br>Fico no aguardo do seu retorno!<br><br>{{nome_vendedor}}', 'publicado', ARRAY['nome_cliente', 'produto', 'valor_cotacao', 'link_cotacao', 'nome_vendedor']);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Follow-up') THEN
      INSERT INTO public.email_templates (id, name, subject, body, status, variables_used) VALUES 
      (gen_random_uuid(), 'Follow-up', 'Gostaria de saber se você teve dúvidas', 'Olá {{nome_cliente}},<br><br>Tudo bem? Gostaria de saber se você conseguiu analisar a proposta do {{produto}} que enviamos em {{data_proposta}}.<br><br>Ficou alguma dúvida em relação aos valores ou coberturas?<br><br>Estou à disposição no telefone {{telefone_cliente}} ou respondendo este e-mail.<br><br>Abraço,<br>{{nome_vendedor}}', 'publicado', ARRAY['nome_cliente', 'produto', 'data_proposta', 'telefone_cliente', 'nome_vendedor']);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Lembrete de Renovação') THEN
      INSERT INTO public.email_templates (id, name, subject, body, status, variables_used) VALUES 
      (gen_random_uuid(), 'Lembrete de Renovação', 'Aviso: Sua apólice está próxima do vencimento', 'Olá {{nome_cliente}},<br><br>Gostaríamos de avisar que a apólice do seu {{produto}} está prestes a vencer.<br><br>Para não ficar desprotegido, já preparei algumas opções de renovação com excelentes condições.<br><br>Podemos conversar ainda hoje para eu te apresentar?<br><br>Atenciosamente,<br>{{nome_vendedor}}', 'publicado', ARRAY['nome_cliente', 'produto', 'nome_vendedor']);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Agradecimento de Fechamento') THEN
      INSERT INTO public.email_templates (id, name, subject, body, status, variables_used) VALUES 
      (gen_random_uuid(), 'Agradecimento de Fechamento', 'Obrigado por escolher a Km Zero', 'Olá {{nome_cliente}},<br><br>Muito obrigado por confiar na Km Zero Seguros para a contratação do seu {{produto}}!<br><br>Sua documentação já está sendo processada. Em caso de sinistro ou dúvidas, você pode nos acionar a qualquer momento.<br><br>Conte sempre conosco.<br><br>Abraços,<br>{{nome_vendedor}}', 'publicado', ARRAY['nome_cliente', 'produto', 'nome_vendedor']);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Feliz Aniversário') THEN
      INSERT INTO public.email_templates (id, name, subject, body, status, variables_used) VALUES 
      (gen_random_uuid(), 'Feliz Aniversário', 'Parabéns pelo seu dia, {{nome_cliente}}!', 'Olá {{nome_cliente}},<br><br>Hoje é um dia muito especial! Toda a equipe da Km Zero Seguros deseja a você um excelente aniversário, repleto de paz, saúde e conquistas.<br><br>Aproveite o seu dia!<br><br>Com carinho,<br>Equipe Km Zero Seguros', 'publicado', ARRAY['nome_cliente']);
    END IF;
END $$;
