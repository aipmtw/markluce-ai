// Posts the 2026-04-18 daily brief (3 headlines).
// Run: node scripts/post-brief-20260418.js
process.stdout.setDefaultEncoding('utf8');

const SUPABASE_URL = 'https://reipdepbltfbfxnjjegy.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaXBkZXBibHRmYmZ4bmpqZWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTUxMjgsImV4cCI6MjA4OTEzMTEyOH0.yEoDps8Fni0x5CKOCsL5zdj0n4if32fr0UGXcdsEfSo';

const date = '2026-04-18';
const headlines = [
  {
    title: 'Claude Opus 4.7 正式上線：程式碼能力、長任務、視覺解析全面升級',
    summary: 'Anthropic 推出 Claude Opus 4.7 並全面開放，主打更強的程式碼生成、長時間運行的軟體任務以及更高解析度的視覺理解。同時針對近期社群對 Claude 效能下滑的疑慮，Anthropic 重新調整了預設運算量配置，以挽回開發者信任。',
    source_name: 'Anthropic',
    source_url: 'https://www.anthropic.com/news'
  },
  {
    title: 'OpenAI Codex 重大更新：跨入電腦操作、網頁工作流與深度開發者工具',
    summary: 'OpenAI 釋出 Codex 新版本，能力範圍從純程式碼擴展至電腦使用、網頁工作流、圖片生成、記憶與自動化任務。新增 PR 審查、終端機、SSH devbox 與內建瀏覽器，使 Codex 成為更完整的代理式開發環境。',
    source_name: 'OpenAI',
    source_url: 'https://openai.com/news/'
  },
  {
    title: 'Cursor 3 推出 Agents Window：為 AI 代理打造獨立多窗工作空間',
    summary: 'Cursor 3 上線專屬於 AI 代理的獨立介面 Agents Window，可平行調度多個代理並以分割面板方式檢視進度。產業也出現新趨勢——Cursor + Claude Code + Codex 三者並用，正悄悄融合為新一代 AI coding stack。',
    source_name: 'Cursor',
    source_url: 'https://www.cursor.com/changelog'
  }
];

(async () => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/briefs`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates'
    },
    body: JSON.stringify({ date, headlines: JSON.stringify(headlines) })
  });
  const text = await r.text();
  console.log('status:', r.status);
  console.log(text);
})();
