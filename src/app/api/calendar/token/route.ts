import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/calendar/token — returns user's calendar sync URL
 * Regenerates token if expired (90-day rolling window)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('calendar_token, calendar_token_expires_at')
      .eq('id', user.id)
      .single()

    if (!profile?.calendar_token) {
      return NextResponse.json({ error: 'No calendar token' }, { status: 404 })
    }

    let token = profile.calendar_token

    // Regenerate if expired or no expiration set
    const isExpired = profile.calendar_token_expires_at
      && new Date(profile.calendar_token_expires_at) < new Date()

    if (isExpired || !profile.calendar_token_expires_at) {
      const adminClient = createAdminClient()
      const newExpiry = new Date()
      newExpiry.setDate(newExpiry.getDate() + 90)

      const { data: updated } = await adminClient
        .from('profiles')
        .update({
          calendar_token: crypto.randomUUID(),
          calendar_token_expires_at: newExpiry.toISOString(),
        })
        .eq('id', user.id)
        .select('calendar_token')
        .single()

      if (updated) {
        token = updated.calendar_token
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://psp.pro'
    const calendarUrl = `${appUrl}/api/calendar/export?token=${token}`

    return NextResponse.json({ url: calendarUrl, token })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to get calendar token' }, { status: 500 })
  }
}
