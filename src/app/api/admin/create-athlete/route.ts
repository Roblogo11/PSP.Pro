import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY: Verify the user is an admin/coach
    const supabase = await createServerClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    // Check if user is admin or coach (use admin client to bypass RLS timing)
    const supabaseAdmin = createAdminClient()
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'coach' && profile.role !== 'master_admin')) {
      return NextResponse.json(
        { error: 'Forbidden - admin or coach access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      email,
      full_name,
      athlete_type,
      sports, // Multi-sport array
      age,
      parent_guardian_name,
      parent_guardian_email,
      parent_guardian_phone,
      trial_days, // Number of days for free trial (default 7)
    } = body

    // Validate required fields
    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
        { status: 400 }
      )
    }

    // Generate a random temporary password (athlete will need to use "Forgot Password" to set their own)
    const crypto = await import('crypto')
    const tempPassword = crypto.randomBytes(16).toString('base64url') + '!Aa1'

    // Create the auth user with admin client (reuse from role check above)
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    })

    if (createUserError) {
      console.error('Auth error:', createUserError)
      const msg = createUserError.message?.includes('already been registered')
        ? 'An account with this email already exists'
        : 'Failed to create athlete account'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Update the profile with additional athlete data
    // Note: Only including columns that exist in profiles table
    const days = trial_days ? parseInt(trial_days) : 30
    const trialExpires = new Date()
    trialExpires.setDate(trialExpires.getDate() + days)

    const profileData: any = {
      id: authData.user.id,
      full_name,
      sports: sports || (athlete_type ? [athlete_type] : ['softball']), // Support multi-sport or single
      athlete_type: sports ? sports[0] : athlete_type, // Primary sport for backwards compatibility
      age: age ? parseInt(age) : null,
      role: 'athlete',
      trial_expires_at: trialExpires.toISOString(),
    }

    // Add parent/guardian info if athlete is under 18
    if (age && parseInt(age) < 18) {
      if (parent_guardian_name) profileData.parent_guardian_name = parent_guardian_name
      if (parent_guardian_email) profileData.parent_guardian_email = parent_guardian_email
      if (parent_guardian_phone) profileData.parent_guardian_phone = parent_guardian_phone
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData)

    if (profileError) {
      console.error('Profile error:', profileError)
      // Try to clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Failed to create athlete profile' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error: any) {
    console.error('Error creating athlete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
