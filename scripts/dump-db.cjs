// scripts/dump-db.cjs
// Run with: npm run db:dump
// Dumps production Supabase data to public/fallback-results.json for local testing.

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load from .env manually (no dotenv dependency)
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...val] = trimmed.split('=');
    const value = val.join('=').trim().replace(/^["']|["']$/g, '').trim();
    if (key?.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value;
    if (key?.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseKey = value;
  });

} catch (e) {
  console.error('Could not read .env file:', e.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const url = new URL(`${supabaseUrl}/rest/v1/student_results?select=*`);
const outputPath = path.join(__dirname, '..', 'public', 'fallback-results.json');

console.log(`Fetching from ${supabaseUrl}...`);

const req = https.request(
  { hostname: url.hostname, path: url.pathname + url.search, headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } },
  (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
          console.error('Unexpected response:', data.substring(0, 200));
          process.exit(1);
        }
        
        // Ensure all semester 3 keys exist for each student
        const sem3Keys = ['cs451', 'cs453', 'cs455', 'cs457', 'cs459', 'cs461'];
        const normalized = parsed.map(row => {
          const item = { ...row };
          sem3Keys.forEach(k => {
            if (item[k] === undefined || item[k] === null || item[k] === '') {
              item[k] = 'Results Unannounced';
            }
          });
          return item;
        });

        // Sort by seat_no
        normalized.sort((a, b) => (a.seat_no || '').localeCompare(b.seat_no || ''));

        fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2));
        console.log(`✅ Dumped and normalized ${normalized.length} records to public/fallback-results.json`);
        console.log(`   Generated at: ${new Date().toISOString()}`);
      } catch (e) {
        console.error('Failed to parse response:', e.message);
        process.exit(1);
      }

    });
  }
);
req.on('error', e => { console.error('Network error:', e.message); process.exit(1); });
req.end();
