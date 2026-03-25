DO $$ 
BEGIN
  -- Criação da tabela de progresso de treinamento
  CREATE TABLE IF NOT EXISTS public.training_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      module_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, module_id)
  );

  -- Tabela de posts do fórum
  CREATE TABLE IF NOT EXISTS public.forum_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      module_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      resolved BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Tabela de respostas do fórum
  CREATE TABLE IF NOT EXISTS public.forum_replies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
  );

END $$;

-- Configuração de RLS (Tornando idempotente)
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Policies para training_progress
DROP POLICY IF EXISTS "Users can see their own progress" ON public.training_progress;
CREATE POLICY "Users can see their own progress" ON public.training_progress FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.training_progress;
CREATE POLICY "Users can insert their own progress" ON public.training_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.training_progress;
CREATE POLICY "Users can update their own progress" ON public.training_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policies para forum_posts
DROP POLICY IF EXISTS "Forum posts are visible to everyone" ON public.forum_posts;
CREATE POLICY "Forum posts are visible to everyone" ON public.forum_posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create forum posts" ON public.forum_posts;
CREATE POLICY "Users can create forum posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policies para forum_replies
DROP POLICY IF EXISTS "Forum replies are visible to everyone" ON public.forum_replies;
CREATE POLICY "Forum replies are visible to everyone" ON public.forum_replies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create forum replies" ON public.forum_replies;
CREATE POLICY "Users can create forum replies" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update forum replies" ON public.forum_replies;
CREATE POLICY "Admins can update forum replies" ON public.forum_replies FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));
