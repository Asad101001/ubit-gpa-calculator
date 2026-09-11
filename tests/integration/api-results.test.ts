import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import resultsHandler from '../../api/results';

describe('Edge Serverless Handler: /api/results', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.VITE_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'mock-anon-key';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should reject non-GET requests with 405 Method Not Allowed', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/results', {
      method: 'POST',
    });
    const res = await resultsHandler(req);
    expect(res.status).toBe(405);
  });

  it('should fetch results and attach privacy masking flag for private accounts', async () => {
    const mockResults = [
      { seat_no: 'B24110006001', name: 'Public Student', cs351: 85 },
      { seat_no: 'B24110006087', name: 'Private Student', cs351: 75 },
    ];

    const mockHiddenProfiles = [
      { seat_no: 'B24110006087', show_results_publicly: false },
    ];

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/rest/v1/student_results')) {
        return Promise.resolve(new Response(JSON.stringify(mockResults), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles')) {
        return Promise.resolve(new Response(JSON.stringify(mockHiddenProfiles), { status: 200 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/results', {
      method: 'GET',
    });

    const res = await resultsHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const data = await res.json();
    expect(data).toHaveLength(2);

    const publicStudent = data.find((s: any) => s.seat_no === 'B24110006001');
    const privateStudent = data.find((s: any) => s.seat_no === 'B24110006087');

    expect(publicStudent.is_hidden).toBe(false);
    expect(privateStudent.is_hidden).toBe(true);
  });

  it('should override stale student_results.is_hidden when profile has show_results_publicly: true', async () => {
    const mockResults = [
      { seat_no: 'B24110006087', name: 'Asad', cs351: 74, is_hidden: true }, // Stale is_hidden in DB
    ];

    const mockProfiles = [
      { seat_no: 'B24110006087', show_results_publicly: true }, // Authoritative user setting
    ];

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/rest/v1/student_results')) {
        return Promise.resolve(new Response(JSON.stringify(mockResults), { status: 200 }));
      }
      if (url.includes('/rest/v1/profiles')) {
        return Promise.resolve(new Response(JSON.stringify(mockProfiles), { status: 200 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/results', { method: 'GET' });
    const res = await resultsHandler(req);
    const data = await res.json();

    expect(data[0].is_hidden).toBe(false); // Correctly unhidden!
  });
});
