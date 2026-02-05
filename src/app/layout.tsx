import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/config/site'
import { Providers } from '@/providers'
import { CommandPalette } from '@/components/ui/command-palette'
import { JsonLdSchema } from '@/components/seo/json-ld-schema'
import { ShockAssistant } from '@/components/shock-assistant'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#07070a',
}

export const metadata: Metadata = {
  title: 'AI-Native Creative Studio | Norfolk Virginia Beach 757 | ShockAI',
  description:
    'AI-powered video production, web development, drone photography, and creative services. Serving Norfolk, Virginia Beach, Chesapeake & the 757 area.',
  keywords: [
    'Norfolk',
    'Virginia Beach',
    '757',
    'Hampton Roads',
    'video production',
    'web development',
    'drone photography',
    'creative studio',
    'AI',
  ],
  authors: [{ name: 'ShockAI' }],
  creator: 'ShockAI',
  publisher: 'ShockAI',
  metadataBase: new URL('https://shockai.io'),
  alternates: {
    canonical: 'https://shockai.io',
  },
  openGraph: {
    title: 'AI-Native Creative Studio | Norfolk Virginia Beach 757 | ShockAI',
    description:
      'AI-powered video production, web development, drone photography, and creative services. Serving Norfolk, Virginia Beach & the 757.',
    url: 'https://shockai.io',
    siteName: 'ShockAI',
    images: [
      {
        url: siteConfig.meta.ogImage,
        width: 1200,
        height: 630,
        alt: 'ShockAI - AI-Native Creative Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Native Creative Studio | Norfolk Virginia Beach 757 | ShockAI',
    description:
      'AI-powered video production, web development, and creative services in the 757.',
    images: [siteConfig.meta.ogImage],
    creator: '@shockmp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <JsonLdSchema />
      </head>
      <body className="min-h-screen bg-cyber-grid">
        <Providers>
          <CommandPalette />
          <ShockAssistant />
          {children}
        </Providers>
      </body>
    </html>
  )
}
