'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'athlete' | 'coach' | 'admin' | 'master_admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
}

export function useUserRole() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setProfile(null)
          setLoading(false)
          return
        }

        // Get user profile with role (email comes from auth.users, not profiles)
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error loading profile:', error)
          setProfile(null)
        } else {
          // Combine profile data with email from auth user
          setProfile({
            ...profileData,
            email: user.email || '',
          } as UserProfile)
        }
      } catch (error) {
        console.error('Error in loadUserProfile:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Check for simulation mode cookie (same polling pattern as stripe-test-banner)
  useEffect(() => {
    const checkSimulation = () => {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const simCookie = cookies.find(c => c.startsWith('simulation_role_ui='))
      const role = simCookie?.split('=')[1] as UserRole | undefined
      setSimulatedRole(role || null)
    }
    checkSimulation()
    const interval = setInterval(checkSimulation, 3000)
    return () => clearInterval(interval)
  }, [])

  // Determine effective role: only master_admin can simulate
  const realRole = profile?.role || null
  const isSimulating = !!(realRole === 'master_admin' && simulatedRole)
  const effectiveRole = isSimulating ? simulatedRole : realRole

  return {
    profile,
    loading,
    realRole,
    isSimulating,
    isAthlete: effectiveRole === 'athlete',
    isCoach: effectiveRole === 'coach' || effectiveRole === 'admin' || effectiveRole === 'master_admin',
    isAdmin: effectiveRole === 'admin' || effectiveRole === 'master_admin',
    isMasterAdmin: effectiveRole === 'master_admin',
  }
}
