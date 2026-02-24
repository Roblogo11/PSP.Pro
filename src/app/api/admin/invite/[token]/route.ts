import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const adminClient = createAdminClient()
    const { data: link } = await adminClient
      .from('invite_links')
      .select('*, coach:coach_id(full_name, avatar_url)')
      .eq('token', params.token)
      .single()

    if (!link) {
      return NextResponse.json({ valid: false, error: 'Link not found' }, { status: 404 })
    }

    if (new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Link expired' }, { status: 410 })
    }

    if (link.uses >= link.max_uses) {
      return NextResponse.json({ valid: false, error: 'Link already used' }, { status: 410 })
    }

    return NextResponse.json({
      valid: true,
      coachName: (link.coach as any)?.full_name || 'Your Coach',
      sport: link.sport,
    })
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 })
  }
}
