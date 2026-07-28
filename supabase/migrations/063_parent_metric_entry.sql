-- ============================================================================
-- 063: Parent-entered performance data + multi-child metric isolation
-- ============================================================================
--
-- ⚠ IF YOU TOUCH PERFORMANCE METRICS, YOU MUST:
--    1. Keep parent INSERTs scoped to their OWN athlete_id. The policy below
--       lets a parent write only rows where athlete_id = auth.uid(). Never
--       broaden this to "any athlete" — parents would be able to write to
--       other families' athletes.
--    2. Keep parent-entered rows UNVERIFIED. Leaderboards filter on
--       custom_metrics->>'verified'. A parent must not be able to self-report
--       a PR onto a public leaderboard. Only coaches/admins may set verified.
--    3. Stamp child_id on every metric row for parent accounts. A parent
--       account holds ONE athlete_id shared by all their children; without
--       child_id, every child's data merges into one chart.
--
-- WHAT THIS ADDS:
--    - entered_by_role  : who logged it ('coach' | 'parent' | 'athlete')
--    - RLS INSERT/UPDATE for parents on their own athlete_id
--    - guard trigger: parent-entered rows are forced verified=false
--
-- Idempotent — safe to re-run.
-- ============================================================================

DO $$
DECLARE
  v_backfilled integer;
BEGIN
  RAISE NOTICE '--- 063: parent metric entry ---';

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='athlete_performance_metrics'
      AND column_name='entered_by_role'
  ) THEN
    ALTER TABLE public.athlete_performance_metrics
      ADD COLUMN entered_by_role text NOT NULL DEFAULT 'coach';
    RAISE NOTICE '  [1] added entered_by_role (default coach)';
  ELSE
    RAISE NOTICE '  [1] entered_by_role already present - skipped';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname='metrics_entered_by_role_check'
      AND conrelid='public.athlete_performance_metrics'::regclass
  ) THEN
    ALTER TABLE public.athlete_performance_metrics
      ADD CONSTRAINT metrics_entered_by_role_check
      CHECK (entered_by_role = ANY (ARRAY['coach','parent','athlete']));
    RAISE NOTICE '      + CHECK (coach|parent|athlete)';
  END IF;

  CREATE INDEX IF NOT EXISTS idx_metrics_entered_by_role
    ON public.athlete_performance_metrics USING btree (entered_by_role);

  -- Existing rows were all coach-entered (only staff could insert until now).
  UPDATE public.athlete_performance_metrics
  SET entered_by_role = 'coach'
  WHERE entered_by_role IS NULL;
  GET DIAGNOSTICS v_backfilled = ROW_COUNT;
  RAISE NOTICE '  [2] normalised % legacy row(s) to entered_by_role=coach', v_backfilled;
END $$;

-- ---------------------------------------------------------------------
-- 3. Force parent-entered rows to be unverified.
--    Leaderboards read custom_metrics->>'verified'; a parent must never be
--    able to self-report a PR onto a public board.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_parent_metric_unverified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();

  -- Staff may set verified freely.
  IF v_role IN ('coach','admin','master_admin') THEN
    RETURN NEW;
  END IF;

  NEW.entered_by_role := 'parent';
  NEW.custom_metrics := jsonb_set(
    coalesce(NEW.custom_metrics, '{}'::jsonb),
    '{verified}',
    'false'::jsonb,
    true
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_parent_metric_unverified ON public.athlete_performance_metrics;
CREATE TRIGGER trg_parent_metric_unverified
  BEFORE INSERT OR UPDATE ON public.athlete_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION public.enforce_parent_metric_unverified();

-- ---------------------------------------------------------------------
-- 4. Let parents write metrics for their OWN account only.
--    Existing staff policies are left untouched; these are additive.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents can insert own athlete metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Parents can insert own athlete metrics"
  ON public.athlete_performance_metrics
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (athlete_id = auth.uid());

DROP POLICY IF EXISTS "Parents can update own athlete metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Parents can update own athlete metrics"
  ON public.athlete_performance_metrics
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (athlete_id = auth.uid() AND entered_by_role = 'parent')
  WITH CHECK (athlete_id = auth.uid() AND entered_by_role = 'parent');

DO $$
BEGIN
  RAISE NOTICE '  [3] trg_parent_metric_unverified installed';
  RAISE NOTICE '  [4] parent INSERT/UPDATE policies added (own athlete_id only)';
  RAISE NOTICE '--- 063 complete ---';
END $$;
