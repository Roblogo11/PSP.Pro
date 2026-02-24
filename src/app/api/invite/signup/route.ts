import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Public endpoint — no auth required — for athlete self-signup via invite link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invite_token, full_name, email, password, age, child_name } = body

    if (!invite_token || !full_name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const ageNum = age ? parseInt(age) : null
    const isParentAccount = ageNum !== null && ageNum > 0 && ageNum < 13

    if (isParentAccount && !child_name?.trim()) {
      return NextResponse.json({ error: "Please enter your child's name" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Validate the invite token
    const { data: link, error: linkErr } = await adminClient
      .from('invite_links')
      .select('id, coach_id, org_id, sport, max_uses, uses, expires_at')
      .eq('token', invite_token)
      .single()

    if (linkErr || !link) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })
    }
    if (new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invite link has expired' }, { status: 410 })
    }
    if (link.uses >= link.max_uses) {
      return NextResponse.json({ error: 'This invite link has already been used' }, { status: 410 })
    }

    // Create the Supabase auth user
    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (createError) {
      const msg = createError.message?.includes('already been registered')
        ? 'An account with this email already exists'
        : 'Failed to create account'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Build profile
    const profileData: any = {
      id: authData.user.id,
      full_name,
      role: 'athlete',
      athlete_type: link.sport || 'softball',
      sports: link.sport ? [link.sport] : ['softball'],
    }

    if (ageNum) {
      profileData.age = ageNum
    }

    if (isParentAccount) {
      profileData.account_type = 'parent_guardian'
      profileData.child_name = child_name.trim()
      profileData.child_age = ageNum
    }

    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert(profileData)

    if (profileError) {
      // Clean up auth user if profile fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Failed to create athlete profile' }, { status: 500 })
    }

    // Auto-enroll in org if invite link has org_id
    if (link.org_id) {
      try {
        await adminClient.from('organization_members').insert({
          org_id: link.org_id,
          user_id: authData.user.id,
          role: 'athlete',
          status: 'active',
          joined_at: new Date().toISOString(),
        })
      } catch {
        // Non-critical: athlete created successfully, org enrollment failed
        console.warn('Failed to auto-enroll athlete in org:', link.org_id)
      }
    }

    // Increment the invite link usage count
    await adminClient
      .from('invite_links')
      .update({ uses: link.uses + 1 })
      .eq('id', link.id)

    return NextResponse.json({
      success: true,
      user: { id: authData.user.id, email: authData.user.email },
    })
  } catch (error: any) {
    console.error('Invite signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
