import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

// GET - Check current simulation status
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Master admin access required' }, { status: 403 })
    }

    const cookieHeader = (await import('next/headers')).cookies
    const cookieStore = await cookieHeader()
    const simulatedRole = cookieStore.get('simulation_role')?.value || null
    const simulationId = cookieStore.get('simulation_id')?.value || null

    // Also fetch past uncleaned simulations
    const adminClient = createAdminClient()
    const { data: pastSessions } = await adminClient
      .from('simulation_sessions')
      .select('id, simulated_role, started_at, ended_at, cleaned_up')
      .eq('admin_id', user.id)
      .eq('cleaned_up', false)
      .order('started_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      active: !!simulatedRole,
      simulatedRole,
      simulationId,
      pastSessions: pastSessions || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Start a simulation session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Master admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { role } = body

    if (role !== 'athlete' && role !== 'coach') {
      return NextResponse.json({ error: 'Invalid role. Must be "athlete" or "coach"' }, { status: 400 })
    }

    const simulationId = randomUUID()

    // Record the simulation session in the database
    const adminClient = createAdminClient()
    const { error: insertError } = await adminClient
      .from('simulation_sessions')
      .insert({
        id: simulationId,
        admin_id: user.id,
        simulated_role: role,
      })

    if (insertError) {
      console.error('Error creating simulation session:', insertError)
      return NextResponse.json({ error: 'Failed to create simulation session' }, { status: 500 })
    }

    const response = NextResponse.json({
      active: true,
      simulatedRole: role,
      simulationId,
      message: `Simulation started as ${role}. Stripe test mode enabled. All data will be tracked for cleanup.`,
    })

    const maxAge = 60 * 60 * 4 // 4 hours

    // Simulation cookies
    response.cookies.set('simulation_role', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('simulation_role_ui', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('simulation_id', simulationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('simulation_id_ui', simulationId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    // Auto-enable Stripe test mode
    response.cookies.set('stripe_test_mode', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('stripe_test_mode_ui', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - End a simulation session (without cleanup)
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read simulation_id before clearing cookies
    const cookieHeader = (await import('next/headers')).cookies
    const cookieStore = await cookieHeader()
    const simulationId = cookieStore.get('simulation_id')?.value

    // Mark simulation session as ended
    if (simulationId) {
      const adminClient = createAdminClient()
      await adminClient
        .from('simulation_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', simulationId)
    }

    const response = NextResponse.json({
      active: false,
      message: 'Simulation ended.',
    })

    // Clear all simulation cookies
    const cookieNames = [
      'simulation_role', 'simulation_role_ui',
      'simulation_id', 'simulation_id_ui',
      'stripe_test_mode', 'stripe_test_mode_ui',
    ]

    for (const name of cookieNames) {
      response.cookies.set(name, '', {
        httpOnly: name === 'simulation_role' || name === 'simulation_id' || name === 'stripe_test_mode',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      })
    }

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
