-- Add featured_on_homepage flag and homepage_image_url to services table
-- This allows coaches to toggle which services appear on the homepage

ALTER TABLE services ADD COLUMN IF NOT EXISTS featured_on_homepage BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS homepage_image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS homepage_order INTEGER DEFAULT 0;

-- Create index for quick featured service lookups
CREATE INDEX IF NOT EXISTS idx_services_featured ON services (featured_on_homepage) WHERE featured_on_homepage = true;
