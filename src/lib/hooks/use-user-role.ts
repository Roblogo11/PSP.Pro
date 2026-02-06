'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'athlete' | 'coach' | 'admin'

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

  return {
    profile,
    loading,
    isAthlete: profile?.role === 'athlete',
    isCoach: profile?.role === 'coach' || profile?.role === 'admin',
    isAdmin: profile?.role === 'admin',
  }
}
