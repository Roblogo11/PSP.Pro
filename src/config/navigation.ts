// Primary navigation flow - PSP.Pro Athletic Training
export const FUNNEL_ROUTES = [
  { path: '/', name: 'Home', keywords: ['start', 'main', 'landing', 'psp'] },
  { path: '/about', name: 'About', keywords: ['team', 'story', 'coaches', 'who'] },
  { path: '/pricing', name: 'Pricing', keywords: ['cost', 'price', 'packages', 'rates', 'sessions'] },
  { path: '/get-started', name: 'Join the Team', keywords: ['begin', 'assessment', 'training', 'onboard', 'join'] },
  { path: '/contact', name: 'Contact', keywords: ['email', 'phone', 'message', 'reach', 'location'] },
] as const

// Additional pages - accessible via Cmd+K and navigation
export const SPOKE_ROUTES = [
  { path: '/blog', name: 'Training Tips', keywords: ['articles', 'tips', 'insights', 'advice'], category: 'Resources' },
  { path: '/faq', name: 'FAQ', keywords: ['questions', 'answers', 'help', 'info'], category: 'Resources' },
  { path: '/booking', name: 'Book Session', keywords: ['schedule', 'appointment', 'reserve', 'time'], category: 'Training' },
  { path: '/locker', name: 'Dashboard', keywords: ['locker', 'stats', 'progress', 'profile'], category: 'Training' },
  { path: '/drills', name: 'Training Drills', keywords: ['drills', 'exercises', 'practice', 'workouts'], category: 'Training' },
  { path: '/login', name: 'Login', keywords: ['signin', 'auth', 'account'], category: 'Account' },
  { path: '/signup', name: 'Sign Up', keywords: ['register', 'join', 'create account'], category: 'Account' },
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
