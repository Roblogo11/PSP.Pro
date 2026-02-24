import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const { allowed } = rateLimit(`create-athlete:${ip}`, { limit: 10, windowSec: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

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
      child_name, // For parent/guardian accounts (under-13)
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
      return NextResponse.json({ error: 'Failed to create athlete account' }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Update the profile with additional athlete data
    const profileData: any = {
      id: authData.user.id,
      full_name,
      sports: sports || (athlete_type ? [athlete_type] : ['softball']), // Support multi-sport or single
      athlete_type: sports ? sports[0] : athlete_type, // Primary sport for backwards compatibility
      age: age ? parseInt(age) : null,
      role: 'athlete',
    }

    // Under-13: auto-create parent/guardian account
    const ageNum = age ? parseInt(age) : null
    if (ageNum && ageNum < 13) {
      profileData.account_type = 'parent_guardian'
      profileData.child_name = child_name || full_name
      profileData.child_age = ageNum
      // For parent accounts: full_name is the parent, child_name is the athlete
      // If coach provided parent_guardian_name, use that as account holder name
      if (parent_guardian_name) {
        profileData.full_name = parent_guardian_name
        profileData.child_name = full_name
      }
      profileData.parent_guardian_name = profileData.full_name
      profileData.parent_guardian_email = email
    } else if (ageNum && ageNum < 18) {
      // 13-17: standard account with parent info
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

    // Generate a password reset link so the athlete can set their own password
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://psp.pro'
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
        },
      })
      if (linkError) {
        console.warn('Could not generate recovery link:', linkError.message)
      }
    } catch (linkErr) {
      // Non-critical: athlete can still use forgot-password flow manually
      console.warn('Recovery link generation failed:', linkErr)
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
