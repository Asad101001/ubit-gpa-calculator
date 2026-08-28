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

    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=*`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` } }
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

    const isOwner = profile.seat_no && profile.seat_no.toUpperCase() === String(body?.seat_no || '').toUpperCase();
    const isAdmin = !!profile.is_admin;

    if (!isOwner && !isAdmin) {
      return new Response(JSON.stringify({ error: 'You can only edit marks for your own seat number.' }), {
        status: 403, headers: { 'Content-Type': 'application/json' },
      });
    }

    const { seat_no, subject_id, marks, marks_payload } = body;

    if (!seat_no) {
      return new Response(JSON.stringify({ error: 'Missing seat_no parameter' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Valid subject IDs (Semesters 1, 2, and 3)
    const validSubjects = [
      'cs351','cs353','cs355','cs357','cs359','cs361',
      'cs352','cs354','cs356','cs358','cs360','cs362',
      'cs451','cs453','cs455','cs457','cs459','cs461'
    ];

    const patchPayload: Record<string, any> = {};

    if (marks_payload && typeof marks_payload === 'object') {
      // Batch mode
      Object.entries(marks_payload).forEach(([k, v]) => {
        const cleanKey = k.toLowerCase().replace('-', '');
        if (validSubjects.includes(cleanKey)) {
          if (v === '' || v === null || v === 'Results Unannounced' || v === 'Marks Missing' || v === undefined) {
            patchPayload[cleanKey] = null;
          } else {
            const num = Number(v);
            if (!isNaN(num) && num >= 0 && num <= 100) {
              patchPayload[cleanKey] = num;
            }
          }
        }
      });
    } else if (subject_id) {
      // Single subject mode
      const cleanKey = subject_id.toLowerCase().replace('-', '');
      if (!validSubjects.includes(cleanKey)) {
        return new Response(JSON.stringify({ error: `Invalid subject: ${subject_id}` }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
      if (marks === '' || marks === null || marks === 'Results Unannounced' || marks === 'Marks Missing' || marks === undefined) {
        patchPayload[cleanKey] = null;
      } else {
        const num = Number(marks);
        if (isNaN(num) || num < 0 || num > 100) {
          return new Response(JSON.stringify({ error: 'Mark must be between 0 and 100, or empty' }), {
            status: 400, headers: { 'Content-Type': 'application/json' },
          });
        }
        patchPayload[cleanKey] = num;
      }
    } else {
      return new Response(JSON.stringify({ error: 'Missing subject_id or marks_payload' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the record in student_results
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/student_results?seat_no=eq.${encodeURIComponent(seat_no)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(patchPayload),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Database error: ${errText}`);
    }

    return new Response(JSON.stringify({ success: true, updated: patchPayload }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}

