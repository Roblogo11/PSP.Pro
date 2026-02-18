import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { getParentNotificationEmail } from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { parentName, parentEmail, athleteName, athleteAge } = await req.json()

    if (!parentEmail || !parentName || !athleteName || !athleteAge) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Only send if this is for the calling user (can't trigger on behalf of others)
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, full_name, parent_consent_sent_at')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Don't spam — only send once
    if (profile.parent_consent_sent_at) {
      return NextResponse.json({ ok: true, alreadySent: true })
    }

    const emailData = getParentNotificationEmail({ parentName, parentEmail, athleteName, athleteAge })
    await sendEmail({ to: parentEmail, ...emailData })

    // Record that we sent it
    await adminClient
      .from('profiles')
      .update({ parent_consent_sent_at: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Parent notify error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
