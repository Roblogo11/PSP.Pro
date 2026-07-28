import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkCourseAccess } from '@/lib/courses/access'

/**
 * The ONLY path that may create a course enrollment.
 *
 * ⚠ Client code must never insert into course_enrollments directly. RLS now
 * rejects athlete self-inserts (migration 062); this route uses the service
 * role key and enforces tier/payment before writing.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Please log in to enroll' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { courseId } = body as { courseId?: string }

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })
    }

    const admin = createAdminClient()
    const access = await checkCourseAccess(admin, user.id, courseId)

    if (!access.allowed) {
      // 402 signals "payment/upgrade required" so the client can route to
      // checkout or the membership page instead of showing a generic error.
      const status =
        access.reason === 'course_not_found' ? 404
        : access.reason === 'inactive' ? 400
        : 402

      return NextResponse.json(
        {
          error: access.message,
          reason: access.reason,
          priceCents: access.priceCents,
          requiredTierSlug: access.requiredTierSlug,
        },
        { status }
      )
    }

    // Idempotent: re-enrolling is a no-op, not an error.
    const { data: existing } = await admin
      .from('course_enrollments')
      .select('id')
      .eq('athlete_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, enrollmentId: existing.id, reason: access.reason })
    }

    // payment_status records HOW access was granted, so a later audit can tell
    // a membership-included enrollment from a purchased one.
    // ⚠ CHECK-constrained to ('free','paid','comp') — see migration 062.
    // Adding a new value requires widening the constraint first.
    const paymentStatus =
      access.reason === 'tier_included' || access.reason === 'staff' ? 'comp' : 'free'

    const { data: created, error: insertError } = await admin
      .from('course_enrollments')
      .insert({
        athlete_id: user.id,
        course_id: courseId,
        payment_status: paymentStatus,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Enrollment insert failed:', insertError.message)
      return NextResponse.json({ error: 'Could not complete enrollment' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, enrollmentId: created.id, reason: access.reason })
  } catch (error: any) {
    console.error('Enroll error:', error?.message || error)
    return NextResponse.json({ error: 'Could not complete enrollment' }, { status: 500 })
  }
}
