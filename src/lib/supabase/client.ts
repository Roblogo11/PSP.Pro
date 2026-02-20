import { createBrowserClient } from '@supabase/ssr'

// Singleton: reuse one Supabase client per browser tab.
// Prevents multiple components from each spawning their own
// auth refresh + realtime connections (which stacks badly with
// multiple open tabs on mobile).
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
