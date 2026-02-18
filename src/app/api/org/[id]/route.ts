import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/org/[id] — fetch one org's full details
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: org, error } = await adminClient
      .from('organizations')
      .select(`
        *,
        owner:profiles!organizations_owner_id_fkey(id, full_name, email, avatar_url),
        members:organization_members(
          id, role, status, joined_at,
          user:profiles(id, full_name, email, avatar_url, role)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ org })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/org/[id] — update org settings
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()

    // Must be org owner or master_admin
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()
    const { data: membership } = await adminClient
      .from('organization_members')
      .select('role')
      .eq('org_id', id)
      .eq('user_id', user.id)
      .single()

    const canEdit = profile?.role === 'master_admin' || membership?.role === 'owner'
    if (!canEdit) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const body = await req.json()
    const allowed = [
      'name', 'tagline', 'logo_url', 'primary_color', 'secondary_color', 'accent_color',
      'hero_headline', 'hero_subheadline', 'about_text', 'sport_focus',
      'platform_fee_percent', 'allow_self_signup', 'require_approval', 'timezone',
      'is_active', 'custom_domain',
    ]
    const updates: Record<string, any> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const { data: updated, error } = await adminClient
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ org: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/org/[id] — deactivate org (master_admin only)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Master admin only' }, { status: 403 })
    }

    await adminClient.from('organizations').update({ is_active: false }).eq('id', id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
