import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/actions/request
 * Submit a request for an action that requires master admin approval
 */
export async function POST(request: NextRequest) {
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

    // Check if user is coach or admin
    const { data: profile } = await supabase
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

    const body = await request.json()
    const { action_type, target_id, target_table, reason, metadata } = body

    if (!action_type || !target_id || !target_table) {
      return NextResponse.json(
        { error: 'Missing required fields: action_type, target_id, target_table' },
        { status: 400 }
      )
    }

    // Create the request
    const { data: actionRequest, error: insertError } = await supabase
      .from('action_requests')
      .insert({
        requested_by: user.id,
        action_type,
        target_id,
        target_table,
        reason,
        metadata: metadata || {},
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating action request:', insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      request: actionRequest,
      message: 'Request submitted successfully. A master admin will review it.',
    })
  } catch (error: any) {
    console.error('Error in action request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/actions/request
 * Get action requests (filtered by user role)
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    // Check if user is master admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('action_requests')
      .select(`
        *,
        requester:profiles!action_requests_requested_by_fkey(id, full_name, role),
        reviewer:profiles!action_requests_reviewed_by_fkey(id, full_name, role)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    // If not master admin, only show their own requests
    if (profile?.role !== 'master_admin') {
      query = query.eq('requested_by', user.id)
    }

    const { data: requests, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching requests:', fetchError)
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error('Error fetching action requests:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
