import { MetadataRoute } from 'next'

const BASE_URL = 'https://shockai.io'

// All static routes with their priorities and change frequencies
const routes: {
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}[] = [
  // Funnel routes (highest priority)
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/video', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/shock-kit', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/website-help', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/get-started', priority: 0.95, changeFrequency: 'weekly' },

  // Core service pages (high priority)
  { path: '/drone', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/photography', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/podcast', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/seo', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/motion-graphics', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/digital-builds', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/website-redesign', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/website-fix', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/media-production', priority: 0.8, changeFrequency: 'weekly' },

  // Company pages
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about/ceo-robbie-creates', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about/ceo-pmbai', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/pricing/specials', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/thank-you', priority: 0.3, changeFrequency: 'yearly' },

  // Blog hub
  { path: '/blog', priority: 0.7, changeFrequency: 'daily' },

  // Blog posts (content marketing)
  { path: '/blog/ai-vs-websites', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog/cite-website-guide', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog/headshot-portrait-styles', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog/photography-course', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog/using-wordpress', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog/web-cookies', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog/websites-shockmp', priority: 0.6, changeFrequency: 'monthly' },

  // Tools
  { path: '/tools/creator-forge', priority: 0.5, changeFrequency: 'monthly' },

  // Utility (low priority, no-index candidates)
  { path: '/whitelist', priority: 0.3, changeFrequency: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  return routes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
