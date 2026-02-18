'use client'

import { useState, useEffect, useCallback } from 'react'

export interface OrgBranding {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  tagline: string | null
  platform_fee_percent: number
  stripe_connect_status: string
  allow_self_signup: boolean
  require_approval: boolean
}

interface UseOrgResult {
  orgs: OrgBranding[]
  currentOrg: OrgBranding | null
  loading: boolean
  setCurrentOrg: (org: OrgBranding) => void
  refreshOrgs: () => Promise<void>
}

export function useOrg(): UseOrgResult {
  const [orgs, setOrgs] = useState<OrgBranding[]>([])
  const [currentOrg, setCurrentOrg] = useState<OrgBranding | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshOrgs = useCallback(async () => {
    try {
      const res = await fetch('/api/org')
      if (!res.ok) return
      const data = await res.json()
      const orgList: OrgBranding[] = data.orgs || []
      setOrgs(orgList)
      if (orgList.length && !currentOrg) {
        setCurrentOrg(orgList[0])
      }
    } catch {
      // Not authenticated or no orgs — silently skip
    } finally {
      setLoading(false)
    }
  }, [currentOrg])

  useEffect(() => { refreshOrgs() }, [])

  return { orgs, currentOrg, loading, setCurrentOrg, refreshOrgs }
}
