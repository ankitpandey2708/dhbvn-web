import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Faridabad Power Outage Tracker — Live DHBVN Updates';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: '#15110c',
          backgroundImage:
            'radial-gradient(900px 420px at 50% -10%, rgba(245,166,35,0.20), transparent 70%)',
          color: '#ece5d8',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Signal strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#f5a623', fontSize: 24, textTransform: 'uppercase', letterSpacing: 6, fontWeight: 600 }}>
            <span style={{ display: 'flex', width: 14, height: 14, borderRadius: 999, background: '#f04438' }} />
            Live signal — DHBVN feed
          </div>
          <div style={{ display: 'flex', color: '#6f665a', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase' }}>
            District Signal
          </div>
        </div>

        {/* Marquee */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', color: '#8a8174', fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>
            Power outage status board
          </div>
          <div style={{ display: 'flex', fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: -4, color: '#f5a623' }}>
            Faridabad
          </div>
        </div>

        {/* Readout row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 48, borderTop: '1px solid #2a241c', paddingTop: 28, color: '#9a9082', fontSize: 26 }}>
          <span style={{ display: 'flex' }}>Live feeder outages</span>
          <span style={{ display: 'flex', color: '#3a3328' }}>/</span>
          <span style={{ display: 'flex' }}>Areas affected</span>
          <span style={{ display: 'flex', color: '#3a3328' }}>/</span>
          <span style={{ display: 'flex' }}>Restoration windows</span>
        </div>
      </div>
    ),
    size,
  );
}
