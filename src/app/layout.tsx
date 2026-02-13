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
import { SimulationBanner } from '@/components/simulation-banner'
import { ImpersonationBanner } from '@/components/impersonation-banner'
import { SpeedInsights } from '@vercel/speed-insights/next'

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
  title: 'PSP.Pro - Elite Softball, Basketball & Soccer Training | Virginia Beach',
  description:
    'ProPer Sports Performance - Elite softball, basketball, and soccer training in Virginia Beach. Master mechanics, build speed, and dominate your sport with data-driven performance.',
  keywords: [
    'Virginia Beach',
    'softball training',
    'basketball training',
    'soccer training',
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
    title: 'PSP.Pro - Elite Softball, Basketball & Soccer Training | Virginia Beach',
    description:
      'Elite softball, basketball, and soccer training in Virginia Beach. Master mechanics, build speed, and dominate your sport with data-driven performance.',
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
    title: 'PSP.Pro - Elite Softball, Basketball & Soccer Training | Virginia Beach',
    description:
      'Elite softball, basketball, and soccer training in Virginia Beach. Master mechanics, build speed, and dominate your sport.',
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
      <body className="min-h-screen min-h-[100dvh]" suppressHydrationWarning>
        <Providers>
          <SimulationBanner />
          <ImpersonationBanner />
          <StripeTestBanner />
          <AthleticOSBackground />
          <CommandPalette />
          <PSPAssistant />
          {children}
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}
