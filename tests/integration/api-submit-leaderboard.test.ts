import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import submitHandler from '../../api/submit';

describe('Edge Serverless Handler: /api/submit', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.VITE_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'mock-anon-key';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should reject non-POST requests with 405', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/submit', {
      method: 'GET',
    });
    const res = await submitHandler(req);
    expect(res.status).toBe(405);
  });

  it('should reject missing required fields with 400', async () => {
    const req = new Request('https://ubit-results-28.vercel.app/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    const res = await submitHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields');
  });

  it('should accept valid leaderboard submission and upsert with IP address', async () => {
    let capturedPayload: any = null;

    globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/rest/v1/leaderboard')) {
        capturedPayload = JSON.parse(String(init?.body || '{}'));
        return Promise.resolve(new Response(null, { status: 201 }));
      }
      return Promise.resolve(new Response('Not found', { status: 404 }));
    });

    const req = new Request('https://ubit-results-28.vercel.app/api/submit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.50'
      },
      body: JSON.stringify({
        name: 'Muhammad Asad Khan',
        cgpa: 3.85,
        gpa1: 3.80,
        gpa2: 3.90
      }),
    });

    const res = await submitHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    expect(capturedPayload).toEqual({
      name: 'Muhammad Asad Khan',
      cgpa: 3.85,
      gpa1: 3.80,
      gpa2: 3.90,
      ip_address: '192.168.1.50'
    });
  });
});
