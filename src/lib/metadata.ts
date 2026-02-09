import { Metadata } from 'next'

interface LocalMetadataOptions {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string
}

const BASE_URL = 'https://propersports.pro'
const DEFAULT_IMAGE = '/images/PSP-black-300x99-1.png'

const LOCATION_KEYWORDS = [
  'Virginia Beach',
  'Norfolk',
  '757',
  'Hampton Roads',
  'Chesapeake',
  'Hampton',
  'Newport News',
  'Coastal Virginia',
  'VA',
]

export function generateLocalMetadata({
  title,
  description,
  path,
  keywords = [],
  image = DEFAULT_IMAGE,
}: LocalMetadataOptions): Metadata {
  const fullTitle = `${title} | Virginia Beach | PSP.Pro`
  const fullDescription = `${description} Serving Virginia Beach, Norfolk, Chesapeake & the 757 area.`
  const url = `${BASE_URL}${path}`
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [...keywords, ...LOCATION_KEYWORDS],
    authors: [{ name: 'ProPer Sports Performance' }],
    creator: 'PSP.Pro',
    publisher: 'ProPer Sports Performance',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: 'PSP.Pro',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [imageUrl],
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
}

// Pre-defined metadata for pages that use this system
export const PAGE_METADATA = {
  about: generateLocalMetadata({
    title: 'About Us',
    description:
      'Learn about ProPer Sports Performance, our coaches, and our commitment to developing elite softball, basketball, and soccer athletes.',
    path: '/about',
    keywords: ['about us', 'coaches', 'athletic training', 'sports performance'],
  }),

  pricing: generateLocalMetadata({
    title: 'Training Packages & Pricing',
    description:
      'View our training packages and pricing for softball, basketball, and soccer lessons, group sessions, and performance programs.',
    path: '/pricing',
    keywords: ['pricing', 'training packages', 'softball lessons', 'basketball training', 'soccer training'],
  }),

  contact: generateLocalMetadata({
    title: 'Contact Us',
    description:
      'Get in touch with PSP.Pro to start your athletic training journey. Schedule a session or learn more about our programs.',
    path: '/contact',
    keywords: ['contact', 'schedule', 'training session', 'consultation'],
  }),

  getStarted: generateLocalMetadata({
    title: 'Get Started - Begin Training',
    description:
      'Start your athletic training journey with PSP.Pro. Sign up for softball, basketball, or soccer training sessions today.',
    path: '/get-started',
    keywords: ['get started', 'sign up', 'training', 'registration'],
  }),
}
