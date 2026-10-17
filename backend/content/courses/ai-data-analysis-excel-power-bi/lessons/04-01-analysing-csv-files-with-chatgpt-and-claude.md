Several chat assistants can now take an uploaded spreadsheet, run real calculations on it, and return tables and charts. This lesson shows how to use that capability well — what to upload, what to ask, and how to make the AI show its working.

## What's actually happening when you upload a file

When you upload a CSV or Excel file to an assistant with a data analysis feature (ChatGPT, Claude and Gemini all offer some version, depending on your plan and settings), the assistant typically writes and runs code — usually Python — in a sandbox to read and analyse the file. That's very different from the AI "reading" the numbers and guessing.

Why this matters:

- **Code-based analysis is usually accurate arithmetic.** Sums and averages are calculated, not estimated.
- **But the logic can still be wrong.** If the code reads dates as MM/DD or counts item lines instead of invoices, the arithmetic will be perfectly accurate and the answer still wrong.
- **You can inspect the code.** Most tools let you expand a "show work" or code section. Even if you don't know Python, the comments and variable names tell you a lot.

If an assistant answers questions about your file without running any code, treat the numbers as rough at best — it may be estimating from a preview of the data.

## Prepare the file

1. **Mask and minimise** (Lesson 1.3). Delete unnecessary columns from a copy.
2. **One clean table per sheet**, headers in row 1, no merged cells or subtotal rows.
3. **CSV is the safest format.** Excel files work too, but multiple sheets, hidden rows and formatting can confuse things. Use File > Save As > CSV UTF-8.
4. **Use clear column names.** `Amount_incl_GST` beats `Amt2`.
5. **Mention size.** Very large files may hit upload limits; for big data, aggregate first (for example, monthly totals by store) or use Power BI or Python locally.

## Start with orientation, not questions

Your first prompt should make the AI describe the data back to you. This catches misreads before they contaminate every answer.

```text
I've uploaded sales data for a Jaipur clothing retailer, July–September 2026.
Before any analysis:
1. Tell me the number of rows and columns, and list each column with its detected data type.
2. Show the min and max of Date and Amount_incl_GST.
3. Show the distinct values of Store, Category and Payment_Mode with counts.
4. Flag anything that looks like a data quality problem.
Dates are in DD-MM-YYYY format (Indian). Amounts are in rupees and include GST.
Don't analyse further yet.
```

Check the reply against what you know. If it says the dates run from January to December when you know they're July to September, it has parsed DD/MM as MM/DD. Correct it now: "Parse Date as day-first."

## Ask business questions, one at a time

Once orientation looks right, move to questions. Specific beats broad:

| Weak | Strong |
|---|---|
| "Analyse this data" | "Show total Amount by Month and Store as a table, months in rows" |
| "Any insights?" | "Which 3 categories had the biggest ₹ increase from July to September? Show the numbers." |
| "Is COD a problem?" | "For Online orders only, show COD share of invoices and of amount by month" |

Ask for **tables first, charts second**. Tables let you verify numbers; a chart can hide an error behind a nice-looking line.

Some useful question patterns for business data:

```text
- "Break down the change in total sales from July to September by category. Which categories explain most of the change?"
- "Compare average invoice value by store. Calculate invoice totals first by grouping on Invoice_No."
- "Which day of the week has the highest average sales per store? Show the table."
- "Identify invoices whose Amount is more than 3 times the median for their category. List them."
- "Create a pivot-style table: Category in rows, Payment_Mode in columns, % of row total."
```

Notice the instruction "calculate invoice totals first" — you're steering the grain issue from Lesson 3.3 explicitly.

## Make it show its working

Build these habits into your prompts:

- "Show the code you ran." — even if you skim it.
- "State any assumptions you made, such as how you handled blanks or duplicates."
- "Give me the row count used for this calculation."

Row counts are a powerful check. If the AI says it analysed 1,000 rows but you removed 25 duplicates and should have 975, something's off.

## Getting outputs you can use

Ask for results in forms you can take back to Excel:

```text
Export the Category x Month summary as a CSV I can download.
```

or

```text
Give me the Excel formula I would use to reproduce this number in my own workbook,
assuming my data is in a Table called Sales.
```

The second prompt is underrated. It moves the analysis into your controlled, refreshable workbook and gives you an independent check at the same time.

Charts: ask for a specific chart type with a clear title, labelled axes and rupee formatting. Many tools let you download the chart as an image for a quick email, but for recurring reports you'll want charts built in Excel, Sheets or Power BI (Module 5).

## Working with the Bengaluru leads sheet

The same approach works for LeadLoop's CRM export:

```text
This is a leads export from a B2B SaaS startup in Bengaluru.
Columns: Lead_ID, Created_On, Source, Owner, City, Stage, Deal_Value, Closed_On.
1. For each Source, show leads, Won, Lost, win rate (Won / (Won + Lost)) and total Won Deal_Value.
2. For Won deals, show median days from Created_On to Closed_On by Source.
3. Which Owner has the most leads stuck in "Demo" for more than 30 days as of 15 October 2026?
```

Defining win rate in the prompt avoids the AI picking a different definition (such as Won divided by all leads).

## Where uploads are not the right tool

- **Recurring reports** — you don't want to re-upload and re-prompt every month. Build it in Excel, Sheets or Power BI.
- **Sensitive data** your organisation hasn't approved for external tools.
- **Very large datasets** — aggregate first, or use Power BI or Python on your own machine.
- **Final numbers for statutory or financial filings** — use your accounting system as the source of truth.

Think of uploads as a fast, smart first pass and a second opinion, not the system of record.

## Try it yourself

About 20 minutes.

1. Take your cleaned project file from Lesson 3.3 and save the Sales table as CSV.
2. Upload it to an assistant with data analysis. Run the orientation prompt and check every detail.
3. Ask the five project questions from Lesson 3.3, one at a time, requesting tables and row counts.
4. Compare at least three numbers with your pivot results. Note any differences.
5. Ask for the Excel formula to reproduce one of the answers, and test it in your workbook.

## Key takeaways

- Data analysis features usually run real code; the arithmetic is reliable, but the logic still needs checking.
- Start with an orientation prompt so the AI describes the data back before analysing.
- Ask specific questions, request tables before charts, and define metrics like win rate yourself.
- Ask for code, assumptions and row counts every time.
- Use uploads for exploration and second opinions; build recurring reports in your own tools.
