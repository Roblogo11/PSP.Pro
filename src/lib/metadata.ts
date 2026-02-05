import { Metadata } from 'next'

interface LocalMetadataOptions {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string
}

const BASE_URL = 'https://shockai.io'
const DEFAULT_IMAGE = '/og-image.jpg'

// Location keywords to boost local SEO - includes 757 area + neighborhoods
const LOCATION_KEYWORDS = [
  // Core cities
  'Norfolk',
  'Virginia Beach',
  '757',
  'Hampton Roads',
  'Chesapeake',
  'Hampton',
  'Newport News',
  'Coastal Virginia',
  'VA',
  // Norfolk neighborhoods
  'Ghent',
  'Downtown Norfolk',
  'Ocean View',
  'Larchmont',
  'Riverview',
  // Virginia Beach neighborhoods
  'Town Center',
  'Chics Beach',
  'Oceanfront',
  'Hilltop',
  'Great Neck',
  'Sandbridge',
  // Chesapeake areas
  'Great Bridge',
  'Greenbrier',
  'Western Branch',
]

export function generateLocalMetadata({
  title,
  description,
  path,
  keywords = [],
  image = DEFAULT_IMAGE,
}: LocalMetadataOptions): Metadata {
  const fullTitle = `${title} | Norfolk & Virginia Beach | ShockAI`
  const fullDescription = `${description} Serving Norfolk, Virginia Beach, Chesapeake & the 757 area.`
  const url = `${BASE_URL}${path}`
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [...keywords, ...LOCATION_KEYWORDS],
    authors: [{ name: 'ShockAI' }],
    creator: 'ShockAI',
    publisher: 'ShockAI',
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
      siteName: 'ShockAI',
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
}

// Pre-defined metadata for common pages
export const PAGE_METADATA = {
  home: generateLocalMetadata({
    title: 'AI-Native Creative Studio',
    description:
      'AI-powered video production, web development, drone photography, and creative services.',
    path: '/',
    keywords: ['creative studio', 'AI', 'video production', 'web development', 'marketing'],
  }),

  video: generateLocalMetadata({
    title: 'Video Production',
    description:
      '4K cinematography, commercial video production, and professional videography services.',
    path: '/video',
    keywords: ['video production', '4K', 'cinematography', 'commercial video', 'videographer'],
  }),

  shockKit: generateLocalMetadata({
    title: 'The Shock Kit - Social Media Content',
    description:
      'Monthly social media content packages including photos, videos, and graphics for your brand.',
    path: '/shock-kit',
    keywords: ['social media', 'content creation', 'monthly package', 'brand content', 'marketing'],
  }),

  websiteHelp: generateLocalMetadata({
    title: 'AI + Website Help - Web Development',
    description:
      'AI-powered website design, development, and optimization services for modern businesses.',
    path: '/website-help',
    keywords: ['web development', 'website design', 'AI websites', 'web design', 'SEO'],
  }),

  getStarted: generateLocalMetadata({
    title: 'Get Started - Request a Quote',
    description:
      'Start your project with ShockAI. Get a free consultation and custom quote for your creative needs.',
    path: '/get-started',
    keywords: ['get started', 'quote', 'consultation', 'project', 'contact'],
  }),

  drone: generateLocalMetadata({
    title: 'Drone Photography & Aerial Video',
    description:
      'Professional drone photography and aerial videography services for real estate, events, and commercial projects.',
    path: '/drone',
    keywords: ['drone photography', 'aerial video', 'FPV', 'DJI', 'real estate photography'],
  }),

  photography: generateLocalMetadata({
    title: 'Professional Photography',
    description:
      'Professional photography services including portraits, headshots, events, and commercial photography.',
    path: '/photography',
    keywords: ['photography', 'portraits', 'headshots', 'event photography', 'commercial'],
  }),

  podcast: generateLocalMetadata({
    title: 'Podcast Production',
    description:
      'Professional podcast production services including recording, editing, and distribution.',
    path: '/podcast',
    keywords: ['podcast production', 'audio recording', 'podcast editing', 'studio'],
  }),

  seo: generateLocalMetadata({
    title: 'SEO Services - Search Engine Optimization',
    description:
      'Local SEO and search engine optimization services to help your business rank higher on Google.',
    path: '/seo',
    keywords: ['SEO', 'search engine optimization', 'local SEO', 'Google ranking', 'digital marketing'],
  }),

  blog: generateLocalMetadata({
    title: 'Blog - AI, Web Development & Creative Insights',
    description:
      'Explore insights on AI technology, web development, photography, video production, and creative trends.',
    path: '/blog',
    keywords: ['blog', 'AI insights', 'web development tips', 'creative industry', 'technology'],
  }),

  about: generateLocalMetadata({
    title: 'About Us - Our Story',
    description:
      'Learn about ShockAI, our team, mission, and commitment to delivering exceptional creative services.',
    path: '/about',
    keywords: ['about us', 'team', 'mission', 'creative agency', 'company'],
  }),

  pricing: generateLocalMetadata({
    title: 'Pricing - Service Packages',
    description:
      'Transparent pricing for video production, web development, photography, and creative services.',
    path: '/pricing',
    keywords: ['pricing', 'packages', 'rates', 'cost', 'services'],
  }),

  contact: generateLocalMetadata({
    title: 'Contact Us',
    description:
      'Get in touch with ShockAI for your next creative project. Request a quote or schedule a consultation.',
    path: '/contact',
    keywords: ['contact', 'get in touch', 'quote', 'consultation', 'email'],
  }),

  // Additional service pages
  motionGraphics: generateLocalMetadata({
    title: 'Motion Graphics & Animation',
    description:
      'Professional motion graphics, 2D/3D animation, and visual effects for commercials, social media, and brand content in Hampton Roads.',
    path: '/motion-graphics',
    keywords: ['motion graphics', 'animation', '2D animation', '3D animation', 'visual effects', 'VFX', 'After Effects'],
  }),

  digitalBuilds: generateLocalMetadata({
    title: 'Digital Builds - Custom Web Applications',
    description:
      'Custom web application development, SaaS platforms, and digital product builds for startups and enterprises in the 757.',
    path: '/digital-builds',
    keywords: ['web applications', 'custom software', 'SaaS', 'app development', 'startup tech', 'React', 'Next.js'],
  }),

  websiteRedesign: generateLocalMetadata({
    title: 'Website Redesign Services',
    description:
      'Transform your outdated website with modern design, improved UX, and faster performance. Website redesign specialists in Norfolk and Virginia Beach.',
    path: '/website-redesign',
    keywords: ['website redesign', 'website refresh', 'UX design', 'site overhaul', 'modern website', 'responsive design'],
  }),

  websiteFix: generateLocalMetadata({
    title: 'Website Fix & Repair Services',
    description:
      'Fast website bug fixes, performance optimization, security patches, and emergency repairs for businesses in Hampton Roads.',
    path: '/website-fix',
    keywords: ['website fix', 'bug fix', 'website repair', 'site maintenance', 'WordPress fix', 'performance optimization'],
  }),

  mediaProduction: generateLocalMetadata({
    title: 'Media Production Services',
    description:
      'Full-service media production including video, photography, audio, and post-production for brands in Norfolk, Virginia Beach, and Chesapeake.',
    path: '/media-production',
    keywords: ['media production', 'content production', 'brand media', 'commercial production', 'corporate video'],
  }),

  thankYou: generateLocalMetadata({
    title: 'Thank You',
    description:
      'Thank you for contacting ShockAI. We will review your project and get back to you within 24 hours.',
    path: '/thank-you',
    keywords: ['thank you', 'confirmation', 'contact received'],
  }),

  pricingSpecials: generateLocalMetadata({
    title: 'Special Offers & Promotions',
    description:
      'Limited-time deals and special pricing on video production, web development, and creative services in the 757 area.',
    path: '/pricing/specials',
    keywords: ['specials', 'deals', 'promotions', 'discounts', 'limited time', 'offers'],
  }),

  creatorForge: generateLocalMetadata({
    title: 'Creator Forge - AI Content Tools',
    description:
      'AI-powered content creation tools for creators, marketers, and businesses. Generate ideas, scripts, and content strategies.',
    path: '/tools/creator-forge',
    keywords: ['AI tools', 'content generator', 'creator tools', 'AI writing', 'content strategy'],
  }),

  whitelist: generateLocalMetadata({
    title: 'Partner Whitelist',
    description:
      'Join the ShockAI partner whitelist for early access to new services, exclusive rates, and priority scheduling.',
    path: '/whitelist',
    keywords: ['whitelist', 'early access', 'partner program', 'VIP', 'exclusive'],
  }),

  // CEO/Team pages
  ceoRobbieCreates: generateLocalMetadata({
    title: 'Robbie Creates - Creative Director',
    description:
      'Meet Robbie, Creative Director at ShockAI. Specializing in video production, cinematography, and visual storytelling in Norfolk VA.',
    path: '/about/ceo-robbie-creates',
    keywords: ['Robbie Creates', 'creative director', 'videographer', 'cinematographer', 'Norfolk creative'],
  }),

  ceoPmbai: generateLocalMetadata({
    title: 'PMBAI - Technical Director',
    description:
      'Meet PMBAI, Technical Director at ShockAI. Leading AI integration, web development, and digital innovation in Hampton Roads.',
    path: '/about/ceo-pmbai',
    keywords: ['PMBAI', 'technical director', 'AI developer', 'web developer', 'tech lead'],
  }),

  // Blog posts with unique, SEO-optimized descriptions
  blogAiVsWebsites: generateLocalMetadata({
    title: 'AI vs Traditional Websites: The Future of Web Development',
    description:
      'Discover how AI is transforming web development in 2026. Compare AI-generated websites vs traditional builds for Norfolk and Virginia Beach businesses.',
    path: '/blog/ai-vs-websites',
    keywords: ['AI websites', 'AI web development', 'website builder', 'AI vs traditional', 'future of web'],
  }),

  blogCiteWebsiteGuide: generateLocalMetadata({
    title: 'How to Cite a Website: Complete Guide for 2026',
    description:
      'Learn proper website citation formats for MLA, APA, and Chicago styles. Essential guide for students and researchers in Virginia.',
    path: '/blog/cite-website-guide',
    keywords: ['cite website', 'MLA citation', 'APA citation', 'Chicago style', 'bibliography', 'research'],
  }),

  blogHeadshotPortraitStyles: generateLocalMetadata({
    title: 'Professional Headshot & Portrait Styles Guide',
    description:
      'Explore headshot styles for LinkedIn, corporate, and creative portfolios. Professional portrait photography tips from Norfolk photographers.',
    path: '/blog/headshot-portrait-styles',
    keywords: ['headshot styles', 'portrait photography', 'LinkedIn headshot', 'corporate portrait', 'professional photo'],
  }),

  blogPhotographyCourse: generateLocalMetadata({
    title: 'Photography Course: From Beginner to Pro',
    description:
      'Free photography course covering camera basics, lighting, composition, and editing. Learn photography in Hampton Roads with ShockAI.',
    path: '/blog/photography-course',
    keywords: ['photography course', 'learn photography', 'camera basics', 'photo editing', 'photography tutorial'],
  }),

  blogUsingWordpress: generateLocalMetadata({
    title: 'WordPress Guide: Building Your Business Website',
    description:
      'Complete WordPress tutorial for small businesses. Learn to build, customize, and optimize your WordPress site in Virginia Beach.',
    path: '/blog/using-wordpress',
    keywords: ['WordPress', 'WordPress tutorial', 'business website', 'CMS', 'website builder', 'WordPress guide'],
  }),

  blogWebCookies: generateLocalMetadata({
    title: 'Web Cookies Explained: Privacy & Compliance Guide',
    description:
      'Understand web cookies, GDPR compliance, and privacy best practices. Essential reading for website owners in Norfolk and beyond.',
    path: '/blog/web-cookies',
    keywords: ['web cookies', 'GDPR', 'privacy policy', 'cookie consent', 'website compliance', 'data privacy'],
  }),

  blogWebsitesShockmp: generateLocalMetadata({
    title: 'Website Design Portfolio: ShockMP Projects',
    description:
      'Explore our website design portfolio featuring local Norfolk and Virginia Beach businesses. See real results from ShockAI web projects.',
    path: '/blog/websites-shockmp',
    keywords: ['website portfolio', 'web design examples', 'Norfolk websites', 'local business websites', 'case studies'],
  }),
}
