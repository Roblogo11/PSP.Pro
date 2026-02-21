import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/layout/sidebar'

// Routes that authenticated users can access without an active membership
const OPEN_ROUTES = ['/booking', '/pricing', '/sessions']

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
    let profile: { role: string; trial_expires_at: string | null } | null = null
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    if (hasServiceKey) {
      const adminClient = createAdminClient()
      const { data } = await adminClient
        .from('profiles')
        .select('role, trial_expires_at')
        .eq('id', user.id)
        .single()
      profile = data
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('role, trial_expires_at')
        .eq('id', user.id)
        .single()
      profile = data
    }

    const role = profile?.role
    const isStaff = role === 'admin' || role === 'coach' || role === 'master_admin'
    // Coach-created athletes get a trial period — check if still active
    const hasActiveTrial = profile?.trial_expires_at
      ? new Date(profile.trial_expires_at) > new Date()
      : false

    // Allow authenticated users to access booking/pricing even without membership
    const headersList = await headers()
    const pathname = headersList.get('x-next-pathname') || headersList.get('x-invoke-path') || ''
    const isOpenRoute = OPEN_ROUTES.some(route => pathname.includes(route))

    // Athletes must have an active package (or active trial) to access the dashboard
    // Exception: booking and pricing pages are always accessible to authenticated users
    if (!isStaff && !hasActiveTrial && !isOpenRoute) {
      const { data: activePackage } = await supabase
        .from('athlete_packages')
        .select('id')
        .eq('athlete_id', user.id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .gt('sessions_total', 0)
        .limit(1)
        .single()

      // Also check for any active bookings (single session purchases)
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
      <main className="flex-1 min-w-0 overflow-x-hidden lg:ml-0">
        {children}
      </main>
    </div>
  )
}
