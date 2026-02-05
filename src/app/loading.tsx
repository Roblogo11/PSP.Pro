export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #004663 0%, #006687 25%, #0088AB 50%, #006687 75%, #004663 100%)',
      }}
      aria-hidden="true"
    >
      <div className="relative flex flex-col items-center">
        {/* Cyan glow effect behind logo */}
        <div
          className="absolute inset-0 blur-3xl opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(0, 180, 216, 0.6) 0%, rgba(0, 180, 216, 0.3) 50%, transparent 70%)',
            transform: 'scale(2)',
          }}
        />

        {/* PSP Logo */}
        <div className="relative z-10 mb-8">
          <img
            src="/images/PSP-black-300x99-1.png"
            alt="ProPer Sports Performance"
            className="h-24 brightness-0 invert"
            style={{
              filter: 'brightness(0) invert(1) drop-shadow(0 0 20px rgba(0, 180, 216, 0.5))',
            }}
          />
        </div>

        {/* Loading animation - Cyan pulse rings */}
        <div className="relative flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              border: '3px solid rgba(0, 180, 216, 0.4)',
              animationDuration: '1.5s',
            }}
          />
          {/* Middle ring */}
          <div
            className="absolute inset-2 rounded-full animate-ping"
            style={{
              border: '3px solid rgba(0, 180, 216, 0.6)',
              animationDuration: '1.2s',
            }}
          />
          {/* Inner circle */}
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.3) 0%, rgba(255, 75, 43, 0.2) 100%)',
              boxShadow: '0 0 30px rgba(0, 180, 216, 0.4)',
            }}
          />
        </div>

        {/* Loading text */}
        <p
          className="mt-8 text-sm font-semibold tracking-wider uppercase"
          style={{
            color: '#00B4D8',
            textShadow: '0 0 10px rgba(0, 180, 216, 0.5)',
          }}
        >
          Loading Athletic OS...
        </p>
      </div>
    </div>
  )
}
