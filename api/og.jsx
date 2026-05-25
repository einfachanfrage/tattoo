import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
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

      {/* Monogram badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '72px',
        height: '72px',
        background: '#C9A96E',
        borderRadius: '16px',
        marginBottom: '36px',
        fontSize: '32px',
        fontFamily: 'Georgia, serif',
        color: '#1A1A1A',
        fontWeight: '500',
      }}>
        ea
      </div>

      {/* Main title */}
      <div style={{
        display: 'flex',
        fontFamily: 'Georgia, serif',
        fontSize: '80px',
        fontWeight: '400',
        color: '#FAF7F2',
        letterSpacing: '-1px',
        marginBottom: '24px',
        lineHeight: 1.1,
      }}>
        Einfach Anfrage
      </div>

      {/* Subtitle */}
      <div style={{
        display: 'flex',
        fontSize: '32px',
        color: 'rgba(250, 247, 242, 0.5)',
        textAlign: 'center',
        maxWidth: '760px',
        lineHeight: 1.5,
        fontFamily: 'Arial, sans-serif',
        fontWeight: '300',
      }}>
        Das smarte Anfrage-Widget für Tätowierer
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
