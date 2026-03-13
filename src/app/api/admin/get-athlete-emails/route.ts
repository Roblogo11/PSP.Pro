import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/get-athlete-emails?ids=id1,id2,id3
 * Returns athlete emails from profiles table (email column added in migration 020)
 * Falls back to Supabase Auth admin API for any missing emails
 * Only accessible by coaches and admins
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const searchParams = request.nextUrl.searchParams
    const athleteIds = searchParams.get('ids')?.split(',').filter(Boolean) || []

    if (athleteIds.length === 0) {
      return NextResponse.json({ emails: {} })
    }

    // Limit to 50 IDs per request to prevent abuse
    const limitedIds = athleteIds.slice(0, 50)

    // Fetch emails from profiles table (email column exists since migration 020)
    const { data: profiles, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, email')
      .in('id', limitedIds)
      .eq('role', 'athlete')

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    const emailMap: Record<string, string> = {}
    const missingEmailIds: string[] = []

    // First pass: get emails from profiles table
    profiles?.forEach(p => {
      if (p.email) {
        emailMap[p.id] = p.email
      } else {
        missingEmailIds.push(p.id)
      }
    })

    // Second pass: for any profiles without email in the table, try auth admin API
    if (missingEmailIds.length > 0) {
      for (const id of missingEmailIds) {
        try {
          const { data: authUser } = await adminClient.auth.admin.getUserById(id)
          if (authUser?.user?.email) {
            emailMap[id] = authUser.user.email
            // Backfill the email to profiles table for future queries
            await adminClient
              .from('profiles')
              .update({ email: authUser.user.email })
              .eq('id', id)
          }
        } catch {
          // Skip silently — email not available for this user
        }
      }
    }

    return NextResponse.json({ emails: emailMap })
  } catch (error: any) {
    console.error('Error in get-athlete-emails:', error?.message || error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
