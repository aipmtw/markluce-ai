"""Create my_blog table and insert first post."""
import json
from pg8000.native import Connection

conn = Connection(
    host='db.reipdepbltfbfxnjjegy.supabase.co',
    port=5432, database='postgres', user='postgres',
    password='02uL6rlxF2feKlY8', ssl_context=True
)

# Create table
conn.run("""
CREATE TABLE IF NOT EXISTS my_blog (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    tags TEXT[] DEFAULT '{}',
    content TEXT NOT NULL DEFAULT '',
    cover_emoji TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);
""")
print("Table created")

# Enable RLS + anon read
conn.run("ALTER TABLE my_blog ENABLE ROW LEVEL SECURITY;")
try:
    conn.run("""
        CREATE POLICY "anon_read_my_blog" ON my_blog
        FOR SELECT TO anon USING (true);
    """)
    print("RLS policy created")
except Exception as e:
    if 'already exists' in str(e):
        print("RLS policy already exists")
    else:
        raise

# Insert first blog post
slug = 'classroom-to-markdown'
title = 'Google Classroom 太慢？一次對話，整門課搬到本地 Markdown'
tags = ['AI', 'Google Classroom', 'Claude Code', 'Python', 'Markdown']
cover_emoji = '\U0001f680'
content = r"""最近參加一個培訓課程，校方使用 Google Classroom 來管理教材和作業。

打開來看了幾下，第一感覺是——**不太友善，也不太有效率。**

每個頁面要等 15-20 秒才載入完，內容藏在不同層級的摺疊面板裡，想要快速複習幾乎不可能。

於是我興起了一個念頭：**用 AI 把整門課的知識點搬到本地，用 Markdown 格式保存。**

（基於校方的各種政策，課程和機構的細節就不提了。重點是方法本身。）

---

## 踩坑：AI 的直覺方式

我用的是 Claude Code，它有瀏覽器自動化的能力（Chrome MCP），可以直接操作網頁。

所以第一輪，AI 很自然地選擇了「直接操作 Google Classroom」：

- 開啟頁面 → 等 15 秒
- 點開一個項目 → 等 15 秒
- 讀取內容 → 存起來
- 下一個 → 等 15 秒...

我在旁邊看它的操作過程，越看越覺得不對勁。**43 個項目，一個一個點，光是等待時間就超過 10 分鐘。** 加上 Google Classroom 是重度 SPA 架構，JavaScript 渲染不穩定，很多時候點開了但內容還沒出來。

> 花了 30 分鐘，只拿到 1 個單元的資料。

這不是效率問題，是方向問題。

---

## 轉折：叫 AI 去找 Google 自己的解法

我決定不讓 AI 繼續硬幹，而是給它一個新指令：

> 「停下來。上網搜一下，Google 本身有沒有提供批次匯出 Classroom 內容的方法？」

**30 秒後，答案出來了：Google Classroom REST API。**

官方 API 可以程式化地拉取所有課程內容——教材、作業、公告、主題分類——全部一次到手。

這就是整個故事的轉折點：**不要用 AI 幫你點 43 次，要用 AI 找到「不用點的方法」。**

---

## 突破後一路順暢

確定用 API 之後，整個流程變得非常乾淨：

### Google Cloud Console 設定（約 10 分鐘）

1. 建立新專案
2. 啟用 Google Classroom API
3. 設定 OAuth 同意畫面
4. 加入自己的帳號為 test user（**這步很容易忘，忘了會被擋在登入頁**）
5. 建立 Desktop OAuth 憑證，下載 `credentials.json`

### AI 寫腳本 + 執行（約 5 分鐘）

AI 寫了一支 Python 腳本，呼叫四個 API endpoint：

| API 端點 | 拉什麼 |
|---------|--------|
| `topics.list()` | 主題分類 |
| `courseWorkMaterials.list()` | 教材（描述、YouTube、附件） |
| `courseWork.list()` | 作業與測驗 |
| `announcements.list()` | 公告 |

一次執行 → 匯出 1,294 行 JSON。

### JSON 轉 Markdown（約 5 分鐘）

再一支腳本，把 JSON 按主題拆成結構化的 Markdown：

```
course-notes/
├── README.md          ← 課程總覽 + 目錄
├── 00-onboarding.md   ← 報到 + 前測
├── 01-unit-one.md     ← 單元一（教材 + 影片 + 測驗）
├── 02-unit-two.md     ← 單元二
├── ...
└── 08-completion.md   ← 後測 + 結業
```

每個檔案包含完整的教材描述、YouTube 影片連結、Google Forms 測驗連結、學習目標。

**從決定用 API 到全部完成：約 15 分鐘。**

---

## 數字

| 項目 | 數量 |
|------|------|
| 主題 | 9 |
| 教材 | 27 |
| 作業/測驗 | 16 |
| YouTube 影片 | 20+ |
| 外部資源連結 | 30+ |
| 產出 Markdown | 10 個檔案 |

---

## 心得

### 1. 瀏覽器自動化有極限

Google Classroom 是重度 SPA，每次互動都要等 JavaScript 渲染完。瀏覽器自動化在這種場景下效率極低。遇到 SPA，想都不要想，直接找 API。

### 2. 讓 AI「找方法」比「硬做」聰明得多

這次最大的收穫不是技術本身，而是一個思維方式：

**當你看到 AI 在低效地執行任務時，停下來，讓它去搜尋更好的方法。**

AI 的「直覺」是用它手上的工具去做（瀏覽器操作）。但有時候正確的做法是退一步，問「有沒有更好的路」。30 秒的搜尋省了 1 小時的硬幹。

### 3. 官方工具最穩

Google Classroom API 是免費的、完整的、不會被擋的。很多人不知道 Google 提供這些 API，或者覺得設定很麻煩。實際上 OAuth 設定大約 10 分鐘就搞定了。

### 4. 人機分工很自然

- **人做的事**：OAuth 設定（建專案、加 test user、瀏覽器登入授權）
- **AI 做的事**：規劃流程、寫腳本、執行 API、資料轉換

這不是「AI 取代人」的故事，是「人提供判斷，AI 提供執行」的協作。

---

## 一句話總結

> 不要用 AI 幫你點 43 次，要用 AI 找到「不用點的方法」。

成功搬完的那一刻，真的很開心。

---

*工具：Claude Code (Opus 4.6) · Google Classroom API · Python*

*技術細節請參考：[實戰：用 Google Classroom API + AI 把整門課匯出成本地 Markdown](/features/2026-04-google-classroom-api-export-markdown)*"""

# Delete existing if any
conn.run("DELETE FROM my_blog WHERE slug = :slug", slug=slug)

conn.run(
    """INSERT INTO my_blog (slug, title, date, tags, cover_emoji, content)
       VALUES (:slug, :title, '2026-04-17', :tags, :emoji, :content)""",
    slug=slug, title=title, tags=tags, emoji=cover_emoji, content=content
)
print(f"Inserted: {slug}")

# Verify
row = conn.run("SELECT id, slug, title FROM my_blog WHERE slug = :slug", slug=slug)
print(f"Verified: id={row[0][0]}, slug={row[0][1]}, title={row[0][2]}")

conn.close()
