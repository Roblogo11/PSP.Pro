import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI vs Websites: Who\'s Really Running the Show? | ShockAI Blog',
  description: 'AI builds fast, but humans build brands. Discover the hybrid approach that blends AI efficiency with cinematic human creativity. Learn how ShockAI combines both for maximum impact.',
  keywords: ['AI websites', 'AI web development', 'human creativity', 'AI efficiency', 'ShockAI', 'Norfolk web design', 'Virginia Beach AI'],
  openGraph: {
    title: 'AI vs Websites: Who\'s Really Running the Show?',
    description: 'AI builds fast, but humans build brands. Discover the hybrid approach that blends AI efficiency with cinematic human creativity.',
    type: 'article',
    publishedTime: '2026-01-29T00:00:00.000Z',
    authors: ['Robbie Creates'],
    siteName: 'ShockAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI vs Websites: Who\'s Really Running the Show?',
    description: 'AI builds fast, but humans build brands. Discover the hybrid approach at ShockAI.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
