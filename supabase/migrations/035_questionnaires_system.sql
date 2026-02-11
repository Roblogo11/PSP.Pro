-- Migration 035: Questionnaire System
-- True/False questionnaires that coaches create and assign to athletes.

CREATE TABLE IF NOT EXISTS public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  category TEXT,
  published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assigned_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  assigned_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  responses JSONB,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assigned_questionnaires_user_id ON public.assigned_questionnaires(user_id);
CREATE INDEX IF NOT EXISTS idx_assigned_questionnaires_questionnaire_id ON public.assigned_questionnaires(questionnaire_id);

-- RLS
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_questionnaires ENABLE ROW LEVEL SECURITY;

-- Questionnaires: anyone authenticated can read published, staff can write
CREATE POLICY "questionnaires_select" ON public.questionnaires FOR SELECT TO authenticated USING (true);
CREATE POLICY "questionnaires_insert" ON public.questionnaires FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "questionnaires_update" ON public.questionnaires FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );
CREATE POLICY "questionnaires_delete" ON public.questionnaires FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- Assigned Questionnaires: athletes can read/update own, staff can read/write all
CREATE POLICY "assigned_q_select" ON public.assigned_questionnaires FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "assigned_q_insert" ON public.assigned_questionnaires FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "assigned_q_update" ON public.assigned_questionnaires FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coach', 'admin', 'master_admin'))
  );
CREATE POLICY "assigned_q_delete" ON public.assigned_questionnaires FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

DO $$
BEGIN
  RAISE NOTICE 'Migration 035: Questionnaire system created (questionnaires, assigned_questionnaires).';
END $$;
