/**
 * /api/admin-delete-user
 *
 * Fully deletes a user from auth.users AND profiles table.
 * Requires the caller to be an admin (verified via their JWT).
 * Uses SUPABASE_SERVICE_ROLE_KEY to call the admin Auth API.
 */
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
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

  const supabaseUrl = (globalThis as any).process?.env?.VITE_SUPABASE_URL ?? '';
  const supabaseKey = (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY ?? '';
  const serviceKey = (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY
    ?? (globalThis as any).process?.env?.VITE_SUPABASE_SERVICE_ROLE_KEY
    ?? '';

  if (!serviceKey) {
    return new Response(JSON.stringify({ error: 'Server not configured for admin operations. Set SUPABASE_SERVICE_ROLE_KEY.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    // ── 1. Authenticate caller ───────────────────────────────────────────────
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const callerUser = await userRes.json();

    // ── 2. Verify caller is admin via profiles table ─────────────────────────
    const callerProfileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${callerUser.id}&select=is_admin`,
      {
        headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
      }
    );

    if (!callerProfileRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to verify admin status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const callerProfiles = await callerProfileRes.json();
    if (!callerProfiles?.[0]?.is_admin) {
      return new Response(JSON.stringify({ error: 'Admin privileges required to delete accounts.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // ── 3. Validate target user ID ────────────────────────────────────────────
    const body = await req.json();
    const { target_user_id } = body;

    if (!target_user_id || typeof target_user_id !== 'string') {
      return new Response(JSON.stringify({ error: 'target_user_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Safety: prevent admin from deleting their own account via this endpoint
    if (target_user_id === callerUser.id) {
      return new Response(JSON.stringify({ error: 'You cannot delete your own account via admin panel.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // ── 4. Delete from auth.users via Admin API (service key required) ────────
    // This cascades to profiles due to ON DELETE CASCADE on the FK constraint.
    const deleteRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${target_user_id}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    );

    if (!deleteRes.ok) {
      const errText = await deleteRes.text();
      // If auth user already gone, still try to clean up orphan profile
      if (!deleteRes.status.toString().startsWith('4')) {
        throw new Error(`Auth API error: ${errText}`);
      }
    }

    // ── 5. Belt-and-suspenders: ensure profile row is removed ─────────────────
    // (ON DELETE CASCADE should handle this, but explicit cleanup ensures no orphans)
    await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${target_user_id}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=minimal',
        },
      }
    );

    return new Response(JSON.stringify({ success: true, deleted_user_id: target_user_id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
