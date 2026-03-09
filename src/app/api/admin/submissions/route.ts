import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify staff role
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    if (!['admin', 'coach', 'master_admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await adminClient
      .from('contact_submissions')
      .select('id, name, email, phone, interest, message, submitted_at, is_read')
      .order('submitted_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('Submissions fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Normalize: expose submitted_at as created_at for the frontend
    const submissions = (data || []).map((s: any) => ({
      ...s,
      created_at: s.submitted_at,
    }))

    return NextResponse.json({ submissions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
