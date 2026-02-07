import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/locker', '/sessions', '/progress', '/settings', '/drills/', '/achievements'],
      },
    ],
    sitemap: 'https://propersports.pro/sitemap.xml',
  }
}
