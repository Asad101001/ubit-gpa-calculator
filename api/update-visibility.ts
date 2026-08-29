export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = (globalThis as any).process?.env?.VITE_SUPABASE_URL ?? '';
  const supabaseKey = (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY ?? '';

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
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

    // 1. Fetch user's profile to get seat_no
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=seat_no`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` } }
    );
    const profileRows = profileRes.ok ? await profileRes.json() : [];
    const seatNo = profileRows?.[0]?.seat_no;

    // 2. Update profile in supabase
    const updateRes = await fetch(
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

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Database error: ${errText}`);
    }

    // 3. Sync student_results is_hidden status
    if (seatNo) {
      await fetch(
        `${supabaseUrl}/rest/v1/student_results?seat_no=eq.${seatNo}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ is_hidden: !show_results_publicly }),
        }
      ).catch(() => null);
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
