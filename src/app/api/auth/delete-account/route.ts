import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const { allowed } = rateLimit(`delete-account:${ip}`, { limit: 3, windowSec: 3600 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()

    // Prevent admin/coach from accidentally self-deleting via this endpoint
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'master_admin') {
      return NextResponse.json(
        { error: 'Master admin accounts cannot be self-deleted. Contact system administrator.' },
        { status: 403 }
      )
    }

    // Archive the account before deletion (non-fatal if it fails)
    try {
      const [bookingsRes, metricsRes] = await Promise.all([
        adminClient.from('bookings').select('*').eq('user_id', user.id),
        adminClient.from('athlete_performance_metrics').select('*').eq('user_id', user.id),
      ])
      await adminClient.from('archived_accounts').insert({
        original_user_id: user.id,
        email: user.email,
        profile_snapshot: profile ?? null,
        bookings_snapshot: bookingsRes.data ?? [],
        metrics_snapshot: metricsRes.data ?? [],
        archived_at: new Date().toISOString(),
      })
    } catch (archiveErr) {
      console.error('Archive failed (non-fatal):', archiveErr)
    }

    // Delete the user from Supabase Auth — cascades to profiles via FK
    const { error } = await adminClient.auth.admin.deleteUser(user.id)
    if (error) throw error

    auditLog({ userId: user.id, action: 'account_deleted', resourceType: 'user', resourceId: user.id, ip })

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
