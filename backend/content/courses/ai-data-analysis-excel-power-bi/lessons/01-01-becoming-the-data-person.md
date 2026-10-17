In almost every Indian office there is one person everyone goes to when the numbers don't add up. This course will make you that person, using AI assistants to do in minutes what used to take a full evening of fighting with spreadsheets.

## What "the data person" actually does

Forget the job titles for a moment. In a Jaipur garment retailer, a Pune logistics firm or a Chennai CA practice, the data person is simply the one who can do four things reliably:

1. **Get the data into shape** — merge the branch-wise sheets, fix the dates, remove the duplicate invoices.
2. **Summarise it** — "What were our sales by category last month, and how does that compare with September?"
3. **Explain it** — turn a pivot table into three sentences a busy director understands.
4. **Repeat it** — produce the same report every month without rebuilding it from scratch.

None of this needs a statistics degree. It needs comfort with formulas, pivot tables, a charting tool, and the habit of checking your work. AI assistants now make the first three much faster, and they help you design the fourth.

## What AI changes — and what it doesn't

Here is an honest picture of where AI helps a spreadsheet user today.

| Task | Without AI | With AI |
|---|---|---|
| Writing a tricky formula | Google it, copy from a forum, adapt it, break it | Describe what you want in plain English, get a formula and an explanation |
| Understanding a colleague's 3-line nested IF | Stare at it for 20 minutes | Paste it and ask "explain this step by step" |
| Cleaning inconsistent city names | Manual find-and-replace | Ask for a mapping table or a cleaning formula |
| First-pass analysis of a CSV | Build pivots one by one | Upload the file to a chat assistant and ask questions |
| Writing the summary email | Stare at a blank page | Ask for a draft, then fix it with your own judgement |

What AI does **not** change: you are still responsible for the numbers. AI assistants can misread a column, pick the wrong date format, or confidently state a total that is off by a few lakh. Throughout this course you will learn a simple discipline: **AI drafts, you verify.** Lesson 4.2 is entirely about verification, and every project includes a checking step.

## The tools we will use

You don't need all of these. Pick what your workplace already uses.

- **A chat assistant** such as ChatGPT, Claude or Gemini. The free versions are enough for formula help. File upload and data analysis features vary by plan and change often, so check what your account offers.
- **Microsoft Excel** (ideally Microsoft 365, which has XLOOKUP, dynamic arrays and Copilot features for eligible plans) or **Google Sheets** (free with any Google account).
- **Power BI Desktop** — free to download on Windows, used in Module 5. Mac users can follow along with Google Sheets or Looker Studio for the dashboard project.
- **Google Colab** — optional, for the light Python lesson. Runs in your browser; nothing to install.

## Meet the datasets

Instead of abstract examples, we will keep returning to a few realistic Indian datasets so you can see how techniques build on each other.

**Pink City Fabrics, Jaipur** — a retailer with two stores and an online channel. Their monthly sales sheet has columns like:

```text
Invoice No | Date | Store | Customer City | Category | Item | Qty | Rate | Amount (incl. GST) | GST Rate | Payment Mode
```

Amounts include GST at 5% or 12% depending on the item, payment modes are UPI, Card, Cash and COD, and — like every real sheet — it has duplicate invoices, cities spelt three ways ("Jaipur", "jaipur ", "JPR"), and dates that are sometimes text.

**LeadLoop, a Bengaluru SaaS startup** — a leads sheet exported from their CRM:

```text
Lead ID | Created On | Source | Owner | Company | City | Stage | Deal Value (₹) | Closed On
```

Sources include LinkedIn, Website, Referral and IndiaMART; stages run from New to Won or Lost.

Later we will add a small **expense register** for a Chennai CA firm and a **branch MIS** for a Nagpur distributor.

## How each lesson works

Every lesson follows the same pattern: a concept, worked examples with real formulas or prompts, and a short "Try it yourself" exercise. Do the exercises. Reading about pivot tables builds no skill; building one does.

The four projects are where it comes together:

1. Clean and analyse a 1,000-row sales dataset (Module 3).
2. Build a pivot-based monthly MIS report that refreshes with new data (Module 3).
3. Build a 1-page dashboard in Power BI or Google Sheets (Module 5).
4. Write a 5-insight executive summary from data (final lesson).

These make a solid portfolio if you are applying for MIS, analyst or finance roles on Naukri or LinkedIn — you can describe exactly what you built and show a sanitised version.

## A word on Excel versions

Indian offices run everything from Excel 2013 to the latest Microsoft 365. Some functions in this course — XLOOKUP, FILTER, UNIQUE, TEXTBEFORE — only exist in newer versions. Whenever we use one, we will give an older-version alternative. A good habit: always tell the AI which version you use, because a formula that works in Microsoft 365 can show `#NAME?` in Excel 2016.

## Try it yourself

Spend 15 minutes setting up and taking stock.

1. Open the spreadsheet tool you use at work. In Excel, go to **File > Account** and note your version. In Google Sheets, just note that you're on Sheets.
2. Open your chat assistant and type: `In my version of Excel/Sheets, is XLOOKUP available? If not, what is the closest alternative?` Check the answer by typing `=XLOOKUP(` in a cell and seeing if it autocompletes.
3. Pick one real (or realistic) sheet you deal with regularly. Write down, in a notebook or a doc: its columns, roughly how many rows, and the one question your manager asks about it most often.
4. Write down the most painful step in producing that report today. This is the problem you will solve by the end of the course.

## Key takeaways

- The "data person" cleans, summarises, explains and repeats — AI speeds up all four.
- AI drafts, you verify: you remain accountable for every number you share.
- Always tell the AI your tool and version; formulas differ between Excel 2016, Microsoft 365 and Google Sheets.
- We'll work with realistic Indian datasets — a Jaipur retailer and a Bengaluru startup — throughout the course.
