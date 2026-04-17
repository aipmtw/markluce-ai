# Every Book — End Page Redesign

## Rephrased Understanding

The current "end" page in each book's `data.js` is actually the **last story page** — it contains real narrative text (e.g., Amy writing in her diary). It's mislabeled as `type: 'end'` when it should be `type: 'story'`.

Meanwhile, the **actual end screen** — the "brought to you by" credits + bookshelf link — is hardcoded in `reader.js`'s `renderPage()` for `type === 'end'`. This end screen currently shows:
- "— 故事結束 —"
- 回到書架 CTA (link to app.markluce.ai)
- "故事由 Luce (AI) 共同編輯 · 審閱：Mark"
- "由 MarkLuce.ai 出品"

The issue: the last story content and the closing credits are conflated into one page. The story's final text gets `type: 'end'` treatment (no audio, no word count in admin), losing its content status.

## Advice

### Separate concerns: last story page vs. universal end screen

**Step 1: Fix data.js for all 36 books**
- Change the last page from `type: 'end'` to `type: 'story'`
- This restores it as a real content page with audio, word count, spec checking

**Step 2: Add a universal end screen in reader.js**
- After the last `data.js` page, the reader auto-appends a universal closing screen
- This screen is NOT in `data.js` — it's rendered by the reader when navigating past the last page
- Content:

```
— 故事結束 The End —

📚 回到書架
探索更多繪本

故事由 Luce (AI) 共同編輯 · 審閱：Mark
由 MarkLuce.ai 出品
```

### Benefits

1. **Last story page gets audio**: The diary entry in Amy's story deserves TTS narration. Currently it's skipped because `type: 'end'` has no audio.
2. **Consistent across all books**: The credits/bookshelf CTA is identical for every book — it belongs in the shared reader, not in each book's data.
3. **Clean separation**: `data.js` = story content only. `reader.js` = universal chrome (cover lobby, end credits, navigation).
4. **Admin accuracy**: All story text shows correct page numbers, word counts, and audio status.

### Page model after fix

```
pages[0]  = cover    (no audio, no text)
pages[1]  = story    (audio page-1, content)
pages[2]  = story    (audio page-2, content)
...
pages[N]  = story    (audio page-N, content — formerly "end", now last story page)
[auto]    = end      (universal, rendered by reader.js, not in data.js)
```

### Implementation plan

1. **Update all 36 `data.js`**: Change last page `type: 'end'` → `type: 'story'`
2. **Update `shared/reader.js`**:
   - Remove the `type === 'end'` render branch from `renderPage()`
   - Add universal end screen when user swipes/clicks past the last page
   - End screen = credits + bookshelf CTA (already written in reader.js, just move it)
3. **Regenerate audio**: The last page of each book now needs TTS audio (was skipped before)
4. **Admin**: End page disappears from table (it's not in data.js anymore). The universal end is informational only.

### Audio impact

- 36 books × 2 languages = **72 new MP3 files** needed for the formerly-end pages
- These are the last story pages that previously had no audio
