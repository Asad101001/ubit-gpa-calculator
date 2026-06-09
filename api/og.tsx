import { ImageResponse } from '@vercel/og';export const config = {
  runtime: 'edge',
};


export default function handler(req: Request) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#020617',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
          padding: '80px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(2,6,23,0) 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(2,6,23,0) 70%)',
            borderRadius: '50%',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10, flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
             <div style={{ display: 'flex', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '24px', border: '2px solid rgba(16, 185, 129, 0.2)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
             </div>
             <span style={{ color: '#fff', fontSize: '48px', fontWeight: 800, marginLeft: '24px' }}>DCS <span style={{ color: '#10b981' }}>UBIT</span></span>
          </div>

          <span style={{ color: '#f8fafc', fontSize: '96px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px' }}>
            Batch '28 GPA<br />
            <span style={{ color: '#10b981' }}>Calculator & Leaderboard</span>
          </span>

          <span style={{ color: '#94a3b8', fontSize: '40px', fontWeight: 500, marginTop: '32px' }}>
            Calculate your semester CGPA exactly according to UOK policies.
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
