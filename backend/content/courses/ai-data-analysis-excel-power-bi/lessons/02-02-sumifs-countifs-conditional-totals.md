Most MIS questions are some version of "how much, how many, where and when". SUMIFS, COUNTIFS and AVERAGEIFS answer them in a single cell. This lesson shows the patterns you'll use every month and how to get AI to write them correctly.

## The shape of SUMIFS

```text
SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)
```

The sum range comes **first**, then pairs of "where to look" and "what to match". All ranges must be the same size. (The older SUMIF puts the sum range last — a frequent source of confusion, so prefer SUMIFS even for a single condition.)

Using Pink City Fabrics' sales as an Excel Table named `Sales`:

Total sales from the Online channel:

```excel
=SUMIFS(Sales[Amount], Sales[Store], "Online")
```

Total UPI sales from the Vaishali store:

```excel
=SUMIFS(Sales[Amount], Sales[Store], "Jaipur Vaishali", Sales[Payment Mode], "UPI")
```

## Criteria from cells, not typed text

Hard-coding "Online" means editing the formula every time. Put the criteria in cells and reference them, so one formula fills a whole summary grid.

Imagine a summary sheet with store names down column A (A2:A4) and payment modes across row 1 (B1:E1). In B2:

```excel
=SUMIFS(Sales[Amount], Sales[Store], $A2, Sales[Payment Mode], B$1)
```

The `$` signs lock the column for the store and the row for the payment mode, so you can drag the formula across and down. If the AI gives you a formula without `$` and you need to fill a grid, ask: "Add the right absolute references so I can drag this across B2:E4."

## Comparison operators and dates

Criteria can include operators in quotes, joined to values with `&`:

```excel
=SUMIFS(Sales[Amount], Sales[Amount], ">=5000")
```

Date ranges are the most common need. Sales for October 2026:

```excel
=SUMIFS(Sales[Amount], Sales[Date], ">="&DATE(2026,10,1), Sales[Date], "<"&DATE(2026,11,1))
```

Better, make it driven by a cell. If H1 holds any date in the month you want (say 1-Oct-2026):

```excel
=SUMIFS(Sales[Amount], Sales[Date], ">="&EOMONTH(H1,-1)+1, Sales[Date], "<="&EOMONTH(H1,0))
```

`EOMONTH(H1,-1)+1` is the first day of H1's month; `EOMONTH(H1,0)` is the last day. Change H1 and the whole report updates. Note this works only when the Date column holds real dates — Lesson 2.3 and Module 3 show how to fix text dates.

### Indian financial year totals

For FY 2026-27 (1 April 2026 to 31 March 2027):

```excel
=SUMIFS(Sales[Amount], Sales[Date], ">="&DATE(2026,4,1), Sales[Date], "<="&DATE(2027,3,31))
```

Always tell the AI "Indian financial year, April to March" — otherwise it may assume a calendar year.

## Wildcards for partial matches

- `"Jaipur*"` — starts with Jaipur
- `"*Saree*"` — contains Saree anywhere
- `"<>Online"` — everything except Online
- `"<>"` — non-blank cells
- `""` — blank cells (useful for "leads with no owner assigned")

Count LeadLoop leads with no owner:

```excel
=COUNTIFS(Leads[Owner], "")
```

## COUNTIFS and AVERAGEIFS

They follow the same pattern. COUNTIFS has no sum range — it just counts rows meeting all conditions.

Won deals from LinkedIn:

```excel
=COUNTIFS(Leads[Source], "LinkedIn", Leads[Stage], "Won")
```

Now a win rate for LinkedIn (won ÷ all closed deals). Suppose an assistant hands you this:

```excel
=COUNTIFS(Leads[Source],"LinkedIn",Leads[Stage],"Won") / COUNTIFS(Leads[Source],"LinkedIn",Leads[Stage],"Won")
```

Spot the problem? The numerator and denominator are identical, so the answer is always 100%. A copy-paste slip like this is easy to miss in a long formula. The correct denominator counts Won **plus** Lost:

```excel
=COUNTIFS(Leads[Source],"LinkedIn",Leads[Stage],"Won") / (COUNTIFS(Leads[Source],"LinkedIn",Leads[Stage],"Won") + COUNTIFS(Leads[Source],"LinkedIn",Leads[Stage],"Lost"))
```

This is exactly the kind of error AI tools occasionally make in longer formulas. Read the explanation, and sanity-check the result: a 100% win rate should make you suspicious.

Average deal value of won LinkedIn deals:

```excel
=AVERAGEIFS(Leads[Deal Value], Leads[Source], "LinkedIn", Leads[Stage], "Won")
```

If there are no matching rows, AVERAGEIFS returns `#DIV/0!`. Wrap it: `=IFERROR(AVERAGEIFS(...), 0)` — or better, show a dash with `"-"` so nobody mistakes "no data" for "zero".

## OR conditions

SUMIFS combines conditions with AND. For OR — sales that are UPI **or** Card — add two SUMIFS:

```excel
=SUMIFS(Sales[Amount], Sales[Payment Mode], "UPI") + SUMIFS(Sales[Amount], Sales[Payment Mode], "Card")
```

In Excel 365 you can also use an array constant, wrapped in SUM:

```excel
=SUM(SUMIFS(Sales[Amount], Sales[Payment Mode], {"UPI","Card"}))
```

## Getting AI to build a summary grid

```text
Excel 365. Table "Sales" with columns Date (real dates), Store, Category, Payment Mode, Amount.
On sheet "Summary", A2:A5 has categories, B1:D1 has store names, H1 has a date in the reporting month.
Write ONE formula for B2 that I can drag to D5, giving total Amount for that category and store in H1's month.
Explain the $ signs.
```

## Try it yourself

About 20 minutes.

1. Ask an AI to generate 50 rows of fake sales data for Pink City Fabrics across September and October 2026 (columns: Date, Store, Category, Payment Mode, Amount). Paste and convert to a Table named `Sales`.
2. Build a Summary sheet with categories down and stores across. Write one SUMIFS in B2 that you drag across the grid, driven by a month cell H1.
3. Change H1 from October to September and check the grid updates.
4. Verify one cell manually: filter the Sales table for that category, store and month, and compare the status-bar Sum with your formula.
5. Add a row with COUNTIFS for number of invoices and a row with average invoice value.

## Key takeaways

- SUMIFS puts the sum range first; use it even for one condition.
- Reference criteria cells with correct `$` locking so one formula fills a whole grid.
- For month or FY totals, use `>=` start and `<=` end dates built with DATE or EOMONTH.
- SUMIFS is AND-only; add separate SUMIFS for OR conditions.
- Sanity-check ratios — a suspicious 100% often means a wrong denominator.
