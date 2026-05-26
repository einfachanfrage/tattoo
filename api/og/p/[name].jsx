import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const url = new URL(req.url);
  const name = decodeURIComponent(url.pathname.split('/').pop()) || 'Tattoo Studio';
  const fontSize = name.length > 22 ? 58 : name.length > 14 ? 72 : name.length > 9 ? 84 : 96;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#0D0C0B',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top gold stripe */}
      <div style={{
        display: 'flex',
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #C9A96E 0%, #E8C98A 50%, #b8934a 100%)',
      }} />

      {/* Subtle vignette corners */}
      <div style={{
        display: 'flex',
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
      }} />

      {/* Top label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        fontSize: '16px',
        color: '#C9A96E',
        fontFamily: 'Arial, sans-serif',
        fontWeight: '600',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        marginBottom: '32px',
      }}>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>✦</span>
        Tattoo · Anfrage
        <span style={{ fontSize: '10px', opacity: 0.7 }}>✦</span>
      </div>

      {/* Photographer name */}
      <div style={{
        display: 'flex',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: `${fontSize}px`,
        fontWeight: '400',
        color: '#FAF7F2',
        letterSpacing: '-1.5px',
        lineHeight: 1.05,
        textAlign: 'center',
        maxWidth: '980px',
        marginBottom: '44px',
      }}>
        {name}
      </div>

      {/* CTA pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(201,169,110,0.09)',
        border: '1px solid rgba(201,169,110,0.22)',
        borderRadius: '100px',
        padding: '13px 42px',
        fontSize: '19px',
        color: 'rgba(250,247,242,0.5)',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.04em',
      }}>
        Anfrage stellen&nbsp;&nbsp;·&nbsp;&nbsp;5 Schritte
      </div>

      {/* Bottom-right brand mark */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        position: 'absolute',
        bottom: '28px',
        right: '36px',
        opacity: 0.22,
      }}>
        {/* Needle icon */}
        <svg width="8" height="15" viewBox="0 0 12 22" fill="none">
          <path d="M6 0 L12 7.5 L6 22 L0 7.5 Z" fill="#C9A96E"/>
          <ellipse cx="6" cy="7" rx="2.5" ry="2.2" fill="#0D0C0B"/>
        </svg>
        <span style={{
          fontSize: '13px',
          color: '#F7F6F3',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}>
          einfach anfrage
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
