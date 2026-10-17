# LMAP Academy — course content format

Every course lives in `backend/content/courses/<slug>/`:

```
<slug>/
  course.json
  lessons/
    01-01-<short-name>.md
    01-02-<short-name>.md
    02-01-...
```

On startup the backend syncs these files into the database (`content_sync.py`), and the
frontend build copies the course metadata for pre-rendered SEO pages. Editing these files and
redeploying is how you change course content.

## course.json

```json
{
  "slug": "prompt-engineering-masterclass",
  "title": "Prompt Engineering Masterclass",
  "subtitle": "One sentence, max 160 characters, benefit-led. Shown on cards and as the hero subtitle.",
  "category": "Prompt Engineering",
  "level": "beginner | intermediate | advanced",
  "price": 1999,
  "mrp": 5999,
  "duration_hours": 7,
  "sort_order": 3,
  "description": "3-4 short paragraphs of plain text separated by \n\n. Who it's for, what changes for the learner, how the course works. No markdown.",
  "audience": ["4-5 short strings: who this course is for"],
  "outcomes": ["6-8 concrete 'you will be able to...' outcomes, each under 110 characters"],
  "prerequisites": ["2-3 short strings"],
  "tools": ["tools/platforms covered, e.g. ChatGPT, Claude, Gemini"],
  "projects": ["3-4 hands-on projects the learner finishes, each one sentence"],
  "seo": {
    "title": "Max 55 characters, includes the main keyword (brand is appended automatically)",
    "description": "140-155 characters, includes the main keyword and a reason to click",
    "keywords": ["8-12 search phrases people in India actually type, e.g. 'prompt engineering course in india'"]
  },
  "faqs": [
    { "q": "Question a buyer would ask", "a": "2-3 sentence honest answer" }
  ],
  "modules": [
    {
      "title": "Module title",
      "lessons": [
        {
          "title": "Lesson title",
          "file": "01-01-what-is-a-prompt.md",
          "minutes": 15,
          "preview": true,
          "summary": "One sentence describing the lesson (shown in the public curriculum)."
        }
      ]
    }
  ]
}
```

Rules:
- `preview: true` makes a lesson free to read without buying. Mark the first lesson of the course and
  at most one more as preview; everything else `false`.
- `minutes` = realistic time to read the lesson and do its exercise.
- `duration_hours` ≈ sum of minutes / 60, rounded to the nearest 0.5.
- 6 FAQs per paid course. Always include one on certificates and one on refunds — the policy is: a
  certificate of completion is issued when every lesson is marked complete; a full refund is available
  within 7 days of purchase if less than 30% of the course has been completed.

## Lesson markdown

- No YAML front matter and no H1 — the lesson title is shown by the page. Start with a 1-2 sentence
  intro paragraph, then use `##` and `###` headings.
- 700-1,100 words. Practical, specific, friendly, plain English. Write for Indian learners: use ₹,
  Indian names, Indian businesses and situations (Naukri/LinkedIn job hunting, GST invoices, a Pune
  bakery's Instagram, a Chennai CA firm, UPI, Tier-2 city freelancers) where natural.
- Every lesson includes, in this order near the end:
  - `## Try it yourself` — a concrete exercise of 10-20 minutes with clear steps.
  - `## Key takeaways` — 3-5 bullet points.
- Put example prompts, templates and code in fenced code blocks (```text for prompts, ```python etc. for code).
- Accuracy matters more than flash. As of late 2026, tools change quickly: do not state tool prices,
  plan limits, or exact model version numbers unless they are stable facts; describe features in a way
  that stays true ("most chat assistants let you upload a PDF"). Never invent statistics, studies,
  quotes, testimonials, or earnings claims. Income figures, if any, must be framed as illustrative
  ranges, not promises.
- Tables are allowed (GitHub-flavoured markdown). No raw HTML. No images.
