export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = (globalThis as any).process?.env?.VITE_SUPABASE_URL ?? '';
  const supabaseKey = (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY ?? '';

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/leaderboard?select=*&order=cgpa.desc.nullslast`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from Supabase');
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
