import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/org — list orgs the current user belongs to
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()

    // Master admin sees all orgs
    if (profile?.role === 'master_admin') {
      const { data: orgs } = await adminClient
        .from('organizations')
        .select(`
          *,
          owner:profiles!organizations_owner_id_fkey(id, full_name, email),
          member_count:organization_members(count)
        `)
        .order('created_at', { ascending: false })
      return NextResponse.json({ orgs: orgs || [] })
    }

    // Regular users: orgs they're members of
    const { data: memberships } = await adminClient
      .from('organization_members')
      .select(`
        role, status, joined_at,
        org:organizations(
          id, name, slug, logo_url, primary_color, secondary_color,
          tagline, stripe_connect_status, platform_fee_percent, is_active,
          owner_id, created_at
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')

    const orgs = memberships?.map(m => ({ ...m.org, member_role: m.role })) || []
    return NextResponse.json({ orgs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/org — create a new organization (coach/admin/master_admin)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()

    if (!profile || !['coach', 'admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only coaches and admins can create organizations' }, { status: 403 })
    }

    const body = await req.json()
    const { name, slug, primary_color, secondary_color, tagline, sport_focus, platform_fee_percent } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 })
    }

    const { data: org, error } = await adminClient
      .from('organizations')
      .insert({
        name,
        slug,
        owner_id: user.id,
        primary_color: primary_color || '#f97316',
        secondary_color: secondary_color || '#06b6d4',
        tagline: tagline || null,
        sport_focus: sport_focus || [],
        platform_fee_percent: platform_fee_percent ?? 15,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'That slug is already taken' }, { status: 409 })
      }
      throw error
    }

    // Auto-add creator as owner member
    await adminClient.from('organization_members').insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner',
      status: 'active',
    })

    return NextResponse.json({ org }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
