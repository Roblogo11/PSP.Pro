import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/layout/sidebar'

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

    // Check user role — use admin client to bypass RLS timing issues
    // Fall back to regular client if service role key isn't configured
    let profile: { role: string } | null = null
    try {
      const adminClient = createAdminClient()
      const { data } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      profile = data
    } catch {
      // Service role key not configured — fall back to regular client
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      profile = data
    }

    const role = profile?.role
    const isStaff = role === 'admin' || role === 'coach' || role === 'master_admin'

    // Athletes must have an active package to access the dashboard
    if (!isStaff) {
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
      <main className="flex-1 lg:ml-0">
        {children}
      </main>
    </div>
  )
}
