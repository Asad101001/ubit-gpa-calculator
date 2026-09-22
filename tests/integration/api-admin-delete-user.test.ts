import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminDeleteHandler from '../../api/admin-delete-user';

describe('Edge Serverless Handler: /api/admin-delete-user', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should reject non-POST requests with 405', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/admin-delete-user', {
      method: 'GET',
    });
    const res = await adminDeleteHandler(req);
    expect(res.status).toBe(405);
  });

  it('should handle OPTIONS preflight with 204', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/admin-delete-user', {
      method: 'OPTIONS',
    });
    const res = await adminDeleteHandler(req);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('should reject requests without authorization header with 401', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/admin-delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_user_id: 'target-123' }),
    });
    const res = await adminDeleteHandler(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Authentication required');
  });

  it('should reject non-admin users with 403', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/v1/user')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 'regular-user' }), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles?id=eq.regular-user')) {
        return Promise.resolve(new Response(JSON.stringify([{ is_admin: false }]), { status: 200 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/admin-delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer regular-token',
      },
      body: JSON.stringify({ target_user_id: 'target-456' }),
    });

    const res = await adminDeleteHandler(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain('Admin privileges required');
  });

  it('should prevent admin from deleting their own account with 400', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/v1/user')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 'admin-user-id' }), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles?id=eq.admin-user-id')) {
        return Promise.resolve(new Response(JSON.stringify([{ is_admin: true }]), { status: 200 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/admin-delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({ target_user_id: 'admin-user-id' }),
    });

    const res = await adminDeleteHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('You cannot delete your own account');
  });

  it('should successfully delete target user via Admin Auth API when called by admin', async () => {
    let deletedUserId = '';

    globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/auth/v1/user')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 'admin-user-id' }), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles?id=eq.admin-user-id')) {
        return Promise.resolve(new Response(JSON.stringify([{ is_admin: true }]), { status: 200 }));
      }
      if (url.includes('/auth/v1/admin/users/')) {
        deletedUserId = url.split('/auth/v1/admin/users/')[1];
        return Promise.resolve(new Response(null, { status: 200 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/admin-delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token',
      },
      body: JSON.stringify({ target_user_id: 'target-student-id' }),
    });

    const res = await adminDeleteHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(deletedUserId).toBe('target-student-id');
  });
});
