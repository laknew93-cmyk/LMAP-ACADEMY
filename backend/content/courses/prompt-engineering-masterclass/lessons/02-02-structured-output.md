Most professional work does not end in a chat window. It ends in Excel, a slide, a form, a checklist or another piece of software. In this lesson you'll learn to get output in exactly the structure you need: tables, JSON, checklists and fixed templates.

## Why structure matters

Unstructured output costs you time twice: once to read and once to reformat. Structured output can be pasted directly into Google Sheets, a CRM, a Notion database or a script. It's also easier to check, because missing pieces stand out.

## Tables

Tables are the easiest win. Name the columns and their order:

Before:

```text
Compare Zoho Books, Tally and QuickBooks for my business.
```

After:

```text
Compare Zoho Books, Tally and QuickBooks for a 6-person interior design firm
in Kochi that issues about 40 GST invoices a month.

Return a markdown table with exactly these columns:
Feature | Zoho Books | Tally | QuickBooks

Rows: Cloud access, GST e-invoicing support, Learning curve for a new
accountant, Mobile app, Best suited for.
Keep each cell under 12 words. If you are unsure about a feature, write
"Verify" instead of guessing.
After the table, add 2 sentences of recommendation.
```

Notice the "Verify" instruction. Product features change often, so you want the model to flag uncertainty rather than invent details. You'll go deeper on this in Module 3.

Tip: if you plan to paste into Excel or Sheets, ask for tab-separated values or CSV inside a code block. That pastes cleanly into cells.

## JSON

JSON (JavaScript Object Notation) is the standard format for passing data between software. Even if you don't code, it's useful when you work with developers, automation tools like Zapier or Make, or when you need guaranteed fields.

```text
Extract the details from the job posting below and return ONLY valid JSON,
no explanation, using this exact schema:

{
  "job_title": string,
  "company": string,
  "location": string,
  "work_mode": "onsite" | "hybrid" | "remote" | "not stated",
  "experience_years_min": number or null,
  "salary_range_inr": string or null,
  "key_skills": [string]
}

Rules:
- Use null when a field is not mentioned. Never guess.
- key_skills: max 6 items, as written in the posting.

<posting>
[PASTE JOB POSTING]
</posting>
```

Three things make this reliable: the exact schema, the allowed values for `work_mode`, and the rule for missing data. Many assistants and most AI APIs also offer a dedicated "structured output" or "JSON mode" setting; if you are building something with an API, use it, because it enforces valid JSON more strictly than a prompt alone.

## Checklists

Checklists turn advice into action:

```text
Create a pre-launch checklist for a Diwali sale on our Shopify store.
Format:
- Group items under these headings: Inventory, Website, Payments (UPI/cards),
  Marketing, Customer support.
- Each item starts with "[ ]" and a verb.
- Max 6 items per heading.
- Mark anything that must be done at least 7 days before launch with (T-7).
```

The "[ ]" format pastes neatly into Notion, Google Docs or a WhatsApp message to your team.

## Fixed templates

Sometimes you need a specific document layout, such as a daily standup update or a site visit report:

```text
Convert my rough notes into this exact format. Do not add sections.

DATE:
SITE:
WORK COMPLETED:
- 
ISSUES:
- 
MATERIALS NEEDED:
- 
NEXT VISIT:

<notes>
went to Wakad site today 14th, tiling done 2nd floor, plumbing leak in
flat 204 need plumber, need 30 bags cement by thurs, next visit monday
</notes>
```

## Getting structure right every time

- **Show the skeleton.** An empty template or schema beats a description of one.
- **Say "only".** "Return only the table" stops chatty introductions.
- **Define empty values.** Decide in advance: "null", "N/A", "Not stated" or blank.
- **Limit cell length.** Long cells break tables.
- **Specify sorting.** "Sort by priority, High first" or "alphabetical by city".
- **Validate.** For JSON, paste the output into any free JSON validator, or ask a developer colleague. For tables, check the row count matches the input.

### Fixing broken structure

If the output drifts, don't rewrite from scratch. Reply with a targeted correction:

```text
Row 3 is missing the "Mobile app" value and you added an extra column.
Regenerate the full table with exactly 4 columns and 5 rows.
```

## Try it yourself

Spend 15-20 minutes.

1. Find a messy piece of real text: a long email thread, a product page, a WhatsApp group discussion about an event.
2. Decide the structure you actually need (table, JSON, checklist or fixed template).
3. Write a prompt that shows the exact skeleton, defines empty values, and says "return only".
4. Run it, then paste the result where it will really live (Sheets, Notion, a JSON validator).
5. If anything breaks, send one targeted correction and note the fix in your Prompt Journal.

## Key takeaways

- Structured output saves reformatting time and makes errors easy to spot.
- Name table columns, show JSON schemas, and give templates as empty skeletons.
- Always define what to write when information is missing, so the model doesn't guess.
- For API or automation work, use the tool's structured output feature where available.
- Fix drifting structure with specific corrections rather than starting over.
