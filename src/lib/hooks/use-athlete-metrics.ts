'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Reuse the same SPORT_METRICS shape from the admin athlete page
export interface MetricDef {
  key: string
  label: string
  unit: string
  dbColumn?: string
  jsonKey?: boolean
  lowerIsBetter?: boolean
}

export const SPORT_METRICS: Record<string, MetricDef[]> = {
  softball: [
    { key: 'exit_velocity', label: 'Exit Velocity', unit: 'mph', dbColumn: 'exit_velocity_mph' },
    { key: 'overhand_throw_velocity', label: 'Overhand Throw Velocity', unit: 'mph', dbColumn: 'throwing_velocity_mph' },
    { key: 'pitching_velocity', label: 'Pitching Velocity', unit: 'mph', jsonKey: true },
    { key: 'pop_time', label: 'Pop Time (Catchers)', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'home_to_first', label: 'Home-to-1B Time', unit: 'sec', dbColumn: 'home_to_first_seconds', lowerIsBetter: true },
    { key: 'spin_rate', label: 'Spin Rate (Pitchers)', unit: 'rpm', jsonKey: true },
    { key: 'strike_pct', label: 'Strike %', unit: '%', jsonKey: true },
    { key: 'contact_pct', label: 'Contact %', unit: '%', jsonKey: true },
    { key: 'launch_angle', label: 'Launch Angle', unit: '°', dbColumn: 'launch_angle_degrees' },
    { key: 'bat_speed', label: 'Bat Speed', unit: 'mph', dbColumn: 'bat_speed_mph' },
    { key: 'glove_to_throw', label: 'Glove-to-Throw Exchange', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'catch_radius', label: 'Catch Radius', unit: 'ft', jsonKey: true },
    { key: 'base_acceleration', label: 'Baserunning Acceleration', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'offspeed_command', label: 'Off-Speed Command', unit: '%', jsonKey: true },
    { key: 'infield_velocity', label: 'Infield Velocity', unit: 'mph', jsonKey: true },
  ],
  basketball: [
    { key: 'three_point_pct', label: '3-Point %', unit: '%', jsonKey: true },
    { key: 'free_throw_pct', label: 'Free Throw %', unit: '%', jsonKey: true },
    { key: 'field_goal_pct', label: 'Field Goal %', unit: '%', jsonKey: true },
    { key: 'vertical_reach', label: 'Vertical Reach', unit: 'in', jsonKey: true },
    { key: 'lane_agility', label: 'Lane Agility Time', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'court_sprint', label: 'Court Sprint', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'ball_handling_score', label: 'Ball Handling Score', unit: '/10', jsonKey: true },
    { key: 'assist_to_turnover', label: 'Assist/Turnover Ratio', unit: 'ratio', jsonKey: true },
    { key: 'defensive_rating', label: 'Defensive Rating', unit: '/10', jsonKey: true },
    { key: 'rebound_rate', label: 'Rebound Rate', unit: '%', jsonKey: true },
    { key: 'sprint_speed', label: 'Sprint Speed', unit: 'mph', jsonKey: true },
    { key: 'reaction_time', label: 'Reaction Time', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'vertical_jump', label: 'Vertical Jump', unit: 'in', dbColumn: 'vertical_jump_inches' },
    { key: 'max_bench', label: 'Max Bench Press', unit: 'lbs', dbColumn: 'bench_press_lbs' },
    { key: 'endurance_score', label: 'Endurance Score', unit: '/10', jsonKey: true },
  ],
  soccer: [
    { key: 'passing_accuracy', label: 'Passing Accuracy', unit: '%', jsonKey: true },
    { key: 'shot_power', label: 'Shot Power', unit: 'mph', jsonKey: true },
    { key: 'shot_accuracy', label: 'Shot Accuracy', unit: '%', jsonKey: true },
    { key: 'sprint_speed', label: 'Sprint Speed', unit: 'mph', jsonKey: true },
    { key: 'dribble_success', label: 'Dribble Success Rate', unit: '%', jsonKey: true },
    { key: 'tackles_won', label: 'Tackles Won %', unit: '%', jsonKey: true },
    { key: 'aerial_win_rate', label: 'Aerial Win Rate', unit: '%', jsonKey: true },
    { key: 'crossing_accuracy', label: 'Crossing Accuracy', unit: '%', jsonKey: true },
    { key: 'first_touch_score', label: 'First Touch Score', unit: '/10', jsonKey: true },
    { key: 'juggling_record', label: 'Juggling Record', unit: 'reps', jsonKey: true },
    { key: 'agility_time', label: 'Agility Course Time', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'distance_covered', label: 'Distance Covered (Match)', unit: 'mi', jsonKey: true },
    { key: 'vo2_max', label: 'VO2 Max', unit: 'ml/kg/min', jsonKey: true },
    { key: 'weak_foot_rating', label: 'Weak Foot Rating', unit: '/5', jsonKey: true },
    { key: 'set_piece_accuracy', label: 'Set Piece Accuracy', unit: '%', jsonKey: true },
  ],
  athleticism: [
    { key: 'ten_yard_split', label: '10-Yard Split', unit: 'sec', dbColumn: 'ten_yard_split_seconds', lowerIsBetter: true },
    { key: 'forty_yard_dash', label: '40-Yard Dash', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'vertical_jump', label: 'Vertical Jump', unit: 'in', dbColumn: 'vertical_jump_inches' },
    { key: 'pro_agility', label: 'Pro Agility 5-10-5', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'broad_jump', label: 'Broad Jump', unit: 'in', dbColumn: 'broad_jump_inches' },
    { key: 'three_cone', label: '3-Cone Drill (L-Drill)', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'med_ball_toss', label: 'Medicine Ball Toss', unit: 'ft', jsonKey: true },
    { key: 'wingspan', label: 'Wing Span', unit: 'in', jsonKey: true },
    { key: 'beep_test', label: 'Beep Test (Yo-Yo)', unit: 'level', jsonKey: true },
    { key: 'max_pullups', label: 'Max Pull-Ups', unit: 'reps', jsonKey: true },
    { key: 'grip_strength', label: 'Grip Strength', unit: 'lbs', jsonKey: true },
    { key: 'deadlift_ratio', label: 'Deadlift (Relative BW)', unit: 'x', jsonKey: true },
    { key: 't_test', label: 'T-Test', unit: 'sec', jsonKey: true, lowerIsBetter: true },
    { key: 'body_fat', label: 'Skin Fold / Body Fat', unit: '%', jsonKey: true, lowerIsBetter: true },
    { key: 'resting_hr', label: 'Resting Heart Rate', unit: 'bpm', jsonKey: true, lowerIsBetter: true },
  ],
}

// Default chart metrics per sport
export const DEFAULT_CHART_METRICS: Record<string, string[]> = {
  softball: ['exit_velocity', 'bat_speed', 'overhand_throw_velocity'],
  basketball: ['three_point_pct', 'vertical_jump', 'free_throw_pct'],
  soccer: ['sprint_speed', 'shot_power', 'passing_accuracy'],
  athleticism: ['forty_yard_dash', 'vertical_jump', 'broad_jump'],
}

export interface MetricEntry {
  id: string
  testDate: string
  sport: string | null
  verified: boolean
  sessionId: string | null
  recordedBy: string | null
  values: Record<string, number> // key → value for all metrics
}

export interface PersonalRecord {
  metricKey: string
  label: string
  unit: string
  value: number
  date: string
  verified: boolean
  lowerIsBetter?: boolean
}

function getMetricValue(entry: any, metricDef: MetricDef): number | null {
  // Check DB column first
  if (metricDef.dbColumn && entry[metricDef.dbColumn] != null) {
    return Number(entry[metricDef.dbColumn])
  }
  // Check JSONB custom_metrics
  if (metricDef.jsonKey && entry.custom_metrics?.metrics?.[metricDef.key] != null) {
    return Number(entry.custom_metrics.metrics[metricDef.key])
  }
  return null
}

export function useAthleteMetrics(userId: string | undefined) {
  const [entries, setEntries] = useState<MetricEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function loadMetrics() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('athlete_performance_metrics')
          .select('*')
          .eq('athlete_id', userId)
          .order('test_date', { ascending: true })

        if (error) throw error

        const transformed: MetricEntry[] = (data || []).map((entry: any) => {
          const sport = entry.custom_metrics?.sport || null
          const verified = entry.custom_metrics?.verified ?? true
          const values: Record<string, number> = {}

          // Extract values from all sport metric definitions
          const allMetrics = [
            ...SPORT_METRICS.softball,
            ...SPORT_METRICS.basketball,
            ...SPORT_METRICS.soccer,
            ...SPORT_METRICS.athleticism,
          ]

          // Dedupe by key (athleticism vertical_jump overlaps basketball)
          const seen = new Set<string>()
          for (const metric of allMetrics) {
            if (seen.has(metric.key)) continue
            seen.add(metric.key)
            const val = getMetricValue(entry, metric)
            if (val !== null) {
              values[metric.key] = val
            }
          }

          return {
            id: entry.id,
            testDate: entry.test_date,
            sport,
            verified,
            sessionId: entry.session_id,
            recordedBy: entry.recorded_by,
            values,
          }
        })

        setEntries(transformed)
      } catch (error) {
        console.error('Error loading athlete metrics:', error)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [userId])

  // Filter entries by sport
  const getEntriesBySport = (sport: string): MetricEntry[] => {
    if (sport === 'all') return entries
    return entries.filter(e => e.sport === sport || e.sport === null)
  }

  // Get time series for a specific metric
  const getMetricTimeSeries = (metricKey: string, sport?: string): Array<{ date: string; value: number; verified: boolean }> => {
    const filtered = sport ? getEntriesBySport(sport) : entries
    return filtered
      .filter(e => e.values[metricKey] !== undefined)
      .map(e => ({
        date: e.testDate,
        value: e.values[metricKey],
        verified: e.verified,
      }))
  }

  // Get personal records for a sport
  const getPersonalRecords = (sport: string): PersonalRecord[] => {
    const metrics = SPORT_METRICS[sport] || []
    const filtered = getEntriesBySport(sport)
    const records: PersonalRecord[] = []

    for (const metric of metrics) {
      let best: { value: number; date: string; verified: boolean } | null = null

      for (const entry of filtered) {
        const val = entry.values[metric.key]
        if (val === undefined) continue

        if (!best) {
          best = { value: val, date: entry.testDate, verified: entry.verified }
        } else if (metric.lowerIsBetter ? val < best.value : val > best.value) {
          best = { value: val, date: entry.testDate, verified: entry.verified }
        }
      }

      if (best) {
        records.push({
          metricKey: metric.key,
          label: metric.label,
          unit: metric.unit,
          value: best.value,
          date: best.date,
          verified: best.verified,
          lowerIsBetter: metric.lowerIsBetter,
        })
      }
    }

    return records
  }

  // Get the latest value for a metric (for leaderboards)
  const getLatestMetricValue = (metricKey: string): { value: number; verified: boolean; date: string } | null => {
    for (let i = entries.length - 1; i >= 0; i--) {
      const val = entries[i].values[metricKey]
      if (val !== undefined) {
        return { value: val, verified: entries[i].verified, date: entries[i].testDate }
      }
    }
    return null
  }

  return {
    entries,
    loading,
    getEntriesBySport,
    getMetricTimeSeries,
    getPersonalRecords,
    getLatestMetricValue,
  }
}
