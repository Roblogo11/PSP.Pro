import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/layout/sidebar'
import { HomeButton } from '@/components/layout/home-button'
import { UserProfileProvider } from '@/lib/contexts/user-profile-context'
import type { UserProfile } from '@/lib/hooks/use-user-role'

/** The profiles columns this layout selects — everything UserProfile needs except `email`. */
type ServerProfileRow = Omit<UserProfile, 'email'>

// Routes any authenticated user can access (session buyers / drop-ins)
const OPEN_ROUTES = [
  '/booking', '/sessions', '/locker',
  '/settings', '/guide', '/leaderboards',
  '/admin', // admin pages handle their own staff-only checks internally
  '/messages',
]

// Routes that require an active membership package (not just a single booking)
// Session buyers who try to access these get redirected to /membership-required
const MEMBER_ONLY_ROUTES = [
  '/progress', '/drills', '/achievements',
  '/video-analysis', '/courses', '/questionnaires', '/progress-report',
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Populated by the auth check below and handed to the client so useUserRole
  // doesn't have to re-fetch what we already have. Stays null if anything in
  // the try block fails, in which case the client falls back to fetching.
  let seededProfile: UserProfile | null = null

  // Protect dashboard routes - require authentication + active membership
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    // Check user role — prefer admin client (bypasses RLS timing), fall back to regular client.
    // Selects the full UserProfile shape (not just `role`) so the result can be
    // handed to the client via UserProfileProvider — this is the same single
    // query we already ran, just returning the columns useUserRole needs, which
    // saves the client an identical round trip after hydration.
    const PROFILE_COLUMNS = 'id, full_name, role, avatar_url, account_type, child_name, child_age'
    let profile: ServerProfileRow | null = null
    const hasServiceKey = !!process.env.SUPABASE_SECRET_KEY
    if (hasServiceKey) {
      const adminClient = createAdminClient()
      const { data } = await adminClient
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', user.id)
        .single()
      profile = data as ServerProfileRow | null
    } else {
      const { data } = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', user.id)
        .single()
      profile = data as ServerProfileRow | null
    }

    // Carries the account email from auth into the profile shape the hook expects.
    seededProfile = profile ? { ...profile, email: user.email || '' } : null

    const role = profile?.role
    const isStaff = role === 'admin' || role === 'coach' || role === 'master_admin'

    // Staff bypass all access checks
    if (!isStaff) {
      const headersList = await headers()
      const pathname = headersList.get('x-next-pathname') || headersList.get('x-invoke-path') || ''
      const isOpenRoute = OPEN_ROUTES.some(route => pathname.includes(route))
      const isMemberRoute = MEMBER_ONLY_ROUTES.some(route => pathname.includes(route))

      if (isMemberRoute) {
        // Member-only routes: active session package OR active Elite membership
        const { data: activePackage } = await supabase
          .from('athlete_packages')
          .select('id')
          .eq('athlete_id', user.id)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .gt('sessions_total', 0)
          .limit(1)
          .single()

        const { data: activeMembership } = await supabase
          .from('athlete_memberships')
          .select('id, status, current_period_end')
          .eq('athlete_id', user.id)
          .in('status', ['active', 'trialing'])
          .or('current_period_end.is.null,current_period_end.gt.' + new Date().toISOString())
          .limit(1)
          .single()

        if (!activePackage && !activeMembership) {
          redirect('/membership-required')
        }
      } else if (!isOpenRoute) {
        // Non-open, non-member routes: need at least a paid booking, active package, or active membership
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

        const { data: activeMembership } = await supabase
          .from('athlete_memberships')
          .select('id, status, current_period_end')
          .eq('athlete_id', user.id)
          .in('status', ['active', 'trialing'])
          .or('current_period_end.is.null,current_period_end.gt.' + new Date().toISOString())
          .limit(1)
          .single()

        if (!activePackage && !activeBooking && !activeMembership) {
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
    <UserProfileProvider profile={seededProfile}>
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar />
        <HomeButton />
        {/* pb-24 on mobile clears the fixed bottom nav (≈64–72px) + iPhone home indicator.
            lg:pb-0 because desktop has a side sidebar, not a bottom bar. */}
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto pb-24 lg:pb-0" id="dashboard-main">
          {children}
        </main>
      </div>
    </UserProfileProvider>
  )
}
