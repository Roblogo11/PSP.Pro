import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()

    // Prevent admin/coach from accidentally self-deleting via this endpoint
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'master_admin') {
      return NextResponse.json(
        { error: 'Master admin accounts cannot be self-deleted. Contact system administrator.' },
        { status: 403 }
      )
    }

    // Delete the user from Supabase Auth — cascades to profiles via FK
    const { error } = await adminClient.auth.admin.deleteUser(user.id)
    if (error) throw error

    // Clear all session cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const response = NextResponse.json({ ok: true })
    for (const cookie of allCookies) {
      response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' })
    }

    return response
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
