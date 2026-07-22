// Posts the AI Meeting Assistants competitive analysis feature article.
// Run: node scripts/post-feature-ai-meeting-assistants.js
process.stdout.setDefaultEncoding('utf8');

const SUPABASE_URL = 'https://reipdepbltfbfxnjjegy.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaXBkZXBibHRmYmZ4bmpqZWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTUxMjgsImV4cCI6MjA4OTEzMTEyOH0.yEoDps8Fni0x5CKOCsL5zdj0n4if32fr0UGXcdsEfSo';

const content = `## 前言

過去一年，AI 會議助理從「自動逐字稿」進化成「會議大腦」——不只記錄，還要產出摘要、追蹤行動項目、串接 CRM 與專案管理工具。對 25–40 歲的台灣上班族與中小企業主管而言，這類工具的決策不再只是「要不要用」，而是「選哪一個 + 如何符合台灣個資法」。

本文針對三大主流——**Fireflies.ai、Otter.ai、Notion AI Meeting Notes**——從功能、價格、台灣市場、PDPA 合規、企業優劣勢做完整拆解，並提出我們自家產品的差異化機會與 MVP 建議。

---

## 一、競品核心功能對比

| 維度 | Fireflies.ai | Otter.ai | Notion AI Meeting Notes |
|------|-------------|----------|------------------------|
| **語音辨識語言** | 100+ 語言（含繁中） | 英、日、法、西、葡（中文支援較弱） | 16 種語言（含繁中） |
| **自動摘要** | 即時逐句重點＋會後完整摘要 | 會後摘要＋OtterPilot 提問 | 結構化摘要、決策、開放問題 |
| **智慧議程** | AskFred / Talk to Fireflies（內建 Perplexity 即時搜尋） | OtterPilot for Sales（業務專用） | 工作區範本：tone / sections / length |
| **行動項目追蹤** | 自動抓 action items＋指派 | 自動條列、可同步 Slack/Asana | @ 提及自動轉成 next steps |
| **整合能力** | Zoom/Meet/Teams + Slack + HubSpot + Salesforce + Notion | Zoom/Meet/Teams + Salesforce + Slack + MCP Server | 原生整合 Notion 資料庫、頁面、待辦 |
| **錄音來源** | 加入會議的 bot | 加入會議的 bot | 桌面系統音訊（不需 bot） |
| **MCP / API** | 公開 API + Zapier | 2026 推出 MCP Server，可對接 Claude/ChatGPT | Notion API（功能受限） |

**關鍵差異**：Otter 在 2026 年率先推出 **MCP Server**，可讓 Claude、ChatGPT 直接讀取會議檔案做後處理；Notion 則走「不派 bot 進會議」的路線，靠擷取桌面音訊解決部分隱私顧慮；Fireflies 則用 Perplexity 切入「即時搜尋」做差異化。

---

## 二、2026 最新更新與台灣市場表現

### Fireflies.ai
- **2026 年新功能**：Talk to Fireflies（Perplexity 驅動）、live bullet notes、100+ 語言。
- **台灣觀察**：因為支援繁體中文辨識，是中小企業最常評估的選項之一；常見於行銷顧問、資訊服務業。
- **痛點**：需以 bot 加入會議，部分台灣傳統製造業客戶仍不允許「未經授權第三方加入」。

### Otter.ai
- **2026 年新功能**：OtterPilot for Sales、Video Replay、MCP Server 對接 LLM。
- **台灣觀察**：在跨國商務、英語會議普及度高，但繁中辨識準確度落後競品；Dcard / PTT 上的中文討論量明顯少於 Fireflies。
- **痛點**：中文使用者多半反映「英文超強、中文一般」。

### Notion AI Meeting Notes
- **2026 年新功能**：工作區管理範本、16 語支援、桌面系統音訊擷取。
- **台灣觀察**：在已導入 Notion 的新創 / 設計工作室擴散最快，搭配 Notion 文件原生整合形成黏著。
- **痛點**：必須是 Notion 付費用戶才划算，獨立會議工具用途較弱。

> **數據附註**：根據 104 人力銀行《2025 企業年終及 2026 薪酬趨勢調查》，AI 相關職缺一年增 38%，顯示企業「導入 AI」的需求強勁；但目前公開資料未針對「AI 會議助理」做細分採用率統計，本文中關於台灣偏好為觀察整理，非調研數據。PTT / Dcard 上針對這三家工具的中文心得文目前數量有限，未見大規模討論串。

---

## 三、定價策略與中小企業性價比

| 方案 | Fireflies.ai | Otter.ai | Notion AI |
|------|-------------|----------|-----------|
| **免費** | 800 分鐘儲存、有限 AI | 300 分/月 | 含於 Notion 免費版（受限） |
| **個人 Pro** | US$10/mo（年繳） | US$8.33/mo（年繳） | US$10/user/mo（含 Notion） |
| **商務** | US$19/mo（年繳） | 6,000 分/月，自訂價 | US$20/user/mo |
| **企業** | US$39/mo（年繳） | 客製 | 客製 |

### 台灣中小企業性價比試算

假設一間 10 人公司、每人每月 8 小時會議、需要繁中辨識 + 摘要：

| 工具 | 月費（10 人） | 折合台幣 | 適用情境 |
|------|--------------|---------|----------|
| Fireflies Business | US$190 | 約 NT$6,200 | 多語、業務型團隊 |
| Otter Business | US$200+ | 約 NT$6,500+ | 英文為主 |
| Notion Business + AI | US$200 | 約 NT$6,500 | 已用 Notion |

> **Token 成本附註**：三家皆採訂閱制，未公開向使用者收取 token，但內部後端推論成本估算約 US$0.005–0.02/分鐘（採 Whisper / Gemini / GPT 系列）。對中小企業而言，**單看現金支出，三家差距 < 10%；真正差異在「整合成本」與「員工學習曲線」**。

---

## 四、PDPA 合規情況與風險

台灣 2025 年 3 月通過《個人資料保護委員會組織法》草案及個資法修正案，2026 年起對「AI 處理個人資料」的要求顯著提高。AI 會議助理涉及的合規重點：

| 風險點 | Fireflies | Otter | Notion AI |
|--------|-----------|-------|----------|
| **資料儲存地** | 美國（AWS） | 美國（AWS） | 美國 / 區域選擇有限 |
| **跨境傳輸告知** | 須在隱私政策補充 | 須在隱私政策補充 | 須在隱私政策補充 |
| **與會者同意機制** | bot 加入時自動提示（英文） | bot 加入時提示 | 不派 bot，但仍須事先告知 |
| **資料保留設定** | 可自訂 | 可自訂 | 可手動刪除 |
| **DPO 文件可索取** | 是（企業版） | 是（企業版） | 是 |

### 台灣企業實務地雷
1. **未告知與會者錄音 / AI 處理** → 違反 PDPA 第 8 條告知義務。
2. **客戶資料 / 商業機密上傳第三方雲端** → 部分金融、醫療、政府客戶合約禁止。
3. **跨境傳輸** → 需在隱私權政策中明確列出傳輸國（美國），並取得當事人同意。
4. **新法下「自動化決策」揭露義務**：若 AI 摘要會被用於人事 / 績效評估，需另外告知。

> **建議**：中小企業若處理客戶 / 員工敏感資料，應優先選擇可關閉「資料用於模型訓練」的方案（三家都支援，但需手動切換）。

---

## 五、台灣企業視角優劣勢總表

| 評估面向 | Fireflies | Otter | Notion AI |
|---------|-----------|-------|-----------|
| 繁中辨識 | ◎ | △ | ○ |
| 行動項目自動化 | ◎ | ○ | ◎ |
| CRM / 業務整合 | ◎ | ◎ | △ |
| Notion 整合 | ○ | △ | ◎（原生） |
| PDPA 友善度 | △（bot + 美國儲存） | △ | ○（無 bot） |
| 中小企業學習曲線 | 中 | 低 | 高（需先懂 Notion） |
| 台灣本地客服 | 無 | 無 | 無 |

（◎ 強、○ 中等、△ 弱）

---

## 六、我們產品的 3 個最強差異化機會 + MVP 建議

### 機會 1：**台灣本地化合規打包**
- **痛點**：三家競品皆在美國儲存，台灣中型以上企業（特別是金融、醫療、政府供應商）都需要額外法務工作。
- **差異化**：資料留在台灣（GCP asia-east1 / AWS ap-northeast-1）+ 內建《PDPA 同意書範本》一鍵發送與會者。
- **可行性**：高。Whisper 開源 + GCP / AWS 台灣區即可達成。法律範本由台灣律師事務所合作審核。
- **預估優勢**：對需要合規的客戶，這是「能不能簽單」的決定性因素，而非「便不便宜」的優化。

### 機會 2：**繁中商務語境最佳化（含中英夾雜）**
- **痛點**：台灣會議常見「中英夾雜」、「行話 + 英文縮寫」（OKR、ROAS、NPS、CCB），三家工具的辨識準確度都不理想。
- **差異化**：基於 Whisper Large + 台灣商務語料 fine-tune，內建可自訂「公司術語表」（產品名、客戶名、縮寫對照）。
- **可行性**：中等。需收集台灣商務會議語料，建議從 1,000 小時起步。
- **預估優勢**：辨識率 +10–15%，是用戶第一秒就感受到的差異。

### 機會 3：**會後「自動執行」而非只是「自動摘要」**
- **痛點**：三家競品都停在「給你摘要與行動項目」，但真正的時間殺手是「會後手動建任務、寄 follow-up、排下次會議」。
- **差異化**：直接呼叫 Google Calendar / Notion / ClickUp / Asana / Email 完成下一步動作（需用戶確認）。
- **可行性**：中高。MCP / function calling 已成熟，技術上不難，難在 UX 設計避免誤觸。
- **預估優勢**：把「省 30 分鐘整理時間」推進到「省 1 小時行政時間」，價值主張立刻翻倍。

### MVP 功能建議（3 個月內可上線）

1. **繁中＋中英夾雜辨識引擎**（基於 Whisper Large-v3 + 台灣商務語料 LoRA）。
2. **PDPA 同意書一鍵發送**（會議邀請自動帶入同意連結，未同意者不被錄音）。
3. **三步驟會後動作生成**（摘要 → 行動項目 → 一鍵建立 Notion / Google Calendar / Email 草稿）。

> **不做的事**（聚焦）：MVP 階段不做 CRM 整合、不做業務銷售特化、不做多人協作工作區——這些是 v2 的事。

---

## 結語

AI 會議助理已不是「有沒有 AI」的競賽，而是「**誰先解決企業簽單的最後一哩路**」。對台灣市場來說，這條路是：**繁中準度 × PDPA 合規 × 會後自動執行**。

三家競品在這三項上都各有缺角——這正是台灣團隊切入的視窗期。`;

const article = {
  slug: 'ai-meeting-assistants-taiwan-competitive-analysis',
  title: 'AI 會議助理競品全解析：Fireflies vs Otter vs Notion AI，台灣市場切入機會',
  date: '2026-04-18',
  tags: ['AI', '會議助理', '競品分析', 'Fireflies', 'Otter', 'Notion AI', 'PDPA', '台灣市場'],
  sources: [
    { url: 'https://www.lindy.ai/blog/fireflies-ai-pricing', title: 'Fireflies.ai Pricing Breakdown 2026 (Lindy)' },
    { url: 'https://otter.ai/pricing', title: 'Otter.ai Pricing' },
    { url: 'https://www.notion.com/product/ai-meeting-notes', title: 'Notion AI Meeting Notes' },
    { url: 'https://www.notion.com/help/ai-meeting-notes', title: 'Notion AI Meeting Notes Help Center' },
    { url: 'https://cloud.google.com/security/compliance/pdpa-taiwan', title: 'Google Cloud — Taiwan PDPA' },
    { url: 'https://www.is-law.com/en/brief-analysis-of-taiwans-pdpa-amendment/', title: 'Taiwan PDPA 2025 Amendment Analysis' },
    { url: 'https://aiacademy.tw/news-ai-fundamental-act-futurecity/', title: '台灣《人工智慧基本法》產業實戰解讀' },
    { url: 'https://technews.tw/2025/12/30/104ai/', title: '104 推出 AI 職涯平台 (TechNews)' }
  ],
  content
};

(async () => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/features`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(article)
  });
  const text = await r.text();
  console.log('status:', r.status);
  console.log(text);
})();
