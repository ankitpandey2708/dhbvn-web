import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: 'linear-gradient(135deg, #0a1118 0%, #1a2332 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 48,
        }}
      >
        <svg
          width="360"
          height="360"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            fill="#00e5ff"
            stroke="#00e5ff"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}
