import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Called during signup to check if the email has an archived account
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ found: false })

    const adminClient = createAdminClient()

    const { data } = await adminClient
      .from('archived_accounts')
      .select('id, archived_at, profile_snapshot')
      .eq('email', email.toLowerCase().trim())
      .is('restore_accepted_at', null)
      .order('archived_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) return NextResponse.json({ found: false })

    return NextResponse.json({
      found: true,
      archiveId: data.id,
      archivedAt: data.archived_at,
      name: data.profile_snapshot?.full_name ?? null,
    })
  } catch {
    return NextResponse.json({ found: false })
  }
}
