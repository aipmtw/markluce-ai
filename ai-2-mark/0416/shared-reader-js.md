# Shared reader.js — Eliminate 36 Identical Copies

## Rephrased Understanding

Currently each of the 36 books has its own `/{slug}/js/reader.js`, but all 36 files are **byte-for-byte identical**. The reader code is already slug-agnostic — it reads `SLUG` from `BOOK.slug` in `data.js`. This means any bug fix (like the audio off-by-one) requires copying the fix to 36 files. Since the bookshelf is one app, reader.js should be one shared file.

**What varies per book (must stay per-book):**
- `data.js` — story text, page data, book metadata (unique per book)
- `css/style.css` — theme colors, background gradients (unique per book)
- `sw.js` — service worker cache paths include the slug (unique per book)
- `index.html` — references slug-specific paths for CSS, manifest, etc.
- `manifest.json` — PWA name, start_url, icons

**What is identical (should be shared):**
- `reader.js` — all rendering, navigation, audio playback, auth, demo gate logic

## Advice

### Move reader.js to a shared location

```
public/shared/reader.js    ← single source of truth
```

Update each book's `index.html` to reference the shared path:
```html
<!-- Before -->
<script src="/flying-bicycle/js/reader.js?v=3"></script>

<!-- After -->
<script src="/shared/reader.js?v=4"></script>
```

`data.js` stays per-book — it defines `BOOK` with slug, pages, etc. The shared `reader.js` reads `BOOK.slug` at runtime, so no code change needed in reader.js itself.

### Service worker consideration

Each book's `sw.js` currently caches `/{slug}/js/reader.js`. Update to cache `/shared/reader.js` instead. This also means all books share the same cached reader — one download serves all books offline.

### Migration steps

1. Copy `reader.js` to `public/shared/reader.js`
2. Update all 36 `index.html` files: change script src to `/shared/reader.js?v=4`
3. Update all 36 `sw.js` files: change cached path from `/{slug}/js/reader.js` to `/shared/reader.js`
4. Optionally delete the 36 individual `/{slug}/js/reader.js` copies
5. Bump service worker cache version to force refresh

### Future opportunity

Same pattern can apply if `style.css` becomes templatized (CSS variables set in `data.js` or `index.html`, shared base stylesheet). But that's a bigger refactor — reader.js is the quick win since it's already identical.
