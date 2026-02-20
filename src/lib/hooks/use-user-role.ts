'use client'

import { useEffect, useState, useCallback } from 'react'
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
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null)
  const [impersonatedUserName, setImpersonatedUserName] = useState<string | null>(null)
  const supabase = createClient()

  const loadUserProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        setProfile(null)
      } else {
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
  }, [supabase])

  useEffect(() => {
    loadUserProfile()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, loadUserProfile])

  // When a background tab becomes visible again, re-fetch profile
  // (catches session expiry, role changes, etc.)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUserProfile()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [loadUserProfile])

  // Check for simulation + impersonation cookies.
  // Only poll when the tab is visible — background tabs don't need this.
  useEffect(() => {
    const checkCookies = () => {
      if (document.visibilityState === 'hidden') return
      const cookies = document.cookie.split(';').map(c => c.trim())

      // Simulation
      const simCookie = cookies.find(c => c.startsWith('simulation_role_ui='))
      const role = simCookie?.split('=')[1] as UserRole | undefined
      setSimulatedRole(role || null)

      // Impersonation
      const idCookie = cookies.find(c => c.startsWith('impersonation_user_id_ui='))
      const nameCookie = cookies.find(c => c.startsWith('impersonation_user_name_ui='))
      setImpersonatedUserId(idCookie?.split('=')[1] || null)
      const rawName = nameCookie?.split('=')[1]
      setImpersonatedUserName(rawName ? decodeURIComponent(rawName) : null)
    }

    checkCookies()
    const interval = setInterval(checkCookies, 3000)
    return () => clearInterval(interval)
  }, [])

  // Determine effective role: only master_admin can simulate
  const realRole = profile?.role || null
  const isSimulating = !!(realRole === 'master_admin' && simulatedRole)
  const isImpersonating = !!(realRole === 'master_admin' && impersonatedUserId)
  const effectiveRole = isSimulating ? simulatedRole : realRole

  return {
    profile,
    loading,
    realRole,
    isSimulating,
    isImpersonating,
    impersonatedUserId,
    impersonatedUserName,
    isAthlete: effectiveRole === 'athlete',
    isCoach: effectiveRole === 'coach' || effectiveRole === 'admin' || effectiveRole === 'master_admin',
    isAdmin: effectiveRole === 'admin' || effectiveRole === 'master_admin',
    isMasterAdmin: effectiveRole === 'master_admin',
  }
}
