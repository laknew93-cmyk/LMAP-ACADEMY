# Slide plans for lesson videos

A slide plan turns a narration script (`video/scripts/<course>/<stem>.txt`) into a slide video.
Save it as `video/slides/<course>/<stem>.json`. `video/slides.py` renders each segment as a 1920×1080
slide and voices its `say` text, so **the concatenated `say` fields must equal the full script** —
split the script into segments; don't drop, reorder or reword it (tiny clean-ups like removing a stray
quote mark are fine). The reference example is
`video/slides/ai-in-60-minutes/01-01-what-ai-assistants-are.json` — read it first and match its style.

```json
{
  "course": "Short course name, e.g. Prompt Engineering Masterclass",
  "lesson": "Module 1 · Lesson 2",
  "title": "Lesson title from course.json",
  "segments": [ ... ]
}
```

Segment types (pick one layout per segment; every segment has `say`):

| Layout | Fields | Use for |
|---|---|---|
| title | `"kind": "title"` | First segment only: the welcome + intro paragraph(s). |
| bullets | `title`, `bullets` (3–5) | Most explanations. |
| numbered | `title`, `numbered` (2–5), optional `highlight` (0-based index) | Steps or a list discussed one item at a time — repeat the same list across segments, moving `highlight`. |
| grid | `title`, `grid` = [[heading, body], …] (2, 3, 4 or 6 cells) | Comparisons, categories, tool overviews. |
| + quote | optional `quote` on any content slide | A memorable analogy or rule. |
| + note | optional `note` on any content slide | A warning, tip or example prompt (keep under ~25 words). |
| exercise | `"kind": "exercise"`, `title` "Try it yourself · N minutes", `numbered` steps | The Try-it-yourself section. |
| recap | `"kind": "recap"`, `title` "Key takeaways", `bullets` | The recap and closing line. |

Rules
- 8–16 segments per lesson; each `say` roughly 40–220 words (about 15–80 seconds).
- On-screen text is short and scannable: titles ≤ 45 characters, bullets ≤ 70 characters, grid body ≤ 55,
  no full sentences copied from the narration. Bullets must reflect what is said in that segment.
- Show example prompts as a `note` (shortened if needed), never long blocks of text.
- Plain characters only on slides: use "-" or "–", no arrows (→), emoji or check marks.
- Valid JSON (escape double quotes inside strings as \").
