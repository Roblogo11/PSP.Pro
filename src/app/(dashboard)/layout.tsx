import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/layout/sidebar'
import { HomeButton } from '@/components/layout/home-button'

// Routes any authenticated user can access (session buyers / drop-ins)
const OPEN_ROUTES = [
  '/booking', '/pricing', '/sessions', '/locker',
  '/settings', '/messages', '/guide',
]

// Routes that require an active membership package (not just a single booking)
// Session buyers who try to access these get redirected to /membership-required
const MEMBER_ONLY_ROUTES = [
  '/progress', '/drills', '/achievements', '/leaderboards',
  '/video-analysis', '/courses', '/questionnaires', '/progress-report',
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect dashboard routes - require authentication + active membership
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    // Check user role — prefer admin client (bypasses RLS timing), fall back to regular client
    let profile: { role: string } | null = null
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    if (hasServiceKey) {
      const adminClient = createAdminClient()
      const { data } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      profile = data
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      profile = data
    }

    const role = profile?.role
    const isStaff = role === 'admin' || role === 'coach' || role === 'master_admin'

    // Staff bypass all access checks
    if (!isStaff) {
      const headersList = await headers()
      const pathname = headersList.get('x-next-pathname') || headersList.get('x-invoke-path') || ''
      const isOpenRoute = OPEN_ROUTES.some(route => pathname.includes(route))
      const isMemberRoute = MEMBER_ONLY_ROUTES.some(route => pathname.includes(route))

      if (isMemberRoute) {
        // Member-only routes require an active package (subscription or session package)
        const { data: activePackage } = await supabase
          .from('athlete_packages')
          .select('id')
          .eq('athlete_id', user.id)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .gt('sessions_total', 0)
          .limit(1)
          .single()

        if (!activePackage) {
          redirect('/membership-required')
        }
      } else if (!isOpenRoute) {
        // Non-open, non-member routes: need at least a paid booking or active package
        const { data: activePackage } = await supabase
          .from('athlete_packages')
          .select('id')
          .eq('athlete_id', user.id)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .gt('sessions_total', 0)
          .limit(1)
          .single()

        const { data: activeBooking } = await supabase
          .from('bookings')
          .select('id')
          .eq('athlete_id', user.id)
          .eq('payment_status', 'paid')
          .limit(1)
          .single()

        if (!activePackage && !activeBooking) {
          redirect('/membership-required')
        }
      }
    }
  } catch (error: any) {
    // Re-throw Next.js redirects (they use throw internally)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    // Any other error (Supabase down, config issue) → redirect to login
    console.error('Dashboard auth error:', error?.message || error)
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh]">
      <Sidebar />
      <HomeButton />
      <main className="flex-1 min-w-0 overflow-x-hidden lg:ml-0">
        {children}
      </main>
    </div>
  )
}
