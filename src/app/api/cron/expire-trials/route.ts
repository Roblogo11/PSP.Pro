import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * Daily cron: expire any 60-day Elite trials whose period has ended.
 * Calls the `expire_overdue_trials()` SQL function — idempotent, safe to re-run.
 * Vercel triggers this via vercel.json crons → /api/cron/expire-trials at 08:00 UTC.
 *
 * Manual run: curl -H "Authorization: Bearer $CRON_SECRET" https://propersports.pro/api/cron/expire-trials
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.rpc('expire_overdue_trials')

    if (error) {
      console.error('expire_overdue_trials RPC failed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      expired: data ?? 0,
      ranAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Cron expire-trials error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}
