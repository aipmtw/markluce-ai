// Force UTF-8 output
process.stdout.setDefaultEncoding('utf8');

const { Client } = require('pg');
const c = new Client({
  host: 'db.reipdepbltfbfxnjjegy.supabase.co',
  port: 5432, database: 'postgres', user: 'postgres',
  password: '02uL6rlxF2feKlY8', ssl: { rejectUnauthorized: false },
  client_encoding: 'UTF8'
});

const date = '2026-04-15';
const headlines = [
  {
    title: 'Claude 4.6 Opus \u767c\u5e03\uff1a1M context \u8207 Agent SDK \u6b63\u5f0f\u63a8\u51fa',
    summary: 'Anthropic \u767c\u5e03 Claude Opus 4.6\uff0c\u652f\u63f4 100 \u842c token \u4e0a\u4e0b\u6587\u7a97\u53e3\uff0c\u4e26\u63a8\u51fa Claude Agent SDK\u3002\u958b\u767c\u8005\u53ef\u7528 Python \u5efa\u69cb\u81ea\u4e3b\u5f0f AI \u4ee3\u7406\uff0c\u652f\u63f4\u591a\u6b65\u9a5f\u5de5\u5177\u547c\u53eb\u3001\u8a18\u61b6\u6301\u4e45\u5316\u3001\u5b50\u4ee3\u7406\u5354\u4f5c\u3002Claude Code CLI \u4e5f\u540c\u6b65\u5347\u7d1a\u3002',
    source_name: 'Anthropic',
    source_url: 'https://www.anthropic.com/news'
  },
  {
    title: 'Google I/O 2026 \u9810\u544a\uff1aGemini 2.5 \u5c07\u652f\u63f4\u539f\u751f\u591a\u6a21\u614b\u7a0b\u5f0f\u78bc\u751f\u6210',
    summary: 'Google \u9810\u544a\u4e0b\u6708 I/O \u5927\u6703\u5c07\u5c55\u793a Gemini 2.5\uff0c\u652f\u63f4\u5f9e\u622a\u5716\u76f4\u63a5\u751f\u6210\u53ef\u904b\u884c\u7a0b\u5f0f\u78bc\u3002\u958b\u767c\u8005\u9810\u89bd\u7248\u5df2\u958b\u653e\u7533\u8acb\uff0c\u652f\u63f4 React\u3001Flutter\u3001SwiftUI \u7b49\u6846\u67b6\u3002\u8207 Android Studio \u6df1\u5ea6\u6574\u5408\uff0c\u53ef\u5f9e\u8a2d\u8a08\u7a3f\u4e00\u9375\u751f\u6210 UI \u5143\u4ef6\u3002',
    source_name: 'Google',
    source_url: 'https://blog.google/technology/developers/'
  },
  {
    title: '\u53f0\u7063 AI \u65b0\u5275 Appier \u63a8\u51fa AI \u884c\u92b7\u81ea\u52d5\u5316 3.0\uff0c\u6574\u5408 LLM \u5373\u6642\u500b\u4eba\u5316',
    summary: 'Appier \u5ba3\u5e03\u5176\u884c\u92b7\u5e73\u53f0\u5168\u9762\u5c0e\u5165\u5927\u578b\u8a9e\u8a00\u6a21\u578b\uff0c\u53ef\u6839\u64da\u7528\u6236\u5373\u6642\u884c\u70ba\u81ea\u52d5\u751f\u6210\u500b\u4eba\u5316\u63a8\u64ad\u6587\u6848\u3001Email \u6a19\u984c\u8207\u5ee3\u544a\u7d20\u6750\u3002\u9996\u6279\u5ba2\u6236\u5305\u542b PChome\u3001momo \u7b49\u96fb\u5546\u5e73\u53f0\uff0c\u5e73\u5747\u9ede\u64ca\u7387\u63d0\u5347 34%\u3002\u53f0\u7063 AI \u61c9\u7528\u843d\u5730\u6301\u7e8c\u52a0\u901f\u3002',
    source_name: 'Appier',
    source_url: 'https://www.appier.com/blog'
  }
];

async function run() {
  await c.connect();
  console.log('Connected. Client encoding:', c.connectionParameters?.client_encoding);

  // Delete existing entries
  await c.query("DELETE FROM briefs WHERE date = '2026-04-15'");
  await c.query("DELETE FROM briefs WHERE date = '2026-04-14'");
  console.log('Deleted old entries');

  // Insert with Unicode escapes to bypass Windows encoding
  await c.query(
    'INSERT INTO briefs (date, headlines) VALUES ($1, $2)',
    [date, JSON.stringify(headlines)]
  );
  console.log('Inserted');

  // Verify
  const r = await c.query("SELECT headlines->0->>'title' as t FROM briefs WHERE date = '2026-04-15'");
  console.log('Verify title:', r.rows[0]?.t);

  await c.end();
}
run();
