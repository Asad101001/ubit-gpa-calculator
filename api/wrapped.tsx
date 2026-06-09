import { ImageResponse } from '@vercel/og';



export default function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

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

          {/* Grid Pattern Simulation */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 2px, transparent 2px)',
              backgroundSize: '40px 40px',
              opacity: 0.5,
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '100px 80px',
              height: '100%',
              zIndex: 10,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '24px', border: '2px solid rgba(16, 185, 129, 0.2)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '24px' }}>
                  <span style={{ color: '#fff', fontSize: '48px', fontWeight: 800, letterSpacing: '-1px' }}>DCS <span style={{ color: '#10b981' }}>UBIT</span></span>
                  <span style={{ color: '#94a3b8', fontSize: '28px', fontWeight: 600, letterSpacing: '4px' }}>BATCH '28 WRAPPED</span>
                </div>
              </div>
            </div>

            {/* Main Title */}
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '40px', marginBottom: '60px' }}>
              <span style={{ color: '#10b981', fontSize: '40px', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px' }}>ACADEMIC SNAPSHOT</span>
              <span style={{ color: '#f8fafc', fontSize: '96px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px' }}>{name}'s<br/>First Year.</span>
            </div>

            {/* Big Stats Box */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.03)', 
              border: '2px solid rgba(255,255,255,0.05)',
              borderRadius: '48px',
              padding: '64px',
              marginTop: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              
              <span style={{ color: '#94a3b8', fontSize: '32px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>Cumulative GPA</span>
              <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '16px' }}>
                <span style={{ color: '#fff', fontSize: '180px', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-6px', textShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>{cgpa}</span>
                <span style={{ color: '#10b981', fontSize: '64px', fontWeight: 800, marginLeft: '24px', marginBottom: '24px' }}>/ 4.0</span>
              </div>

              <div style={{ display: 'flex', marginTop: '64px', paddingTop: '64px', borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                {/* Left Stat */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ color: '#94a3b8', fontSize: '24px', fontWeight: 600, letterSpacing: '1px' }}>Global Percentile</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '16px' }}>
                    <span style={{ color: '#fff', fontSize: '72px', fontWeight: 800, letterSpacing: '-2px' }}>{percentile}</span>
                    <span style={{ color: '#06b6d4', fontSize: '36px', fontWeight: 700, marginLeft: '8px' }}>%</span>
                  </div>
                </div>
                {/* Right Stat */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '48px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '24px', fontWeight: 600, letterSpacing: '1px' }}>Overall Grade</span>
                  <span style={{ color: '#fff', fontSize: '72px', fontWeight: 800, marginTop: '16px', color: '#10b981' }}>{grade}</span>
                </div>
              </div>

            </div>

            {/* Best Course Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '32px',
              padding: '48px',
              marginTop: '60px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#10b981', fontSize: '28px', fontWeight: 600, letterSpacing: '1px' }}>Top Performing Subject</span>
                <span style={{ color: '#fff', fontSize: '48px', fontWeight: 800, marginTop: '12px', letterSpacing: '-1px' }}>{bestCourseName}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ color: '#10b981', fontSize: '28px', fontWeight: 600, letterSpacing: '1px' }}>Grade Point</span>
                <span style={{ color: '#fff', fontSize: '56px', fontWeight: 800, marginTop: '8px' }}>{bestCourseGP}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingBottom: '20px' }}>
              <span style={{ color: '#64748b', fontSize: '28px', fontWeight: 500 }}>Generated securely at ubit-gpa-calculator-28.vercel.app</span>
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
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
