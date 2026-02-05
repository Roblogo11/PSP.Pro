export type ServiceType = 'video' | 'photography' | 'drone' | 'motion-graphics'

export interface Project {
  id: string
  client: string
  location: {
    neighborhood: string  // Ghent, Sandbridge, Downtown Norfolk, etc.
    city: string          // Norfolk, Virginia Beach, Chesapeake
  }
  serviceType: ServiceType
  mediaUrl: string
  mediaType: 'image' | 'video' | 'gif'
  title: string
  description: string
  tags?: string[]
  featured?: boolean
  year?: number
}

export const projects: Project[] = [
  // VIDEO PROJECTS
  {
    id: 'ghent-restaurant-promo',
    client: 'The Birch',
    location: { neighborhood: 'Ghent', city: 'Norfolk' },
    serviceType: 'video',
    mediaUrl: 'https://roblogo.com/wp-content/uploads/2025/02/20240228_125258-1.gif',
    mediaType: 'gif',
    title: 'Restaurant Brand Story',
    description: 'Cinematic brand video capturing the farm-to-table experience at this Ghent staple.',
    tags: ['brand-story', 'restaurant', 'cinematic'],
    featured: true,
    year: 2024,
  },
  {
    id: 'oceanfront-event',
    client: 'VA Beach Tourism',
    location: { neighborhood: 'Oceanfront', city: 'Virginia Beach' },
    serviceType: 'video',
    mediaUrl: 'https://roblogo.com/wp-content/uploads/2025/02/All-sports-need-videography.gif',
    mediaType: 'gif',
    title: 'Summer Festival Coverage',
    description: 'Dynamic event coverage of the annual Oceanfront music festival.',
    tags: ['event', 'festival', 'tourism'],
    featured: true,
    year: 2024,
  },
  {
    id: 'downtown-corporate',
    client: 'Harbor Group',
    location: { neighborhood: 'Downtown', city: 'Norfolk' },
    serviceType: 'video',
    mediaUrl: 'https://roblogo.com/wp-content/uploads/2025/02/chris-sm-clip-dallas-game.gif',
    mediaType: 'gif',
    title: 'Corporate Brand Film',
    description: 'Executive interviews and office culture showcase for this Downtown Norfolk firm.',
    tags: ['corporate', 'interviews', 'brand'],
    year: 2024,
  },

  // PHOTOGRAPHY PROJECTS
  {
    id: 'sandbridge-real-estate',
    client: 'Sandbridge Realty',
    location: { neighborhood: 'Sandbridge', city: 'Virginia Beach' },
    serviceType: 'photography',
    mediaUrl: 'https://roblogo.com/wp-content/uploads/2025/02/D-law-1.gif',
    mediaType: 'gif',
    title: 'Luxury Beach Properties',
    description: 'Aerial and interior photography for high-end Sandbridge vacation rentals.',
    tags: ['real-estate', 'luxury', 'aerial'],
    featured: true,
    year: 2024,
  },
  {
    id: 'greenbrier-product',
    client: 'Local Artisan Co',
    location: { neighborhood: 'Greenbrier', city: 'Chesapeake' },
    serviceType: 'photography',
    mediaUrl: 'https://roblogo.com/wp-content/uploads/2025/03/fix-my-website.gif',
    mediaType: 'gif',
    title: 'Product Photography',
    description: 'E-commerce product shots for handcrafted goods from this Chesapeake maker.',
    tags: ['product', 'e-commerce', 'artisan'],
    year: 2024,
  },

  // DRONE PROJECTS
  {
    id: 'town-center-aerial',
    client: 'Armada Hoffler',
    location: { neighborhood: 'Town Center', city: 'Virginia Beach' },
    serviceType: 'drone',
    mediaUrl: 'https://roblogo.com/wp-content/uploads/2025/03/drone-show-va-beach.gif',
    mediaType: 'gif',
    title: 'Commercial Development',
    description: 'Progress documentation and marketing aerials for Town Center expansion.',
    tags: ['construction', 'commercial', 'progress'],
    featured: true,
    year: 2024,
  },
]

// Helper functions
export function getProjectsByService(serviceType: ServiceType): Project[] {
  return projects.filter(p => p.serviceType === serviceType)
}

export function getProjectsByNeighborhood(neighborhood: string): Project[] {
  return projects.filter(p =>
    p.location.neighborhood.toLowerCase() === neighborhood.toLowerCase()
  )
}

export function getProjectsByCity(city: string): Project[] {
  return projects.filter(p =>
    p.location.city.toLowerCase() === city.toLowerCase()
  )
}

export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.featured)
}
