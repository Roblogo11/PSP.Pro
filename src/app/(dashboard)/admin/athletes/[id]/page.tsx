'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toastError } from '@/lib/toast'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString } from '@/lib/utils/local-date'
import { useUserRole } from '@/lib/hooks/use-user-role'
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Trash2,
  Save,
  X,
  Activity,
  Zap,
  Award,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
} from 'lucide-react'
import Link from 'next/link'

// ─── Sport-Specific Metric Templates ─────────────────────────────────
interface MetricDef {
  key: string
  label: string
  unit: string
  placeholder: string
  step?: string
  dbColumn?: string   // saves to existing DB column
  lowerIsBetter?: boolean
}

const SPORT_METRICS: Record<string, MetricDef[]> = {
  softball: [
    { key: 'exit_velocity', label: 'Exit Velocity', unit: 'mph', placeholder: '88.5', dbColumn: 'exit_velocity_mph' },
    { key: 'overhand_throw_velocity', label: 'Overhand Throw Velocity', unit: 'mph', placeholder: '62.0', dbColumn: 'throwing_velocity_mph' },
    { key: 'pitching_velocity', label: 'Pitching Velocity', unit: 'mph', placeholder: '58.0' },
    { key: 'pop_time', label: 'Pop Time (Catchers)', unit: 'sec', placeholder: '2.10', step: '0.01', lowerIsBetter: true },
    { key: 'home_to_first', label: 'Home-to-1B Time', unit: 'sec', placeholder: '2.90', step: '0.01', dbColumn: 'home_to_first_seconds', lowerIsBetter: true },
    { key: 'spin_rate', label: 'Spin Rate (Pitchers)', unit: 'rpm', placeholder: '1200' },
    { key: 'strike_pct', label: 'Strike %', unit: '%', placeholder: '65.0' },
    { key: 'contact_pct', label: 'Contact %', unit: '%', placeholder: '78.0' },
    { key: 'launch_angle', label: 'Launch Angle', unit: '\u00B0', placeholder: '15.0', dbColumn: 'launch_angle_degrees' },
    { key: 'bat_speed', label: 'Bat Speed', unit: 'mph', placeholder: '65.0', dbColumn: 'bat_speed_mph' },
    { key: 'glove_to_throw', label: 'Glove-to-Throw Exchange', unit: 'sec', placeholder: '0.85', step: '0.01', lowerIsBetter: true },
    { key: 'catch_radius', label: 'Catch Radius', unit: 'ft', placeholder: '6.5' },
    { key: 'base_acceleration', label: 'Baserunning Acceleration', unit: 'sec', placeholder: '1.50', step: '0.01', lowerIsBetter: true },
    { key: 'offspeed_command', label: 'Off-Speed Command', unit: '%', placeholder: '55.0' },
    { key: 'infield_velocity', label: 'Infield Velocity', unit: 'mph', placeholder: '58.0' },
  ],
  basketball: [
    { key: 'three_pt_pct', label: '3-Point Shooting %', unit: '%', placeholder: '35.0' },
    { key: 'free_throw_pct', label: 'Free Throw %', unit: '%', placeholder: '75.0' },
    { key: 'lane_agility', label: 'Lane Agility Time', unit: 'sec', placeholder: '11.50', step: '0.01', lowerIsBetter: true },
    { key: 'max_vertical_reach', label: 'Max Vertical Reach', unit: 'in', placeholder: '108.0' },
    { key: 'effective_fg_pct', label: 'Effective FG%', unit: '%', placeholder: '52.0' },
    { key: 'assist_to_turnover', label: 'Assist-to-Turnover Ratio', unit: ':1', placeholder: '2.5' },
    { key: 'lateral_slide_speed', label: 'Lateral Slide Speed', unit: 'sec', placeholder: '3.20', step: '0.01', lowerIsBetter: true },
    { key: 'reaction_time', label: 'Reaction Time', unit: 'ms', placeholder: '250', lowerIsBetter: true },
    { key: 'dribble_velocity', label: 'Dribble Velocity', unit: 'mph', placeholder: '12.5' },
    { key: 'defensive_rebound_rate', label: 'Defensive Rebound Rate', unit: '%', placeholder: '22.0' },
    { key: 'block_steal_rate', label: 'Block/Steal Rate', unit: '/gm', placeholder: '2.5' },
    { key: 'box_to_box_sprint', label: 'Box-to-Box Sprint', unit: 'sec', placeholder: '3.80', step: '0.01', lowerIsBetter: true },
    { key: 'hand_size', label: 'Hand Size', unit: 'in', placeholder: '9.5' },
    { key: 'catch_shoot_release', label: 'Catch-and-Shoot Release', unit: 'sec', placeholder: '0.55', step: '0.01', lowerIsBetter: true },
    { key: 'perimeter_defense', label: 'Perimeter Defensive Rating', unit: 'pts', placeholder: '105', lowerIsBetter: true },
  ],
  soccer: [
    { key: 'passing_accuracy', label: 'Passing Accuracy', unit: '%', placeholder: '82.0' },
    { key: 'first_touch', label: 'First Touch Efficiency', unit: '%', placeholder: '88.0' },
    { key: 'shot_power', label: 'Shot Power/Velocity', unit: 'mph', placeholder: '65.0' },
    { key: 'successful_dribbles', label: 'Successful Dribbles (1v1)', unit: '/gm', placeholder: '5.0' },
    { key: 'distance_covered', label: 'Total Distance Covered', unit: 'mi', placeholder: '6.2' },
    { key: 'sprints_per_game', label: 'Sprints per Game', unit: '', placeholder: '35' },
    { key: 'cross_accuracy', label: 'Cross Accuracy', unit: '%', placeholder: '28.0' },
    { key: 'aerial_duel_pct', label: 'Aerial Duel Win %', unit: '%', placeholder: '55.0' },
    { key: 'recovery_speed', label: 'Recovery Speed', unit: 'sec', placeholder: '2.80', step: '0.01', lowerIsBetter: true },
    { key: 'tackle_success', label: 'Tackle Success %', unit: '%', placeholder: '72.0' },
    { key: 'interceptions_90', label: 'Interceptions per 90', unit: '/90', placeholder: '3.5' },
    { key: 'shot_on_goal_pct', label: 'Shot-on-Goal %', unit: '%', placeholder: '45.0' },
    { key: 'decision_speed', label: 'Decision-Making Speed', unit: 'ms', placeholder: '320', lowerIsBetter: true },
    { key: 'goalie_save_pct', label: 'Goalie Save %', unit: '%', placeholder: '72.0' },
    { key: 'distribution_accuracy', label: 'Distribution Accuracy (GK)', unit: '%', placeholder: '68.0' },
  ],
  athleticism: [
    { key: 'ten_yard_split', label: '10-Yard Split', unit: 'sec', placeholder: '1.65', step: '0.01', dbColumn: 'ten_yard_split_seconds', lowerIsBetter: true },
    { key: 'forty_yard_dash', label: '40-Yard Dash', unit: 'sec', placeholder: '4.80', step: '0.01', lowerIsBetter: true },
    { key: 'vertical_jump', label: 'Vertical Jump', unit: 'in', placeholder: '28.5', dbColumn: 'vertical_jump_inches' },
    { key: 'pro_agility', label: 'Pro Agility 5-10-5', unit: 'sec', placeholder: '4.55', step: '0.01', lowerIsBetter: true },
    { key: 'broad_jump', label: 'Broad Jump', unit: 'in', placeholder: '95.0', dbColumn: 'broad_jump_inches' },
    { key: 'three_cone', label: '3-Cone Drill (L-Drill)', unit: 'sec', placeholder: '7.20', step: '0.01', lowerIsBetter: true },
    { key: 'med_ball_toss', label: 'Medicine Ball Toss', unit: 'ft', placeholder: '32.0' },
    { key: 'wingspan', label: 'Wing Span', unit: 'in', placeholder: '68.0' },
    { key: 'beep_test', label: 'Beep Test (Yo-Yo)', unit: 'level', placeholder: '8.5' },
    { key: 'max_pullups', label: 'Max Pull-Ups', unit: 'reps', placeholder: '12' },
    { key: 'grip_strength', label: 'Grip Strength', unit: 'lbs', placeholder: '95' },
    { key: 'deadlift_ratio', label: 'Deadlift (Relative BW)', unit: 'x', placeholder: '1.75' },
    { key: 't_test', label: 'T-Test', unit: 'sec', placeholder: '9.50', step: '0.01', lowerIsBetter: true },
    { key: 'body_fat', label: 'Skin Fold / Body Fat', unit: '%', placeholder: '15.0', lowerIsBetter: true },
    { key: 'resting_hr', label: 'Resting Heart Rate', unit: 'bpm', placeholder: '62', lowerIsBetter: true },
  ],
}

const SPORT_TABS = [
  { key: 'softball', label: 'Softball', emoji: '\u26BE' },
  { key: 'basketball', label: 'Basketball', emoji: '\uD83C\uDFC0' },
  { key: 'soccer', label: 'Soccer', emoji: '\u26BD' },
  { key: 'athleticism', label: 'Athleticism', emoji: '\uD83C\uDFCB\uFE0F' },
]

// Map athlete_type to default sport tab
function getDefaultTab(athleteType: string | null): string {
  if (!athleteType) return 'softball'
  const t = athleteType.toLowerCase()
  if (t.includes('basketball') || t.includes('hoops')) return 'basketball'
  if (t.includes('soccer') || t.includes('football') || t.includes('futbol')) return 'soccer'
  return 'softball'
}

// ─── Interfaces ─────────────────────────────────────────────────────
interface AthleteProfile {
  id: string
  full_name: string
  email: string | null
  athlete_type: string | null
  age: number | null
  avatar_url: string | null
}

interface PerformanceMetric {
  id: string
  test_date: string
  session_id: string | null
  throwing_velocity_mph: number | null
  throwing_velocity_avg_mph: number | null
  throwing_accuracy_percentage: number | null
  exit_velocity_mph: number | null
  exit_velocity_avg_mph: number | null
  bat_speed_mph: number | null
  launch_angle_degrees: number | null
  sixty_yard_dash_seconds: number | null
  home_to_first_seconds: number | null
  ten_yard_split_seconds: number | null
  vertical_jump_inches: number | null
  broad_jump_inches: number | null
  overall_performance_score: number | null
  notes: string | null
  recorded_by: string
  custom_metrics: {
    sport?: string
    verified?: boolean
    metrics?: Record<string, number>
  } | null
  created_at: string
}

// ─── Helper: Get metric value from a record (checks DB col first, then JSONB) ──
function getMetricValue(metric: PerformanceMetric, def: MetricDef): number | null {
  // Check native DB column first
  if (def.dbColumn) {
    const val = metric[def.dbColumn as keyof PerformanceMetric] as number | null
    if (val !== null && val !== undefined) return val
  }
  // Check custom_metrics JSONB
  const cm = metric.custom_metrics?.metrics
  if (cm && cm[def.key] !== undefined) return cm[def.key]
  return null
}

// ─── Component ──────────────────────────────────────────────────────
export default function AthleteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const athleteId = params.id as string
  const { profile, isCoach, isAdmin, loading: profileLoading } = useUserRole()

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMetricForm, setShowAddMetricForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sport tab for the form
  const [formTab, setFormTab] = useState('softball')
  // Sport tab for the history view
  const [historyTab, setHistoryTab] = useState('all')
  // Verified toggle
  const [isVerified, setIsVerified] = useState(true)

  // Dynamic form values — keyed by metric def key
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formDate, setFormDate] = useState(getLocalDateString())
  const [formNotes, setFormNotes] = useState('')
  const [formOverallScore, setFormOverallScore] = useState('')

  // Redirect if not authorized
  useEffect(() => {
    if (!profileLoading && !isCoach && !isAdmin) {
      router.push('/locker')
    }
  }, [profileLoading, isCoach, isAdmin, router])

  // Load athlete data and metrics
  useEffect(() => {
    if (!profile || !isCoach) return

    async function loadData() {
      try {
        const supabase = createClient()

        const { data: athleteData, error: athleteError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', athleteId)
          .single()

        if (athleteError) throw athleteError
        setAthlete(athleteData)
        setFormTab(getDefaultTab(athleteData.athlete_type))

        const { data: metricsData, error: metricsError } = await supabase
          .from('athlete_performance_metrics')
          .select('*')
          .eq('athlete_id', athleteId)
          .order('test_date', { ascending: false })

        if (metricsError) throw metricsError
        setMetrics(metricsData || [])
      } catch (error) {
        console.error('Error loading athlete data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [profile, isCoach, athleteId])

  const resetForm = () => {
    setFormValues({})
    setFormDate(getLocalDateString())
    setFormNotes('')
    setFormOverallScore('')
    setIsVerified(true)
  }

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || saving) return

    setSaving(true)
    try {
      const supabase = createClient()

      const metricData: Record<string, any> = {
        athlete_id: athleteId,
        recorded_by: profile.id,
        test_date: formDate,
        notes: formNotes || null,
      }

      if (formOverallScore) {
        metricData.overall_performance_score = parseFloat(formOverallScore)
      }

      // Build custom_metrics JSONB and fill DB columns
      const jsonMetrics: Record<string, number> = {}
      const currentTabMetrics = SPORT_METRICS[formTab] || []

      currentTabMetrics.forEach((def) => {
        const val = formValues[def.key]
        if (val && val !== '') {
          const num = parseFloat(val)
          if (!isNaN(num)) {
            if (def.dbColumn) {
              metricData[def.dbColumn] = num
            }
            // Always store in JSONB too for easy sport-filtered querying
            jsonMetrics[def.key] = num
          }
        }
      })

      // Also check the athleticism tab if we're on a sport tab
      if (formTab !== 'athleticism') {
        SPORT_METRICS.athleticism.forEach((def) => {
          const val = formValues[def.key]
          if (val && val !== '') {
            const num = parseFloat(val)
            if (!isNaN(num)) {
              if (def.dbColumn) {
                metricData[def.dbColumn] = num
              }
              jsonMetrics[def.key] = num
            }
          }
        })
      }

      metricData.custom_metrics = {
        sport: formTab,
        verified: isVerified,
        metrics: jsonMetrics,
      }

      // Use upsert to prevent duplicate entries for same athlete + date
      const { error } = await supabase
        .from('athlete_performance_metrics')
        .upsert(metricData, { onConflict: 'athlete_id,test_date' })

      if (error) throw error

      // Reload metrics
      const { data: metricsData } = await supabase
        .from('athlete_performance_metrics')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('test_date', { ascending: false })

      setMetrics(metricsData || [])
      setShowAddMetricForm(false)
      resetForm()
    } catch (error: any) {
      console.error('Error saving metric:', error)
      toastError(`Error saving metric: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMetric = async (metricId: string) => {
    if (!confirm('Are you sure you want to delete this metric entry?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('athlete_performance_metrics')
        .delete()
        .eq('id', metricId)

      if (error) throw error
      setMetrics(metrics.filter((m) => m.id !== metricId))
    } catch (error: any) {
      console.error('Error deleting metric:', error)
      toastError(`Error deleting metric: ${error.message}`)
    }
  }

  // ─── Stat Cards Logic ─────────────────────────────────────────────
  // Get the "best" latest values for the stat overview cards based on sport
  function getTopStats(): { label: string; value: number | null; unit: string; icon: any; lowerIsBetter?: boolean }[] {
    const sport = getDefaultTab(athlete?.athlete_type ?? null)
    const defs = SPORT_METRICS[sport] || SPORT_METRICS.softball

    // Pick the first 3 sport metrics + athleticism metric + overall score
    const topDefs = defs.slice(0, 3)
    const athDef = SPORT_METRICS.athleticism[0] // 10-Yard Split

    const icons = [Activity, Zap, TrendingUp, Dumbbell]
    const stats = topDefs.map((def, i) => {
      const latestVal = metrics.length > 0 ? getMetricValue(metrics[0], def) : null
      return { label: def.label, value: latestVal, unit: ` ${def.unit}`, icon: icons[i], lowerIsBetter: def.lowerIsBetter }
    })

    const athVal = metrics.length > 0 ? getMetricValue(metrics[0], athDef) : null
    stats.push({ label: athDef.label, value: athVal, unit: ` ${athDef.unit}`, icon: Dumbbell, lowerIsBetter: athDef.lowerIsBetter })

    return stats
  }

  function getImprovement(def: MetricDef): { value: number; percent: number; improved: boolean } | null {
    if (metrics.length < 2) return null
    const latest = getMetricValue(metrics[0], def)
    const previous = getMetricValue(metrics[1], def)
    if (!latest || !previous) return null

    const change = latest - previous
    const percentChange = (change / previous) * 100
    return {
      value: change,
      percent: percentChange,
      improved: def.lowerIsBetter ? change < 0 : change > 0,
    }
  }

  // ─── Stat Card Component ──────────────────────────────────────────
  const StatCard = ({
    label,
    value,
    unit,
    improvement,
    icon: Icon,
  }: {
    label: string
    value: number | null
    unit: string
    improvement: { value: number; percent: number; improved: boolean } | null
    icon: any
  }) => (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-orange" />
          <span className="text-sm text-cyan-800 dark:text-white">{label}</span>
        </div>
        {improvement && (
          <div
            className={`flex items-center gap-1 text-xs ${
              improvement.improved ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {improvement.improved ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(improvement.percent).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {value !== null ? `${value}${unit}` : '-'}
      </p>
    </div>
  )

  // ─── Verified Badge ───────────────────────────────────────────────
  const VerifiedBadge = ({ verified }: { verified: boolean }) => (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        verified
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      }`}
    >
      {verified ? (
        <>
          <CheckCircle2 className="w-3 h-3" />
          PSP Verified
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3" />
          Self-Reported
        </>
      )}
    </span>
  )

  // ─── Filtered Metrics for History ─────────────────────────────────
  const filteredMetrics = historyTab === 'all'
    ? metrics
    : metrics.filter((m) => m.custom_metrics?.sport === historyTab)

  // ─── Loading / Not Found States ───────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange"></div>
      </div>
    )
  }

  if (!athlete) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-cyan-800 dark:text-white">Athlete not found</p>
          <Link href="/admin/athletes" className="text-orange hover:text-orange-400 mt-4 inline-block">
            Back to Athletes
          </Link>
        </div>
      </div>
    )
  }

  const topStats = getTopStats()

  return (
    <div className="px-3 py-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/athletes"
          className="inline-flex items-center gap-2 text-cyan-800 dark:text-white hover:text-orange transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Athletes
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
              {athlete.full_name}
            </h1>
            <div className="flex items-center gap-4 text-cyan-800 dark:text-white flex-wrap">
              <span>{athlete.athlete_type || 'Athlete'}</span>
              {athlete.age && <span>Age: {athlete.age}</span>}
              {athlete.email && <span className="hidden md:inline">{athlete.email}</span>}
            </div>
          </div>

          <button
            onClick={() => {
              resetForm()
              setShowAddMetricForm(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Performance Data
          </button>
        </div>
      </div>

      {/* Latest Stats Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Latest Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topStats.map((stat, i) => {
            const sport = getDefaultTab(athlete.athlete_type ?? null)
            const defs = [...(SPORT_METRICS[sport] || []), ...SPORT_METRICS.athleticism]
            const matchDef = defs.find((d) => d.label === stat.label)
            return (
              <StatCard
                key={i}
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                improvement={matchDef ? getImprovement(matchDef) : null}
                icon={stat.icon}
              />
            )
          })}
        </div>
      </div>

      {/* ─── Add Metric Modal ───────────────────────────────────────── */}
      {showAddMetricForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add Performance Data</h2>
              <button
                onClick={() => setShowAddMetricForm(false)}
                className="text-cyan-800 dark:text-white hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-6">
              {/* Date + Verified row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">
                    Test Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">
                    Verification Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsVerified(!isVerified)}
                    className={`w-full px-4 py-3 rounded-xl border font-medium flex items-center justify-center gap-2 transition-colors ${
                      isVerified
                        ? 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 border-gray-500/40 text-gray-400 hover:bg-gray-500/30'
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        PSP Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        Self-Reported
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sport Tabs */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">
                  Sport Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPORT_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFormTab(tab.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formTab === tab.key
                          ? 'bg-orange text-white shadow-lg shadow-orange/25'
                          : 'bg-cyan-50/50 dark:bg-white/5 text-cyan-800 dark:text-white hover:bg-white/10 border border-cyan-200/40'
                      }`}
                    >
                      {tab.emoji} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sport-Specific Metrics Grid */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {SPORT_TABS.find((t) => t.key === formTab)?.emoji}{' '}
                  {SPORT_TABS.find((t) => t.key === formTab)?.label} Metrics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(SPORT_METRICS[formTab] || []).map((def) => (
                    <div key={def.key}>
                      <label className="block text-sm text-cyan-800 dark:text-white mb-1">
                        {def.label} <span className="text-cyan-600 dark:text-gray-500">({def.unit})</span>
                      </label>
                      <input
                        type="number"
                        step={def.step || '0.1'}
                        value={formValues[def.key] || ''}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, [def.key]: e.target.value }))
                        }
                        className="w-full px-3 py-2 bg-cyan-50/50 border border-cyan-200/40 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50 text-sm"
                        placeholder={def.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Athleticism metrics (always shown if on a sport tab) */}
              {formTab !== 'athleticism' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    {SPORT_TABS[3].emoji} Athleticism Metrics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {SPORT_METRICS.athleticism.map((def) => (
                      <div key={def.key}>
                        <label className="block text-sm text-cyan-800 dark:text-white mb-1">
                          {def.label} <span className="text-cyan-600 dark:text-gray-500">({def.unit})</span>
                        </label>
                        <input
                          type="number"
                          step={def.step || '0.1'}
                          value={formValues[def.key] || ''}
                          onChange={(e) =>
                            setFormValues((prev) => ({ ...prev, [def.key]: e.target.value }))
                          }
                          className="w-full px-3 py-2 bg-cyan-50/50 border border-cyan-200/40 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50 text-sm"
                          placeholder={def.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Score */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">
                  Overall Performance Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formOverallScore}
                  onChange={(e) => setFormOverallScore(e.target.value)}
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
                  placeholder="85"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">
                  Notes
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
                  placeholder="Additional observations..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Metrics'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMetricForm(false)}
                  className="px-6 py-3 rounded-xl bg-cyan-50/50 hover:bg-white/10 text-slate-900 dark:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Performance History ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Performance History</h2>
          {/* History filter tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setHistoryTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                historyTab === 'all'
                  ? 'bg-orange text-white'
                  : 'bg-cyan-50/50 dark:bg-white/5 text-cyan-800 dark:text-white hover:bg-white/10'
              }`}
            >
              All
            </button>
            {SPORT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setHistoryTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  historyTab === tab.key
                    ? 'bg-orange text-white'
                    : 'bg-cyan-50/50 dark:bg-white/5 text-cyan-800 dark:text-white hover:bg-white/10'
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredMetrics.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Target className="w-12 h-12 text-cyan-700 dark:text-white mx-auto mb-4" />
            <p className="text-cyan-800 dark:text-white mb-4">
              {historyTab === 'all' ? 'No performance data yet' : `No ${historyTab} data yet`}
            </p>
            <button
              onClick={() => {
                resetForm()
                setShowAddMetricForm(true)
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMetrics.map((metric) => {
              const sport = metric.custom_metrics?.sport || 'softball'
              const verified = metric.custom_metrics?.verified ?? false
              const sportDefs = SPORT_METRICS[sport] || []
              const allDefs = [...sportDefs, ...SPORT_METRICS.athleticism]

              // Collect all values that exist for this entry
              const displayValues = allDefs
                .map((def) => {
                  const val = getMetricValue(metric, def)
                  if (val === null) return null
                  return { label: def.label, value: val, unit: def.unit }
                })
                .filter(Boolean) as { label: string; value: number; unit: string }[]

              // Also check legacy fields not in sport templates
              if (metric.overall_performance_score) {
                displayValues.push({ label: 'Overall Score', value: metric.overall_performance_score, unit: '/100' })
              }
              if (metric.sixty_yard_dash_seconds && !displayValues.find(d => d.label.includes('60'))) {
                displayValues.push({ label: '60-Yard Dash', value: metric.sixty_yard_dash_seconds, unit: 'sec' })
              }

              const sportTab = SPORT_TABS.find((t) => t.key === sport)

              return (
                <div key={metric.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-wrap">
                      <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                          {new Date(metric.test_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {sportTab && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/20">
                              {sportTab.emoji} {sportTab.label}
                            </span>
                          )}
                          <VerifiedBadge verified={verified} />
                          {metric.session_id && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-orange/10 text-orange border border-orange/20">
                              <Calendar className="w-3 h-3" />
                              Session Linked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMetric(metric.id)}
                      className="text-cyan-800 dark:text-white hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {displayValues.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {displayValues.map((item, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-cyan-800 dark:text-gray-400 mb-0.5">{item.label}</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            {item.value} <span className="text-sm font-normal text-cyan-600 dark:text-gray-500">{item.unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-cyan-800 dark:text-gray-400 mb-4">No metric values recorded</p>
                  )}

                  {metric.notes && (
                    <div className="pt-4 border-t border-cyan-200/40">
                      <p className="text-sm text-cyan-700 dark:text-white">{metric.notes}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
