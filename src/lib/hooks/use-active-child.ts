'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ChildProfile {
  id: string
  child_name: string
  child_age: number | null
  athlete_type: string | null
  sports: string[] | null
  avatar_url: string | null
}

/**
 * Resolves the currently-selected child for a parent/guardian account.
 *
 * ⚠ Any page showing athlete-specific data (metrics, progress, records) MUST
 * scope by `activeChildId` when `isParent` is true. A parent account holds one
 * `athlete_id` shared by every child — filtering on athlete_id alone merges all
 * of a family's children into a single dataset. That was the state before this
 * hook existed: the switcher changed bookings but not progress.
 *
 * Returns `activeChildId: null` for ordinary single-athlete accounts, which
 * makes the child filter a no-op — safe to call unconditionally.
 */
export function useActiveChild(userId: string | undefined) {
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [activeChildId, setActiveChildId] = useState<string | null>(null)
  const [isParent, setIsParent] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type, active_child_id')
        .eq('id', userId)
        .single()

      const parent = profile?.account_type === 'parent_guardian'
      setIsParent(parent)

      if (!parent) {
        setChildren([])
        setActiveChildId(null)
        return
      }

      const res = await fetch('/api/parent/children')
      const json = await res.json().catch(() => ({}))
      const list: ChildProfile[] = json.children || []
      setChildren(list)

      // Fall back to the first child so a parent who never opened Settings
      // still sees exactly one child's data rather than a merged view.
      setActiveChildId(profile?.active_child_id || list[0]?.id || null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  /** Switch the active child and persist it (mirrors to profiles via trigger). */
  const switchChild = useCallback(async (childId: string) => {
    setActiveChildId(childId) // optimistic
    const res = await fetch('/api/parent/active-child', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ child_id: childId }),
    })
    if (!res.ok) {
      await load() // revert to server truth
      return false
    }
    return true
  }, [load])

  return {
    children,
    activeChildId,
    activeChild: children.find(c => c.id === activeChildId) || null,
    isParent,
    hasMultiple: children.length > 1,
    loading,
    switchChild,
    refresh: load,
  }
}
