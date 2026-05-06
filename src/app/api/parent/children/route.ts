import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/parent/children — list children for the authenticated parent
// (or for any parent if the caller is staff and passes ?parent_id=...)
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role, account_type')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const isStaff = ['coach', 'admin', 'master_admin'].includes(profile.role)
  const parentIdParam = request.nextUrl.searchParams.get('parent_id')
  const targetParentId = isStaff && parentIdParam ? parentIdParam : user.id

  const { data, error } = await adminClient
    .from('parent_children')
    .select('*')
    .eq('parent_id', targetParentId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ children: data || [] })
}

// POST /api/parent/children — add a new child to the authenticated parent
// (or to any parent if the caller is staff and passes parent_id in the body)
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role, account_type')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await request.json()
  const { child_name, child_age, athlete_type, sports, notes, parent_id: bodyParentId } = body

  if (!child_name?.trim()) {
    return NextResponse.json({ error: 'child_name is required' }, { status: 400 })
  }

  const isStaff = ['coach', 'admin', 'master_admin'].includes(profile.role)
  const targetParentId = isStaff && bodyParentId ? bodyParentId : user.id

  // Non-staff can only add children to their own parent_guardian account
  if (!isStaff && profile.account_type !== 'parent_guardian') {
    return NextResponse.json(
      { error: 'Only parent/guardian accounts can add children' },
      { status: 403 },
    )
  }

  const { data, error } = await adminClient
    .from('parent_children')
    .insert({
      parent_id: targetParentId,
      child_name: child_name.trim(),
      child_age: child_age ? parseInt(child_age) : null,
      athlete_type: athlete_type || null,
      sports: Array.isArray(sports) ? sports : null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ child: data })
}
