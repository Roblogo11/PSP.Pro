import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/calendar/token — returns user's calendar sync URL
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
      .select('calendar_token')
      .eq('id', user.id)
      .single()

    if (!profile?.calendar_token) {
      return NextResponse.json({ error: 'No calendar token' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://psp.pro'
    const calendarUrl = `${appUrl}/api/calendar/export?token=${profile.calendar_token}`

    return NextResponse.json({ url: calendarUrl, token: profile.calendar_token })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
