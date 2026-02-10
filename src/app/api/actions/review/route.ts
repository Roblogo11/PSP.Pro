import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PATCH /api/actions/review
 * Approve or deny an action request (master admin only)
 */
export async function PATCH(request: NextRequest) {
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

    // Check if user is master admin (use admin client to bypass RLS timing)
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'master_admin') {
      return NextResponse.json(
        { error: 'Only master admins can review requests' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { request_id, action, execute } = body

    if (!request_id || !['approve', 'deny'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request: need request_id and action (approve/deny)' },
        { status: 400 }
      )
    }

    // Get the request details
    const { data: actionRequest, error: fetchError } = await supabase
      .from('action_requests')
      .select('*')
      .eq('id', request_id)
      .single()

    if (fetchError || !actionRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Update request status
    const { error: updateError } = await supabase
      .from('action_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'denied',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', request_id)

    if (updateError) {
      console.error('Error updating request:', updateError)
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 400 }
      )
    }

    // If approved and execute=true, perform the action
    let executionResult = null
    if (action === 'approve' && execute) {
      executionResult = await executeAction(supabase, actionRequest)
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully`,
      executed: !!executionResult?.success,
      executionResult,
    })
  } catch (error: any) {
    console.error('Error reviewing action request:', error?.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Execute the approved action
 */
async function executeAction(supabase: any, actionRequest: any) {
  try {
    const { action_type, target_id, target_table } = actionRequest

    switch (action_type) {
      case 'delete_session':
        // Delete from bookings table
        const { error: deleteSessionError } = await supabase
          .from('bookings')
          .delete()
          .eq('id', target_id)

        if (deleteSessionError) throw deleteSessionError
        return { success: true, message: 'Session deleted' }

      case 'delete_athlete':
        // This requires service role - would need a server-side function
        // For now, return instruction to use admin delete route
        return {
          success: false,
          message: 'Use /api/admin/delete-athlete endpoint for this action',
        }

      case 'delete_drill':
        const { error: deleteDrillError } = await supabase
          .from('drills')
          .delete()
          .eq('id', target_id)

        if (deleteDrillError) throw deleteDrillError
        return { success: true, message: 'Drill deleted' }

      case 'delete_performance_metric':
        const { error: deleteMetricError } = await supabase
          .from('athlete_performance_metrics')
          .delete()
          .eq('id', target_id)

        if (deleteMetricError) throw deleteMetricError
        return { success: true, message: 'Performance metric deleted' }

      default:
        return { success: false, message: 'Unknown action type' }
    }
  } catch (error: any) {
    console.error('Error executing action:', error)
    return { success: false, message: error.message }
  }
}
