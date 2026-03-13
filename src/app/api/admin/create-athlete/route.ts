import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email/send'
import { getWelcomeAthleteEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const { allowed } = rateLimit(`create-athlete:${ip}`, { limit: 10, windowSec: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = await createServerClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createAdminClient()
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
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
      sports,
      age,
      parent_guardian_name,
      parent_guardian_email,
      parent_guardian_phone,
      child_name,
    } = body

    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
        { status: 400 }
      )
    }

    // Generate a random temporary password (athlete will set their own via reset link)
    const crypto = await import('crypto')
    const tempPassword = crypto.randomBytes(16).toString('base64url') + '!Aa1'

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
      if (createUserError.message?.includes('already')) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create athlete account' }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Build profile data
    const profileData: any = {
      id: authData.user.id,
      full_name,
      email, // Store email in profiles table for easy querying
      sports: sports || (athlete_type ? [athlete_type] : ['softball']),
      athlete_type: sports ? sports[0] : athlete_type,
      age: age ? parseInt(age) : null,
      role: 'athlete',
    }

    // Under-13: auto-create parent/guardian account (COPPA)
    const ageNum = age ? parseInt(age) : null
    if (ageNum && ageNum < 13) {
      profileData.account_type = 'parent_guardian'
      profileData.child_name = child_name || full_name
      profileData.child_age = ageNum
      if (parent_guardian_name) {
        profileData.full_name = parent_guardian_name
        profileData.child_name = full_name
      }
      profileData.parent_guardian_name = profileData.full_name
      profileData.parent_guardian_email = email
    } else if (ageNum && ageNum < 18) {
      if (parent_guardian_name) profileData.parent_guardian_name = parent_guardian_name
      if (parent_guardian_email) profileData.parent_guardian_email = parent_guardian_email
      if (parent_guardian_phone) profileData.parent_guardian_phone = parent_guardian_phone
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData)

    if (profileError) {
      console.error('Profile error:', profileError)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Failed to create athlete profile' }, { status: 400 })
    }

    // Generate a password reset link so the athlete can set their own password
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://propersports.pro'
    let resetPasswordUrl = `${appUrl}/forgot-password`

    try {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
        },
      })
      if (linkData?.properties?.action_link) {
        resetPasswordUrl = linkData.properties.action_link
      }
    } catch (linkErr) {
      console.warn('Recovery link generation failed:', linkErr)
    }

    // Send welcome email to the athlete with password setup link
    const coachName = profile.full_name || 'Your Coach'
    const athleteDisplayName = profileData.child_name || full_name
    try {
      const welcomeEmail = getWelcomeAthleteEmail({
        athleteName: athleteDisplayName,
        coachName,
        resetPasswordUrl,
        loginUrl: `${appUrl}/login`,
      })
      await sendEmail({
        to: email,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html,
        text: welcomeEmail.text,
      })
    } catch (emailErr) {
      // Non-critical: account is created, email is a bonus
      console.warn('Welcome email send failed:', emailErr)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      message: `Account created! A welcome email with password setup link has been sent to ${email}.`,
    })
  } catch (error: any) {
    console.error('Error creating athlete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
