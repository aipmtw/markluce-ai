import json, urllib.request

SUPABASE_URL = "https://reipdepbltfbfxnjjegy.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaXBkZXBibHRmYmZ4bmpqZWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTUxMjgsImV4cCI6MjA4OTEzMTEyOH0.yEoDps8Fni0x5CKOCsL5zdj0n4if32fr0UGXcdsEfSo"

content = """## 前言

Google Classroom 上的課程內容散落在不同頁面、不同層級的展開面板裡，每頁載入動輒 15-20 秒。想快速複習找不到重點，想讓 AI 幫你整理——它連頁面都讀不順。

這篇文章記錄一個真實案例：**把一門 9 個主題、43 個項目的完整線上課程，用 Google Classroom API 一次匯出，再用 AI 轉成結構化的本地 Markdown 檔案。** 全程約 15 分鐘。

如果你正在上任何 Google Classroom 的課程，這個方法都適用。

---

## 為什麼不用瀏覽器自動化？

第一反應通常是用瀏覽器自動化（Selenium、Playwright、或 Claude Code 的 Chrome MCP）直接爬頁面。實測結果：

| 問題 | 影響 |
|------|------|
| Google Classroom 是重度 SPA | 頁面渲染依賴大量非同步 JavaScript，DOM 結構不穩定 |
| 每頁載入 15-20 秒 | 43 個項目逐一點開至少要 10 分鐘純等待 |
| 內容隱藏在摺疊面板 | 需要模擬點擊展開，時序控制困難 |
| 登入狀態管理 | Google 帳號的 cookie 和 session 處理複雜 |

> **結論：瀏覽器自動化打不過 Google Classroom 的 SPA 架構。用官方 API 才是正解。**

---

## Step 1：Google Cloud Console 建立專案

到 [Google Cloud Console](https://console.cloud.google.com) 操作：

### 1.1 建立新專案

1. 點擊頂部的專案選擇器 → **New Project**
2. 輸入專案名稱（例如 `classroom-export`）
3. 點 **Create**

### 1.2 啟用 Google Classroom API

1. 左側選單 → **APIs & Services** → **Library**
2. 搜尋 **Google Classroom API**
3. 點進去 → **Enable**

### 1.3 設定 OAuth 同意畫面

1. 左側選單 → **Google Auth Platform** → **Audience**（或 **APIs & Services** → **OAuth consent screen**）
2. 選擇 **External** → **Create**
3. 填寫應用名稱、支援信箱
4. Scopes 頁面可先略過（腳本會自行請求）
5. **重要：加入 Test User**
   - 在 **Test users** 區塊點 **+ Add users**
   - 輸入你用來登入 Google Classroom 的 Gmail 地址
   - 儲存

> ⚠️ **為什麼需要 Test User？** OAuth app 在測試模式下（未發布到正式環境），只有被列為 test user 的帳號才能通過 Google 登入授權。忘記這步會在登入時看到 "Access blocked" 錯誤。

### 1.4 建立 OAuth 憑證

1. 左側選單 → **APIs & Services** → **Credentials**
2. 點 **+ Create Credentials** → **OAuth client ID**
3. Application type 選 **Desktop app**
4. 名稱隨意（例如 `classroom-export`）
5. 點 **Create**
6. 下載 JSON → 存為 `credentials.json`

到這裡，Google Cloud Console 的設定全部完成。

---

## Step 2：安裝 Python 套件

```bash
pip install google-api-python-client google-auth-oauthlib
```

只需要這兩個套件。

---

## Step 3：寫提取腳本

以下是完整的提取腳本，一次拉取課程的所有內容：

```python
# extract_classroom.py
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os

SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
    'https://www.googleapis.com/auth/classroom.announcements.readonly',
    'https://www.googleapis.com/auth/classroom.topics.readonly',
]

def auth():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
        creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as f:
            f.write(creds.to_json())
    return creds

def main():
    service = build('classroom', 'v1', credentials=auth())

    # 列出所有課程
    courses = service.courses().list().execute().get('courses', [])
    print("你的課程：")
    for i, c in enumerate(courses):
        print(f"  [{i}] {c['name']} (id: {c['id']}, 狀態: {c.get('courseState')})")

    idx = int(input("選擇課程編號: "))
    course_id = courses[idx]['id']

    # 一次拉取所有內容
    data = {
        'course': courses[idx],
        'topics': service.courses().topics()
            .list(courseId=course_id).execute().get('topic', []),
        'materials': service.courses().courseWorkMaterials()
            .list(courseId=course_id).execute()
            .get('courseWorkMaterial', []),
        'coursework': service.courses().courseWork()
            .list(courseId=course_id).execute()
            .get('courseWork', []),
        'announcements': service.courses().announcements()
            .list(courseId=course_id).execute()
            .get('announcements', []),
    }

    with open('classroom_export.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\\n匯出完成！")
    print(f"  主題: {len(data['topics'])}")
    print(f"  教材: {len(data['materials'])}")
    print(f"  作業/測驗: {len(data['coursework'])}")
    print(f"  公告: {len(data['announcements'])}")

if __name__ == '__main__':
    main()
```

### 執行流程

```bash
python extract_classroom.py
```

1. 首次執行會自動開啟瀏覽器 → Google 登入頁
2. 用你的 Classroom 帳號登入並授權
3. 腳本自動拉取所有內容 → 存為 `classroom_export.json`
4. 之後再執行會使用快取的 `token.json`，不需重新登入

---

## Step 4：用 AI 轉換成 Markdown

拿到 `classroom_export.json` 後，丟給 AI（Claude Code、ChatGPT、或任何你慣用的工具）處理：

### 提示詞範例

```
讀取 classroom_export.json，按照 topics 分類，為每個主題生成一個 markdown 檔案。

每個檔案包含：
- 主題名稱作為標題
- 該主題下所有教材的標題、描述
- YouTube 影片連結（從 materials.link 欄位提取）
- Google Forms 連結（測驗/作業）
- 學習目標說明

另外生成一個 README.md 作為課程總覽和目錄。
輸出到 ./course-notes/ 目錄。
```

### 產出結構

```
course-notes/
├── README.md          ← 課程總覽 + 各單元目錄
├── 00-onboarding.md   ← 報到、前測、社群連結
├── 01-unit-one.md     ← 單元一（教材 + 影片 + 測驗）
├── 02-unit-two.md     ← 單元二
├── ...
└── 08-completion.md   ← 後測 + 結業
```

每個 Markdown 檔案都是乾淨的、可離線閱讀的本地檔案。你可以：
- 用 VS Code 搜尋全課程關鍵字
- 用 `grep` 快速找到特定影片連結
- 丟進 NotebookLM 做進一步整理
- 直接交給 AI 幫你複習重點、準備考試

---

## API 端點速查表

| 端點 | 用途 | 回傳內容 |
|------|------|---------|
| `courses.list()` | 列出所有課程 | 課程名稱、ID、狀態（ACTIVE/ARCHIVED） |
| `courses.topics.list()` | 課程主題分類 | 主題名稱、排序 |
| `courses.courseWorkMaterials.list()` | 教材 | 標題、描述、附件（YouTube/文件/連結） |
| `courses.courseWork.list()` | 作業與測驗 | 標題、描述、類型、截止日期 |
| `courses.announcements.list()` | 公告 | 公告內容、附件 |

### 需要的 OAuth Scopes

```python
SCOPES = [
    'classroom.courses.readonly',
    'classroom.courseworkmaterials.readonly',
    'classroom.coursework.me.readonly',
    'classroom.announcements.readonly',
    'classroom.topics.readonly',
]
```

全部都是唯讀權限，不會修改課程內容。

---

## 安全提醒

| 檔案 | 敏感程度 | 處理方式 |
|------|---------|---------|
| `credentials.json` | 高 — OAuth 客戶端密鑰 | 加入 `.gitignore`，不要上傳 |
| `token.json` | 高 — 登入 token | 加入 `.gitignore`，不要上傳 |
| `classroom_export.json` | 中 — 課程內容 | 視課程是否有隱私內容決定 |
| `course-notes/*.md` | 低 — 整理後的筆記 | 自由使用 |

```bash
# .gitignore
credentials.json
token.json
```

---

## 實測數據

以一門 9 主題、43 項目的完整課程為例：

| 項目 | 數量 |
|------|------|
| 主題 (Topics) | 9 |
| 教材 (Materials) | 27 |
| 作業/測驗 (CourseWork) | 16 |
| YouTube 影片連結 | 20+ |
| 外部資源連結 | 30+ |
| 產出 Markdown 檔案 | 10 |
| JSON 匯出行數 | 1,294 |
| **Google Cloud 設定時間** | **約 10 分鐘** |
| **腳本執行時間** | **約 30 秒** |
| **AI 轉 Markdown 時間** | **約 5 分鐘** |

---

## 常見問題

**Q：已封存 (Archived) 的課程也能匯出嗎？**
A：可以。API 對已封存課程的唯讀存取完全正常。

**Q：我不是老師，只是學生，可以用嗎？**
A：可以。只要你是課程成員（學生或老師），API 就能讀取你有權限看到的所有內容。

**Q：需要付費嗎？**
A：不需要。Google Cloud Console 的 Classroom API 免費使用，沒有呼叫次數限制（合理範圍內）。

**Q：OAuth app 需要發布嗎？**
A：個人使用不需要。保持 test mode，把自己加為 test user 即可。只有要讓其他人使用時才需要走 Google 的驗證發布流程。

**Q：`token.json` 會過期嗎？**
A：會，但腳本已內建自動刷新。如果遇到授權錯誤，刪除 `token.json` 重新執行即可。

---

## 結語

Google Classroom 的 SPA 介面讓瀏覽器自動化幾乎行不通，但官方 API 提供了完整的程式化存取。整個流程的關鍵步驟其實只有一個：**在 Google Cloud Console 正確設定 OAuth 憑證和 test user。** 之後的事——寫腳本、跑 API、轉格式——都可以交給 AI 完成。

從混亂的線上教室到乾淨的本地 Markdown，一次對話就夠了。"""

article = {
    "slug": "google-classroom-api-export-markdown",
    "title": "實戰：用 Google Classroom API + AI 把整門課匯出成本地 Markdown",
    "date": "2026-04-17",
    "tags": ["Google Classroom", "Google Cloud Console", "API", "Python", "Markdown", "教學"],
    "sources": [
        {"url": "https://developers.google.com/classroom/reference/rest", "title": "Google Classroom API Reference"},
        {"url": "https://console.cloud.google.com", "title": "Google Cloud Console"},
        {"url": "https://developers.google.com/classroom/guides/auth", "title": "Google Classroom API: Authorization"},
        {"url": "https://developers.google.com/identity/protocols/oauth2", "title": "Google OAuth 2.0 Overview"},
        {"url": "https://developers.google.com/classroom/reference/rest/v1/courses.courseWorkMaterials/list", "title": "courseWorkMaterials.list API"},
        {"url": "https://developers.google.com/classroom/reference/rest/v1/courses.courseWork/list", "title": "courseWork.list API"}
    ],
    "content": content
}

data = json.dumps(article, ensure_ascii=False).encode('utf-8')
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/features",
    data=data,
    headers={
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode('utf-8'))
        print(json.dumps({"status": "ok", "id": result[0]["id"], "slug": result[0]["slug"]}, indent=2))
except urllib.error.HTTPError as e:
    print(f"Error {e.code}: {e.read().decode('utf-8')}")
