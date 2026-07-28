import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Single source of truth for "may this user access this course?"
 *
 * ⚠ Server-side only — call with an admin client. Never trust the browser for
 * this decision. The historical leak (fixed 2026-07-28) was courses/page.tsx
 * inserting course_enrollments directly with payment_status:'free', because RLS
 * only checked athlete_id = auth.uid() and never looked at price or tier.
 *
 * Access model:
 *   - required_tier_id NULL + price 0  -> free, anyone signed in
 *   - required_tier_id set             -> needs an active membership on that tier
 *   - price_cents > 0                  -> needs a completed Stripe payment
 *   - staff                            -> always allowed
 */

export type CourseAccessReason =
  | 'staff'
  | 'free'
  | 'tier_included'
  | 'already_paid'
  | 'needs_tier'
  | 'needs_payment'
  | 'course_not_found'
  | 'inactive'

export interface CourseAccessResult {
  allowed: boolean
  reason: CourseAccessReason
  /** Human-readable, safe to surface in the UI. */
  message: string
  /** Set when the blocker is payment — drives the checkout CTA. */
  priceCents?: number
  requiredTierSlug?: string
}

/** Membership statuses that count as currently entitled. */
const ACTIVE_MEMBERSHIP_STATUSES = ['active', 'trialing'] as const

export async function checkCourseAccess(
  admin: SupabaseClient,
  userId: string,
  courseId: string
): Promise<CourseAccessResult> {
  // Staff bypass — mirrors the dashboard layout guard.
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const role = profile?.role
  if (role === 'coach' || role === 'admin' || role === 'master_admin') {
    return { allowed: true, reason: 'staff', message: 'Staff access' }
  }

  const { data: course } = await admin
    .from('courses')
    .select('id, title, price_cents, pricing_type, is_active, included_in_membership, required_tier_id')
    .eq('id', courseId)
    .single()

  if (!course) {
    return { allowed: false, reason: 'course_not_found', message: 'Course not found' }
  }

  if (!course.is_active) {
    return { allowed: false, reason: 'inactive', message: 'This course is not currently available' }
  }

  // Already holds a valid enrollment (paid earlier, or granted by staff).
  const { data: existing } = await admin
    .from('course_enrollments')
    .select('id, payment_status, expires_at')
    .eq('athlete_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()

  const enrollmentLive =
    existing && (!existing.expires_at || new Date(existing.expires_at) > new Date())

  if (enrollmentLive && existing!.payment_status !== 'free') {
    return { allowed: true, reason: 'already_paid', message: 'Already enrolled' }
  }

  // Tier-gated course: require an active membership on the named tier.
  if (course.required_tier_id) {
    const { data: membership } = await admin
      .from('athlete_memberships')
      .select('id, status, current_period_end, tier_id, membership_tiers(slug, name)')
      .eq('athlete_id', userId)
      .eq('tier_id', course.required_tier_id)
      .in('status', ACTIVE_MEMBERSHIP_STATUSES as unknown as string[])
      .maybeSingle()

    const periodLive =
      membership &&
      (!membership.current_period_end ||
        new Date(membership.current_period_end) > new Date())

    if (membership && periodLive) {
      return { allowed: true, reason: 'tier_included', message: 'Included with your membership' }
    }

    const { data: tier } = await admin
      .from('membership_tiers')
      .select('slug, name')
      .eq('id', course.required_tier_id)
      .single()

    return {
      allowed: false,
      reason: 'needs_tier',
      message: `This course is included with the ${tier?.name ?? 'paid'} membership`,
      requiredTierSlug: tier?.slug,
      priceCents: course.price_cents ?? 0,
    }
  }

  // Paid one-off course with no tier: requires payment.
  if ((course.price_cents ?? 0) > 0) {
    if (enrollmentLive && existing!.payment_status === 'paid') {
      return { allowed: true, reason: 'already_paid', message: 'Already enrolled' }
    }
    return {
      allowed: false,
      reason: 'needs_payment',
      message: 'This course requires purchase',
      priceCents: course.price_cents,
    }
  }

  // Genuinely free.
  return { allowed: true, reason: 'free', message: 'Free course' }
}
