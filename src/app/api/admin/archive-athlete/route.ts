import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { auditLog } from '@/lib/audit'
import { getClientIP } from '@/lib/rate-limit'

// POST: Archive (soft-delete) an athlete — coaches and admins can do this
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
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

    const { athlete_id } = await request.json()

    if (!athlete_id) {
      return NextResponse.json({ error: 'athlete_id is required' }, { status: 400 })
    }

    if (athlete_id === user.id) {
      return NextResponse.json({ error: 'Cannot archive your own account' }, { status: 400 })
    }

    // Coaches must have a booking relationship with the athlete
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

    // Verify athlete exists and is not already archived
    const { data: athlete } = await adminClient
      .from('profiles')
      .select('id, full_name, archived_at')
      .eq('id', athlete_id)
      .single()

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 })
    }

    if (athlete.archived_at) {
      return NextResponse.json({ error: 'Athlete is already archived' }, { status: 400 })
    }

    // Soft-delete: set archived_at timestamp
    const { error: archiveError } = await adminClient
      .from('profiles')
      .update({ archived_at: new Date().toISOString(), archived_by: user.id })
      .eq('id', athlete_id)

    if (archiveError) {
      console.error('Archive error:', archiveError)
      return NextResponse.json({ error: 'Failed to archive athlete' }, { status: 500 })
    }

    auditLog({
      userId: user.id,
      action: 'athlete_archived',
      resourceType: 'profile',
      resourceId: athlete_id,
      metadata: { athlete_name: athlete.full_name, role: profile.role },
      ip: getClientIP(request),
    })

    return NextResponse.json({ success: true, message: 'Athlete archived successfully' })
  } catch (error) {
    console.error('Error archiving athlete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Restore an archived athlete — coaches and admins
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
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

    const { athlete_id } = await request.json()

    if (!athlete_id) {
      return NextResponse.json({ error: 'athlete_id is required' }, { status: 400 })
    }

    // Restore: clear archived_at
    const { error: restoreError } = await adminClient
      .from('profiles')
      .update({ archived_at: null, archived_by: null })
      .eq('id', athlete_id)

    if (restoreError) {
      console.error('Restore error:', restoreError)
      return NextResponse.json({ error: 'Failed to restore athlete' }, { status: 500 })
    }

    auditLog({
      userId: user.id,
      action: 'athlete_restored',
      resourceType: 'profile',
      resourceId: athlete_id,
      metadata: { role: profile.role },
      ip: getClientIP(request),
    })

    return NextResponse.json({ success: true, message: 'Athlete restored successfully' })
  } catch (error) {
    console.error('Error restoring athlete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
