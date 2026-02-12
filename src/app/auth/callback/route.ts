import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/locker'
  // Prevent open redirect — only allow relative paths starting with /
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/locker'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check user role to route them correctly (use admin client to bypass RLS timing)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Use admin client to bypass RLS timing, fall back to regular client
        let role: string | undefined
        try {
          const adminClient = createAdminClient()
          const { data: profile } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          role = profile?.role
        } catch {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          role = profile?.role
        }
        if (role === 'admin' || role === 'coach' || role === 'master_admin') {
          return NextResponse.redirect(`${origin}/admin`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
