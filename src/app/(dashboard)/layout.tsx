import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect dashboard routes - require authentication
  // Skip auth check if Supabase is not configured (development mode)
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }
  } catch (error) {
    // In development without Supabase configured, allow access
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Dashboard accessed without Supabase authentication (dev mode)')
    } else {
      throw error
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-0">
        {children}
      </main>
    </div>
  )
}
