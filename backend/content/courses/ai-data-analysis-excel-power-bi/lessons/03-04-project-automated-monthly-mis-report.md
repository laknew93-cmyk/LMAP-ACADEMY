The difference between someone who "makes reports" and a real MIS professional is that the second person builds the report once and refreshes it every month. In this project you'll build a pivot-based monthly MIS report that updates in minutes when new data arrives.

## The scenario

Sharma Distributors in Nagpur supplies FMCG products to retailers through three branches: Nagpur, Amravati and Wardha. Every month, each branch emails a sales export. Today, Rohit in the head office spends two days copying files together, fixing columns and rebuilding pivots. Your goal: get that down to under 30 minutes, most of it reviewing rather than building.

The report needs:

1. Sales (net of GST) by branch for the month, vs last month and vs target.
2. Top 10 products and top 10 retailers by sales.
3. Category mix by branch.
4. Collections: amount billed vs amount received, and outstanding over 60 days (from a separate receivables sheet — optional stretch).

## The architecture

Good recurring reports separate four layers:

```text
INPUT        ->   PREPARE           ->   CALCULATE          ->   PRESENT
Monthly files     Power Query            Pivots / SUMIFS        Report sheet
in one folder     (combine + clean)      (on clean Table)       (fixed layout, charts)
```

Rules that make this work:

- Never type into the clean data or pivots by hand.
- The only thing that changes each month is new files in the folder, plus one "Report Month" cell.
- Every number on the Report sheet traces back to the clean Table.

## Step 1: Set up the folder

Create a folder like `Sharma_MIS/Data/` and save each branch's monthly file there with a consistent name: `Nagpur_2026-09.xlsx`, `Amravati_2026-09.xlsx` and so on. Consistency in file layout matters more than the names: same columns, same order, same header row. If branches send different layouts, ask them (politely, with a template) to standardise. That one email can save hours every month.

For practice, ask an AI to generate three branch files for August and September 2026 with columns: Invoice No, Date, Branch, Retailer Code, Product, Category, Qty, Net Amount, GST Amount, Gross Amount.

## Step 2: Combine and clean with Power Query

In Excel (Windows, 2016 or later; Microsoft 365 on Mac also supports Power Query with some differences):

1. **Data > Get Data > From File > From Folder**, select the Data folder.
2. Click **Combine & Transform Data**. Choose the sheet or table to use from the sample file.
3. In the Power Query Editor, apply cleaning steps:
   - Remove the Source.Name column if not needed (or keep it to trace rows back to files).
   - Set data types: Date as Date, amounts as Decimal Number.
   - Trim and clean text columns (Transform > Format > Trim).
   - Replace values for known spelling variants.
   - Remove duplicates on Invoice No + Product.
4. **Close & Load To** a Table on a sheet named `Data`.

Every step is recorded in the "Applied Steps" list on the right. Next month, add new files to the folder and click **Data > Refresh All** — all steps re-run automatically.

If a step confuses you, ask an AI:

```text
In Power Query, my Date column from the branch files is text like "05-09-2026" (DD-MM-YYYY).
When I change type to Date it gives errors for some rows. How do I convert it correctly?
Explain the steps in the Power Query editor and the M code.
```

(The usual answer: use **Change Type > Using Locale** and choose Date with English (India) locale, which reads day-first.)

## Step 3: Add a control panel

Create a `Control` sheet with:

| Cell | Content |
|---|---|
| B2 | Report Month (enter 1-Sep-2026) |
| B3 | `=EOMONTH(B2,-1)+1` — first day of month |
| B4 | `=EOMONTH(B2,0)` — last day of month |
| B5 | `=EOMONTH(B2,-2)+1` — first day of previous month |
| B6 | `=EOMONTH(B2,-1)` — last day of previous month |

Name these cells (Formulas > Define Name): `MonthStart`, `MonthEnd`, `PrevStart`, `PrevEnd`. Formulas become readable, and you change only B2 each month.

Also add a `Targets` table: Branch, Month, Target.

## Step 4: Build the calculations

**Branch summary with SUMIFS** (fixed layout, so it's ideal for the front page). With branches in A6:A8 of the Report sheet:

```excel
This month:   =SUMIFS(Data[Net Amount], Data[Branch], $A6, Data[Date], ">="&MonthStart, Data[Date], "<="&MonthEnd)
Last month:   =SUMIFS(Data[Net Amount], Data[Branch], $A6, Data[Date], ">="&PrevStart, Data[Date], "<="&PrevEnd)
MoM %:        =IFERROR(B6/C6-1, "-")
Target:       =SUMIFS(Targets[Target], Targets[Branch], $A6, Targets[Month], MonthStart)
Achievement:  =IFERROR(B6/E6, "-")
```

(Store Targets[Month] as the first day of each month so it matches `MonthStart`.)

**Top 10 products and retailers with pivots.** Create a pivot from the Data table with Product in Rows and Sum of Net Amount in Values. Add a Timeline or a Month field to Filters. Then right-click Product > **Filter > Top 10**, by Sum of Net Amount. Repeat for Retailer Code.

In Excel 365, you can instead use dynamic formulas that need no refresh clicks:

```excel
=TAKE(SORT(GROUPBY(Data[Product], Data[Net Amount], SUM, 0, 0), 2, -1), 10)
```

As written, this covers every row in Data; to limit it to the report month, GROUPBY has an optional filter argument — ask an AI to add it for your column names. GROUPBY is newer and may not exist in your version; ask an AI for the equivalent with UNIQUE, SUMIFS and SORTBY if you get `#NAME?`. A pivot works everywhere.

**Category mix:** pivot with Category in Rows, Branch in Columns, values shown as % of Column Total.

## Step 5: Design the report page

On a `Report` sheet, arrange:

- Title with the month: `="Sharma Distributors — Monthly MIS — "&TEXT(Control!B2,"mmmm yyyy")`
- The branch summary table at the top.
- Top 10 tables side by side.
- One or two charts (Module 5 covers chart choice).
- A "Notes" box for commentary.

Use conditional formatting for MoM % (green above 0, red below) and achievement (red below 90%). Keep formatting consistent: Indian number format for rupees. A custom format that shows lakh-style commas:

```text
[>=10000000]##\,##\,##\,##0;[>=100000]##\,##\,##0;##,##0
```

## Step 6: The monthly refresh routine

Write this on a `README` sheet:

```text
1. Save the three branch files for the new month in /Data (same layout).
2. Open the workbook, change Control!B2 to the new month (1st of month).
3. Data > Refresh All. Wait for completion.
4. Check: Data row count vs sum of branch file rows (Control!B9 vs B10).
5. Check: total Net Amount vs accounts' sales register for the month.
6. Review Report sheet; update the Notes box.
7. Save as Sharma_MIS_YYYY-MM.xlsx and send as PDF.
```

Step 4 deserves a formula: on the Control sheet, `=COUNTIFS(Data[Date], ">="&MonthStart, Data[Date], "<="&MonthEnd)` gives this month's rows.

Ask an AI to review your design:

```text
Here is the structure of my monthly MIS workbook [describe sheets and key formulas].
What could break when I refresh it next month? Suggest checks I should add.
```

## Try it yourself

This project takes 60–90 minutes.

1. Generate August and September files for three branches and put them in a folder.
2. Combine them with Power Query (or, in Google Sheets, stack them on one sheet and use QUERY).
3. Build the Control sheet, branch SUMIFS summary, a Top 10 products pivot and a category mix pivot.
4. Design the Report sheet and write the README routine.
5. Test it: add an October file, change the month, refresh. Did everything update correctly?

## Key takeaways

- Separate input, preparation, calculation and presentation layers.
- Power Query records cleaning steps once and replays them on every refresh.
- Drive the whole report from one Report Month cell using EOMONTH and named cells.
- Use SUMIFS for fixed front-page tables and pivots for Top 10 and mix analysis.
- Write a refresh routine with built-in control checks, and test it with next month's data.
