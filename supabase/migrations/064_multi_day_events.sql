-- ============================================================================
-- 064: Multi-day events (e.g. a 3-day camp booked as ONE thing)
-- ============================================================================
--
-- ⚠ IF YOU TOUCH EVENTS, YOU MUST:
--    1. Leave `available_slots` one-row-per-day. The slot-count triggers
--       (recalculate_slot_availability + hourly pg_cron heal) are load-bearing
--       and assume one date per row. Multi-day is expressed by GROUPING slots
--       under an event, never by widening a slot to a date range.
--    2. Keep event_id nullable on available_slots. Ordinary one-off slots have
--       no event and must keep working exactly as before.
--    3. Book the EVENT, not each day. A 3-day camp is one booking; its
--       booking row carries event_id. Do not create 3 bookings.
--
-- WHY A NEW TABLE: a camp needs one name, one price, one capacity, and one
-- date RANGE, while still having per-day times so the calendar and the
-- existing slot machinery keep working.
--
-- Idempotent — safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    coach_id uuid NOT NULL,
    service_id uuid,
    org_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    location text,
    max_participants integer NOT NULL DEFAULT 1,
    price_cents integer,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

DO $$
BEGIN
  RAISE NOTICE '--- 064: multi-day events ---';

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='events_pkey' AND conrelid='public.events'::regclass) THEN
    ALTER TABLE public.events ADD CONSTRAINT events_pkey PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='events_coach_id_fkey' AND conrelid='public.events'::regclass) THEN
    ALTER TABLE public.events ADD CONSTRAINT events_coach_id_fkey
      FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='events_service_id_fkey' AND conrelid='public.events'::regclass) THEN
    ALTER TABLE public.events ADD CONSTRAINT events_service_id_fkey
      FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;
  END IF;

  -- A range must not run backwards. Single-day events (start = end) are legal.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='events_date_range_check' AND conrelid='public.events'::regclass) THEN
    ALTER TABLE public.events ADD CONSTRAINT events_date_range_check
      CHECK (end_date >= start_date);
  END IF;

  CREATE INDEX IF NOT EXISTS idx_events_coach_id   ON public.events USING btree (coach_id);
  CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events USING btree (start_date);
  CREATE INDEX IF NOT EXISTS idx_events_is_active  ON public.events USING btree (is_active);
  RAISE NOTICE '  [1] events table + constraints + indexes';

  -- Link slots to their parent event (nullable = ordinary one-off slot).
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='available_slots' AND column_name='event_id'
  ) THEN
    ALTER TABLE public.available_slots ADD COLUMN event_id uuid;
    ALTER TABLE public.available_slots ADD CONSTRAINT available_slots_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
    RAISE NOTICE '  [2] available_slots.event_id added';
  ELSE
    RAISE NOTICE '  [2] available_slots.event_id already present - skipped';
  END IF;
  CREATE INDEX IF NOT EXISTS idx_available_slots_event_id ON public.available_slots USING btree (event_id);

  -- One booking covers the whole event.
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bookings' AND column_name='event_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN event_id uuid;
    ALTER TABLE public.bookings ADD CONSTRAINT bookings_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;
    RAISE NOTICE '  [3] bookings.event_id added';
  ELSE
    RAISE NOTICE '  [3] bookings.event_id already present - skipped';
  END IF;
  CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON public.bookings USING btree (event_id);
END $$;

CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_events_updated_at();

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone may browse active events; only staff may manage them.
DROP POLICY IF EXISTS events_public_read ON public.events;
CREATE POLICY events_public_read ON public.events
  AS PERMISSIVE FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS events_staff_write ON public.events;
CREATE POLICY events_staff_write ON public.events
  AS PERMISSIVE FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles
                 WHERE profiles.id = auth.uid()
                   AND profiles.role = ANY (ARRAY['coach','admin','master_admin'])))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles
                 WHERE profiles.id = auth.uid()
                   AND profiles.role = ANY (ARRAY['coach','admin','master_admin'])));

GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '  [4] RLS + policies + grants on events';
  RAISE NOTICE '--- 064 complete ---';
END $$;
