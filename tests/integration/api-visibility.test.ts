import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import visibilityHandler from '../../api/update-visibility';

describe('Edge Serverless Handler: /api/update-visibility', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.VITE_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'mock-anon-key';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should reject non-POST methods with 405', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/update-visibility', {
      method: 'GET',
    });
    const res = await visibilityHandler(req);
    expect(res.status).toBe(405);
  });

  it('should reject non-boolean show_results_publicly payload with 400', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/v1/user')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 'user-id' }), { status: 200 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/update-visibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ show_results_publicly: 'not-a-boolean' }),
    });

    const res = await visibilityHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('show_results_publicly boolean required');
  });

  it('should update profile and synchronize student_results.is_hidden', async () => {
    let patchedProfile: any = null;
    let patchedStudentResult: any = null;

    globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/auth/v1/user')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 'user-id' }), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles?id=eq.user-id&select=seat_no')) {
        return Promise.resolve(new Response(JSON.stringify([{ seat_no: 'B24110006087' }]), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles?id=eq.user-id')) {
        patchedProfile = JSON.parse(String(init?.body || '{}'));
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (url.includes('/rest/v1/student_results?seat_no=eq.B24110006087')) {
        patchedStudentResult = JSON.parse(String(init?.body || '{}'));
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    // Make account private (show_results_publicly: false)
    const req = new Request('https://ubit-results-28.vercel.app/api/update-visibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ show_results_publicly: false }),
    });

    const res = await visibilityHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.show_results_publicly).toBe(false);

    expect(patchedProfile).toEqual({ show_results_publicly: false });
    expect(patchedStudentResult).toEqual({ is_hidden: true });
  });
});
