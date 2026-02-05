import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — AI, Web Development & Creative Insights | ShockAI',
  description: 'Explore insights on AI technology, modern web development, photography tips, and creative strategies from the ShockAI team in Norfolk, Virginia Beach & Hampton Roads.',
  keywords: ['ShockAI blog', 'AI technology', 'web development', 'photography tips', 'Norfolk tech', 'Virginia Beach creative', 'digital marketing'],
  openGraph: {
    title: 'ShockAI Blog — AI, Web Development & Creative Insights',
    description: 'Explore insights on AI technology, modern web development, photography tips, and creative strategies.',
    type: 'website',
    siteName: 'ShockAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShockAI Blog',
    description: 'AI, Web Development & Creative Insights from Norfolk, Virginia Beach.',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
