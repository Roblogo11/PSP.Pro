import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How Websites Work With ShockMP — Web Development Services | ShockAI Blog',
  description: 'Transform underperforming websites into high-converting digital assets. SEO optimization, performance tuning, and custom development for Norfolk and Virginia Beach businesses.',
  keywords: ['ShockMP websites', 'web development Norfolk', 'website optimization', 'SEO services', 'Virginia Beach web design', 'custom websites', 'ShockAI'],
  openGraph: {
    title: 'How Websites Work With ShockMP',
    description: 'Transform underperforming websites into high-converting digital assets with SEO and custom development.',
    type: 'article',
    publishedTime: '2026-01-29T00:00:00.000Z',
    authors: ['Robbie Creates'],
    siteName: 'ShockAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Websites Work With ShockMP',
    description: 'Transform your website into a high-converting digital asset.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
