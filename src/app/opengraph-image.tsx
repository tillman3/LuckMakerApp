import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Luck Maker 3000 — Smart Lottery Analytics';
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
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07080e 0%, #0f1018 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '30%',
            width: '500px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(255,215,0,0.06), transparent)',
            borderRadius: '50%',
          }}
        />
        
        <div style={{ fontSize: '72px', marginBottom: '8px', display: 'flex' }}>🍀</div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '64px', fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: '-2px' }}>
            LUCK MAKER
          </span>
          <span style={{ fontSize: '64px', fontWeight: 900, color: '#ffd700', letterSpacing: '-2px' }}>
            3000
          </span>
        </div>
        
        <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.45)', fontWeight: 400, marginBottom: '12px' }}>
          Smart Lottery Analytics & EV Calculator
        </div>
        
        <div style={{ fontSize: '18px', color: 'rgba(0,255,136,0.6)', fontWeight: 600 }}>
          Real math. Real odds. Play smarter.
        </div>
      </div>
    ),
    { ...size }
  );
}
