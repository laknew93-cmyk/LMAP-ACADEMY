A good dashboard answers a manager's top questions in under a minute, on one screen, without explanation. In this project you'll choose the right charts, design a clean layout, and build a one-page dashboard in Power BI or Google Sheets.

## Start with the audience, not the charts

Before opening any tool, write down:

- **Who** looks at it? (Mr. Agarwal, the owner of Pink City Fabrics.)
- **When**? (Monday mornings, on his phone or laptop, for 2–3 minutes.)
- **What decisions** does it support? (Which store needs attention, which categories to restock before Diwali, whether online COD is getting risky.)
- **Which 3–5 questions** must it answer at a glance?

You can use AI to sharpen this:

```text
I'm building a one-page sales dashboard for the owner of a Jaipur clothing retailer with 2 stores and an online channel.
Data: invoice-level sales with Date, Store, Category, Item, Qty, Amount incl GST, Payment Mode, Customer City.
He reviews it weekly to decide on stock and staff. Suggest the 5 most useful questions the dashboard should answer,
the KPI for each, and the best chart type. Keep it to one page.
```

Pick what makes sense; drop anything decorative.

## Choosing the right chart

| Question type | Best chart | Avoid |
|---|---|---|
| How much in total? | KPI card with comparison (vs last month) | Gauges with no context |
| How has it changed over time? | Line chart (or column chart for few periods) | Pie charts |
| How do categories compare? | Horizontal bar chart, sorted | 3D bars, unsorted bars |
| What's the share/mix? | 100% stacked bar, or a pie/donut with 2–4 slices only | Pies with 8 slices |
| How do two measures relate? | Scatter plot | Dual-axis charts unless very clear |
| Detail lookup | Small table or matrix with conditional formatting | Huge tables on the main page |

Three rules that improve most dashboards immediately:

1. **Sort bars** by value, largest first.
2. **Label directly** — show values on bars instead of making people read axes.
3. **Use colour for meaning**, not decoration: one neutral colour for everything, one highlight colour for what needs attention.

## The layout

Use a simple Z-pattern — people read top-left first.

```text
+-------------------------------------------------------------+
| Title: Pink City Fabrics — Sales Dashboard   [Month slicer] |
+--------------+--------------+--------------+----------------+
| Total Sales  | MoM Growth % | Invoices     | Avg Invoice ₹  |
+--------------+--------------+--------------+----------------+
| Sales trend by month (line, |  Sales by Category (bar,      |
| one line per channel)       |  sorted, with MoM %)          |
+-----------------------------+-------------------------------+
| Payment mode mix by channel | Top 10 items (table)          |
| (100% stacked bar)          |                               |
+-----------------------------+-------------------------------+
| Notes: 2–3 lines of commentary / data as of [date]          |
+-------------------------------------------------------------+
```

KPIs across the top, trend and breakdown in the middle, detail at the bottom.

## Option A: Build it in Power BI

Using the model and measures from Lesson 5.1:

1. **KPI cards:** Insert > Card for Total Sales, MoM Growth %, Invoices and Avg Invoice Value. Format currency with ₹ and no decimals.
2. **Slicers:** a Month Name slicer (dropdown style) and a Store slicer.
3. **Trend:** a Line chart with `Date[Month Start]` on the X-axis, Total Sales as values, Store in Legend.
4. **Category:** a Clustered bar chart with Category on the Y-axis and Total Sales as values; sort descending; turn on data labels.
5. **Payment mix:** a 100% stacked bar chart, Store on the axis, Payment Mode as legend.
6. **Top items:** a Table visual with Item and Total Sales; use the visual's filter pane > Item > Filter type **Top N**, show top 10 by Total Sales.
7. **Conditional formatting:** in the Category chart, colour bars by MoM Growth % (red for negative) using fx rules.

Check interactions: clicking a bar in one visual filters the others. If that's confusing for a particular visual, use **Format > Edit interactions** to turn it off.

A useful extra measure for the title:

```dax
Selected Month Label =
"Sales for " & SELECTEDVALUE ( 'Date'[Month Name], "multiple months" )
```

Put it in a Card at the top so the dashboard always states what period it shows.

## Option B: Build it in Google Sheets

1. Put your clean data on a `Data` sheet.
2. Create a `Calc` sheet with summary tables using QUERY or SUMIFS, driven by a month cell. For example, sales by category for the month in B1 (a date in that month):

```excel
=QUERY(Data!A1:K, "select E, sum(I) where B >= date '"&TEXT(EOMONTH(B1,-1)+1,"yyyy-mm-dd")&"' and B <= date '"&TEXT(EOMONTH(B1,0),"yyyy-mm-dd")&"' group by E order by sum(I) desc label sum(I) 'Sales'", 1)
```

Here B is Date, E is Category and I is Amount. The date has to be inserted as text in `yyyy-mm-dd` form, which is why TEXT is used. Ask an AI to adapt this to your column letters, and test it against a SUMIFS total.

3. On a `Dashboard` sheet, add KPI cells with large fonts and reference the Calc sheet. Show MoM % with conditional formatting.
4. Insert charts (Insert > Chart) from the Calc tables: line for trend, bar for category, stacked bar for payment mix.
5. Add a data validation dropdown for the month (Data > Data validation, list of month dates) so users can switch periods.
6. Hide gridlines (View > Show > Gridlines) for a clean look.

Looker Studio (free from Google) is another option if you want a more dashboard-like, interactive feel on top of Sheets data.

## Review with AI — and with a human

Take a screenshot of your finished dashboard (with masked or practice data) and ask a chat assistant that accepts images:

```text
Here is my one-page sales dashboard for a retail business owner. Critique it as a data visualisation expert:
Is the most important information prominent? Any chart that's the wrong type? Any clutter to remove?
Is anything ambiguous (units, periods, GST-inclusive or not)? Give me the top 5 fixes in priority order.
```

Then show it to one real person for 60 seconds and ask: "What's the main thing this tells you?" If they can't answer, simplify.

## Final checklist

```text
[ ] Title states business, period and "data as of" date
[ ] Units are clear: ₹, incl. or excl. GST, lakhs or rupees
[ ] KPIs have comparisons (vs last month or target), not just raw numbers
[ ] Bars sorted; values labelled; no 3D; max 2–3 colours
[ ] Slicers work and don't break any visual
[ ] Totals match your Excel pivot / control total
[ ] Fits on one screen without scrolling
```

## Try it yourself

Allow 60–90 minutes for the project.

1. Write the audience, decisions and 3–5 key questions for your dashboard.
2. Sketch the layout on paper using the template above.
3. Build it in Power BI (Option A) or Google Sheets (Option B) using your clean Pink City Fabrics data.
4. Verify every KPI against your Excel results.
5. Get an AI critique from a screenshot and make at least three improvements.

## Key takeaways

- Start from the audience's decisions and 3–5 questions, not from available charts.
- Match chart to question: lines for trends, sorted bars for comparisons, cards with comparisons for KPIs.
- Use a KPI-top, trend-middle, detail-bottom layout that fits one screen.
- Make periods, units and GST treatment explicit on the page.
- Verify totals and get both an AI critique and a quick human test.
