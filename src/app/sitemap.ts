import { MetadataRoute } from 'next'

const BASE_URL = 'https://propersports.pro'

// All static routes with their priorities and change frequencies
const routes: {
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}[] = [
  // Main pages (highest priority)
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/get-started', priority: 0.95, changeFrequency: 'weekly' },

  // Content pages
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },

  // Auth & Dashboard
  { path: '/login', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/signup', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/booking', priority: 0.7, changeFrequency: 'weekly' },

  // Utility
  { path: '/thank-you', priority: 0.3, changeFrequency: 'yearly' },
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
