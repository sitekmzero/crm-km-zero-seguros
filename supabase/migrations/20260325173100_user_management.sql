-- Add status to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    descricao TEXT,
    ip_usuario TEXT,
    data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
CREATE POLICY "Admins can view audit log" ON public.audit_log 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

DROP POLICY IF EXISTS "Admins can insert audit log" ON public.audit_log;
CREATE POLICY "Admins can insert audit log" ON public.audit_log 
FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));
