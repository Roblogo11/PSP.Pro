-- ============================================================================
-- Fix Drills Table: Add missing columns
-- The drills table may be missing equipment_needed, focus_areas, published,
-- featured, slug, instructions, category, and duration_seconds columns
-- depending on how the original table was created.
-- ============================================================================

-- Core columns that the drill creation form expects
-- Make youtube_url optional (was NOT NULL in original schema)
ALTER TABLE public.drills ALTER COLUMN youtube_url DROP NOT NULL;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner';
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 300;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS equipment_needed TEXT[] DEFAULT '{}';
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS focus_areas TEXT[] DEFAULT '{}';
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Make slug unique if not already (ignore if constraint exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'drills_slug_key'
  ) THEN
    -- Populate any null slugs first
    UPDATE public.drills
    SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTR(id::TEXT, 1, 8)
    WHERE slug IS NULL;

    ALTER TABLE public.drills ADD CONSTRAINT drills_slug_key UNIQUE (slug);
  END IF;
END $$;
