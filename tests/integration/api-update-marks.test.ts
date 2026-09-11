import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import updateMarksHandler from '../../api/update-marks';

describe('Edge Serverless Handler: /api/update-marks', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.VITE_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'mock-anon-key';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should handle HTTP OPTIONS preflight request with 204 and CORS headers', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/update-marks', {
      method: 'OPTIONS',
    });
    const res = await updateMarksHandler(req);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('should reject non-POST methods with 405 Method Not Allowed', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/update-marks', {
      method: 'GET',
    });
    const res = await updateMarksHandler(req);
    expect(res.status).toBe(405);
  });

  it('should reject requests without authorization header with 401', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/update-marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seat_no: 'B24110006087', subject_id: 'cs351', marks: 85 }),
    });
    const res = await updateMarksHandler(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Authentication required');
  });

  it('should reject unauthorized non-owner non-admin user with 403', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/v1/user')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 'user-123' }), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles')) {
        return Promise.resolve(new Response(JSON.stringify([
          { id: 'user-123', seat_no: 'B24110006001', is_admin: false }
        ]), { status: 200 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/update-marks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-jwt-token'
      },
      body: JSON.stringify({ seat_no: 'B24110006087', subject_id: 'cs351', marks: 85 }),
    });

    const res = await updateMarksHandler(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain('You can only edit marks for your own seat number');
  });

  it('should allow verified owner to update their own marks with 200', async () => {
    let patchedBody: any = null;
    globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/auth/v1/user')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 'owner-id' }), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles')) {
        return Promise.resolve(new Response(JSON.stringify([
          { id: 'owner-id', seat_no: 'B24110006087', is_admin: false }
        ]), { status: 200 }));
      }
      if (url.includes('/rest/v1/student_results')) {
        patchedBody = JSON.parse(String(init?.body || '{}'));
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/update-marks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer owner-jwt-token'
      },
      body: JSON.stringify({ seat_no: 'b24110006087', subject_id: 'CS-351', marks: 90 }),
    });

    const res = await updateMarksHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.updated).toEqual({ cs351: 90 });
    expect(patchedBody).toEqual({ cs351: 90 });
  });

  it('should allow administrator to update any student marks with 200', async () => {
    let patchedUrl = '';
    let patchedBody: any = null;
    globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/auth/v1/user')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 'admin-id' }), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles')) {
        return Promise.resolve(new Response(JSON.stringify([
          { id: 'admin-id', seat_no: 'B24110006087', is_admin: true }
        ]), { status: 200 }));
      }
      if (url.includes('/rest/v1/student_results')) {
        patchedUrl = url;
        patchedBody = JSON.parse(String(init?.body || '{}'));
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/update-marks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-jwt-token'
      },
      body: JSON.stringify({ seat_no: 'B24110006001', subject_id: 'cs451', marks: 95 }),
    });

    const res = await updateMarksHandler(req);
    expect(res.status).toBe(200);
    expect(patchedUrl).toContain('seat_no=eq.B24110006001');
    expect(patchedBody).toEqual({ cs451: 95 });
  });

  it('should support batch updates via marks_payload with clearing of marks', async () => {
    let patchedBody: any = null;
    globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/auth/v1/user')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 'admin-id' }), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles')) {
        return Promise.resolve(new Response(JSON.stringify([
          { id: 'admin-id', seat_no: 'B24110006087', is_admin: true }
        ]), { status: 200 }));
      }
      if (url.includes('/rest/v1/student_results')) {
        patchedBody = JSON.parse(String(init?.body || '{}'));
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/update-marks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-jwt-token'
      },
      body: JSON.stringify({ 
        seat_no: 'B24110006001', 
        marks_payload: {
          cs351: 85,
          cs353: 'Results Unannounced',
          cs451: null,
          cs453: 88,
        }
      }),
    });

    const res = await updateMarksHandler(req);
    expect(res.status).toBe(200);
    expect(patchedBody).toEqual({
      cs351: 85,
      cs353: null,
      cs451: null,
      cs453: 88,
    });
  });
});
