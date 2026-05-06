-- Migration 058: Fix blog post cover image extensions
--
-- Migration 039 seeded blog posts with `.jpg` paths, but the public/images/
-- folder only contains `.webp` versions (jpg copies were never committed).
-- Result: 6 broken images on /admin/media and on /blog (404s).

UPDATE blog_posts
SET cover_image = REPLACE(cover_image, '.jpg', '.webp')
WHERE cover_image LIKE '%.jpg';

UPDATE blog_posts
SET cover_image = REPLACE(cover_image, '.jpeg', '.webp')
WHERE cover_image LIKE '%.jpeg';

-- Same treatment for any inline image markdown in post content.
-- ![](/images/foo.jpg) → ![](/images/foo.webp)
UPDATE blog_posts
SET content = REPLACE(content, '.jpg)', '.webp)')
WHERE content LIKE '%.jpg)%';

UPDATE blog_posts
SET content = REPLACE(content, '.jpeg)', '.webp)')
WHERE content LIKE '%.jpeg)%';
