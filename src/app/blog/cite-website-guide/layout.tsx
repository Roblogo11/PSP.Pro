import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Cite a Website — Quick Guide (APA, MLA, Chicago) | ShockAI Blog',
  description: 'Practical citation examples for APA, MLA, and Chicago styles. Includes edge-case rules for no author, no date, and archived pages.',
  keywords: ['cite website', 'APA citation', 'MLA citation', 'Chicago citation', 'website citation', 'academic citation', 'reference guide'],
  openGraph: {
    title: 'How to Cite a Website — Quick Guide (APA, MLA, Chicago)',
    description: 'Practical citation examples for APA, MLA, and Chicago styles with edge-case rules.',
    type: 'article',
    publishedTime: '2026-01-29T00:00:00.000Z',
    authors: ['Robbie Creates'],
    siteName: 'ShockAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Cite a Website — Quick Guide',
    description: 'APA, MLA, and Chicago citation examples with edge-case rules.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
