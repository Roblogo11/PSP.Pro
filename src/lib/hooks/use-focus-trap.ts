'use client'

import { useEffect, useRef } from 'react'

/**
 * Traps keyboard focus within a container element when active.
 * Returns a ref to attach to the modal/dialog container.
 * Pressing Escape calls onEscape if provided.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  onEscape?: () => void
) {
  const ref = useRef<T>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active || !ref.current) return

    // Save previously focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement

    const container = ref.current

    // Focus the first focusable element inside
    const focusFirst = () => {
      const focusable = getFocusableElements(container)
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        // If no focusable elements, focus the container itself
        container.setAttribute('tabindex', '-1')
        container.focus()
      }
    }

    // Small delay to let the modal render
    const timer = setTimeout(focusFirst, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.stopPropagation()
        onEscape()
        return
      }

      if (e.key !== 'Tab') return

      const focusable = getFocusableElements(container)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to previously focused element
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus()
      }
    }
  }, [active, onEscape])

  return ref
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter(
    (el) => !el.closest('[hidden]') && el.offsetParent !== null
  )
}
