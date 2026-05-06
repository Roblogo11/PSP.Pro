-- Migration 058: Fix blog post cover image extensions
--
-- Migration 039 seeded blog posts with `.jpg` paths, but the public/images/
-- folder only contains `.webp` versions (jpg copies were never committed).
-- Result: 6 broken images on /admin/media and on /blog (404s).
--
-- Note: blog_posts uses `thumbnail_url`, NOT `cover_image`. Earlier draft
-- of this migration assumed a different column name and failed.

UPDATE blog_posts
SET thumbnail_url = REPLACE(thumbnail_url, '.jpg', '.webp')
WHERE thumbnail_url LIKE '%.jpg';

UPDATE blog_posts
SET thumbnail_url = REPLACE(thumbnail_url, '.jpeg', '.webp')
WHERE thumbnail_url LIKE '%.jpeg';

-- Same treatment for any inline image markdown in post content.
-- ![](/images/foo.jpg) → ![](/images/foo.webp)
UPDATE blog_posts
SET content = REPLACE(content, '.jpg)', '.webp)')
WHERE content LIKE '%.jpg)%';

UPDATE blog_posts
SET content = REPLACE(content, '.jpeg)', '.webp)')
WHERE content LIKE '%.jpeg)%';
