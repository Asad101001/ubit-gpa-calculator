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
    // Validate JWT
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

    // Fetch profile to check verification
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=*`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );

    if (!profileRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch profile' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const profiles = await profileRes.json();
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      });
    }

    const profile = profiles[0];

    if (!profile.is_verified && !profile.is_admin) {
      return new Response(JSON.stringify({ error: 'Account not verified. Contact admin.' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { seat_no, subject_id, marks } = body;

    if (!seat_no || !subject_id || marks === undefined) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Non-admin users can only edit their own marks
    if (!profile.is_admin && profile.seat_no !== seat_no) {
      return new Response(JSON.stringify({ error: 'You can only edit your own marks.' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Valid subject IDs
    const validSubjects = ['cs351','cs353','cs355','cs357','cs359','cs361','cs352','cs354','cs356','cs358','cs360','cs362'];
    if (!validSubjects.includes(subject_id)) {
      return new Response(JSON.stringify({ error: 'Invalid subject' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the mark
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/student_results?seat_no=eq.${encodeURIComponent(seat_no)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ [subject_id]: marks }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Supabase error: ${errText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
