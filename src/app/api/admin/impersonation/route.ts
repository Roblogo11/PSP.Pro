import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Check current impersonation status
export async function GET() {
  try {
    const supabase = await createClient()
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

    if (profile?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Master admin access required' }, { status: 403 })
    }

    const cookieHeader = (await import('next/headers')).cookies
    const cookieStore = await cookieHeader()
    const userId = cookieStore.get('impersonation_user_id')?.value || null
    const userName = cookieStore.get('impersonation_user_name')?.value || null

    return NextResponse.json({
      active: !!userId,
      userId,
      userName,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Start impersonating a player
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
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

    if (profile?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Master admin access required' }, { status: 403 })
    }

    // Mutual exclusion: reject if simulation mode is active
    const cookieHeader = (await import('next/headers')).cookies
    const cookieStore = await cookieHeader()
    const simulationRole = cookieStore.get('simulation_role')?.value
    if (simulationRole) {
      return NextResponse.json(
        { error: 'Cannot impersonate while simulation mode is active. End the simulation first.' },
        { status: 409 }
      )
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Look up the athlete profile (use admin client to bypass RLS)
    const { data: athleteProfile, error: lookupError } = await adminClient
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', userId)
      .single()

    if (lookupError || !athleteProfile) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const playerName = athleteProfile.full_name || athleteProfile.email || 'Unknown Player'

    const response = NextResponse.json({
      active: true,
      userId: athleteProfile.id,
      userName: playerName,
      message: `Now viewing dashboard as ${playerName}. Read-only mode — no data will be modified.`,
    })

    const maxAge = 60 * 60 * 2 // 2 hours

    // Impersonation cookies (httpOnly + JS-readable pairs)
    response.cookies.set('impersonation_user_id', athleteProfile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('impersonation_user_id_ui', athleteProfile.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('impersonation_user_name', playerName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('impersonation_user_name_ui', playerName, {
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

// DELETE - Stop impersonating
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = NextResponse.json({
      active: false,
      message: 'Impersonation ended.',
    })

    // Clear all impersonation cookies
    const cookieNames = [
      'impersonation_user_id', 'impersonation_user_id_ui',
      'impersonation_user_name', 'impersonation_user_name_ui',
    ]

    for (const name of cookieNames) {
      response.cookies.set(name, '', {
        httpOnly: name === 'impersonation_user_id' || name === 'impersonation_user_name',
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
