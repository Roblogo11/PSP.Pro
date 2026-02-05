import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Why We Moved Beyond WordPress: Modern JavaScript Web Apps | ShockAI Blog',
  description: 'WordPress was revolutionary in 2005. In 2026, modern JavaScript frameworks like Next.js deliver faster sites, better security, lower costs, and unlimited customization.',
  keywords: ['WordPress vs Next.js', 'modern web development', 'JavaScript frameworks', 'React websites', 'ShockAI', 'Norfolk web development', 'Virginia Beach websites'],
  openGraph: {
    title: 'Why We Moved Beyond WordPress: The Case for Modern JavaScript',
    description: 'WordPress was revolutionary in 2005. In 2026, modern JavaScript frameworks deliver faster sites, better security, and unlimited customization.',
    type: 'article',
    publishedTime: '2026-01-29T00:00:00.000Z',
    authors: ['ShockAI Team'],
    siteName: 'ShockAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why We Moved Beyond WordPress',
    description: 'Modern JavaScript frameworks deliver faster sites, better security, and unlimited customization.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
