import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/org/[id]/members — invite a user to the org by email
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: org_id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()

    // Must be org owner/admin or master_admin
    const [{ data: profile }, { data: membership }] = await Promise.all([
      adminClient.from('profiles').select('role').eq('id', user.id).single(),
      adminClient.from('organization_members').select('role').eq('org_id', org_id).eq('user_id', user.id).maybeSingle(),
    ])

    const canInvite = profile?.role === 'master_admin' || ['owner', 'admin', 'coach'].includes(membership?.role || '')
    if (!canInvite) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const { email, role = 'athlete' } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Find user by email
    const { data: invitee } = await adminClient
      .from('profiles').select('id').eq('email', email.toLowerCase()).maybeSingle()

    if (!invitee) {
      return NextResponse.json({ error: 'No account found with that email. User must sign up first.' }, { status: 404 })
    }

    // Check not already a member
    const { data: existing } = await adminClient
      .from('organization_members')
      .select('id, status')
      .eq('org_id', org_id)
      .eq('user_id', invitee.id)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'User is already a member of this org' }, { status: 409 })
      }
      // Re-activate
      await adminClient.from('organization_members').update({ status: 'active', role }).eq('id', existing.id)
      return NextResponse.json({ ok: true, action: 'reactivated' })
    }

    await adminClient.from('organization_members').insert({
      org_id,
      user_id: invitee.id,
      role,
      status: 'active',
      invited_by: user.id,
    })

    return NextResponse.json({ ok: true, action: 'added' }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/org/[id]/members — update a member's role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: org_id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()
    const { data: membership } = await adminClient
      .from('organization_members').select('role').eq('org_id', org_id).eq('user_id', user.id).maybeSingle()

    const canManage = profile?.role === 'master_admin' || ['owner', 'admin'].includes(membership?.role || '')
    if (!canManage) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

    const { user_id, role, status } = await req.json()
    const updates: Record<string, any> = {}
    if (role) updates.role = role
    if (status) updates.status = status

    await adminClient.from('organization_members')
      .update(updates)
      .eq('org_id', org_id)
      .eq('user_id', user_id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/org/[id]/members?user_id=xxx — remove a member
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: org_id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const target_user_id = req.nextUrl.searchParams.get('user_id') || user.id

    // Can remove self, or admin can remove others
    if (target_user_id !== user.id) {
      const { data: profile } = await adminClient
        .from('profiles').select('role').eq('id', user.id).single()
      const { data: membership } = await adminClient
        .from('organization_members').select('role').eq('org_id', org_id).eq('user_id', user.id).maybeSingle()

      const canRemove = profile?.role === 'master_admin' || ['owner', 'admin'].includes(membership?.role || '')
      if (!canRemove) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await adminClient.from('organization_members')
      .update({ status: 'removed' })
      .eq('org_id', org_id)
      .eq('user_id', target_user_id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
