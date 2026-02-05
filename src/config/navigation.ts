// Primary funnel flow - the "Linear OS" path
export const FUNNEL_ROUTES = [
  { path: '/', name: 'Home', keywords: ['start', 'main', 'landing'] },
  { path: '/video', name: 'Video Production', keywords: ['film', 'recording', 'cinematography', '4k'] },
  { path: '/shock-kit', name: 'The Shock Kit', keywords: ['social', 'content', 'monthly', 'package'] },
  { path: '/website-help', name: 'AI + Website Help', keywords: ['web', 'design', 'ai', 'development'] },
  { path: '/get-started', name: 'Get Started', keywords: ['begin', 'services', 'contact', 'quote'] },
] as const

// Spoke pages - accessible via Cmd+K and footer, not in main funnel
export const SPOKE_ROUTES = [
  { path: '/drone', name: 'Drone Services', keywords: ['aerial', 'flying', 'fpv', 'dji'], category: 'Services' },
  { path: '/photography', name: 'Photography', keywords: ['photo', 'shoot', 'portrait', 'headshot'], category: 'Services' },
  { path: '/podcast', name: 'Podcast Production', keywords: ['audio', 'interview', 'recording', 'studio'], category: 'Services' },
  { path: '/seo', name: 'SEO Services', keywords: ['search', 'optimization', 'google', 'ranking'], category: 'Services' },
  { path: '/motion-graphics', name: 'Motion Graphics', keywords: ['animation', 'video', 'effects'], category: 'Services' },
  { path: '/digital-builds', name: 'Digital Builds', keywords: ['web', 'app', 'development'], category: 'Services' },
  { path: '/website-redesign', name: 'Website Redesign', keywords: ['redesign', 'refresh', 'update'], category: 'Services' },
  { path: '/website-fix', name: 'Website Fix', keywords: ['fix', 'repair', 'bug', 'issue'], category: 'Services' },
  { path: '/blog', name: 'Blog', keywords: ['articles', 'news', 'insights', 'posts'], category: 'Resources' },
  { path: '/about', name: 'About Us', keywords: ['team', 'story', 'company', 'who'], category: 'Company' },
  { path: '/pricing', name: 'Pricing', keywords: ['cost', 'price', 'packages', 'rates'], category: 'Company' },
  { path: '/contact', name: 'Contact', keywords: ['email', 'phone', 'message', 'reach'], category: 'Company' },
] as const

// All routes combined for search
export const ALL_ROUTES = [...FUNNEL_ROUTES, ...SPOKE_ROUTES]

// Helper to get funnel position
export function getFunnelIndex(path: string): number {
  return FUNNEL_ROUTES.findIndex((route) => route.path === path)
}

// Helper to get next/prev funnel routes
export function getFunnelNavigation(currentPath: string) {
  const currentIndex = getFunnelIndex(currentPath)

  if (currentIndex === -1) {
    // Not in funnel - return null
    return { prev: null, next: null, isInFunnel: false }
  }

  return {
    prev: currentIndex > 0 ? FUNNEL_ROUTES[currentIndex - 1] : null,
    next: currentIndex < FUNNEL_ROUTES.length - 1 ? FUNNEL_ROUTES[currentIndex + 1] : null,
    isInFunnel: true,
  }
}

// Get direction for transitions: 1 = forward, -1 = backward
export function getTransitionDirection(fromPath: string, toPath: string): number {
  const fromIndex = getFunnelIndex(fromPath)
  const toIndex = getFunnelIndex(toPath)

  // If either path is not in funnel, use a default forward transition
  if (fromIndex === -1 || toIndex === -1) {
    return 1
  }

  return toIndex > fromIndex ? 1 : -1
}
