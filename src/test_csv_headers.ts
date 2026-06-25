import * as fs from 'fs';

// Manually load env variables from .env.local
const envLocal = fs.readFileSync('./.env.local', 'utf-8');
envLocal.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    process.env[key] = value;
  }
});

async function run() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/chunks?limit=0`;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  
  console.log('Fetching CSV headers for chunks table...');
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Accept': 'text/csv'
    }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV: ${res.statusText}`);
  }
  
  const text = await res.text();
  console.log('Headers returned:');
  console.log(text.trim());
}

run().catch(console.error);
