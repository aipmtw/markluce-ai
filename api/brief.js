const SUPABASE_URL = 'https://reipdepbltfbfxnjjegy.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaXBkZXBibHRmYmZ4bmpqZWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTUxMjgsImV4cCI6MjA4OTEzMTEyOH0.yEoDps8Fni0x5CKOCsL5zdj0n4if32fr0UGXcdsEfSo';

module.exports = async (req, res) => {
  const headers = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  if (req.method === 'GET') {
    const date = req.query.date;
    const url = date
      ? `${SUPABASE_URL}/rest/v1/briefs?date=eq.${date}&limit=1`
      : `${SUPABASE_URL}/rest/v1/briefs?order=date.desc&limit=1`;

    const r = await fetch(url, { headers });
    const data = await r.json();
    const row = data[0];
    if (!row) return res.json(null);
    if (typeof row.headlines === 'string') {
      try { row.headlines = JSON.parse(row.headlines); } catch (_) {}
    }
    return res.json(row);
  }

  if (req.method === 'POST') {
    const pass = req.headers['x-admin-pass'] || req.body?.pass;
    if (pass !== (process.env.ADMIN_PASS || 'aipm2026')) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const { date, headlines } = req.body;
    if (!date || !headlines) return res.status(400).json({ error: 'date and headlines required' });

    const r = await fetch(`${SUPABASE_URL}/rest/v1/briefs`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation,resolution=merge-duplicates' },
      body: JSON.stringify({ date, headlines }),
    });
    const data = await r.json();
    return res.json(data);
  }

  res.status(405).json({ error: 'GET or POST only' });
};
