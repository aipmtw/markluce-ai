# Known Bugs — 2026-04-16

## Root Cause: Page Numbering Misalignment

The reader internally uses 1-indexed page numbers where cover=1, first content=2. But admin, audio files, and user expectation all use content-only numbering where first content=1. This off-by-one shifting causes cascading confusion:

- `startReading()` calls `goToPage(2)` → URL shows `/amy/2` → user thinks they're on page 2
- Admin says "Page 1 of 14" for the same content
- Audio file is `page-1-zh.mp3` for the same content
- `playPageAudio()` uses `audioNum = pageNum - 1` to compensate

**The fix**: Align the reader to match admin numbering. Cover gets no page number (URL: `/amy/`). Content pages are 1-indexed (URL: `/amy/1` = admin page 1 = `page-1-zh.mp3`).

### New page model (reader internal):

```
currentPage = 0    → cover     → URL: /amy/       → no audio
currentPage = 1    → story 1   → URL: /amy/1      → page-1-zh.mp3
currentPage = 2    → story 2   → URL: /amy/2      → page-2-zh.mp3
...
currentPage = 14   → story 14  → URL: /amy/14     → page-14-zh.mp3
currentPage = N+1  → end screen (universal, not in data)
```

This means:
- `pages[0]` = cover, `currentPage = 0`
- `pages[i]` = story, `currentPage = i` (same as array index)
- Audio: `page-${currentPage}-zh.mp3` (no more `-1` offset)
- Admin `/admin/amy/1` and reader `/amy/1` show the same content

## Bug 2: No back-to-cover button
**Where**: Reader story pages
**Fix**: Add a 📖 button in toolbar → `goToPage(0)`

## Bug 3: Page indicator shows "1 / 15" text instead of dots
**Where**: Reader bottom toolbar
**Fix**: Replace with dot navigation. Content pages only (14 dots). Active dot highlighted. Clickable to jump.

## Bug 4: No text visible in 中＋EN (bilingual) mode on content pages
**Where**: Reader content pages (e.g., `/detective-cat/1`)
**Symptom**: When language selector is set to 中＋EN (bilingual/both), no text is displayed. Switching to 中文 or English individually shows text correctly.
**Root cause**: The injected CSS rule `body:not(.lang-zh):not(.lang-en) .text-zh, .text-en { display:none }` hides `.text-zh` and `.text-en` in bilingual mode (when body has no lang class). But the story page content uses `.text-zh` and `.text-en` div classes — these are the same class names being hidden by the bilingual CSS rule meant only for the cover/end screen's `<span class="text-zh">` elements.
**Fix**: The lang-aware spans on cover/stats/end should use different class names (e.g., `lang-zh-only`, `lang-en-only`, `lang-both-only`) to avoid conflicting with the existing `.text-zh` / `.text-en` classes used by story page content divs.

## Bug 5: Cover credits not respecting language selector
**Where**: Reader cover page (e.g., `/detective-cat/`)
**Symptom**: In English mode, cover still shows Chinese credits "審閱：Mark ｜ 共同編輯：Luce (AI)" instead of English equivalent.
**Root cause**: The credits line in renderPage cover template uses `${BOOK.credits}` directly without i18n wrapping.
**Fix**: Wrap credits with `i18n-zh` / `i18n-en` spans displaying the appropriate language version.

## Bug 6: End screen needs proper URL and admin representation
**Where**: Reader and admin
**Symptom**:
- Reader: "故事結束 The End ▶" on last page navigates to `/robot-dream/16` (a number that doesn't correspond to any data page)
- Admin: `/admin/robot-dream` overview doesn't show the end screen as a row (unlike cover which has its own row)
- Admin: `/admin/robot-dream/16` tries to render an invalid page

**Root cause**: The universal end screen exists only in reader.js runtime — it has no URL identity and no admin representation.

**Fix — Reader URL**: End screen should use `/slug/end` instead of `/slug/{N+1}`. This matches the cover pattern (`/slug/` = cover, `/slug/1` = page 1, `/slug/end` = end screen). The "故事結束 The End ▶" button navigates to `/slug/end`.

**Fix — Admin overview**: Add an "end" row at the bottom of the overview table (like cover at the top). Shows type=end, no page number, no audio, no word count — just "Universal end screen" with a link to `/admin/slug/end` detail view.

**Fix — Admin detail**: `/admin/slug/end` renders a preview of the universal end screen as the user sees it (credits, bookshelf link), similar to how `/admin/slug/cover` shows the cover preview.

### Updated page model:
```
Reader URL         Admin URL              Description
/slug/             /admin/slug/cover      Cover (page 0)
/slug/1            /admin/slug/1          Content page 1
/slug/2            /admin/slug/2          Content page 2
...
/slug/N            /admin/slug/N          Last content page
/slug/end          /admin/slug/end        Universal end screen
```

### End screen content design:

The end screen should feel like a **celebration + invitation**, not just a dead-end with a link.

```
[Emoji: 🎉]

恭喜你讀完了！/ Congratulations!

{Book Title zh}
{Book Title en}

你剛讀完 {N} 頁的精彩故事！
You just finished {N} pages of adventure!

[📚 探索更多繪本 / Explore More Stories ▶]  ← strong CTA to bookshelf

故事由 Luce (AI) 共同編輯 · 審閱：Mark
由 MarkLuce.ai 出品
{version}
```

Key elements:
- **Congrats message**: Celebrates the achievement of finishing a book (important for kids)
- **Book recap**: Shows the title they just read + page count
- **Strong CTA**: "探索更多繪本" button styled like the cover Start Reading button (green, prominent)
- **Credits**: Same as current, respects language selector
- **All bilingual**: Every text element uses i18n spans

## Fix Plan

### reader.js changes:
1. **currentPage**: Change from 1-indexed to 0-indexed (cover=0, content=1..N)
2. **URL mapping**: `/slug/` = cover (page 0), `/slug/1` = page 1, etc.
3. **Audio**: `page-${currentPage}-zh.mp3` directly (remove the `-1` offset hack)
4. **Page indicator**: Replace text with dots for content pages only
5. **Back-to-cover button**: 📖 in toolbar → `goToPage(0)`
6. **startReading()**: `goToPage(1)` — now correct and intuitive
7. **Demo gate**: `DEMO_MAX = 3` means pages 1-3 are free (same as before)
