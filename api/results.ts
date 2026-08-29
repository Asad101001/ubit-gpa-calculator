export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = (globalThis as any).process?.env?.VITE_SUPABASE_URL ?? '';
  const supabaseKey = (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY ?? '';
  const serviceKey = (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY ?? (globalThis as any).process?.env?.VITE_SUPABASE_SERVICE_ROLE_KEY ?? supabaseKey;

  try {
    const [resultsRes, profilesRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/student_results?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }),
      fetch(`${supabaseUrl}/rest/v1/profiles?select=seat_no,show_results_publicly&show_results_publicly=eq.false`, {
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
    const hiddenSeatNos = new Set<string>();

    if (profilesRes && profilesRes.ok) {
      const hiddenProfiles = await profilesRes.json().catch(() => []);
      if (Array.isArray(hiddenProfiles)) {
        hiddenProfiles.forEach((p: any) => {
          if (p.seat_no) hiddenSeatNos.add(String(p.seat_no).toUpperCase());
        });
      }
    }

    // Subject IDs to sanitize if private
    const subjectIds = [
      'cs351','cs353','cs355','cs357','cs359','cs361',
      'cs352','cs354','cs356','cs358','cs360','cs362',
      'cs451','cs453','cs455','cs457','cs459','cs461'
    ];

    // Attach is_hidden tag and sanitize records
    const enrichedData = data.map((row: any) => {
      const seatNo = row.seat_no ? String(row.seat_no).toUpperCase() : '';
      const isHidden = (seatNo && hiddenSeatNos.has(seatNo)) || !!row.is_hidden;

      if (!isHidden) {
        return { ...row, is_hidden: false };
      }

      // If hidden, sanitize marks from public response
      const sanitized: Record<string, any> = {
        ...row,
        is_hidden: true,
      };
      subjectIds.forEach(sub => {
        sanitized[sub] = 'Hidden';
      });
      return sanitized;
    });

    return new Response(JSON.stringify(enrichedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

