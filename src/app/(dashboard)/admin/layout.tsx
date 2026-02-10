import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    // Verify admin or coach role (use admin client to bypass RLS timing)
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
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      profile = data
    }

    if (!profile || (profile.role !== 'admin' && profile.role !== 'coach' && profile.role !== 'master_admin')) {
      redirect('/locker')
    }
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Admin auth error:', error?.message || error)
    redirect('/login')
  }

  return <>{children}</>
}
