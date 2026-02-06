'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Edit,
  Trash2,
  Save,
  X,
  Activity,
  Zap,
  Award,
} from 'lucide-react'
import Link from 'next/link'

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
  throwing_velocity_mph: number | null
  throwing_velocity_avg_mph: number | null
  exit_velocity_mph: number | null
  exit_velocity_avg_mph: number | null
  bat_speed_mph: number | null
  sixty_yard_dash_seconds: number | null
  home_to_first_seconds: number | null
  overall_performance_score: number | null
  notes: string | null
  recorded_by: string
  created_at: string
}

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

  // Form state for new metric
  const [metricForm, setMetricForm] = useState({
    test_date: new Date().toISOString().split('T')[0],
    throwing_velocity_mph: '',
    throwing_velocity_avg_mph: '',
    throwing_accuracy_percentage: '',
    exit_velocity_mph: '',
    exit_velocity_avg_mph: '',
    bat_speed_mph: '',
    launch_angle_degrees: '',
    sixty_yard_dash_seconds: '',
    home_to_first_seconds: '',
    ten_yard_split_seconds: '',
    vertical_jump_inches: '',
    broad_jump_inches: '',
    overall_performance_score: '',
    notes: '',
  })

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

        // Load athlete profile
        const { data: athleteData, error: athleteError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', athleteId)
          .single()

        if (athleteError) throw athleteError
        setAthlete(athleteData)

        // Load performance metrics
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

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const supabase = createClient()

      // Convert form data to proper types
      const metricData: any = {
        athlete_id: athleteId,
        recorded_by: profile.id,
        test_date: metricForm.test_date,
        notes: metricForm.notes || null,
      }

      // Add numeric fields only if they have values
      const numericFields = [
        'throwing_velocity_mph',
        'throwing_velocity_avg_mph',
        'throwing_accuracy_percentage',
        'exit_velocity_mph',
        'exit_velocity_avg_mph',
        'bat_speed_mph',
        'launch_angle_degrees',
        'sixty_yard_dash_seconds',
        'home_to_first_seconds',
        'ten_yard_split_seconds',
        'vertical_jump_inches',
        'broad_jump_inches',
        'overall_performance_score',
      ]

      numericFields.forEach((field) => {
        const value = metricForm[field as keyof typeof metricForm]
        if (value && value !== '') {
          metricData[field] = parseFloat(value as string)
        }
      })

      const { error } = await supabase
        .from('athlete_performance_metrics')
        .insert(metricData)

      if (error) throw error

      // Reload metrics
      const { data: metricsData } = await supabase
        .from('athlete_performance_metrics')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('test_date', { ascending: false })

      setMetrics(metricsData || [])
      setShowAddMetricForm(false)

      // Reset form
      setMetricForm({
        test_date: new Date().toISOString().split('T')[0],
        throwing_velocity_mph: '',
        throwing_velocity_avg_mph: '',
        throwing_accuracy_percentage: '',
        exit_velocity_mph: '',
        exit_velocity_avg_mph: '',
        bat_speed_mph: '',
        launch_angle_degrees: '',
        sixty_yard_dash_seconds: '',
        home_to_first_seconds: '',
        ten_yard_split_seconds: '',
        vertical_jump_inches: '',
        broad_jump_inches: '',
        overall_performance_score: '',
        notes: '',
      })
    } catch (error: any) {
      console.error('Error saving metric:', error)
      alert(`Error saving metric: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMetric = async (metricId: string) => {
    if (!confirm('Are you sure you want to delete this metric?')) return

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
      alert(`Error deleting metric: ${error.message}`)
    }
  }

  const getLatestValue = (field: keyof PerformanceMetric) => {
    if (metrics.length === 0) return null
    return metrics[0][field]
  }

  const getImprovement = (field: keyof PerformanceMetric, lowerIsBetter = false) => {
    if (metrics.length < 2) return null
    const latest = metrics[0][field] as number | null
    const previous = metrics[1][field] as number | null
    if (!latest || !previous) return null

    const change = latest - previous
    const percentChange = (change / previous) * 100

    return {
      value: change,
      percent: percentChange,
      improved: lowerIsBetter ? change < 0 : change > 0,
    }
  }

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
    improvement: ReturnType<typeof getImprovement>
    icon: any
  }) => (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-orange" />
          <span className="text-sm text-slate-400">{label}</span>
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
      <p className="text-2xl font-bold text-white">
        {value !== null ? `${value}${unit}` : '-'}
      </p>
    </div>
  )

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
          <p className="text-slate-400">Athlete not found</p>
          <Link href="/admin/athletes" className="text-orange hover:text-orange-400 mt-4 inline-block">
            Back to Athletes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/athletes"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Athletes
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              {athlete.full_name}
            </h1>
            <div className="flex items-center gap-4 text-slate-400">
              <span>{athlete.athlete_type || 'Athlete'}</span>
              {athlete.age && <span>Age: {athlete.age}</span>}
              {athlete.email && <span>{athlete.email}</span>}
            </div>
          </div>

          <button
            onClick={() => setShowAddMetricForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Performance Data
          </button>
        </div>
      </div>

      {/* Latest Stats Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Latest Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            label="Throwing Velocity"
            value={getLatestValue('throwing_velocity_mph')}
            unit=" mph"
            improvement={getImprovement('throwing_velocity_mph')}
            icon={Activity}
          />
          <StatCard
            label="Exit Velocity"
            value={getLatestValue('exit_velocity_mph')}
            unit=" mph"
            improvement={getImprovement('exit_velocity_mph')}
            icon={Zap}
          />
          <StatCard
            label="60-Yard Dash"
            value={getLatestValue('sixty_yard_dash_seconds')}
            unit="s"
            improvement={getImprovement('sixty_yard_dash_seconds', true)}
            icon={TrendingUp}
          />
          <StatCard
            label="Overall Score"
            value={getLatestValue('overall_performance_score')}
            unit="/100"
            improvement={getImprovement('overall_performance_score')}
            icon={Award}
          />
        </div>
      </div>

      {/* Add Metric Form */}
      {showAddMetricForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Performance Data</h2>
              <button
                onClick={() => setShowAddMetricForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-6">
              {/* Test Date */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Test Date
                </label>
                <input
                  type="date"
                  value={metricForm.test_date}
                  onChange={(e) => setMetricForm({ ...metricForm, test_date: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                />
              </div>

              {/* Throwing Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Throwing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Max Velocity (mph)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={metricForm.throwing_velocity_mph}
                      onChange={(e) => setMetricForm({ ...metricForm, throwing_velocity_mph: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="75.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Avg Velocity (mph)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={metricForm.throwing_velocity_avg_mph}
                      onChange={(e) => setMetricForm({ ...metricForm, throwing_velocity_avg_mph: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="73.2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Accuracy (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={metricForm.throwing_accuracy_percentage}
                      onChange={(e) => setMetricForm({ ...metricForm, throwing_accuracy_percentage: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="85"
                    />
                  </div>
                </div>
              </div>

              {/* Batting Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Batting</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Max Exit Velocity (mph)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={metricForm.exit_velocity_mph}
                      onChange={(e) => setMetricForm({ ...metricForm, exit_velocity_mph: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="88.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Avg Exit Velocity (mph)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={metricForm.exit_velocity_avg_mph}
                      onChange={(e) => setMetricForm({ ...metricForm, exit_velocity_avg_mph: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="82.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Bat Speed (mph)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={metricForm.bat_speed_mph}
                      onChange={(e) => setMetricForm({ ...metricForm, bat_speed_mph: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="65.0"
                    />
                  </div>
                </div>
              </div>

              {/* Speed Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Speed & Agility</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">60-Yard Dash (sec)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={metricForm.sixty_yard_dash_seconds}
                      onChange={(e) => setMetricForm({ ...metricForm, sixty_yard_dash_seconds: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="7.15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Home to 1st (sec)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={metricForm.home_to_first_seconds}
                      onChange={(e) => setMetricForm({ ...metricForm, home_to_first_seconds: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="4.25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">10-Yard Split (sec)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={metricForm.ten_yard_split_seconds}
                      onChange={(e) => setMetricForm({ ...metricForm, ten_yard_split_seconds: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="1.65"
                    />
                  </div>
                </div>
              </div>

              {/* Power Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Power</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Vertical Jump (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={metricForm.vertical_jump_inches}
                      onChange={(e) => setMetricForm({ ...metricForm, vertical_jump_inches: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="28.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Broad Jump (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={metricForm.broad_jump_inches}
                      onChange={(e) => setMetricForm({ ...metricForm, broad_jump_inches: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="95.0"
                    />
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Overall Performance Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={metricForm.overall_performance_score}
                  onChange={(e) => setMetricForm({ ...metricForm, overall_performance_score: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                  placeholder="85"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={metricForm.notes}
                  onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
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
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Performance History */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Performance History</h2>
        {metrics.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No performance data yet</p>
            <button
              onClick={() => setShowAddMetricForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {new Date(metric.test_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-slate-400">
                      Recorded {new Date(metric.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteMetric(metric.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {metric.throwing_velocity_mph && (
                    <div>
                      <p className="text-sm text-slate-400">Throwing Velocity</p>
                      <p className="text-xl font-bold text-white">{metric.throwing_velocity_mph} mph</p>
                    </div>
                  )}
                  {metric.exit_velocity_mph && (
                    <div>
                      <p className="text-sm text-slate-400">Exit Velocity</p>
                      <p className="text-xl font-bold text-white">{metric.exit_velocity_mph} mph</p>
                    </div>
                  )}
                  {metric.sixty_yard_dash_seconds && (
                    <div>
                      <p className="text-sm text-slate-400">60-Yard Dash</p>
                      <p className="text-xl font-bold text-white">{metric.sixty_yard_dash_seconds}s</p>
                    </div>
                  )}
                  {metric.overall_performance_score && (
                    <div>
                      <p className="text-sm text-slate-400">Overall Score</p>
                      <p className="text-xl font-bold text-white">{metric.overall_performance_score}/100</p>
                    </div>
                  )}
                </div>

                {metric.notes && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-slate-300">{metric.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
