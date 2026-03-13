import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { auditLog } from '@/lib/audit'
import { getClientIP } from '@/lib/rate-limit'

export async function DELETE(request: NextRequest) {
  try {
    // Authentication & Authorization check
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create Supabase admin client with service role (also used for role check to bypass RLS)
    const supabaseAdmin = createAdminClient()

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Only master_admin can permanently delete
    if (!profile || profile.role !== 'master_admin') {
      return NextResponse.json(
        { error: 'Forbidden - only master admin can permanently delete athletes' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const athleteId = searchParams.get('id')

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Athlete ID is required' },
        { status: 400 }
      )
    }

    // Prevent self-deletion
    if (athleteId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Verify athlete is archived first (must archive before permanent delete)
    const { data: athlete } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, archived_at')
      .eq('id', athleteId)
      .single()

    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      )
    }

    if (!athlete.archived_at) {
      return NextResponse.json(
        { error: 'Athlete must be archived before permanent deletion. Archive the athlete first.' },
        { status: 400 }
      )
    }

    // Delete the user from auth (this will cascade delete the profile)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      athleteId
    )

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete athlete' }, { status: 400 })
    }

    auditLog({
      userId: user.id,
      action: 'athlete_permanently_deleted',
      resourceType: 'profile',
      resourceId: athleteId,
      metadata: { athlete_name: athlete.full_name, athlete_email: athlete.email },
      ip: getClientIP(request),
    })

    return NextResponse.json({
      success: true,
      message: 'Athlete permanently deleted',
    })
  } catch (error: any) {
    console.error('Error deleting athlete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
