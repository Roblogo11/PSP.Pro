import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

    // Check if user is coach or admin (use admin client to bypass RLS timing)
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

    const body = await request.json()
    const { action_type, target_id, target_table, reason, metadata } = body

    if (!action_type || !target_id || !target_table) {
      return NextResponse.json(
        { error: 'Missing required fields: action_type, target_id, target_table' },
        { status: 400 }
      )
    }

    // Validate action_type and target_table against allowed values
    const ALLOWED_ACTIONS = ['delete', 'archive', 'restore', 'transfer', 'suspend', 'activate']
    const ALLOWED_TABLES = ['profiles', 'bookings', 'services', 'organizations', 'available_slots']
    if (!ALLOWED_ACTIONS.includes(action_type)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }
    if (!ALLOWED_TABLES.includes(target_table)) {
      return NextResponse.json({ error: 'Invalid target table' }, { status: 400 })
    }

    // Validate metadata: must be a plain object with safe values
    let sanitizedMetadata = {}
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      const safeEntries = Object.entries(metadata).filter(
        ([k, v]) => typeof k === 'string' && k.length < 100 && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
      )
      sanitizedMetadata = Object.fromEntries(safeEntries)
    }

    // Create the request
    const { data: actionRequest, error: insertError } = await supabase
      .from('action_requests')
      .insert({
        requested_by: user.id,
        action_type,
        target_id,
        target_table,
        reason: typeof reason === 'string' ? reason.slice(0, 500) : null,
        metadata: sanitizedMetadata,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating action request:', insertError)
      return NextResponse.json(
        { error: 'Failed to create request' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      request: actionRequest,
      message: 'Request submitted successfully. A master admin will review it.',
    })
  } catch (error: any) {
    console.error('Error in action request:', error?.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Check if user is master admin (use admin client to bypass RLS timing)
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
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
        { error: 'Failed to fetch requests' },
        { status: 400 }
      )
    }

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error('Error fetching action requests:', error?.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
