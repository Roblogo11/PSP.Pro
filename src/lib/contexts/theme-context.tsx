'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  // Apply theme to DOM
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement

    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }

    try {
      localStorage.setItem('theme', newTheme)
    } catch (e) {
      console.error('Failed to save theme to localStorage', e)
    }

    console.log('✅ Theme applied:', newTheme, 'HTML classes:', root.className)
  }, [])

  // Initialize theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      if (savedTheme === 'light' || savedTheme === 'dark') {
        console.log('📂 Loaded theme from localStorage:', savedTheme)
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialTheme = prefersDark ? 'dark' : 'light'
        console.log('🌐 Using system preference:', initialTheme)
        setThemeState(initialTheme)
        applyTheme(initialTheme)
      }
    } catch (e) {
      console.error('Failed to initialize theme', e)
      applyTheme('dark')
    }
  }, [applyTheme])

  const setTheme = useCallback((newTheme: Theme) => {
    console.log('🎨 setTheme called with:', newTheme)
    setThemeState(newTheme)
    applyTheme(newTheme)
  }, [applyTheme])

  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark'
      console.log('🔄 toggleTheme: switching from', prevTheme, 'to', newTheme)
      applyTheme(newTheme)
      return newTheme
    })
  }, [applyTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
