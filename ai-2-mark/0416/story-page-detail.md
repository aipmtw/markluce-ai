# Admin Story Page Detail View

## Rephrased Understanding

The current `/admin/{slug}` shows a table of all pages with MP3 durations — great for overview. But you want to **drill down into a single page** by clicking on any row. For example, clicking on page 2's text "Amy 是二年三班最安靜的女孩..." should navigate to `/admin/amy/2` and show that page's full detail:

- Full Chinese text (not truncated)
- Full English text
- Character/word counts with spec check
- ZH MP3: playable audio + exact duration
- EN MP3: playable audio + exact duration
- Emoji/illustration info
- Navigation: prev/next page links

The `/admin/{slug}` book overview should also add a **PAGE** column or make the `#` column clickable, linking each row to `/admin/{slug}/{pageNum}`.

## Industry Reference

This is similar to a CMS page editor — think WordPress post list → click to edit a single post. In our case it's read-only QA, not editing, but the drill-down pattern is the same.

## Advice

### URL structure

```
/admin/{slug}          → book overview (existing)
/admin/{slug}/cover    → cover page preview (as user sees it) + stats
/admin/{slug}/{page}   → single page detail (page number, 1-indexed from first content page)
```

Both can be served by the same `book.html` via Vercel rewrite. The JS reads the URL to decide which view to render:
- `/admin/amy` → overview mode (current behavior)
- `/admin/amy/cover` → cover preview: renders the cover exactly as the reader shows it (title, subtitle, emoji, credits, stats bar, Start Reading button), plus admin-only info (audio file summary, spec info). This makes it easy to discuss "what the user sees on landing" without switching to the reader.
- `/admin/amy/2` → page detail mode (content page 2)

### Vercel rewrite

Add one more rewrite:
```json
{ "source": "/admin/:slug/:page", "destination": "/admin/book.html" }
```

### Cover preview (`/admin/{slug}/cover`) should show

1. **Visual preview**: Render the cover as the reader shows it — background color, emoji scene, title (中+EN), subtitle, credits, version. Use the book's actual CSS variables if possible, or approximate with inline styles.
2. **Stats bar**: Same as reader cover — `14 pages · 14 ZH audio · 14 EN audio · ~8:30 bilingual`
3. **[Start Reading] button**: Preview only (not functional), shows what the user will see
4. **Admin info below preview**: Audio summary, spec info, link to page 1 detail
5. **Navigation**: `↑ Back to book overview` + `Page 1 →`

### Page detail view (`/admin/{slug}/{N}`) should show

1. **Header**: Book title + "Page 2 of 14" with prev/next arrows
2. **Visual preview**: Render the page as the reader shows it — emoji scene, 中文 text, English text, styled similarly to the actual reader
3. **Full text**: Complete 中文 and English text (no truncation), with character/word counts and spec compliance badges
4. **Audio players**: Inline `<audio>` controls for both ZH and EN MP3 with exact duration
5. **Audio file info**: File path, file size, duration
6. **Navigation**: `← Cover` / `← Page 1` / `Page 3 →` links, plus `↑ Back to book overview`

### Book overview changes

- Make the `#` column a link: `<a href="/admin/{slug}/cover">cover</a>` for row 1, `<a href="/admin/{slug}/{N}">{N}</a>` for content pages
- Make the 中文 text cell clickable too (more intuitive since you naturally click on the text you want to inspect)

### Implementation plan

1. Update `vercel.json` — add `/admin/:slug/:page` rewrite
2. Update `book.html` JS — detect URL segment: no page → overview, `cover` → cover preview, number → page detail
3. In overview mode — make `#` and 中文 text cells link to detail views
4. Cover preview — render visual mock of reader cover + admin info
5. Page detail — render visual mock of reader page + full text + audio players + navigation
