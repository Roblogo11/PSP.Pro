export interface GalleryCategory {
  id: string
  label: string
  description: string
}

export interface GalleryConfig {
  photography: GalleryCategory[]
  video: GalleryCategory[]
  drone: GalleryCategory[]
  podcast: GalleryCategory[]
  'media-production': GalleryCategory[]
  'motion-graphics': GalleryCategory[]
  'digital-builds': GalleryCategory[]
  'website-redesign': GalleryCategory[]
}

export const galleryCategories: GalleryConfig = {
  photography: [
    {
      id: 'products',
      label: 'Product Photography',
      description: 'Professional product shots and lifestyle photography'
    },
    {
      id: 'events',
      label: 'Events',
      description: 'Event coverage and live photography'
    },
    {
      id: 'portraits',
      label: 'Portraits',
      description: 'Professional headshots and portrait photography'
    },
    {
      id: 'lifestyle',
      label: 'Lifestyle',
      description: 'Lifestyle and environmental photography'
    },
    {
      id: 'headshots',
      label: 'Headshots',
      description: 'Professional business headshots'
    },
    {
      id: 'commercial',
      label: 'Commercial',
      description: 'Commercial and advertising photography'
    }
  ],
  video: [
    {
      id: 'corporate',
      label: 'Corporate',
      description: 'Corporate videos and promotional content'
    },
    {
      id: 'events',
      label: 'Events',
      description: 'Event videography and live coverage'
    },
    {
      id: 'promotional',
      label: 'Promotional',
      description: 'Marketing and promotional videos'
    },
    {
      id: 'documentary',
      label: 'Documentary',
      description: 'Documentary-style videos and storytelling'
    },
    {
      id: 'wedding',
      label: 'Wedding',
      description: 'Wedding videography'
    }
  ],
  drone: [
    {
      id: 'aerial',
      label: 'Aerial',
      description: 'Aerial photography and videography'
    },
    {
      id: 'real-estate',
      label: 'Real Estate',
      description: 'Property and real estate aerial shots'
    },
    {
      id: 'events',
      label: 'Events',
      description: 'Aerial event coverage'
    },
    {
      id: 'landscape',
      label: 'Landscape',
      description: 'Landscape and scenic aerial photography'
    },
    {
      id: 'construction',
      label: 'Construction',
      description: 'Construction site monitoring and documentation'
    }
  ],
  podcast: [
    {
      id: 'interviews',
      label: 'Interviews',
      description: 'Guest interviews and conversations'
    },
    {
      id: 'tutorials',
      label: 'Tutorials',
      description: 'Educational and how-to content'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      description: 'Product and service reviews'
    },
    {
      id: 'discussions',
      label: 'Discussions',
      description: 'Panel discussions and roundtables'
    },
    {
      id: 'live-shows',
      label: 'Live Shows',
      description: 'Live podcast recordings and streams'
    },
    {
      id: 'behind-the-scenes',
      label: 'Behind The Scenes',
      description: 'BTS content and production insights'
    }
  ],
  'media-production': [
    {
      id: 'podcasts',
      label: 'Podcasts',
      description: 'Podcast production and recording'
    },
    {
      id: 'interviews',
      label: 'Interviews',
      description: 'Professional interview productions'
    },
    {
      id: 'promotional',
      label: 'Promotional',
      description: 'Promotional video content'
    },
    {
      id: 'social-content',
      label: 'Social Content',
      description: 'Social media video content'
    },
    {
      id: 'behind-the-scenes',
      label: 'Behind The Scenes',
      description: 'BTS production content'
    }
  ],
  'motion-graphics': [
    {
      id: '3d-renders',
      label: '3D Renders',
      description: 'AI-generated 3D visualizations'
    },
    {
      id: 'animations',
      label: 'Animations',
      description: 'Motion graphics and animations'
    },
    {
      id: 'generative-art',
      label: 'Generative Art',
      description: 'AI-powered generative art systems'
    },
    {
      id: 'social-graphics',
      label: 'Social Graphics',
      description: 'Animated social media graphics'
    }
  ],
  'digital-builds': [
    {
      id: 'websites',
      label: 'Websites',
      description: 'Custom website builds'
    },
    {
      id: 'web-apps',
      label: 'Web Apps',
      description: 'Interactive web applications'
    },
    {
      id: 'ecommerce',
      label: 'E-Commerce',
      description: 'E-commerce platforms and stores'
    },
    {
      id: 'landing-pages',
      label: 'Landing Pages',
      description: 'High-converting landing pages'
    }
  ],
  'website-redesign': [
    {
      id: 'before-after',
      label: 'Before & After',
      description: 'Website transformation comparisons'
    },
    {
      id: 'redesigns',
      label: 'Redesigns',
      description: 'Full website redesign projects'
    },
    {
      id: 'case-studies',
      label: 'Case Studies',
      description: 'Detailed redesign case studies'
    }
  ]
}

export function getCategoryLabel(type: keyof GalleryConfig, categoryId: string): string {
  const category = galleryCategories[type].find(cat => cat.id === categoryId)
  return category?.label || categoryId
}

export function getCategoryDescription(type: keyof GalleryConfig, categoryId: string): string {
  const category = galleryCategories[type].find(cat => cat.id === categoryId)
  return category?.description || ''
}
