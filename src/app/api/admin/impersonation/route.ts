import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { auditLog } from '@/lib/audit'
import { getClientIP } from '@/lib/rate-limit'

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
    const coachId = cookieStore.get('impersonation_coach_id')?.value || null
    const coachName = cookieStore.get('impersonation_coach_name')?.value || null

    return NextResponse.json({
      active: !!(userId || coachId),
      userId,
      userName,
      coachId,
      coachName,
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
    const { userId, type = 'athlete' } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Look up the target profile (use admin client to bypass RLS)
    const { data: targetProfile, error: lookupError } = await adminClient
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', userId)
      .single()

    if (lookupError || !targetProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const maxAge = 60 * 60 * 2 // 2 hours
    const cookieOpts = (httpOnly: boolean) => ({
      httpOnly,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge,
    })

    if (type === 'coach') {
      // Verify target is actually a coach or admin
      if (targetProfile.role !== 'coach' && targetProfile.role !== 'admin' && targetProfile.role !== 'master_admin') {
        return NextResponse.json({ error: 'Target user is not a coach' }, { status: 400 })
      }

      const coachName = targetProfile.full_name || targetProfile.email || 'Unknown Coach'

      auditLog({
        userId: user.id,
        action: 'impersonation_started',
        resourceType: 'user',
        resourceId: targetProfile.id,
        metadata: { targetName: coachName, targetRole: targetProfile.role, impersonationType: 'coach' },
        ip: getClientIP(request),
      })

      const response = NextResponse.json({
        active: true,
        coachId: targetProfile.id,
        coachName,
        message: `Now viewing dashboard as Coach ${coachName}. Read-only mode — no data will be modified.`,
      })

      response.cookies.set('impersonation_coach_id', targetProfile.id, cookieOpts(true))
      response.cookies.set('impersonation_coach_id_ui', targetProfile.id, cookieOpts(false))
      response.cookies.set('impersonation_coach_name', encodeURIComponent(coachName), cookieOpts(true))
      response.cookies.set('impersonation_coach_name_ui', encodeURIComponent(coachName), cookieOpts(false))

      return response
    }

    // Default: athlete impersonation (existing behavior)
    const playerName = targetProfile.full_name || targetProfile.email || 'Unknown Player'

    auditLog({
      userId: user.id,
      action: 'impersonation_started',
      resourceType: 'user',
      resourceId: targetProfile.id,
      metadata: { targetName: playerName, targetRole: targetProfile.role, impersonationType: 'athlete' },
      ip: getClientIP(request),
    })

    const response = NextResponse.json({
      active: true,
      userId: targetProfile.id,
      userName: playerName,
      message: `Now viewing dashboard as ${playerName}. Read-only mode — no data will be modified.`,
    })

    response.cookies.set('impersonation_user_id', targetProfile.id, cookieOpts(true))
    response.cookies.set('impersonation_user_id_ui', targetProfile.id, cookieOpts(false))
    response.cookies.set('impersonation_user_name', playerName, cookieOpts(true))
    response.cookies.set('impersonation_user_name_ui', playerName, cookieOpts(false))

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

    // Clear all impersonation cookies (athlete + coach)
    const cookieNames = [
      'impersonation_user_id', 'impersonation_user_id_ui',
      'impersonation_user_name', 'impersonation_user_name_ui',
      'impersonation_coach_id', 'impersonation_coach_id_ui',
      'impersonation_coach_name', 'impersonation_coach_name_ui',
    ]

    for (const name of cookieNames) {
      response.cookies.set(name, '', {
        httpOnly: !name.endsWith('_ui'),
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
