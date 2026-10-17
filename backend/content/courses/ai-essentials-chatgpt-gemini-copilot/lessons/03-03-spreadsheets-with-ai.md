Spreadsheets scare a lot of people — formulas, pivot tables, messy data. The good news: an AI assistant can act as a patient Excel tutor and helper who never gets tired of your questions. This lesson shows you how.

## Three ways AI helps with spreadsheets

1. **Writing formulas** — describe what you want in plain English, get the formula.
2. **Explaining** — paste a formula or a confusing sheet and get it explained.
3. **Analysing data** — upload a file and ask questions, get summaries and charts.

You don't need to be an Excel expert. You do need to describe your data clearly.

## Getting formulas in plain English

The trick is to tell the assistant your exact columns:

```text
I have an Excel sheet of sales invoices.
Column A: Invoice date
Column B: Customer name
Column C: City
Column D: Invoice amount (before GST)
Column E: GST rate (as 5%, 12%, 18% etc.)
Rows 2 to 500.

Give me formulas for:
1. GST amount in column F
2. Total invoice value in column G
3. Total sales for customers in Nagpur
4. Number of invoices above ₹50,000
Explain each formula in one line.
```

You'll typically get formulas like `=D2*E2` and `=SUMIF(C2:C500,"Nagpur",G2:G500)` with explanations. Copy one, test it on a few rows, and check the result manually for at least one row.

### Common requests that save hours

- Look up a value from another sheet (VLOOKUP or XLOOKUP)
- Combine first and last names, or split full names
- Extract the month from a date
- Flag overdue payments ("if due date is before today and status is not Paid")
- Remove duplicates or find duplicates
- Count or sum by category

If a formula gives an error, paste the error and the formula back to the assistant: "This shows #N/A. Here's my data layout. What's wrong?"

## Understanding someone else's spreadsheet

Inherited a sheet from a colleague who left? Paste a complicated formula and ask:

```text
Explain this Excel formula step by step in simple language, and tell me what would make it break:
=IFERROR(INDEX(Rates!C:C,MATCH(1,(Rates!A:A=B2)*(Rates!B:B=D2),0)),"Not found")
```

This is a quick way to learn Excel without a formal course — every confusing formula becomes a mini-lesson.

## Analysing data with file uploads

Many assistants can analyse uploaded spreadsheets or CSV files directly: totals, averages, trends, comparisons and charts. Some run actual calculations behind the scenes, which makes them more reliable for numbers than plain text answers.

Example prompts after uploading a sales file:

- `Which 5 customers gave us the most revenue this year?`
- `Show monthly sales as a table and a line chart. Which months were weakest?`
- `Are there any rows with missing or suspicious values?`
- `Compare sales across cities. Which city grew the most from Q1 to Q2?`

Amit, who manages a distribution business in Surat, uploads his monthly sales export and asks for "top customers, slow-moving products and unpaid invoices older than 45 days". What used to take an afternoon now takes 15 minutes, plus time to double-check the key numbers.

### Verify the numbers

Numbers are red-zone output (from Lesson 1.2). Always:

- Spot-check two or three results by calculating them yourself in Excel.
- Check that totals match your original file's totals.
- Make sure the assistant read the right columns — ask "Which columns did you use for this calculation?"

## Cleaning messy data

Real data is messy: "Mumbai", "mumbai", "Bombay" and "MUMBAI " all in one column. AI can help:

```text
My City column has inconsistent spellings like "Bengaluru", "Bangalore", "B'lore", "bangalore ". Suggest an approach to standardise them in Excel, and give me the formulas or steps.
```

For small datasets, you can paste the list and ask for a cleaned version. For large ones, ask for the method so you apply it in Excel yourself.

## Spreadsheet structure and templates

AI is also good at designing sheets from scratch:

```text
Design a simple Excel template for a home-tuition teacher to track 20 students: name, class, monthly fee, payment date, payment mode (cash/UPI), pending amount. Suggest column headings, formulas for pending fees, and conditional formatting to highlight unpaid students in red.
```

Similar templates work for expense trackers, inventory lists, attendance registers and simple GST invoice registers.

## Privacy reminder

Spreadsheets often contain customer names, phone numbers, salaries or financial details. Before uploading:

- Check your company's AI policy.
- Remove or mask personal data — replace names with "Customer 1, Customer 2".
- Often you can describe the structure and ask for formulas without sharing real data at all.

## Try it yourself

Spend 15-20 minutes with a real or sample spreadsheet.

1. Open any spreadsheet you use (or create a small one with 10-15 rows: date, item, category, amount).
2. Describe the columns to an assistant and ask for three formulas you'd find useful — for example, total by category, monthly totals, and a flag for amounts above a limit.
3. Apply the formulas in Excel or Google Sheets and manually check one result for each.
4. If you have a non-confidential file, upload it and ask for the top 3 insights and one chart.
5. Paste one formula you don't understand and ask for a step-by-step explanation.
6. Save your best formula prompt as Prompt #7 in your library.

## Key takeaways

- Describe your columns and row ranges precisely to get correct formulas.
- Use AI as an Excel tutor: paste any confusing formula or error and ask for an explanation.
- File uploads allow quick analysis, but always spot-check numbers against your original data.
- AI can help clean messy data and design useful templates from scratch.
- Mask personal and financial details before uploading spreadsheets.
