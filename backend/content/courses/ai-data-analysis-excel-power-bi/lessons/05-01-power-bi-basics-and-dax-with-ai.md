Power BI is where many Excel users go next: it handles bigger data, connects several tables cleanly, and produces interactive dashboards that managers can explore themselves. This lesson gets you from zero to your first model and DAX measures, with AI explaining every formula.

## Power BI in one paragraph

Power BI Desktop is a free Windows application from Microsoft. You **load** data (Excel, CSV, folders, databases), **clean** it with the same Power Query you met in Lesson 3.4, **model** it by connecting tables, write **measures** in a formula language called DAX, and **visualise** it on report pages. To share reports online with colleagues, organisations use the Power BI service, which generally needs a paid licence — check with your IT team. For learning, Desktop is all you need.

If you're on a Mac, you can follow the concepts here and build the dashboard project in Google Sheets or Looker Studio instead.

## Step 1: Load the data

Open Power BI Desktop > **Get data > Excel workbook** (or Text/CSV) and select your clean Pink City Fabrics file from the Lesson 3.3 project. Tick the `Sales` table and click **Transform Data** to open Power Query. Check that:

- Date is a Date type (calendar icon), not text.
- Amount and Qty are numbers.
- Text columns are trimmed.

Then **Close & Apply**.

Also load a small `Products` table (Item, Category, GST Rate) and, if you have it, a `Targets` table (Store, Month, Target).

## Step 2: Build a date table

Power BI's time calculations work best with a dedicated date table. On the **Modeling** tab, click **New table** and enter:

```dax
Date =
ADDCOLUMNS (
    CALENDAR ( DATE ( 2026, 4, 1 ), DATE ( 2027, 3, 31 ) ),
    "Month Start", DATE ( YEAR ( [Date] ), MONTH ( [Date] ), 1 ),
    "Month Name", FORMAT ( [Date], "mmm-yy" ),
    "FY", IF ( MONTH ( [Date] ) >= 4,
        "FY" & YEAR ( [Date] ) & "-" & RIGHT ( YEAR ( [Date] ) + 1, 2 ),
        "FY" & ( YEAR ( [Date] ) - 1 ) & "-" & RIGHT ( YEAR ( [Date] ), 2 ) ),
    "FY Quarter", "Q" & ( INT ( MOD ( MONTH ( [Date] ) - 4, 12 ) / 3 ) + 1 )
)
```

This covers the Indian financial year 2026-27, with columns for month, FY label and FY quarter. Extend the range if your data spans more years. Then select the table and use **Mark as date table**, choosing the Date column.

Tip: to make "Month Name" sort Apr-26, May-26… instead of alphabetically, select it and set **Sort by column** to Month Start.

## Step 3: Create relationships

Switch to **Model view** (the diagram icon on the left). Drag:

- `Date[Date]` onto `Sales[Date]`
- `Products[Item]` onto `Sales[Item]`

You'll see lines with "1" on the lookup side and "*" (many) on the Sales side. This is a **star schema**: a central fact table (Sales) surrounded by lookup (dimension) tables. It replaces all those XLOOKUP columns you'd add in Excel.

If you ask an AI for help, describe your tables:

```text
In Power BI I have: Sales (Invoice No, Date, Store, Item, Qty, Amount), Products (Item, Category, GST Rate),
Date (Date, Month Start, FY, FY Quarter), Targets (Store, Month Start, Target).
How should I set up relationships? Targets is monthly, Sales is daily — is that a problem?
```

(Short answer you'll likely get: Targets is at a different grain, so relate it through Month Start or a separate Store table — a good question to explore with AI once the basics feel comfortable.)

## Step 4: Measures vs calculated columns

This is the concept that confuses every Excel user, so get it clear:

| | Calculated column | Measure |
|---|---|---|
| Computed | Once per row, stored in the table | On the fly, for whatever is filtered in the visual |
| Like in Excel | A helper column | A pivot table value |
| Example | `Taxable = Sales[Amount] / (1 + RELATED(Products[GST Rate]))` | `Total Sales = SUM(Sales[Amount])` |
| Use for | Row-level attributes, slicing/grouping | Totals, ratios, comparisons |

Rule of thumb: **if you'll add it up or compare it, make it a measure.**

## Step 5: Your first DAX measures

Select the Sales table, click **New measure**, and add these one at a time:

```dax
Total Sales = SUM ( Sales[Amount] )

Total Qty = SUM ( Sales[Qty] )

Invoices = DISTINCTCOUNT ( Sales[Invoice No] )

Avg Invoice Value = DIVIDE ( [Total Sales], [Invoices] )
```

DIVIDE is safer than `/` because it returns blank instead of an error when the denominator is zero.

### CALCULATE: the most important function

CALCULATE evaluates a measure under modified filters:

```dax
Online Sales = CALCULATE ( [Total Sales], Sales[Store] = "Online" )

Online Share = DIVIDE ( [Online Sales], CALCULATE ( [Total Sales], ALL ( Sales[Store] ) ) )
```

The second measure divides Online sales by total sales across **all** stores, ignoring any store filter on the visual — that's what `ALL ( Sales[Store] )` does.

### Time intelligence

With a marked date table, comparisons become one-liners:

```dax
Sales Last Month = CALCULATE ( [Total Sales], DATEADD ( 'Date'[Date], -1, MONTH ) )

MoM Growth % = DIVIDE ( [Total Sales] - [Sales Last Month], [Sales Last Month] )

Sales LY = CALCULATE ( [Total Sales], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )

Sales FYTD = TOTALYTD ( [Total Sales], 'Date'[Date], "3/31" )
```

The `"3/31"` tells TOTALYTD the year ends on 31 March — essential for Indian financial-year totals. (Without it, YTD resets every January.) Sales LY needs last year's data loaded and a date table that covers it; otherwise it shows blank.

Format percentage measures as % in the **Measure tools** ribbon.

## Using AI to write and explain DAX

DAX is where AI help pays off most, because the logic is subtle. Always state your table and column names exactly:

```text
Power BI. Tables: Sales (Date, Store, Item, Amount), 'Date' (marked date table, Date column), Products (Item, Category).
Write a DAX measure for the % contribution of each Category to total sales, which still shows the correct share when a Store slicer is applied.
Explain how filter context works in your answer.
```

And to understand existing measures:

```text
Explain this DAX measure line by line, and tell me what it returns when a single month and a single store are selected:
[paste measure]
```

Test AI-written DAX by putting the measure in a **table visual** next to simple values you can verify in Excel. A measure that looks right in a card can be wrong once sliced by month.

## Copilot in Power BI

Microsoft has added Copilot features to Power BI that, depending on your licence and admin settings, can suggest DAX measures, summarise report pages in text, answer questions about data in a model, and draft report pages from a description. The same advice applies as with Excel: tidy, well-named models get better results, and you inspect everything it produces. Clear table and column names (`Total Sales`, not `Measure 7`) help both humans and Copilot.

## Try it yourself

About 20 minutes (plus installation if needed).

1. Install Power BI Desktop from Microsoft's site or the Microsoft Store (Windows), and load your clean sales data.
2. Create the Date table with the DAX above, mark it as a date table, and relate it to Sales.
3. Create Total Sales, Invoices, Avg Invoice Value, Sales Last Month and MoM Growth % measures.
4. Add a table visual with Month Name and these measures. Verify one month's Total Sales against your Excel pivot.
5. Ask an AI to explain CALCULATE and ALL using your own Online Share measure as the example.

## Key takeaways

- Power BI = load, clean (Power Query), model (relationships), measure (DAX), visualise.
- Build and mark a date table; use `"3/31"` in TOTALYTD for Indian financial years.
- Use measures for anything you total or compare; calculated columns for row-level attributes.
- CALCULATE changes filter context — it's the heart of DAX.
- Give AI exact table and column names, and verify every measure in a table visual.
