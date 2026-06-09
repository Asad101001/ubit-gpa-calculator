import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

// Initialize Redis only if the environment variables are present
const redis = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) 
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    }) 
  : null;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // 1. Rate Limiting Check (If Redis is configured)
    if (redis) {
      const rateLimitKey = `rate_limit:${ip}`;
      const lastSubmission = await redis.get(rateLimitKey);
      
      if (lastSubmission) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait 10 minutes before submitting again.' 
        }), { status: 429, headers: { 'Content-Type': 'application/json' } });
      }

      // Set a 10-minute (600s) expiry block
      await redis.set(rateLimitKey, 'blocked', { ex: 600 });
    }

    // 2. Parse Data
    const body = await req.json();
    const { name, cgpa, gpa1, gpa2 } = body;

    if (!name || cgpa == null) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Upsert to Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const payload = {
      name,
      cgpa,
      gpa1,
      gpa2,
      ip_address: ip
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/leaderboard`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' // Upsert
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Supabase Error: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
