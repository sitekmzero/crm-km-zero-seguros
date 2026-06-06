DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END $$;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_documents" ON public.documents;
CREATE POLICY "authenticated_all_documents" ON public.documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('documents', 'documents', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "authenticated_storage_documents_select" ON storage.objects;
CREATE POLICY "authenticated_storage_documents_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "authenticated_storage_documents_insert" ON storage.objects;
CREATE POLICY "authenticated_storage_documents_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "authenticated_storage_documents_update" ON storage.objects;
CREATE POLICY "authenticated_storage_documents_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "authenticated_storage_documents_delete" ON storage.objects;
CREATE POLICY "authenticated_storage_documents_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents');

-- Reload schema cache to fix PGRST205
NOTIFY pgrst, 'reload schema';
