import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/org/by-slug/[slug] — public lookup, no auth required
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const adminClient = createAdminClient()

    const { data: org, error } = await adminClient
      .from('organizations')
      .select(`
        id, name, slug, logo_url, primary_color, secondary_color, accent_color,
        tagline, hero_headline, hero_subheadline, about_text,
        sport_focus, allow_self_signup, is_active, created_at,
        members:organization_members(
          id, role, status,
          user:profiles(id, full_name, avatar_url, role)
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    // Filter to only active coaches for public display
    const coaches = (org.members as any[])?.filter(
      m => m.status === 'active' && (m.role === 'coach' || m.role === 'owner')
    ) || []

    return NextResponse.json({ org: { ...org, coaches } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
