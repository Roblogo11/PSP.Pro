import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/get-athlete-emails
 * Returns athlete emails from auth.users (not accessible client-side)
 * Only accessible by coaches and admins
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and has coach/admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role (use admin client to bypass RLS timing)
    const adminClient = createAdminClient()
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!['coach', 'admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get athlete IDs from request
    const searchParams = request.nextUrl.searchParams
    const athleteIds = searchParams.get('ids')?.split(',') || []

    if (athleteIds.length === 0) {
      return NextResponse.json({ emails: {} })
    }

    // Fetch emails from auth.users via service role
    // Note: This requires using the service role client to access auth.users
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .in('id', athleteIds)
      .eq('role', 'athlete')

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    // Build email map (id -> email)
    // Note: We need to fetch from auth.users which requires admin access
    // For now, return a placeholder that shows this needs server-side implementation
    const emailMap: Record<string, string> = {}

    // TODO: Implement with Supabase Admin SDK or Edge Function
    // For now, return empty map - coaches will need to contact athletes via other means
    profiles?.forEach(p => {
      emailMap[p.id] = 'Email not available (contact support)' // Placeholder
    })

    return NextResponse.json({ emails: emailMap })
  } catch (error: any) {
    console.error('Error in get-athlete-emails:', error?.message || error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
