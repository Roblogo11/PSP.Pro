import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['coach', 'admin', 'master_admin'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('org_id')

    let linksQuery = adminClient
      .from('invite_links')
      .select('*')
      .order('created_at', { ascending: false })

    if (orgId) {
      linksQuery = linksQuery.eq('org_id', orgId)
    } else {
      linksQuery = linksQuery.eq('coach_id', user.id)
    }

    const { data: links } = await linksQuery

    return NextResponse.json({ links: links || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['coach', 'admin', 'master_admin'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { sport, trial_days = 30, max_uses = 1, org_id } = body

    const { data: link, error } = await adminClient
      .from('invite_links')
      .insert({
        coach_id: user.id,
        sport: sport || null,
        trial_days,
        max_uses,
        org_id: org_id || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ link })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const adminClient = createAdminClient()
    await adminClient
      .from('invite_links')
      .delete()
      .eq('id', id)
      .eq('coach_id', user.id) // coaches can only delete their own

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
