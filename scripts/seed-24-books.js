const { Client } = require('pg');
const c = new Client({
  host: 'db.reipdepbltfbfxnjjegy.supabase.co',
  port: 5432, database: 'postgres', user: 'postgres',
  password: '02uL6rlxF2feKlY8', ssl: { rejectUnauthorized: false }
});

const BOOKS = [
  // 3-6 歲 (7 new)
  { slug: 'rainbow-painting', title_zh: '彩虹畫家', title_en: 'Rainbow Painter', age: '3-6', pages: 10 },
  { slug: 'bunny-moon', title_zh: '小兔望月', title_en: 'Bunny and the Moon', age: '3-6', pages: 10 },
  { slug: 'magic-seeds', title_zh: '魔法種子', title_en: 'Magic Seeds', age: '3-6', pages: 10 },
  { slug: 'cloud-adventure', title_zh: '雲朵冒險記', title_en: 'Cloud Adventure', age: '3-6', pages: 10 },
  { slug: 'penguin-dance', title_zh: '企鵝舞會', title_en: 'Penguin Dance Party', age: '3-6', pages: 10 },
  { slug: 'kitten-market', title_zh: '小貓逛市場', title_en: 'Kitten Goes to Market', age: '3-6', pages: 10 },
  { slug: 'firefly-night', title_zh: '螢火蟲之夜', title_en: 'Firefly Night', age: '3-6', pages: 10 },
  // 7-9 歲 (8 new)
  { slug: 'detective-cat', title_zh: '偵探貓咪', title_en: 'Detective Cat', age: '7-9', pages: 10 },
  { slug: 'music-forest', title_zh: '音樂森林', title_en: 'Music Forest', age: '7-9', pages: 10 },
  { slug: 'flying-bicycle', title_zh: '飛天腳踏車', title_en: 'The Flying Bicycle', age: '7-9', pages: 10 },
  { slug: 'dream-bakery', title_zh: '夢想麵包店', title_en: 'Dream Bakery', age: '7-9', pages: 10 },
  { slug: 'treasure-map', title_zh: '寶藏地圖', title_en: 'Treasure Map', age: '7-9', pages: 10 },
  { slug: 'shadow-friend', title_zh: '影子朋友', title_en: 'Shadow Friend', age: '7-9', pages: 10 },
  { slug: 'paper-airplane', title_zh: '紙飛機環遊世界', title_en: 'Paper Airplane Around the World', age: '7-9', pages: 10 },
  { slug: 'weather-wizard', title_zh: '天氣魔法師', title_en: 'Weather Wizard', age: '7-9', pages: 10 },
  // 10-12 歲 (9 new)
  { slug: 'ai-partner', title_zh: 'AI 夥伴日記', title_en: 'AI Partner Diary', age: '10-12', pages: 10 },
  { slug: 'ocean-explorer', title_zh: '深海探險家', title_en: 'Deep Sea Explorer', age: '10-12', pages: 10 },
  { slug: 'future-city', title_zh: '未來城市', title_en: 'Future City', age: '10-12', pages: 10 },
  { slug: 'math-kingdom', title_zh: '數學王國', title_en: 'Math Kingdom', age: '10-12', pages: 10 },
  { slug: 'space-garden', title_zh: '太空花園', title_en: 'Space Garden', age: '10-12', pages: 10 },
  { slug: 'history-detective', title_zh: '歷史偵探社', title_en: 'History Detective Club', age: '10-12', pages: 10 },
  { slug: 'eco-heroes', title_zh: '環保小英雄', title_en: 'Eco Heroes', age: '10-12', pages: 10 },
  { slug: 'inventor-girl', title_zh: '發明家女孩', title_en: 'Inventor Girl', age: '10-12', pages: 10 },
  { slug: 'parallel-worlds', title_zh: '平行世界', title_en: 'Parallel Worlds', age: '10-12', pages: 10 },
];

async function run() {
  await c.connect();

  for (const b of BOOKS) {
    await c.query(
      `INSERT INTO books (slug, title_zh, title_en, age_tier, page_count, cover_url, price_ntd, is_demo, status)
       VALUES ($1, $2, $3, $4, $5, '', 99, false, 'published')
       ON CONFLICT (slug) DO UPDATE SET title_zh=$2, title_en=$3, age_tier=$4, page_count=$5, status='published'`,
      [b.slug, b.title_zh, b.title_en, b.age, b.pages]
    );
    console.log('Book:', b.slug);
  }

  // Also fix existing books age_tier to match new grouping
  await c.query(`UPDATE books SET age_tier='3-6' WHERE slug IN ('lulu-garden','bear-kitchen') AND age_tier='3-5'`);
  await c.query(`UPDATE books SET age_tier='3-6' WHERE slug IN ('dino-school','ocean-friends','mei') AND age_tier='4-6'`);
  await c.query(`UPDATE books SET age_tier='7-9' WHERE slug='star-musician' AND age_tier='8-10'`);
  console.log('Fixed age tiers to 3-group system');

  // Verify
  const r = await c.query('SELECT slug, title_zh, age_tier, status FROM books ORDER BY age_tier, slug');
  console.log('\nAll books:');
  r.rows.forEach(b => console.log(`  ${b.age_tier}  ${b.title_zh} (${b.slug}) [${b.status}]`));
  console.log('Total:', r.rows.length);

  await c.end();
}
run();
