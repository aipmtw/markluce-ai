const SUPABASE_URL = 'https://reipdepbltfbfxnjjegy.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaXBkZXBibHRmYmZ4bmpqZWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTUxMjgsImV4cCI6MjA4OTEzMTEyOH0.yEoDps8Fni0x5CKOCsL5zdj0n4if32fr0UGXcdsEfSo';

module.exports = async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/briefs?select=id,date,headlines&order=date.desc&limit=${limit}`,
    {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    }
  );
  const data = await r.json();
  for (const row of data) {
    if (typeof row.headlines === 'string') {
      try { row.headlines = JSON.parse(row.headlines); } catch (_) {}
    }
  }
  res.json(data);
};
