

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
      },
    });
  }

  // We only need to serve the HTML with meta tags so that Discord/WhatsApp picks up the custom image.
  // We can pass the stats in the URL if we have them, or just redirect.
  // Wait, if we don't have the stats in the URL, how do we get them? We can fetch from Supabase here!
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  let cgpa = '0.00';
  let percentile = '50';
  let bestCourseName = 'N/A';
  let bestCourseGP = '0.0';

  if (supabaseUrl && supabaseKey) {
    try {
      // Direct REST call to Supabase to keep edge function lightweight without the whole SDK if preferred, 
      // but let's just use fetch.
      const res = await fetch(`${supabaseUrl}/rest/v1/leaderboard?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (res.ok) {
        const data: any[] = await res.json();
        // Calculate percentile
        const sorted = [...data].sort((a, b) => b.cgpa - a.cgpa);
        const userIndex = sorted.findIndex(d => d.name.toLowerCase() === name.toLowerCase());
        
        if (userIndex !== -1) {
          const user = sorted[userIndex];
          cgpa = user.cgpa.toFixed(2);
          const totalBelow = sorted.length - (userIndex + 1);
          percentile = Math.round((totalBelow / sorted.length) * 100).toString();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // The actual image URL for the OG tag
  const host = req.headers.get('host') || 'ubit-gpa-calculator-28.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const ogImageUrl = `${protocol}://${host}/api/wrapped?name=${encodeURIComponent(name)}&cgpa=${cgpa}&percentile=${percentile}&bestCourseName=${encodeURIComponent(bestCourseName)}&bestCourseGP=${bestCourseGP}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${name}'s UBIT Batch '28 Wrapped</title>
      <meta name="description" content="Check out my first year academic snapshot for DCS UBIT Batch '28!">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="website">
      <meta property="og:title" content="${name}'s UBIT Batch '28 Wrapped">
      <meta property="og:description" content="Check out my first year academic snapshot for DCS UBIT Batch '28!">
      <meta property="og:image" content="${ogImageUrl}">
      
      <!-- Twitter -->
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:title" content="${name}'s UBIT Batch '28 Wrapped">
      <meta property="twitter:description" content="Check out my first year academic snapshot for DCS UBIT Batch '28!">
      <meta property="twitter:image" content="${ogImageUrl}">

      <!-- Instant Redirect to the main app -->
      <meta http-equiv="refresh" content="0; url=/">
      <script>
        window.location.href = "/";
      </script>
    </head>
    <body style="background: #020617; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh;">
      <p>Redirecting to UBIT GPA Calculator...</p>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  });
}
