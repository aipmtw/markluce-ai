# aipm048 — Line 請假小幫手（MCP 架構設計）

> 透過 LINE 聊天介面提供便捷的請假服務，員工無需登入企業系統即可快速完成請假申請與假單查詢。
> 本專案採用 **MCP (Model Context Protocol) 架構**，讓 LLM 能透過標準化工具介面操作 HR / 假勤 / 通知 / 檔案等子系統。

---

## 系統架構總覽（Flowchart）

```mermaid
flowchart TB
    subgraph Client["📱 使用者端"]
        U[員工<br/>LINE App]
        M[主管<br/>LINE App]
    end

    subgraph LINE["LINE Platform"]
        LMA[LINE Messaging API<br/>Webhook]
        LFM[Flex Message<br/>UI 元件]
    end

    subgraph BotServer["🤖 Bot Server (Node.js / Python)"]
        WH[Webhook Handler]
        SM[Session / State Manager]
        NLU[訊息分派器<br/>意圖辨識]
        LLM[LLM Agent<br/>Claude / GPT]
        MCPC[MCP Client]
    end

    subgraph MCPServers["🔌 MCP Servers"]
        HR[HR MCP Server<br/>員工查詢 / 假別餘額]
        LV[Leave MCP Server<br/>假單 CRUD / 簽核]
        NT[Notification MCP Server<br/>推播主管 / 通知申請者]
        FS[File MCP Server<br/>診斷書 / 證明上傳]
    end

    subgraph Backend["🗄️ 後端資料層"]
        DB[(PostgreSQL<br/>employees / leaves /<br/>balances / approvals)]
        S3[(Object Storage<br/>S3 / GCS<br/>附件檔案)]
        HRSYS[(企業 HR 系統<br/>SAP / 人事整合)]
    end

    U -->|文字 / 選單| LMA
    LMA -->|webhook event| WH
    WH --> SM
    SM --> NLU
    NLU -->|複雜語句| LLM
    NLU -->|明確意圖| MCPC
    LLM -->|tool call| MCPC

    MCPC --> HR
    MCPC --> LV
    MCPC --> NT
    MCPC --> FS

    HR --> DB
    HR --> HRSYS
    LV --> DB
    NT --> LMA
    FS --> S3

    LMA -->|推播假單卡片| LFM
    LFM --> M
    LFM --> U
```

---

## 序列圖一：請假申請流程

```mermaid
sequenceDiagram
    autonumber
    actor U as 員工
    participant L as LINE Platform
    participant B as Bot Server<br/>(Webhook + LLM)
    participant MC as MCP Client
    participant HR as HR MCP Server
    participant LV as Leave MCP Server
    participant FS as File MCP Server
    participant NT as Notification MCP Server
    participant DB as PostgreSQL
    actor M as 主管

    U->>L: 點選「請假申請」/ 輸入「我要請假」
    L->>B: webhook event (userId, message)
    B->>MC: tools/list — 取得可用工具
    MC->>HR: get_employee(line_user_id)
    HR->>DB: SELECT employee
    DB-->>HR: employee_id, dept, manager
    HR-->>MC: employee 資料
    MC-->>B: 已綁定員工

    B->>L: 推送假別選單 (Flex Message)
    L->>U: 顯示假別 (特休 / 病假 / 事假...)
    U->>L: 選擇「特休」
    L->>B: postback: leave_type=annual
    B->>MC: get_leave_balance(employee_id, "annual")
    MC->>HR: get_leave_balance
    HR->>DB: SELECT balance
    HR-->>MC: annual_remaining=10
    MC-->>B: 餘額 10 天

    B->>L: 詢問起訖日期 (datetime picker)
    L->>U: 顯示日期選擇器
    U->>L: 2026-04-22 ~ 2026-04-23
    L->>B: postback: date range
    B->>L: 詢問請假事由
    U->>L: 「家庭旅遊」
    L->>B: 文字訊息

    opt 上傳附件
        U->>L: 上傳診斷書 (image/pdf)
        L->>B: file event
        B->>MC: upload_attachment(file)
        MC->>FS: store_file
        FS-->>MC: file_url
    end

    B->>L: 顯示確認卡片 (假別 / 日期 / 事由)
    L->>U: 確認 / 取消
    U->>L: 確認送出
    L->>B: postback: confirm

    B->>MC: create_leave_request(payload)
    MC->>LV: create_leave_request
    LV->>DB: INSERT INTO leaves<br/>status=pending
    DB-->>LV: leave_id=L20260418-001
    LV-->>MC: {leave_id, current_stage:"pending"}
    MC-->>B: 已建立

    B->>MC: notify_approver(leave_id, manager)
    MC->>NT: send_approval_request
    NT->>L: push Flex Message → 主管
    L->>M: 顯示待簽核卡片 (核准 / 駁回)

    B->>L: 推送「申請成功」訊息
    L->>U: ✅ 假單 L20260418-001 已送出，等待 王經理 簽核

    Note over M,DB: 主管在 LINE 直接點「核准」<br/>觸發另一個 webhook，更新 DB → 通知員工
```

---

## 序列圖二：查詢假單流程

```mermaid
sequenceDiagram
    autonumber
    actor U as 員工
    participant L as LINE Platform
    participant B as Bot Server<br/>(Webhook + LLM)
    participant MC as MCP Client
    participant HR as HR MCP Server
    participant LV as Leave MCP Server
    participant DB as PostgreSQL

    U->>L: 點選「查詢假單」/ 輸入「我請過哪些假」
    L->>B: webhook event
    B->>MC: get_employee(line_user_id)
    MC->>HR: get_employee
    HR->>DB: SELECT employee
    HR-->>MC: employee_id
    MC-->>B: 員工身分確認

    B->>L: 推送查詢條件選單<br/>(依狀態 / 假別 / 日期 / 餘額)
    L->>U: 顯示選單
    U->>L: 選擇「依日期區間」
    L->>B: postback: query_type=by_date_range

    B->>L: 顯示日期選擇器
    U->>L: 2026-01-01 ~ 2026-04-18
    L->>B: postback: date range

    B->>MC: list_leave_records(employee_id, filter)
    MC->>LV: list_leave_records
    LV->>DB: SELECT * FROM leaves<br/>WHERE employee_id=? AND date BETWEEN ?
    DB-->>LV: 5 筆假單
    LV-->>MC: leave_records[5]
    MC-->>B: 查詢結果

    B->>L: 推送 Flex Message Carousel<br/>(每張卡片 = 一筆假單)
    L->>U: 顯示假單卡片清單

    U->>L: 點選某張假單「查看詳情」
    L->>B: postback: leave_id=L20260315-007
    B->>MC: get_leave_detail(leave_id)
    MC->>LV: get_leave_detail
    LV->>DB: SELECT leave + approval_history
    LV-->>MC: 假單詳情 + 簽核歷程
    MC-->>B: detail
    B->>L: 推送詳情卡片<br/>(假別 / 起訖 / 簽核軌跡)
    L->>U: 顯示詳情

    opt 查看餘額
        U->>L: 點選「剩餘假別天數」
        L->>B: postback: query_type=balance
        B->>MC: get_leave_balance(employee_id)
        MC->>HR: get_leave_balance (all types)
        HR->>DB: SELECT balances
        HR-->>MC: {annual:10, sick:14, personal:7}
        MC-->>B: balance
        B->>L: 推送餘額卡片
        L->>U: 特休 10 / 病假 14 / 事假 7
    end
```

---

## MCP 工具定義（給 LLM 用）

| MCP Server | Tool Name | 說明 |
|-----------|-----------|------|
| HR | `get_employee` | 由 LINE userId 取得員工資料 |
| HR | `get_leave_balance` | 查詢假別餘額 |
| Leave | `create_leave_request` | 建立假單 |
| Leave | `list_leave_records` | 列出假單（可帶 filter） |
| Leave | `get_leave_detail` | 取得單筆假單詳情 + 簽核軌跡 |
| Leave | `cancel_leave_request` | 取消假單 |
| Leave | `approve_leave` / `reject_leave` | 主管簽核 |
| Notification | `send_approval_request` | 推送待簽核卡片給主管 |
| Notification | `notify_employee` | 通知員工簽核結果 |
| File | `upload_attachment` | 上傳證明文件至 S3/GCS |

---

## 為什麼用 MCP 架構？

1. **可換 LLM**：今天用 Claude，明天換 GPT-5、Gemini，工具介面不變。
2. **HR 系統可獨立替換**：把 HR MCP Server 換成串接 SAP / 人事系統，LINE 端零改動。
3. **可被其他客戶端複用**：同一組 MCP Server 也能被 Claude Desktop、內部後台、Slack Bot 取用。
4. **權限收斂**：所有資料庫存取集中在 MCP Server 層，便於做稽核與 PDPA 合規控制。
