export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const ip = req.headers['x-forwarded-for'] || '127.0.0.1';
    
    // Parse Data
    const { name, cgpa, gpa1, gpa2 } = req.body;

    if (!name || cgpa == null) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    const payload = {
      name,
      cgpa,
      gpa1,
      gpa2,
      ip_address: ip
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/leaderboard`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' // Upsert
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase Error: ${errorText}`);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ success: true });

  } catch (e: any) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: e.message });
  }
}
