import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Activity } from 'lucide-react'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect to dashboard if already authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/locker')
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Glow Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="p-2 glass-card group-hover:bg-white/10 transition-all duration-300">
            <Activity className="w-6 h-6 text-orange" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">PSP.Pro</h1>
            <p className="text-xs text-slate-400">Athletic OS</p>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 text-center text-sm text-slate-400">
        <p>
          © {new Date().getFullYear()} Proper Sports Performance. Based in Virginia Beach, VA.
        </p>
      </footer>
    </div>
  )
}
