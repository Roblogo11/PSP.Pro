'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { UserProfile } from '@/lib/hooks/use-user-role'

/**
 * Carries the profile the server already fetched during layout render.
 *
 * Why this exists: the dashboard layout runs `getUser()` + a `profiles` query
 * before it emits any HTML. Without this context, `useUserRole` runs that exact
 * same pair again on the client after hydration — and because every data effect
 * on a dashboard page is gated on `effectiveUserId`, none of them could start
 * until that redundant round trip finished. Seeding the hook removes a full
 * request from the critical path of the first paint.
 *
 * `null` is a meaningful value here (server looked, found no profile), so the
 * context default is `undefined` to mean "no server ever provided one" —
 * that's what lets the hook tell "not seeded" apart from "seeded as empty".
 *
 * Deliberately NOT mounted at the root: public marketing pages also call
 * useUserRole and have no server-fetched profile to offer. They keep the
 * original client-fetch path.
 */
const UserProfileContext = createContext<UserProfile | null | undefined>(undefined)

export function UserProfileProvider({
  profile,
  children,
}: {
  profile: UserProfile | null
  children: ReactNode
}) {
  return (
    <UserProfileContext.Provider value={profile}>
      {children}
    </UserProfileContext.Provider>
  )
}

/**
 * Returns the server-seeded profile, or `undefined` when there is no provider
 * above this component (public pages) — callers must treat `undefined` as
 * "fetch it yourself" and `null` as "server says no profile".
 */
export function useServerProfile(): UserProfile | null | undefined {
  return useContext(UserProfileContext)
}
