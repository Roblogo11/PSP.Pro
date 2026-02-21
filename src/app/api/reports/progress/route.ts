import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { getProgressReportEmail } from '@/lib/email/progress-report-template'

/**
 * POST /api/reports/progress — generate and optionally email a progress report
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { athleteId, sendEmailReport } = await request.json()

    if (!athleteId) {
      return NextResponse.json({ error: 'athleteId required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Verify requesting user is staff or the athlete themselves
    const { data: requester } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = requester && ['coach', 'admin', 'master_admin'].includes(requester.role)
    if (!isStaff && user.id !== athleteId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Get athlete profile
    const { data: athlete } = await adminClient
      .from('profiles')
      .select('id, full_name, email, athlete_type, sports')
      .eq('id', athleteId)
      .single()

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const periodStart = thirtyDaysAgo.toISOString().split('T')[0]
    const periodEnd = new Date().toISOString().split('T')[0]

    // Fetch metrics from last 30 days
    const { data: recentMetrics } = await adminClient
      .from('athlete_performance_metrics')
      .select('*')
      .eq('athlete_id', athleteId)
      .gte('test_date', periodStart)
      .order('test_date', { ascending: false })

    // Fetch previous period metrics for comparison
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const { data: previousMetrics } = await adminClient
      .from('athlete_performance_metrics')
      .select('*')
      .eq('athlete_id', athleteId)
      .gte('test_date', sixtyDaysAgo.toISOString().split('T')[0])
      .lt('test_date', periodStart)
      .order('test_date', { ascending: false })
      .limit(1)

    // Fetch active goals
    const { data: goals } = await adminClient
      .from('athlete_performance_goals')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('status', 'active')

    // Fetch session counts
    const { count: sessionsCompleted } = await adminClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', athleteId)
      .eq('status', 'completed')
      .gte('booking_date', periodStart)

    const { count: sessionsTotal } = await adminClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', athleteId)
      .in('status', ['confirmed', 'completed', 'pending'])
      .gte('booking_date', periodStart)

    // Fetch drill completions
    const { count: drillsCompleted } = await adminClient
      .from('assigned_drills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', athleteId)
      .eq('completed', true)
      .gte('completed_at', thirtyDaysAgo.toISOString())

    // Fetch coach notes (non-private)
    const { data: coachNotes } = await adminClient
      .from('athlete_performance_notes')
      .select('title, content, created_at')
      .eq('athlete_id', athleteId)
      .eq('is_private', false)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    // Build metrics comparison
    const latestMetric = recentMetrics?.[0]
    const prevMetric = previousMetrics?.[0]
    const metricFields: { key: string; label: string; unit: string; higherIsBetter: boolean }[] = [
      { key: 'throwing_velocity_mph', label: 'Throwing Velocity', unit: 'mph', higherIsBetter: true },
      { key: 'exit_velocity_mph', label: 'Exit Velocity', unit: 'mph', higherIsBetter: true },
      { key: 'bat_speed_mph', label: 'Bat Speed', unit: 'mph', higherIsBetter: true },
      { key: 'sixty_yard_dash_seconds', label: '60-Yard Dash', unit: 'sec', higherIsBetter: false },
      { key: 'vertical_jump_inches', label: 'Vertical Jump', unit: 'in', higherIsBetter: true },
      { key: 'ten_yard_split_seconds', label: '10-Yard Split', unit: 'sec', higherIsBetter: false },
    ]

    const metrics = metricFields
      .filter(f => latestMetric?.[f.key])
      .map(f => {
        const current = latestMetric[f.key]
        const previous = prevMetric?.[f.key]
        const improved = previous
          ? f.higherIsBetter ? current > previous : current < previous
          : false
        return {
          label: f.label,
          current: current.toString(),
          previous: previous?.toString() || null,
          unit: f.unit,
          improved,
        }
      })

    // Build goals progress
    const goalsList = (goals || []).map((g: any) => ({
      name: g.metric_name || g.goal_type,
      current: g.current_value || 0,
      target: g.target_value || 1,
      percentComplete: g.target_value ? Math.round(((g.current_value || 0) / g.target_value) * 100) : 0,
    }))

    // Find personal records from this period
    const personalRecords: { label: string; value: string; date: string }[] = []
    if (recentMetrics && recentMetrics.length > 0) {
      // Get all-time metrics for comparison
      const { data: allTime } = await adminClient
        .from('athlete_performance_metrics')
        .select('*')
        .eq('athlete_id', athleteId)
        .lt('test_date', periodStart)
        .order('test_date', { ascending: false })

      metricFields.forEach(f => {
        const currentBest = recentMetrics.reduce((best: number | null, m: any) => {
          const val = m[f.key]
          if (!val) return best
          if (!best) return val
          return f.higherIsBetter ? Math.max(best, val) : Math.min(best, val)
        }, null)

        if (!currentBest) return

        const previousBest = (allTime || []).reduce((best: number | null, m: any) => {
          const val = m[f.key]
          if (!val) return best
          if (!best) return val
          return f.higherIsBetter ? Math.max(best, val) : Math.min(best, val)
        }, null)

        const isNewPR = !previousBest || (f.higherIsBetter ? currentBest > previousBest : currentBest < previousBest)
        if (isNewPR) {
          const prMetric = recentMetrics.find((m: any) => m[f.key] === currentBest)
          personalRecords.push({
            label: f.label,
            value: `${currentBest} ${f.unit}`,
            date: prMetric?.test_date || periodEnd,
          })
        }
      })
    }

    const sport = athlete.athlete_type || (athlete.sports as string[])?.[0] || 'Multi-sport'
    const periodLabel = `${new Date(periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    const reportData = {
      athleteName: athlete.full_name || 'Athlete',
      sport: sport.charAt(0).toUpperCase() + sport.slice(1),
      periodLabel,
      metrics,
      goals: goalsList,
      sessionsCompleted: sessionsCompleted || 0,
      sessionsTotal: sessionsTotal || 0,
      drillsCompleted: drillsCompleted || 0,
      coachNotes: (coachNotes || []).map((n: any) => ({
        title: n.title || 'Note',
        content: n.content || '',
        date: new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })),
      personalRecords,
    }

    // Generate email HTML
    const emailContent = getProgressReportEmail(reportData)

    // Send email if requested
    if (sendEmailReport && athlete.email) {
      await sendEmail({
        to: athlete.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: `Progress Report for ${athlete.full_name} — ${reportData.periodLabel}. Sessions: ${reportData.sessionsCompleted}, Drills: ${reportData.drillsCompleted}, PRs: ${reportData.personalRecords.length}. View full report at https://psp.pro/progress-report`,
      })

      // Update last report sent timestamp
      await adminClient.from('profiles').update({
        last_progress_report_at: new Date().toISOString(),
      }).eq('id', athleteId)
    }

    return NextResponse.json({
      success: true,
      report: reportData,
      html: emailContent.html,
      emailSent: sendEmailReport && !!athlete.email,
    })
  } catch (error: any) {
    console.error('Progress report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
