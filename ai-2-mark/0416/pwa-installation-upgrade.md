# PWA Installation & Auto-Upgrade Strategy

## Current State (broken)
- Root manifest.json is a leftover from Mei's book — wrong name/icon
- Per-book HTML files don't register their own sw.js
- No upgrade prompt mechanism

## Decision: One App-Level PWA
- Users install "Luce 繪本誌" once at app.markluce.ai
- Not 36 individual book PWAs
- One SW manages bookshelf + shared reader.js
- Per-book SWs handle offline audio precaching only

## Implementation Plan
1. Fix root manifest.json — "Luce 繪本誌" branding
2. Fix root sw.js — precache bookshelf + shared files
3. Per-book index.html — register per-book sw.js for audio caching
4. Add upgrade toast: "新版本已準備好 — 點擊更新"
