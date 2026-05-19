-- Backfill video_url from youtube_url for drills created via the admin form,
-- which historically wrote to the wrong column. Detail page reads video_url
-- only, so any drill with youtube_url set but video_url null was invisible.

UPDATE public.drills
SET video_url = youtube_url
WHERE video_url IS NULL
  AND youtube_url IS NOT NULL
  AND youtube_url <> '';
