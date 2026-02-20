// Admin layout — auth is already verified by the parent (dashboard) layout.
// Role gating is handled client-side by the admin page's useUserRole() hook,
// which redirects non-staff to /locker. This avoids redundant server-side
// Supabase calls that cause slow loads on mobile.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
