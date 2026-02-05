import Image from 'next/image'

const LOGO_URL = 'https://roblogo.com/wp-content/uploads/2025/02/smp-icon-anim.gif'

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 46, 0.9) 50%, rgba(10, 10, 10, 0.95) 100%)',
      }}
      aria-hidden="true"
    >
      <div className="relative" style={{ width: '140px', height: '140px' }}>
        {/* Soft glow behind hex */}
        <div
          className="absolute inset-0 blur-2xl opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)',
            transform: 'scale(1.5)',
          }}
        />
        {/* Spinning hex border */}
        <div
          className="absolute inset-0 animate-hex-spin"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(236, 72, 153, 0.3) 100%)',
          }}
        />
        {/* Static hex background with logo */}
        <div
          className="absolute inset-[6px]"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: 'rgba(10, 10, 10, 0.9)',
          }}
        />
        {/* Static logo centered - clipped to hex */}
        <div
          className="absolute inset-[6px] flex items-center justify-center overflow-hidden"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        >
          <Image
            src={LOGO_URL}
            alt=""
            width={90}
            height={90}
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}
