import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/profile-role
 * Fetches a user's role using the service role key (bypasses RLS).
 * Verifies auth via Bearer token (not cookies) to avoid Safari cookie sync race.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Verify the requesting user via Bearer token from Authorization header
    // This avoids the cookie-sync race condition on Safari/Apple devices
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
    }

    // Verify the token and get the user
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token)

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS for profile lookup
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ role: profile.role })
  } catch (error: any) {
    console.error('Error fetching profile role:', error?.message || error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
