Hiring managers for GenAI roles receive hundreds of resumes that list "LangChain, RAG, LLMs". What makes yours stand out is a live link to something that works, with a README that shows engineering judgement. In this lesson you turn one of your course projects into a polished, deployed portfolio piece.

## Pick your flagship project

You have built four projects. Choose one as your flagship and polish it properly; the others can be linked as supporting work.

| Project | Best for roles in |
|---|---|
| Document Q&A (RAG) with citations | Enterprise AI, IT services GenAI practices, legal/HR tech |
| GST invoice extraction service | Fintech, accounting SaaS, back-office automation |
| CSV analyst agent | Analytics, BI, data products |
| Streamlit career chatbot | Edtech, consumer apps (weaker alone; combine with RAG) |

A good flagship solves a recognisable problem, has a live demo, and shows at least two of: structured output, retrieval, tools/agents, evaluation, safety.

## Polish the demo

Small details change how a recruiter perceives your project in the first 30 seconds:

- **Sample data built in**: a "Try with sample invoice" or "Load demo documents" button, so visitors do not need their own files.
- **Clear empty state**: one sentence on what the app does and three example questions.
- **Visible citations or validation**: show the sources panel or the `needs_review` issues. That is your differentiator; make it obvious.
- **Graceful errors**: friendly messages for rate limits, large files and refusals.
- **Limits on**: rate limiting and upload caps, so a public link cannot drain your credits.
- **Never collect real personal data**: add a note asking visitors to use sample documents only.

## Write a README that sells

Your README is the project's landing page. Recruiters skim it; technical interviewers read it closely. Use this structure:

```markdown
# GST Invoice Extractor

Upload a GST invoice (PDF or photo) and get validated JSON: supplier, GSTIN,
line items and tax totals, with automatic checks that flag invoices for review.

**Live demo:** https://your-app.onrender.com/docs  (may take ~30s to wake up)
**Demo video (90s):** link

## Why
Accounts teams re-type invoices into accounting software by hand. This service
extracts the data and flags inconsistencies so humans only review exceptions.

## How it works
1. FastAPI receives the file and checks type and size.
2. Claude reads the document and returns data constrained to a Pydantic schema.
3. Deterministic checks validate GSTIN format, line-item sums and CGST/SGST/IGST rules.
4. Clean invoices are auto-accepted; others are marked `needs_review`.

## Results
Evaluated on 20 sample invoices (10 PDF, 10 phone photos):
| Field | Exact match |
|---|---|
| Invoice number | x/20 |
| GSTIN | x/20 |
| Grand total (within ₹1) | x/20 |

## Design decisions
- Structured output + Pydantic instead of free-text JSON parsing.
- Model reads, code verifies: arithmetic checks are deterministic.
- Model name and limits come from environment variables.

## Limitations
- Handwritten invoices are less reliable.
- GSTIN checks format only, not live registration status.

## Run locally
cp .env.example .env   # add your ANTHROPIC_API_KEY
docker build -t invoice-extractor . && docker run -p 8000:8000 --env-file .env invoice-extractor

## Tech
Python, FastAPI, Anthropic Claude API, Pydantic, Docker, Render
```

Notes on this template:

- **Results with real numbers** from your own evaluation set are the most persuasive section. Fill in actual figures; never invent them. An honest "17/20" beats a vague "highly accurate".
- **Design decisions** show you thought, not just followed a tutorial. These become interview talking points.
- **Limitations** signal maturity. Every senior engineer lists them.
- `.env.example` is a copy of `.env` with placeholder values, committed so others know which variables to set.

## Record a 90-second demo video

Many recruiters will not click a live link, but will watch a short video. Use any screen recorder:

1. 10 seconds: the problem ("Accounts teams type invoices by hand").
2. 50 seconds: upload a sample, show the JSON, then upload a broken invoice and show the flagged issue.
3. 30 seconds: architecture in one sentence and your evaluation result.

Upload it as an unlisted YouTube video or to Loom and link it at the top of the README.

## Present it on LinkedIn and Naukri

- **Resume bullet** (specific, measurable, honest):

```text
Built and deployed a GST invoice extraction API (FastAPI, Claude API, Pydantic, Docker);
schema-constrained extraction plus rule-based GST validation; 18/20 exact grand-total
matches on a self-built test set of PDF and photo invoices.
```

- **LinkedIn post**: a short story (problem, what you built, one surprising thing you learned, demo link). Posts about what went wrong and how you fixed it tend to start better conversations than pure announcements.
- **GitHub profile**: pin the flagship and two supporting repos. Make sure each has a README, a licence and no committed secrets.
- **Naukri/LinkedIn skills**: list concrete skills you can defend in an interview (RAG, embeddings, vector databases, tool calling, LLM evaluation, FastAPI, Docker), not every buzzword.

## Common portfolio mistakes

| Mistake | Fix |
|---|---|
| Demo link is dead or asks visitors for an API key | Keep it deployed; key stays server-side |
| README is the default template | Use the structure above |
| No evaluation, just "it works well" | Add a small test set and real numbers |
| Committed `.env` in Git history | Revoke the key, rewrite history or create a fresh repo |
| Ten half-finished projects | One polished flagship and two supporting |

## Try it yourself

About 20 minutes now, plus a few hours over the week:

1. Pick your flagship project and write down the one-sentence problem it solves.
2. Create `.env.example` and the README using the template, filling in your real evaluation numbers.
3. Add one demo-friendly feature: a sample-data button or example questions.
4. Script and record a 90-second video.
5. Write your resume bullet and ask a friend (or a chat assistant) to critique it for clarity, without inflating claims.

## Key takeaways

- One polished, deployed flagship beats many unfinished projects.
- A strong README covers why, how, results, design decisions and limitations.
- Real evaluation numbers are your most persuasive evidence; never invent them.
- A 90-second video reaches recruiters who never click live links.
- Keep secrets out of repos and demos safe to share publicly.
