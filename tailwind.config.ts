import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PSP.Pro Brand Colors - Premium PSP.Pro Theme
        border: '#1F2937', // Subtle border

        // Semantic Color Aliases (for compatibility)
        primary: '#050A18', // Navy
        secondary: '#FF5722', // Orange (main CTA color)
        accent: '#00B4D8', // Cyan (accent/highlight)

        // Dark backgrounds
        'dark-100': '#1A1F2E',
        'dark-200': '#141824',
        'dark-300': '#0F1219',

        // Primary: Deep Navy (Command Center Background)
        navy: {
          DEFAULT: '#050A18',
          50: '#0F1623',
          100: '#0A1120',
          200: '#080D1C',
          300: '#060B19',
          400: '#050A18',
          500: '#040916',
          600: '#030714',
          700: '#020612',
          800: '#010410',
          900: '#00020E',
        },

        // Accent: Electric Orange (High-Energy CTAs & Highlights)
        orange: {
          DEFAULT: '#B8301A',
          50: '#F8DCD8',
          100: '#F1B9B1',
          200: '#E5998B',
          300: '#D4422A',
          400: '#C6391F',
          500: '#B8301A',
          600: '#9C2815',
          700: '#802112',
          800: '#64190E',
          900: '#48120A',
        },

        // Accent 2: PSP Blue (Logo Cyan - Tech & Speed)
        cyan: {
          DEFAULT: '#00B4D8',
          50: '#E0F7FF',
          100: '#B8EEFF',
          200: '#8FE5FF',
          300: '#66DCFF',
          400: '#3DD3FF',
          500: '#00B4D8',
          600: '#0096B8',
          700: '#007898',
          800: '#005A78',
          900: '#003C58',
        },

        // Utility: Slate Gray (Secondary Text & UI Elements)
        slate: {
          DEFAULT: '#4A5568',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#4A5568',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Text: Soft White (Primary Text)
        white: {
          DEFAULT: '#F7FAFC',
          soft: '#E2E8F0',
          muted: '#CBD5E1',
        },

        // Glassmorphism overlays
        glass: {
          light: 'rgba(247, 250, 252, 0.05)',
          medium: 'rgba(247, 250, 252, 0.1)',
          dark: 'rgba(5, 10, 24, 0.8)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',

        // PSP.Pro Signature Gradients
        'gradient-athletic': 'linear-gradient(135deg, #050A18 0%, #0F1623 50%, #B8301A 100%)',
        'gradient-velocity': 'linear-gradient(90deg, #B8301A 0%, #C6391F 50%, #D4422A 100%)',
        'gradient-command': 'linear-gradient(180deg, rgba(5,10,24,0.95) 0%, rgba(15,22,35,0.9) 100%)',

        // Subtle grid pattern for dashboard
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8301A' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },

      boxShadow: {
        // Glassmorphism & Glow Effects
        'glass': '0 8px 32px 0 rgba(184, 48, 26, 0.1)',
        'glass-lg': '0 12px 48px 0 rgba(184, 48, 26, 0.15)',
        'glow-orange': '0 0 20px rgba(184, 48, 26, 0.4)',
        'glow-orange-lg': '0 0 40px rgba(184, 48, 26, 0.6)',
        'inner-glow': 'inset 0 0 20px rgba(184, 48, 26, 0.1)',
        'command-panel': '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(184, 48, 26, 0.1)',
      },

      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
      },

      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'slide-left': 'slide-left 0.5s ease-out',
        'slide-right': 'slide-right 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-slow': 'fade-in 1s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'velocity-line': 'velocity-line 2s ease-in-out infinite',
      },

      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(184, 48, 26, 0.4)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 40px rgba(184, 48, 26, 0.6)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': {
            opacity: '0.8',
            filter: 'drop-shadow(0 0 8px rgba(184, 48, 26, 0.4))',
          },
          '50%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 16px rgba(184, 48, 26, 0.8))',
          },
        },
        'velocity-line': {
          '0%, 100%': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
