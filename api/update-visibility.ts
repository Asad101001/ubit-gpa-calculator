export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = (globalThis as any).process?.env?.VITE_SUPABASE_URL ?? '';
  const supabaseKey = (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY ?? '';
  // Service key required to update student_results under strict RLS
  // (anon/user JWT cannot freely update other users' rows)
  const serviceKey = (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY
    ?? (globalThis as any).process?.env?.VITE_SUPABASE_SERVICE_ROLE_KEY
    ?? '';

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await userRes.json();
    const body = await req.json();
    const { show_results_publicly } = body;

    if (typeof show_results_publicly !== 'boolean') {
      return new Response(JSON.stringify({ error: 'show_results_publicly boolean required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch user's profile to get seat_no — use service key for reliable read
    const profileAuthKey = serviceKey || supabaseKey;
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=seat_no`,
      {
        headers: {
          'apikey': profileAuthKey,
          'Authorization': `Bearer ${profileAuthKey}`,
        },
      }
    );
    const profileRows = profileRes.ok ? await profileRes.json() : [];
    const seatNo = profileRows?.[0]?.seat_no;

    // 2. Update profile — user can update their own profile via their JWT (RLS allows this)
    const updateProfileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ show_results_publicly }),
      }
    );

    if (!updateProfileRes.ok) {
      const errText = await updateProfileRes.text();
      throw new Error(`Database error updating profile: ${errText}`);
    }

    // 3. Sync student_results is_hidden status via SERVICE KEY
    // This bypasses RLS so the update always succeeds regardless of policy
    if (seatNo && serviceKey) {
      const updateResultsRes = await fetch(
        `${supabaseUrl}/rest/v1/student_results?seat_no=eq.${encodeURIComponent(seatNo)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ is_hidden: !show_results_publicly }),
        }
      );
      // Non-fatal if this fails — profile is the authoritative source
      if (!updateResultsRes.ok) {
        console.warn('Could not sync student_results.is_hidden:', await updateResultsRes.text());
      }
    }

    return new Response(JSON.stringify({ success: true, show_results_publicly }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
