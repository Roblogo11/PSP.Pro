import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { auditLog } from '@/lib/audit'
import { getClientIP } from '@/lib/rate-limit'

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

    // Coaches must have a booking relationship with the athlete (not master_admin/admin)
    if (profile.role === 'coach') {
      const { data: relationship } = await adminClient
        .from('bookings')
        .select('id')
        .eq('coach_id', user.id)
        .eq('athlete_id', athlete_id)
        .limit(1)
        .maybeSingle()

      if (!relationship) {
        return NextResponse.json({ error: 'You do not manage this athlete' }, { status: 403 })
      }
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

    auditLog({
      userId: user.id,
      action: 'athlete_updated',
      resourceType: 'profile',
      resourceId: athlete_id,
      metadata: { fields: Object.keys(updateData), role: profile.role },
      ip: getClientIP(request),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating athlete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
