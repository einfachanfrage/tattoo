import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const url = new URL(req.url);
  const name = decodeURIComponent(url.pathname.split('/').pop()) || 'Tattoo Studio';

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#1A1A1A',
        padding: '80px',
      }}
    >
      {/* Top accent line */}
      <div style={{
        display: 'flex',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: 'linear-gradient(90deg, #C9A96E, #b8934a)',
      }} />

      {/* Label */}
      <div style={{
        display: 'flex',
        fontSize: '22px',
        color: '#C9A96E',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '24px',
      }}>
        Tattoo-Anfrage
      </div>

      {/* Photographer name */}
      <div style={{
        display: 'flex',
        fontFamily: 'Georgia, serif',
        fontSize: '88px',
        fontWeight: '400',
        color: '#FAF7F2',
        letterSpacing: '-1px',
        marginBottom: '28px',
        lineHeight: 1.1,
        textAlign: 'center',
      }}>
        {name}
      </div>

      {/* CTA hint */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(201, 169, 110, 0.12)',
        border: '1px solid rgba(201, 169, 110, 0.3)',
        borderRadius: '12px',
        padding: '16px 32px',
        fontSize: '26px',
        color: 'rgba(250, 247, 242, 0.6)',
        fontFamily: 'Arial, sans-serif',
      }}>
        <span style={{ color: '#C9A96E', fontSize: '28px' }}>📸</span>
        Anfrage jetzt in 3 Minuten stellen
      </div>

      {/* Powered by */}
      <div style={{
        display: 'flex',
        position: 'absolute',
        bottom: '32px',
        fontSize: '18px',
        color: 'rgba(250, 247, 242, 0.2)',
        fontFamily: 'Arial, sans-serif',
      }}>
        Powered by Einfach Anfrage
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
