export const config = {
  runtime: 'edge',
};

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

    return new Response(JSON.stringify(enrichedData), {
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
