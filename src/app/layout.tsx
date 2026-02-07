import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/config/site'
import { Providers } from '@/providers'
import { CommandPalette } from '@/components/ui/command-palette'
import { JsonLdSchema } from '@/components/seo/json-ld-schema'
import { PSPAssistant } from '@/components/psp-assistant'
import { AthleticOSBackground } from '@/components/athletic-os-background'
import { StripeTestBanner } from '@/components/stripe-test-banner'

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
  title: 'PSP.Pro - Elite Baseball & Softball Training | Virginia Beach',
  description:
    'ProPer Sports Performance - Elite baseball and softball training in Virginia Beach. Track velocity, master mechanics, and dominate the diamond with data-driven performance.',
  keywords: [
    'Virginia Beach',
    'baseball training',
    'softball training',
    'velocity tracking',
    'sports performance',
    'athletic training',
    'Hampton Roads',
    '757',
  ],
  authors: [{ name: 'Proper Sports Performance' }],
  creator: 'PSP.Pro',
  publisher: 'Proper Sports Performance',
  metadataBase: new URL('https://propersports.pro'),
  alternates: {
    canonical: 'https://propersports.pro',
  },
  openGraph: {
    title: 'PSP.Pro - Elite Baseball & Softball Training | Virginia Beach',
    description:
      'Elite baseball and softball training in Virginia Beach. Track velocity, master mechanics, and dominate the diamond with data-driven performance.',
    url: 'https://propersports.pro',
    siteName: 'PSP.Pro',
    images: [
      {
        url: siteConfig.meta.ogImage,
        width: 1200,
        height: 630,
        alt: 'PSP.Pro - ProPer Sports Performance',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PSP.Pro - Elite Baseball & Softball Training | Virginia Beach',
    description:
      'Elite baseball and softball training in Virginia Beach. Track velocity, master mechanics, and dominate the diamond.',
    images: [siteConfig.meta.ogImage],
    creator: '@propersports',
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <JsonLdSchema />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <Providers>
          <StripeTestBanner />
          <AthleticOSBackground />
          <CommandPalette />
          <PSPAssistant />
          {children}
        </Providers>
      </body>
    </html>
  )
}
