# Audio-Page Alignment Bug & Admin Detail Page

## The Bug — Audio Off-by-One

In the reader (e.g., `ocean-explorer/js/app.js:581`), audio paths use `pageNum = currentPage + 1`. Since the cover is `pages[0]`, the cover maps to `page-1-zh.mp3`, and the first *content* page maps to `page-2-zh.mp3`. But TTS generation likely created audio starting from content — meaning `page-1-zh.mp3` was generated for the first content page's text. Result: every content page plays the *next* page's audio, and the cover tries to play content audio it shouldn't.

## Industry Practice — Cover vs Page 1

In publishing, the **cover is not page 1**. Page numbering starts from the first interior page. In children's digital books specifically:
- **Cover** = splash/index (no TTS audio)
- **Page 1** = first content spread (audio starts here)
- This matches Kindle, Apple Books, Epic!, and most digital storybook apps

## Advice

### 1. Fix the page model

Keep `pages[0]` as cover with `type: 'cover'`. Audio should only play for content pages. The audio path for content page at index `i` should be `page-{i}-zh.mp3` (where `i` starts at 1 for the first content page). This means: skip audio when `currentPage === 0` (cover), and use `pageNum = currentPage` (not `+1`) for content pages.

### 2. Admin book detail page

Create `/admin/{slug}/` as a route in the admin SPA (not a separate HTML file — use URL parsing). Show:
- Row 0: Cover (image thumbnail, no audio expected)
- Rows 1–N: Content pages with columns: `#`, `中文 text preview`, `EN text preview`, `ZH MP3 ✓/✗ + duration`, `EN MP3 ✓/✗ + duration`, `Image ✓/✗`
- Detect duration by loading each MP3 via `Audio()` object and reading `.duration` on `loadedmetadata`

### 3. Naming convention going forward

`page-{N}-{lang}.mp3` where N=1 is first content page. No audio for cover. This aligns with industry standard.

### 4. Cover Page UX — Book Summary + Start Reading

**Rephrased understanding:**
The cover has no TTS audio of its own, but it should serve as the book's landing page — showing the reader what's ahead before they commit. Key info to surface: total content pages, total audio tracks (zh + en), and estimated listening time. The reader needs a clear entry point: either auto-play into page 1, or a deliberate **[Start Reading]** button.

**Industry practice:**
- **Epic!, Vooks, Moonbug**: Cover shows title + a prominent **"Read" / "Play"** button. No auto-play — the child (or parent) initiates.
- **Apple Books / Kindle Kids**: Tapping the cover opens to page 1; audio narration starts on explicit play.
- **Khan Academy Kids**: Shows a brief summary card (page count, duration) with a **"Start"** button.
- The consensus: **explicit start, not auto-play**. Auto-play is disorienting — kids may not be ready, parents may want to set up the environment first.

**Advice:**

The cover page should display:
- Book title (中文 + EN), age group, cover illustration
- **Book stats bar**: `16 pages · 16 ZH audio · 16 EN audio · ~5 min 雙語`
- A prominent **[開始閱讀 Start Reading ▶]** button that navigates to page 1 and begins audio playback in the selected language mode
- Language mode selector (中文 / English / 雙語) visible on the cover so the reader chooses before starting
- Optionally: a **[Auto-play 自動翻頁]** toggle on the cover, defaulting to OFF

This keeps the cover as a "lobby" — zero audio, full context, explicit start. Once the reader taps Start, page 1 loads and audio begins immediately.
