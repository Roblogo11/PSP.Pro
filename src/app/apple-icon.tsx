import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #B8301A 0%, #00B4D8 100%)',
          color: 'white',
          fontSize: 88,
          fontWeight: 900,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '-2px',
        }}
      >
        PSP
      </div>
    ),
    { ...size }
  )
}
