import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * DELETE /api/sessions/delete?id=xxx
 * Delete a session with conditional permission checks
 * - Master admins can delete any session
 * - Coaches can delete empty sessions directly
 * - Coaches must request approval for sessions with athletes
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile (use admin client to bypass RLS timing)
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['coach', 'admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('bookings')
      .select('*, athlete:profiles!bookings_athlete_id_fkey(id, full_name)')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if session is in the past
    const isPastSession = new Date(session.booking_date) < new Date()

    // Master admins can delete any session
    if (profile.role === 'master_admin') {
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', sessionId)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return NextResponse.json(
          { error: deleteError.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Session deleted successfully',
        deletedDirectly: true,
      })
    }

    // For coaches: check if session has athletes or is in the past
    const hasAthlete = !!session.athlete_id

    // Can delete directly if: no athlete AND not a past session
    if (!hasAthlete && !isPastSession) {
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', sessionId)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return NextResponse.json(
          { error: deleteError.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Session deleted successfully',
        deletedDirectly: true,
      })
    }

    // Need approval - return info about why
    const reason = hasAthlete
      ? `Session has athlete enrolled: ${session.athlete?.full_name}`
      : 'Cannot delete past sessions without approval'

    return NextResponse.json(
      {
        requiresApproval: true,
        reason,
        sessionDetails: {
          id: session.id,
          date: session.booking_date,
          athlete: session.athlete?.full_name,
          hasAthlete,
          isPastSession,
        },
      },
      { status: 403 }
    )
  } catch (error: any) {
    console.error('Error deleting session:', error?.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sessions/delete?id=xxx&check=true
 * Check if a session can be deleted directly (without actually deleting)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['coach', 'admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get session details
    const { data: session } = await supabase
      .from('bookings')
      .select('*, athlete:profiles!bookings_athlete_id_fkey(id, full_name)')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const isPastSession = new Date(session.booking_date) < new Date()
    const hasAthlete = !!session.athlete_id
    const isMasterAdmin = profile.role === 'master_admin'

    // Master admin can always delete
    if (isMasterAdmin) {
      return NextResponse.json({
        canDeleteDirectly: true,
        requiresApproval: false,
        isMasterAdmin: true,
      })
    }

    // Coach can delete if no athlete and not past
    const canDeleteDirectly = !hasAthlete && !isPastSession

    return NextResponse.json({
      canDeleteDirectly,
      requiresApproval: !canDeleteDirectly,
      isMasterAdmin: false,
      reason: !canDeleteDirectly
        ? hasAthlete
          ? 'Session has athlete enrolled'
          : 'Cannot delete past sessions without approval'
        : undefined,
      sessionDetails: {
        hasAthlete,
        isPastSession,
        athleteName: session.athlete?.full_name,
      },
    })
  } catch (error: any) {
    console.error('Error checking session deletion:', error?.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
