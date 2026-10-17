# LMAP Academy

Practical AI courses for India — https://lmapacademy.org

## Stack
- **Backend**: FastAPI + PostgreSQL (SQLite locally) + JWT auth — `backend/`
- **Frontend**: React + Vite, pre-rendered for SEO — `frontend/`
- **Payments**: Razorpay (INR), with webhook backup
- **Hosting**: Render (`render.yaml`)

## Content
Course content lives in files, not the admin panel:

- `backend/content/courses/<slug>/course.json` + `lessons/*.md` — format in `backend/content/COURSE_SPEC.md`.
  The API syncs these into the database on every start, keeping learners' progress.
- `frontend/content/blog/*.md` — SEO blog articles.
- `frontend/content/pages/*.md` — About, Contact, Terms, Privacy, Refund pages.
- `frontend/src/site.js` — business name, address, support email, bundle price.

To change a price, edit `course.json` (and `BUNDLE_PRICE` / `site.js` for the All-Access Pass) and redeploy.

## Commercials
| Course | Price | MRP |
|---|---|---|
| AI in 60 Minutes (lead magnet) | Free | — |
| AI Essentials: ChatGPT, Gemini & Copilot | ₹1,499 | ₹4,999 |
| Prompt Engineering Masterclass | ₹1,999 | ₹5,999 |
| Make Money with AI: Freelancing & Small Business | ₹2,499 | ₹6,999 |
| AI for Content Creation & Personal Branding | ₹2,499 | ₹6,999 |
| AI for Data Analysis: Excel, Sheets & Power BI | ₹2,999 | ₹7,999 |
| Build AI Agents & Automations Without Code | ₹3,499 | ₹9,999 |
| Generative AI Mastery (Python, RAG, Agents) | ₹4,999 | ₹14,999 |
| **All-Access Pass** (all paid courses) | **₹6,999** | — |

Prices include taxes. Refunds: 7 days, if under 30% completed.

## Local development
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # set ADMIN_PASSWORD
uvicorn main:app --port 8001 --reload
```
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5174
npm run build                 # builds + pre-renders pages, sitemap.xml, robots.txt
```

## SEO
`npm run build` runs `scripts/build-catalog.mjs` (copies course metadata into `src/data/catalog.json`)
and `scripts/prerender.mjs`, which writes a real HTML page for every course, blog post and info page
with title/description/canonical/Open Graph tags and JSON-LD (Course, FAQPage, BlogPosting,
BreadcrumbList, Organization), plus `sitemap.xml` and `robots.txt`.
Set `VITE_GA_ID` (Google Analytics 4) and `VITE_GSC_VERIFICATION` (Search Console) on the static site.
