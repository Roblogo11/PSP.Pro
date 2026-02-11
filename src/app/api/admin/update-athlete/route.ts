import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['coach', 'admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { athlete_id, full_name, athlete_type, age } = body

    if (!athlete_id) {
      return NextResponse.json({ error: 'athlete_id is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (athlete_type !== undefined) updateData.athlete_type = athlete_type
    if (age !== undefined) updateData.age = age ? parseInt(age) : null

    const { error: updateError } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', athlete_id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update athlete' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating athlete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
