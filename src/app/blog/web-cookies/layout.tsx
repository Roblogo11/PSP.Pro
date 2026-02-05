import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Deconstructing the Web Cookie — Session, Persistent & Privacy | ShockAI Blog',
  description: 'HTTP cookies explained: session vs persistent, first vs third-party, privacy regulations, and security best practices for web developers.',
  keywords: ['web cookies', 'HTTP cookies', 'session cookies', 'persistent cookies', 'privacy', 'GDPR', 'web security', 'third-party cookies'],
  openGraph: {
    title: 'Deconstructing the Web Cookie',
    description: 'HTTP cookies explained: session vs persistent, first vs third-party, privacy regulations, and security best practices.',
    type: 'article',
    publishedTime: '2026-01-29T00:00:00.000Z',
    authors: ['Robbie Creates'],
    siteName: 'ShockAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deconstructing the Web Cookie',
    description: 'Everything you need to know about HTTP cookies and privacy.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
