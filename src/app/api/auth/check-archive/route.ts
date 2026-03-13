import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

// Called during signup to check if the email has an archived account
// Rate limited + minimal response to prevent email enumeration
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const { allowed } = rateLimit(`check-archive:${ip}`, { limit: 5, windowSec: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { email } = await request.json()
    if (!email) return NextResponse.json({ found: false })

    const adminClient = createAdminClient()

    const { data } = await adminClient
      .from('archived_accounts')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .is('restore_accepted_at', null)
      .order('archived_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) return NextResponse.json({ found: false })

    // Only return archiveId (needed for restore flow) — no name or date to limit info disclosure
    return NextResponse.json({
      found: true,
      archiveId: data.id,
    })
  } catch {
    return NextResponse.json({ found: false })
  }
}
