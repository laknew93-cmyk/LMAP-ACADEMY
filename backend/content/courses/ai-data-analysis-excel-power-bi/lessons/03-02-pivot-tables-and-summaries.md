A pivot table turns thousands of rows into a summary in seconds, and it's the backbone of almost every MIS report in India. This lesson takes you from your first pivot to month-on-month comparisons, with AI helping you decide what to build.

## Before you pivot: get the data in shape

Pivots need a clean, tabular source:

- One header row, every column named, no merged cells.
- One row per transaction — no subtotal rows mixed in.
- Real dates and real numbers (Lesson 3.1).
- Ideally formatted as an Excel Table (Ctrl + T), so new rows are included when you refresh.

## Your first pivot

With the Pink City Fabrics `Sales` table selected:

1. **Insert > PivotTable**, choose **New Worksheet**, click OK.
2. Drag **Category** to Rows.
3. Drag **Amount** to Values (it should show "Sum of Amount").
4. Drag **Store** to Columns.

You now have sales by category and store. In Google Sheets, it's **Insert > Pivot table**, then add Rows, Columns and Values from the editor panel on the right.

### The four areas

| Area | What it does | Example |
|---|---|---|
| Rows | Groups down the side | Category, Item |
| Columns | Groups across the top | Store, Month |
| Values | What you calculate | Sum of Amount, Count of Invoice No |
| Filters | Limits the whole pivot | Payment Mode = UPI |

## Grouping dates by month

Drag **Date** to Rows. In recent Excel versions it may group into Years/Quarters/Months automatically; if not, right-click a date > **Group** > choose **Months** and **Years**. Always include Years, or October 2025 and October 2026 will merge into one "Oct".

Excel's grouping uses calendar quarters. For Indian financial-year quarters, add a helper column in the source data (the FY and FQ formulas from Lesson 2.3) and use those fields instead.

## Changing how values are shown

Right-click a value > **Show Values As** unlocks some of the most useful analysis:

- **% of Grand Total** — each category's share of total sales.
- **% of Column Total** — category mix within each store.
- **Difference From** (base: previous month) — month-on-month change in ₹.
- **% Difference From** (previous month) — MoM growth %.
- **Running Total In** (Date) — cumulative sales through the year.

Tip: drag Amount into Values **twice** — show one as Sum and the other as % of Column Total. Rename them by clicking the header ("Sales ₹", "Share %").

## Counting things

To count invoices, drag Invoice No to Values; it'll show "Count of Invoice No". But if an invoice has several item lines, that counts lines, not invoices. To count unique invoices in Excel on Windows, tick **Add this data to the Data Model** when creating the pivot, then change the value setting to **Distinct Count**. In Google Sheets, choose **COUNTUNIQUE** in the "Summarise by" option.

## Slicers and timelines

Click inside the pivot, then **PivotTable Analyze > Insert Slicer** and choose Store and Payment Mode. You get clickable buttons that filter the pivot — very handy for managers who don't want to touch dropdowns. **Insert Timeline** does the same for dates. One slicer can control several pivots: right-click the slicer > **Report Connections**.

## Calculated fields

Want average invoice value or GST collected inside the pivot? **PivotTable Analyze > Fields, Items & Sets > Calculated Field**. For example, a field named `Taxable` with formula `= Amount / 1.05` — but beware, calculated fields operate on **sums**, not individual rows. That's fine for a single GST rate; with mixed 5% and 12% items it gives wrong results. Instead, add a Taxable column to the source data and pivot that. This is a trap AI assistants sometimes walk into, so if a suggestion uses calculated fields with ratios or mixed rates, double-check.

## Using AI to design the pivot

You often know the business question but not which fields to drag where. Describe both:

```text
I have a sales table with columns: Date, Store, Category, Item, Qty, Amount, Payment Mode.
My manager wants to know: which categories drove the growth from September to October 2026,
and did that differ between the Online channel and the physical stores?
Tell me exactly how to set up the pivot (Rows, Columns, Values, Filters, Show Values As),
and what to look for in the result.
```

A sensible answer: Category in Rows, Date grouped by Month in Columns, Store as a slicer, Amount shown as **Difference From** previous month. Then sort by the October difference, largest first, to see the growth drivers.

## Formula-based summaries vs pivots

Pivots are fast to build and explore. SUMIFS grids (Lesson 2.2) give fixed layouts that don't shift when data changes — better for a report template that must look identical every month. Many MIS reports use both: pivots to explore, SUMIFS for the final printed format. In Excel 365, you can also reference pivot values reliably with `GETPIVOTDATA` (created automatically when you click a pivot cell while writing a formula).

Google Sheets users have a third option, the QUERY function:

```excel
=QUERY(Sales!A1:G, "select C, sum(G) where C is not null group by C order by sum(G) desc label sum(G) 'Sales'", 1)
```

Here C is Category and G is Amount; the final `1` tells QUERY there's one header row. It produces a live summary table that updates as data changes.

## Refresh, refresh, refresh

The most common pivot mistake: adding new data and forgetting to refresh. Right-click the pivot > **Refresh**, or **Data > Refresh All** for every pivot in the workbook. If your source is a Table, new rows are picked up automatically on refresh; if it's a fixed range like A1:K1000, rows beyond 1000 are silently ignored.

## Try it yourself

About 20 minutes.

1. Use your cleaned practice data from Lesson 3.1, or ask an AI for 100 rows of Pink City Fabrics sales across August to October 2026.
2. Build a pivot: Category in Rows, Date grouped by Month and Year in Columns, Sum of Amount in Values.
3. Add a second copy of Amount shown as **% Difference From** previous month.
4. Add slicers for Store and Payment Mode.
5. Write two sentences: which category grew most, and in which channel. Ask an AI to suggest one follow-up question your manager might ask.

## Key takeaways

- Pivots need clean, tabular data with real dates and numbers — ideally an Excel Table.
- Group dates by month **and** year; use helper columns for Indian FY quarters.
- "Show Values As" gives shares, MoM differences and running totals without formulas.
- Avoid calculated fields for row-level maths like mixed GST rates; add a source column instead.
- Always refresh after new data arrives.
