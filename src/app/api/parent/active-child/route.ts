import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/parent/active-child — switch which child the parent is operating as
// Body: { child_id: string }
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { child_id } = await request.json()
  if (!child_id) {
    return NextResponse.json({ error: 'child_id is required' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Verify child belongs to this parent
  const { data: child, error: childError } = await adminClient
    .from('parent_children')
    .select('id, parent_id')
    .eq('id', child_id)
    .single()

  if (childError || !child) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }
  if (child.parent_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await adminClient
    .from('profiles')
    .update({ active_child_id: child_id })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
