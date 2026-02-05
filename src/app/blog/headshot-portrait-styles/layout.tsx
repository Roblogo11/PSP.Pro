import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '30 Signature Headshot & Portrait Styles for Professionals | ShockAI Blog',
  description: 'From corporate boardrooms to neon-soaked urban nights — explore 30 professional headshot and portrait styles for Norfolk, Virginia Beach & Hampton Roads. Find the perfect style for your career.',
  keywords: ['professional headshots', 'portrait photography', 'Norfolk photographer', 'Virginia Beach headshots', 'corporate photography', 'personal branding', 'ShockAI'],
  openGraph: {
    title: '30 Signature Headshot & Portrait Styles for Professionals',
    description: 'From corporate boardrooms to neon-soaked urban nights — explore 30 professional headshot styles for Hampton Roads.',
    type: 'article',
    publishedTime: '2026-01-29T00:00:00.000Z',
    authors: ['Robbie Creates'],
    siteName: 'ShockAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: '30 Signature Headshot & Portrait Styles',
    description: 'Professional headshot styles for Norfolk, Virginia Beach & Hampton Roads.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
