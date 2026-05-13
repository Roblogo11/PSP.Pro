import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          fontSize: 16,
          fontWeight: 900,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '-0.5px',
        }}
      >
        PSP
      </div>
    ),
    { ...size }
  )
}
