# 手機無密碼 LINE 登入 — 實作計畫

## 現狀

前端已使用 LIFF SDK（`liff.login()`），LIFF ID：`2009738746-2qigSpHh`。
當使用者需要登入時，LIFF SDK 跳轉到 LINE Login 網頁，顯示帳號密碼輸入框。

## 目標

**移除帳號密碼輸入介面**，登入頁面只顯示 QR Code。

- **手機**：點擊 QR Code → 開啟 LINE App → 自動登入
- **電腦**：用手機 LINE 掃 QR Code → 登入

---

## 登入頁面設計

### UI（取代現有帳號密碼表單）

```
┌─────────────────────────┐
│                         │
│     ┌───────────┐       │
│     │           │       │
│     │  QR Code  │       │
│     │  (LIFF    │       │
│     │   URL)    │       │
│     │           │       │
│     └───────────┘       │
│                         │
│   📱 手機：點擊 QR Code  │
│      直接用 LINE 開啟    │
│                         │
│   💻 電腦：用 LINE 掃描   │
│      QR Code 登入        │
│                         │
└─────────────────────────┘
```

### QR Code 內容

```
https://liff.line.me/2009738746-2qigSpHh?returnTo=目前頁面路徑
```

LIFF URL 開啟後，LINE App 自動提供身份，不需要輸入任何東西。

---

## 實作步驟

### 1. 產生 QR Code

- 使用 `qrcode` npm 套件 或 前端 library（如 `qrcode.js`）
- 內容：LIFF URL + 當前頁面路徑作為 returnTo 參數
- QR Code 要夠大（至少 200x200px），方便掃描

### 2. QR Code 做成可點擊連結

```html
<a href="https://liff.line.me/2009738746-2qigSpHh?returnTo=/audrey/book/1">
  <img src="動態產生的QR Code" alt="用 LINE 登入" />
</a>
```

- **手機點擊**：OS 偵測到 LIFF URL → 開啟 LINE App → 自動登入 → 導回原頁面
- **電腦點擊**：開啟 LIFF 頁面，在瀏覽器內走 LINE Login 流程（fallback）

### 3. 偵測裝置顯示不同提示

```javascript
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

if (isMobile) {
  // 顯示：「點擊 QR Code，用 LINE 開啟」
} else {
  // 顯示：「用手機 LINE 掃描 QR Code 登入」
}
```

### 4. 移除舊的登入 UI

- 移除 `handleLogin()` 中的 `liff.login()` 呼叫（這個會跳到帳號密碼頁）
- 移除登入按鈕，改為 QR Code 圖片 + 提示文字
- 保留 `liff.init()` 和 `liff.isLoggedIn()` 檢查（用於 LIFF URL 開啟後自動取得 profile）

### 5. LIFF 頁面載入後的登入處理

當使用者透過 QR Code 進入 LIFF 頁面（在 LINE in-app browser 中）：

```javascript
await liff.init({ liffId: LIFF_ID });
if (liff.isLoggedIn()) {
  const profile = await liff.getProfile();
  // 儲存登入狀態
  // 導回 returnTo 頁面
}
```

---

## 額外用途：LINE 群組分享

QR Code 也可以用於 LINE 群組分享導流：
- 老師在 LINE 群組發 QR Code 圖片
- 家長在 LINE 裡長按 QR Code → LINE 辨識 → 開啟 LIFF → 自動登入看繪本
- 跟微信長按 QR Code 的體驗一樣

---

## 前置檢查

在實作前，先確認 LINE Developers Console 設定：
1. LIFF Endpoint URL 正確指向 app.markluce.ai
2. LINE Login Channel 已啟用
3. LIFF 的 Scope 包含 `profile`、`openid`
4. 測試 LIFF URL 在手機上能否正常開啟 LINE App
