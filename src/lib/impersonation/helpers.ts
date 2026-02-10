/**
 * Client-side impersonation helpers.
 * Used by components to detect impersonation mode and get impersonated user info.
 */

/** Read the impersonated user ID from the JS-readable cookie */
export function getImpersonatedUserId(): string | null {
  if (typeof window === 'undefined') return null
  const cookies = document.cookie.split(';').map(c => c.trim())
  const cookie = cookies.find(c => c.startsWith('impersonation_user_id_ui='))
  return cookie?.split('=')[1] || null
}

/** Read the impersonated user name from the JS-readable cookie */
export function getImpersonatedUserName(): string | null {
  if (typeof window === 'undefined') return null
  const cookies = document.cookie.split(';').map(c => c.trim())
  const cookie = cookies.find(c => c.startsWith('impersonation_user_name_ui='))
  return decodeURIComponent(cookie?.split('=')[1] || '') || null
}

/** Check if impersonation is currently active */
export function isImpersonationActive(): boolean {
  return !!getImpersonatedUserId()
}
