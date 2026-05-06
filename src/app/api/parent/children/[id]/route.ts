import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// PATCH /api/parent/children/[id] — update a child record
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile && ['coach', 'admin', 'master_admin'].includes(profile.role)

  // Verify ownership unless staff
  const { data: child } = await adminClient
    .from('parent_children')
    .select('parent_id')
    .eq('id', params.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  if (child.parent_id !== user.id && !isStaff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.child_name !== undefined) updateData.child_name = body.child_name
  if (body.child_age !== undefined) updateData.child_age = body.child_age ? parseInt(body.child_age) : null
  if (body.athlete_type !== undefined) updateData.athlete_type = body.athlete_type
  if (body.sports !== undefined) updateData.sports = body.sports
  if (body.notes !== undefined) updateData.notes = body.notes
  if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url

  const { error } = await adminClient
    .from('parent_children')
    .update(updateData)
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/parent/children/[id] — remove a child record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile && ['admin', 'master_admin'].includes(profile.role)

  const { data: child } = await adminClient
    .from('parent_children')
    .select('parent_id')
    .eq('id', params.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  if (child.parent_id !== user.id && !isStaff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await adminClient
    .from('parent_children')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
