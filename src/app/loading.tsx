'use client'

import Image from 'next/image'

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #004663 0%, #006687 25%, #0088AB 50%, #006687 75%, #004663 100%)',
      }}
      aria-hidden="true"
    >
      <div className="relative flex flex-col items-center max-w-md mx-auto px-6">
        {/* Cyan glow effect behind logo */}
        <div
          className="absolute inset-0 blur-3xl opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(0, 180, 216, 0.6) 0%, rgba(0, 180, 216, 0.3) 50%, transparent 70%)',
            transform: 'scale(2.5)',
          }}
        />

        {/* PSP Logo */}
        <div className="relative z-10 mb-6 animate-pulse" style={{ animationDuration: '2s' }}>
          <Image
            src="/images/PSP-black-300x99-1.png"
            alt="PSP.Pro Logo"
            width={300}
            height={99}
            priority
            className="h-20 md:h-24 w-auto brightness-0 invert"
            style={{
              filter: 'drop-shadow(0 0 25px rgba(0, 180, 216, 0.6)) brightness(0) invert(1)',
            }}
          />
        </div>

        {/* Brand Tagline */}
        <p
          className="relative z-10 text-xs md:text-sm tracking-[0.3em] uppercase mb-8 opacity-70"
          style={{
            color: '#CBD5E1',
            textShadow: '0 0 8px rgba(0, 180, 216, 0.3)',
          }}
        >
          PSP.Pro
        </p>

        {/* Loading animation - Cyan pulse rings */}
        <div className="relative flex items-center justify-center mb-6" style={{ width: '90px', height: '90px' }}>
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              border: '3px solid rgba(0, 180, 216, 0.5)',
              animationDuration: '1.8s',
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute inset-2 rounded-full animate-ping"
            style={{
              border: '3px solid rgba(0, 180, 216, 0.7)',
              animationDuration: '1.4s',
            }}
          />
          {/* Inner circle - rotating gradient */}
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.4) 0%, rgba(255, 75, 43, 0.3) 100%)',
              boxShadow: '0 0 35px rgba(0, 180, 216, 0.5), inset 0 0 20px rgba(0, 180, 216, 0.2)',
              animation: 'spin 3s linear infinite',
            }}
          />
        </div>

        {/* Loading text */}
        <div className="relative z-10 text-center">
          <p
            className="text-base md:text-lg font-bold tracking-wide mb-2"
            style={{
              color: '#F7FAFC',
              textShadow: '0 0 15px rgba(0, 180, 216, 0.4)',
            }}
          >
            Powering Up
          </p>
          <p
            className="text-xs md:text-sm tracking-wider uppercase opacity-60"
            style={{
              color: '#00B4D8',
              textShadow: '0 0 8px rgba(0, 180, 216, 0.3)',
            }}
          >
            Progression Over Perfection
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
