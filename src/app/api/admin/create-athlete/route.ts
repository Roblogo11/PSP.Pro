import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create a Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      full_name,
      athlete_type,
      age,
      parent_guardian_name,
      parent_guardian_email,
      parent_guardian_phone,
    } = body

    // Validate required fields
    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
        { status: 400 }
      )
    }

    // Create the auth user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Update the profile with additional athlete data
    // Note: Only including columns that exist in profiles table
    const profileData: any = {
      id: authData.user.id,
      full_name,
      athlete_type,
      age: age ? parseInt(age) : null,
      role: 'athlete',
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
      return NextResponse.json({ error: profileError.message }, { status: 400 })
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
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
