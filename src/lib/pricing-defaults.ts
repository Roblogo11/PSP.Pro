// Fallback pricing data — used when Supabase fetch returns empty or fails.
// Keep in sync with what coaches see in /admin/services.

export interface PricingService {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price_cents: number
  category: string // 'individual' | 'group' | 'specialty'
  max_participants: number
  is_active: boolean
  video_url?: string | null
}

export interface PricingPackage {
  id: string
  name: string
  description: string | null
  sessions_included: number
  price_cents: number
  validity_days: number
  is_active: boolean
}

export const DEFAULT_SERVICES: PricingService[] = [
  {
    id: 'default-pitching',
    name: 'Pitching Session',
    description: 'Velocity development\nMechanics analysis\nCommand training\nVideo review included',
    duration_minutes: 60,
    price_cents: 7500,
    category: 'individual',
    max_participants: 1,
    is_active: true,
  },
  {
    id: 'default-hitting',
    name: 'Hitting Session',
    description: 'Exit velocity training\nSwing mechanics\nApproach development\nVideo analysis included',
    duration_minutes: 60,
    price_cents: 7500,
    category: 'individual',
    max_participants: 1,
    is_active: true,
  },
  {
    id: 'default-speed-agility',
    name: 'Speed & Agility',
    description: 'Sprint mechanics\nExplosive power\nAgility drills\nSport-specific movements\nCompetitive environment\nProfessional coaching',
    duration_minutes: 90,
    price_cents: 5000,
    category: 'group',
    max_participants: 6,
    is_active: true,
  },
  {
    id: 'default-video-analysis',
    name: 'Video Analysis',
    description: 'In-depth video breakdown of mechanics with actionable feedback and drill recommendations.',
    duration_minutes: 30,
    price_cents: 5000,
    category: 'specialty',
    max_participants: 1,
    is_active: true,
  },
  {
    id: 'default-recovery',
    name: 'Recovery & Mobility',
    description: 'Guided recovery focused on mobility, flexibility, and injury prevention for optimal performance.',
    duration_minutes: 45,
    price_cents: 4500,
    category: 'specialty',
    max_participants: 1,
    is_active: true,
  },
]

export const DEFAULT_PACKAGES: PricingPackage[] = [
  {
    id: 'default-5-pack',
    name: '5-Session Pack',
    description: null,
    sessions_included: 5,
    price_cents: 35000,
    validity_days: 90,
    is_active: true,
  },
  {
    id: 'default-10-pack',
    name: '10-Session Pack',
    description: null,
    sessions_included: 10,
    price_cents: 67500,
    validity_days: 180,
    is_active: true,
  },
  {
    id: 'default-20-pack',
    name: '20-Session Pack',
    description: null,
    sessions_included: 20,
    price_cents: 130000,
    validity_days: 365,
    is_active: true,
  },
]
