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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { name, cgpa, gpa1, gpa2, gpa3, seat_no } = body;

    // ── Server-side validation ──────────────────────────────────────────────

    // Name: required, letters + spaces only, 2–50 chars
    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 50) {
      return new Response(JSON.stringify({ error: 'Name must be 2–50 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    if (!/^[a-zA-Z\s.\-']+$/.test(cleanName)) {
      return new Response(JSON.stringify({ error: 'Name can only contain letters, spaces, dots, hyphens' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // CGPA: must be a valid number in range (0.001, 4.000]
    if (cgpa == null || typeof cgpa !== 'number') {
      return new Response(JSON.stringify({ error: 'CGPA is required and must be a number' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    const cgpaNum = Number(cgpa);
    if (isNaN(cgpaNum) || cgpaNum <= 0 || cgpaNum > 4.0) {
      return new Response(JSON.stringify({ error: 'CGPA must be between 0.001 and 4.000' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // GPA1/GPA2/GPA3: optional but must be valid if present
    const validateGpa = (val: any, fieldName: string) => {
      if (val === null || val === undefined) return null;
      const n = Number(val);
      if (isNaN(n) || n < 0 || n > 4.0) {
        throw new Error(`${fieldName} must be between 0 and 4.000`);
      }
      return n;
    };

    let g1: number | null = null, g2: number | null = null, g3: number | null = null;
    try {
      g1 = validateGpa(gpa1, 'GPA1');
      g2 = validateGpa(gpa2, 'GPA2');
      g3 = validateGpa(gpa3, 'GPA3');
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    const supabaseUrl = (globalThis as any).process?.env?.VITE_SUPABASE_URL ?? '';
    const supabaseKey = (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY ?? '';

    const payload: Record<string, any> = {
      name: cleanName,
      cgpa: parseFloat(cgpaNum.toFixed(3)),
      gpa1: g1 !== null ? parseFloat(g1.toFixed(2)) : null,
      gpa2: g2 !== null ? parseFloat(g2.toFixed(2)) : null,
      gpa3: g3 !== null ? parseFloat(g3.toFixed(2)) : null,
      ip_address: ip,
    };

    // Determine upsert conflict key:
    // - If seat_no is provided and the caller is authenticated, upsert by seat_no.
    //   This gives each student exactly one leaderboard entry, regardless of IP or name.
    // - If no seat_no (anonymous submission), upsert by name.
    let conflictKey = 'name';
    if (seat_no && typeof seat_no === 'string') {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        // Verify JWT and confirm the seat_no belongs to this user
        const token = authHeader.replace('Bearer ', '').trim();
        const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` },
        }).catch(() => null);

        if (userRes && userRes.ok) {
          const user = await userRes.json();
          // Verify seat_no matches the user's linked profile
          const profileRes = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=seat_no`,
            { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` } }
          ).catch(() => null);

          if (profileRes && profileRes.ok) {
            const profiles = await profileRes.json();
            const profileSeatNo = profiles?.[0]?.seat_no;
            if (profileSeatNo && profileSeatNo.toUpperCase().trim() === seat_no.toUpperCase().trim()) {
              // Confirmed ownership: use seat_no as the upsert key
              payload['seat_no'] = seat_no.toUpperCase().trim();
              conflictKey = 'seat_no';
            }
          }
        }
      }
    }

    // Upsert: one entry per student (by seat_no if auth'd, else by name)
    const res = await fetch(`${supabaseUrl}/rest/v1/leaderboard?on_conflict=${conflictKey}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Supabase Error: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
