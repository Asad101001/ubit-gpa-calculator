import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type') || 'wrapped';

    if (type === 'og') {
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

    // Extract params
    const name = searchParams.get('name') || 'Student';
    const cgpa = searchParams.get('cgpa') || '0.00';
    const percentile = searchParams.get('percentile') || '50';
    const bestCourseName = searchParams.get('bestCourseName') || 'N/A';
    const bestCourseGP = searchParams.get('bestCourseGP') || '0.0';
    
    // Determine overall grade
    let grade = 'F';
    const numCgpa = parseFloat(cgpa);
    if (numCgpa >= 4.0) grade = 'A+';
    else if (numCgpa >= 3.8) grade = 'A';
    else if (numCgpa >= 3.4) grade = 'B+';
    else if (numCgpa >= 3.0) grade = 'B';
    else if (numCgpa >= 2.6) grade = 'C+';
    else if (numCgpa >= 2.0) grade = 'C';
    else if (numCgpa >= 1.0) grade = 'D';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '1080px',
            height: '1920px',
            backgroundColor: '#020617', // slate-950
            fontFamily: 'sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Ambient Orbs (Mimicking the Glow) */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-20%',
              width: '1000px',
              height: '1000px',
              background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(2,6,23,0) 70%)', // emerald-500
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              right: '-20%',
              width: '1200px',
              height: '1200px',
              background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(2,6,23,0) 70%)', // cyan-500
              borderRadius: '50%',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', padding: '120px', zIndex: 10, flex: 1 }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '120px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                 <div style={{ display: 'flex', padding: '24px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '32px', border: '2px solid rgba(16, 185, 129, 0.2)' }}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                 </div>
                 <span style={{ color: '#fff', fontSize: '64px', fontWeight: 800, marginLeft: '32px' }}>DCS <span style={{ color: '#10b981' }}>UBIT</span></span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: '48px', fontWeight: 600 }}>Batch '28 Wrapped</span>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              <span style={{ color: '#38bdf8', fontSize: '64px', fontWeight: 700, marginBottom: '24px' }}>
                Hey, {name}!
              </span>
              <span style={{ color: '#f8fafc', fontSize: '100px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '80px' }}>
                You absolutely crushed <br />
                your first year.
              </span>

              {/* Big Stats Row */}
              <div style={{ display: 'flex', gap: '40px', marginBottom: '80px' }}>
                {/* CGPA Box */}
                <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '48px', padding: '60px', flex: 1 }}>
                  <span style={{ color: '#94a3b8', fontSize: '40px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '24px' }}>Final CGPA</span>
                  <span style={{ color: '#10b981', fontSize: '160px', fontWeight: 900, lineHeight: 1 }}>{cgpa}</span>
                  <span style={{ color: '#f8fafc', fontSize: '48px', fontWeight: 700, marginTop: '24px' }}>Grade: {grade}</span>
                </div>

                {/* Percentile Box */}
                <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '48px', padding: '60px', flex: 1 }}>
                  <span style={{ color: '#94a3b8', fontSize: '40px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '24px' }}>Top</span>
                  <span style={{ color: '#38bdf8', fontSize: '160px', fontWeight: 900, lineHeight: 1 }}>{percentile}%</span>
                  <span style={{ color: '#f8fafc', fontSize: '48px', fontWeight: 700, marginTop: '24px' }}>of Batch '28</span>
                </div>
              </div>

              {/* Best Course Box */}
              <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '48px', padding: '60px', width: '100%' }}>
                  <span style={{ color: '#94a3b8', fontSize: '40px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '24px' }}>Best Performance</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                     <span style={{ color: '#f8fafc', fontSize: '72px', fontWeight: 800, maxWidth: '600px' }}>{bestCourseName}</span>
                     <span style={{ color: '#10b981', fontSize: '80px', fontWeight: 900 }}>{bestCourseGP} GP</span>
                  </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '120px', borderTop: '2px solid rgba(255, 255, 255, 0.1)', paddingTop: '60px' }}>
               <span style={{ color: '#64748b', fontSize: '40px', fontWeight: 500 }}>ubit-gpa-calculator-28.vercel.app</span>
               <span style={{ color: '#64748b', fontSize: '40px', fontWeight: 500 }}>Share your stats!</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
      },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
