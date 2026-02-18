/**
 * Accessible toast notification — replaces window.alert() site-wide.
 * Injects an aria-live region so screen readers announce the message,
 * and shows a brief visual toast at the top of the viewport.
 */

type ToastType = 'success' | 'error' | 'info'

const TOAST_DURATION = 4000

// Ensure there's always a live-region in the DOM for screen readers
let liveRegion: HTMLDivElement | null = null

function ensureLiveRegion() {
  if (liveRegion && document.body.contains(liveRegion)) return liveRegion
  liveRegion = document.createElement('div')
  liveRegion.setAttribute('aria-live', 'assertive')
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.setAttribute('role', 'alert')
  liveRegion.className = 'sr-only'
  liveRegion.style.cssText =
    'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;'
  document.body.appendChild(liveRegion)
  return liveRegion
}

export function toast(message: string, type: ToastType = 'info') {
  // 1. Screen-reader announcement
  const region = ensureLiveRegion()
  region.textContent = ''
  // Force re-announce by clearing first
  requestAnimationFrame(() => {
    region.textContent = message.replace(/[✅❌⚠️🗑️]/g, '').trim()
  })

  // 2. Visual toast
  const existing = document.getElementById('psp-toast')
  if (existing) existing.remove()

  const el = document.createElement('div')
  el.id = 'psp-toast'
  el.setAttribute('role', 'status')

  const colors: Record<ToastType, string> = {
    success: 'background:#065f46;color:#d1fae5;border-color:#10b981;',
    error: 'background:#7f1d1d;color:#fecaca;border-color:#ef4444;',
    info: 'background:#1e3a5f;color:#e0f2fe;border-color:#0ea5e9;',
  }

  el.style.cssText = `
    position:fixed;top:1rem;left:50%;transform:translateX(-50%);z-index:9999;
    padding:0.75rem 1.5rem;border-radius:0.5rem;border:1px solid;
    font-size:0.875rem;font-weight:500;max-width:90vw;text-align:center;
    box-shadow:0 10px 25px rgba(0,0,0,0.3);
    opacity:0;transition:opacity 0.2s ease-in;
    ${colors[type]}
  `
  el.textContent = message.replace(/[✅❌⚠️🗑️]/g, '').trim()

  document.body.appendChild(el)
  // Trigger fade-in
  requestAnimationFrame(() => { el.style.opacity = '1' })

  setTimeout(() => {
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 200)
  }, TOAST_DURATION)
}

export function toastSuccess(message: string) { toast(message, 'success') }
export function toastError(message: string) { toast(message, 'error') }
