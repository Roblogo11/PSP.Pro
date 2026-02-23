import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['coach', 'admin', 'master_admin'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Forbidden - coaches only' }, { status: 403 })
    }

    const body = await request.json()
    const { bio, specialties, profile_slug, years_experience, certifications } = body

    // Validate slug format (lowercase, hyphens only)
    if (profile_slug && !/^[a-z0-9-]+$/.test(profile_slug)) {
      return NextResponse.json({ error: 'Slug can only contain lowercase letters, numbers, and hyphens' }, { status: 400 })
    }

    const { error } = await adminClient
      .from('profiles')
      .update({
        bio: bio || null,
        specialties: specialties || null,
        profile_slug: profile_slug || null,
        years_experience: years_experience || null,
        certifications: certifications || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      if (error.message.includes('unique')) {
        return NextResponse.json({ error: 'That profile URL is already taken, try a different one' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
