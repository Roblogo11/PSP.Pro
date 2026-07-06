-- Migration 033: Add video_url column to services
-- Allows coaches to attach a promo/intro video to any service.

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN public.services.video_url IS 'Optional video URL (YouTube embed, Vimeo, or direct .mp4)';

DO $$
BEGIN
  RAISE NOTICE 'Migration 033: Added video_url to services table.';
END $$;
