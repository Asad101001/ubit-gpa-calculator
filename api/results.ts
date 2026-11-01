export const config = {
  runtime: 'edge',
};

// Official Section A Roster (75 enrolled students)
const SECTION_A_SEATS = new Set([
  'B24110006001', 'B24110006002', 'B24110006005', 'B24110006007', 'B24110006009',
  'B24110006010', 'B24110006014', 'B24110006015', 'B24110006018', 'B24110006019',
  'B24110006022', 'B24110006023', 'B24110006024', 'B24110006026', 'B24110006027',
  'B24110006030', 'B24110006031', 'B24110006034', 'B24110006037', 'B24110006038',
  'B24110006039', 'B24110006043', 'B24110006044', 'B24110006050', 'B24110006051',
  'B24110006054', 'B24110006055', 'B24110006058', 'B24110006059', 'B24110006063',
  'B24110006066', 'B24110006067', 'B24110006070', 'B24110006071', 'B24110006074',
  'B24110006078', 'B24110006079', 'B24110006082', 'B24110006083', 'B24110006086',
  'B24110006087', 'B24110006090', 'B24110006091', 'B24110006094', 'B24110006098',
  'B24110006099', 'B24110006102', 'B24110006106', 'B24110006107', 'B24110006108',
  'B24110006111', 'B24110006114', 'B24110006115', 'B24110006119', 'B24110006122',
  'B24110006123', 'B24110006125', 'B24110006126', 'B24110006130', 'B24110006131',
  'B24110006134', 'B24110006135', 'B24110006138', 'B24110006139', 'B24110006142',
  'B24110006143', 'B24110006146', 'B24110006147', 'B24110006151', 'B24110006154',
  'B24110006155', 'B24110006158', 'B24110006159', 'B24110006162', 'B24110006166'
]);

export default async function handler(req: Request) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = (globalThis as any).process?.env?.VITE_SUPABASE_URL ?? '';
  const supabaseKey = (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY ?? '';
  // Service key: used for reading profiles (bypasses RLS row filters) 
  const serviceKey = (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY
    ?? (globalThis as any).process?.env?.VITE_SUPABASE_SERVICE_ROLE_KEY
    ?? supabaseKey;

  try {
    // Fetch student_results (anon key is fine — public read policy)
    // Fetch profiles with service key to reliably get visibility settings under any RLS config
    const [resultsRes, profilesRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/student_results?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }),
      fetch(`${supabaseUrl}/rest/v1/profiles?select=seat_no,show_results_publicly`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }).catch(() => null),
    ]);

    if (!resultsRes.ok) {
      throw new Error('Failed to fetch results from database');
    }

    const data = await resultsRes.json();
    const profileVisibilityMap = new Map<string, boolean>();

    if (profilesRes && profilesRes.ok) {
      const allProfiles = await profilesRes.json().catch(() => []);
      if (Array.isArray(allProfiles)) {
        allProfiles.forEach((p: any) => {
          if (p.seat_no) {
            profileVisibilityMap.set(String(p.seat_no).toUpperCase().trim(), !!p.show_results_publicly);
          }
        });
      }
    }

    // Attach is_hidden flag:
    // If a user has a registered profile, their show_results_publicly preference is authoritative.
    // If they have no profile, fall back to student_results.is_hidden.
    const enrichedData = data.map((row: any) => {
      const seatNo = row.seat_no ? String(row.seat_no).toUpperCase().trim() : '';
      let isHidden = !!row.is_hidden;
      if (seatNo && profileVisibilityMap.has(seatNo)) {
        isHidden = !profileVisibilityMap.get(seatNo);
      }
      return { ...row, is_hidden: isHidden };
    });

    // Filter strictly to official Section A roster (~75 students)
    const sectionAData = enrichedData.filter((row: any) => {
      const seatNo = row.seat_no ? String(row.seat_no).toUpperCase().trim() : '';
      return SECTION_A_SEATS.has(seatNo);
    });

    return new Response(JSON.stringify(sectionAData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Short-lived CDN cache (60s) + stale-while-revalidate (5 min) for fast global reads
        // Results change infrequently — no reason for no-store which penalises every user
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
