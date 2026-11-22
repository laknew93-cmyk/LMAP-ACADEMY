# Final certificate test — question bank format

Each course has `backend/content/courses/<slug>/quiz.json`. Learners get 10 random questions from the
bank and need 70% to earn the certificate, so the bank needs **18 questions** (more variety on retries).

```json
[
  {
    "q": "Question text (one sentence, max ~160 characters)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 2,
    "explain": "One sentence: why the correct option is right (shown after the test)."
  }
]
```

Rules
- Exactly 4 options; `answer` is the 0-based index of the single correct option.
- Every question must be answerable from the course lessons (read them all) — no outside trivia.
- Test understanding and application, not memorised wording: prefer short scenarios
  ("Priya needs to… what should she do first?") over "Which lesson said…".
- Cover every module roughly evenly. Mix easy, medium and a few harder questions.
- Wrong options must be plausible (common misconceptions), similar length to the right one, never
  joke answers, never "All of the above" / "None of the above".
- Vary the position of the correct answer (roughly even spread across 0–3).
- No trick questions; no questions about tool prices, plan limits or version numbers.
- Plain text only, valid JSON.
