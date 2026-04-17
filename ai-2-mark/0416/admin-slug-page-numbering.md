# Admin Table — Page Numbering Convention

## Current State

The `#` column shows array index + 1 (1-16 for a 16-element book). This makes the cover = 1, first story = 2, which conflicts with the audio numbering and industry convention where content starts at page 1.

## Options

| Option | Cover | First Story | Last Story | End | Pros | Cons |
|--------|-------|-------------|------------|-----|------|------|
| A: Cover = 0 | 0 | 1 | 14 | — | Matches audio file numbering (`page-1-zh.mp3` = content page 1). Zero clearly means "not a content page". | Unfamiliar to non-devs |
| B: Cover = blank | — | 1 | 14 | — | Clean, cover and end are visually distinct from numbered content. Matches print publishing (cover has no page number). | Slightly less precise |
| C: Cover = "C", End = "E" | C | 1 | 14 | E | Explicit labels, no ambiguity | Extra visual noise |

## Advice

**Go with Option B (blank for cover/end, 1-indexed content)**. Reasons:

1. **Matches audio files**: `page-1-zh.mp3` corresponds to content page 1 in the table
2. **Matches reader URL**: `/amy/2` is reader page 2 (1-indexed including cover), but the admin detail URL `/admin/amy/1` maps to content page 1 — this aligns the admin `#` column with the admin detail URL
3. **Industry standard**: Print books don't number the cover. Digital books (Kindle, Apple Books) start numbering from the first content page
4. **Clean visual**: Cover and end rows already have yellow/grey type badges — a blank `#` reinforces they're structural, not content

### How it maps

```
Admin #  | Type    | Array Index | Audio File      | Admin Detail URL     | Reader URL
—        | cover   | 0           | (none)          | /admin/amy/cover     | /amy/
1        | story   | 1           | page-1-zh.mp3   | /admin/amy/1         | /amy/2
2        | story   | 2           | page-2-zh.mp3   | /admin/amy/2         | /amy/3
...      | ...     | ...         | ...             | ...                  | ...
13       | story   | 13          | page-13-zh.mp3  | /admin/amy/13        | /amy/14
—        | end     | 14          | (none)          | /admin/amy/14        | /amy/15
```

### Implementation

In the overview table row rendering, change the `#` cell from:
```js
// Before
<td><a href="${detailLink}">${pageNum}</a></td>

// After: blank for cover/end, content-page-number for story
<td><a href="${detailLink}">${isContent ? contentIndex : ''}</a></td>
```

Where `contentIndex` counts only story pages (1, 2, 3...), skipping cover and end.
